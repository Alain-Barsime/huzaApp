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
    logError("Request method: " . $_SERVER['REQUEST_METHOD']);
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(204);
        exit;
    }

    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception("Invalid request method: " . $_SERVER['REQUEST_METHOD']);
    }

    $rawInput = file_get_contents('php://input');
    logError("Raw input: " . $rawInput);
    $input = json_decode($rawInput, true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        logError("JSON decode error: " . json_last_error_msg());
        http_response_code(400);
        echo json_encode(['error' => 'Invalid JSON payload']);
        exit;
    }

    if (!$input || !isset($input['case_id']) || !isset($input['message'])) {
        logError("Missing case_id or message. Input: " . print_r($input, true));
        http_response_code(400);
        echo json_encode(['error' => 'Case ID and message are required']);
        exit;
    }

    $caseId = trim($input['case_id']);
    $message = trim($input['message']);
    if (empty($caseId) || empty($message)) {
        logError("Empty case_id or message after trim");
        http_response_code(400);
        echo json_encode(['error' => 'Case ID and message cannot be empty']);
        exit;
    }

    require 'connect.php';

    $stmt = $conn->prepare("INSERT INTO discussions (case_id, comment, created_at) VALUES (?, ?, CURDATE())");
    if (!$stmt) {
        throw new Exception("Prepare failed: " . $conn->error);
    }

    $stmt->bind_param("ss", $caseId, $message);
    if (!$stmt->execute()) {
        throw new Exception("Execute failed: " . $stmt->error);
    }

    $newId = $conn->insert_id;
    $stmt->close();
    $conn->close();

    logError("Successfully added message for case_id: $caseId");
    echo json_encode([
        'success' => true,
        'message' => [
            'id' => $newId,
            'sender' => 'user',
            'text' => $message,
            'time' => date('c') 
        ]
    ]);

} catch (Exception $e) {
    logError("API Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Internal server error',
        'message' => $e->getMessage()
    ]);
}
?>