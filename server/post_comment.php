<?php
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

$logDir = __DIR__ . '/logs';
$errorLog = $logDir . '/api_errors.log';


if (!file_exists($logDir) && !mkdir($logDir, 0755, true)) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to create logs directory']);
    exit;
}

function writeLog($message) {
    global $errorLog;
    $timestamp = date('Y-m-d H:i:s');
    $logMessage = "[$timestamp] $message" . PHP_EOL;
    file_put_contents($errorLog, $logMessage, FILE_APPEND);
}

ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', $errorLog);
error_reporting(E_ALL);

try {
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(204);
        exit;
    }

    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception("Invalid request method: " . $_SERVER['REQUEST_METHOD']);
    }

    $inputJSON = file_get_contents('php://input');
    writeLog("Raw input: " . $inputJSON);
    $input = json_decode($inputJSON, true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception("Invalid JSON payload: " . json_last_error_msg());
    }

    if (!isset($input['case_id']) || !isset($input['comment'])) {
        throw new Exception("Missing case_id or comment");
    }

    $case_id = trim($input['case_id']);
    $comment = trim($input['comment']);
    if (empty($case_id) || empty($comment)) {
        throw new Exception("case_id and comment cannot be empty");
    }

    require_once 'connect.php';

    $stmt = $conn->prepare("INSERT INTO discussions (case_id, comment, created_at) VALUES (?, ?, CURDATE())");
    if (!$stmt) {
        throw new Exception("Prepare failed: " . $conn->error);
    }

    $stmt->bind_param("ss", $case_id, $comment);
    if (!$stmt->execute()) {
        throw new Exception("Execute failed: " . $stmt->error);
    }

    $newId = $conn->insert_id;
    $stmt->close();
    $conn->close();

    writeLog("Successfully added comment for case_id: $case_id");
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'message' => [
            'id' => $newId,
            'created_at' => date('Y-m-d') 
        ]
    ]);

} catch (Exception $e) {
    writeLog("API Error: " . $e->getMessage());
    $statusCode = ($e->getMessage() === "Missing case_id or comment" || $e->getMessage() === "case_id and comment cannot be empty") ? 400 : 500;
    http_response_code($statusCode);
    echo json_encode([
        'success' => false,
        'error' => $statusCode === 400 ? $e->getMessage() : 'Internal server error',
        'message' => $e->getMessage()
    ]);
}
?>