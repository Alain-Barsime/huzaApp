<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

$logDir = __DIR__ . '/logs';
$errorLog = $logDir . '/api_errors.log';

// Create logs directory if it doesn't exist
if (!file_exists($logDir) && !mkdir($logDir, 0755, true)) {
    http_response_code(500);
    die(json_encode(['error' => 'Failed to create logs directory']));
}

// Custom error handler to log errors
function logError($message) {
    global $errorLog;
    $timestamp = date('Y-m-d H:i:s');
    $logMessage = "[$timestamp] $message" . PHP_EOL;
    file_put_contents($errorLog, $logMessage, FILE_APPEND);
}

error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', $errorLog);

try {
    require 'connect.php';

    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception("Invalid request method");
    }

    $input = json_decode(file_get_contents('php://input'), true);
    if (!$input || !isset($input['case_id'])) {
        throw new Exception("Missing case_id");
    }

    $case_id = trim($input['case_id']);
    if (empty($case_id)) {
        throw new Exception("Case ID is empty");
    }

    $stmt = $conn->prepare("UPDATE complaints SET progress = ? WHERE case_id = ?");
    if (!$stmt) {
        throw new Exception("Prepare failed: " . $conn->error);
    }

    $progress = 'in process';
    $stmt->bind_param("ss", $progress, $case_id);

    if (!$stmt->execute()) {
        throw new Exception("Execute failed: " . $stmt->error);
    }

    if ($stmt->affected_rows === 0) {
        throw new Exception("No complaint found with case_id: $case_id");
    }

    $stmt->close();
    $conn->close();

    echo json_encode(['success' => true, 'message' => 'Progress updated to in process']);

} catch (Exception $e) {
    logError("API Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage(), 'logged' => true]);
}
?>