<?php
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

$logDir = __DIR__ . '/logs';
$errorLog = $logDir . '/api_errors.log';

// Create logs directory if it doesn't exist
if (!file_exists($logDir) && !mkdir($logDir, 0755, true)) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to create logs directory']);
    exit;
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

    if (!$input || !isset($input['case_id'])) {
        logError("Missing case_id. Input: " . print_r($input, true));
        http_response_code(400);
        echo json_encode(['error' => 'Case ID is required']);
        exit;
    }

    $caseId = trim($input['case_id']);
    if (empty($caseId)) {
        logError("Empty case_id after trim");
        http_response_code(400);
        echo json_encode(['error' => 'Case ID cannot be empty']);
        exit;
    }

    require 'connect.php';

    // Check if complaint exists
    $checkStmt = $conn->prepare("SELECT case_id FROM complaints WHERE case_id = ?");
    if (!$checkStmt) {
        throw new Exception("Prepare check failed: " . $conn->error);
    }
    $checkStmt->bind_param("s", $caseId);
    if (!$checkStmt->execute()) {
        throw new Exception("Execute check failed: " . $checkStmt->error);
    }
    $result = $checkStmt->get_result();
    if ($result->num_rows === 0) {
        logError("Complaint not found for case_id: $caseId");
        http_response_code(404);
        echo json_encode(['error' => 'Complaint not found']);
        exit;
    }
    $checkStmt->close();

    // Update complaint status
    $stmt = $conn->prepare("UPDATE complaints SET progress = ? WHERE case_id = ?");
    if (!$stmt) {
        throw new Exception("Prepare update failed: " . $conn->error);
    }

    $progress = 'resolved';
    $stmt->bind_param("ss", $progress, $caseId);
    if (!$stmt->execute()) {
        throw new Exception("Execute update failed: " . $stmt->error);
    }

    if ($stmt->affected_rows === 0) {
        logError("No rows updated for case_id: $caseId");
        http_response_code(404);
        echo json_encode(['error' => 'Complaint not found or already resolved']);
        exit;
    }

    $stmt->close();
    $conn->close();

    logError("Successfully updated status to resolved for case_id: $caseId");
    echo json_encode(['success' => true]);

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