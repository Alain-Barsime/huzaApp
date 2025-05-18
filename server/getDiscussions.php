<?php
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
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

    if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
        throw new Exception("Invalid request method: " . $_SERVER['REQUEST_METHOD']);
    }

    $caseId = $_GET['id'] ?? null;
    if (empty($caseId)) {
        http_response_code(400);
        logError("Missing case ID");
        echo json_encode(['error' => 'Case ID is required']);
        exit;
    }

    require 'connect.php';

    $stmt = $conn->prepare("SELECT id, case_id, comment, created_at FROM discussions WHERE case_id = ? ORDER BY created_at ASC");
    if (!$stmt) {
        throw new Exception("Prepare failed: " . $conn->error);
    }

    $stmt->bind_param("s", $caseId);
    if (!$stmt->execute()) {
        throw new Exception("Execute failed: " . $stmt->error);
    }

    $result = $stmt->get_result();
    $messages = [];
    while ($row = $result->fetch_assoc()) {
        $messages[] = [
            'id' => $row['id'],
            'case_id' => $row['case_id'],
            'comment' => $row['comment'],
            'created_at' => $row['created_at'],
            //to make it eaasy for frontend lets add these tooo
            'text' => $row['comment'],
            'time' => date('c', strtotime($row['created_at'])), // ISO 8601
            'sender' => 'user' // Hardcoded for ComplaintDetails.jsx
        ];
    }

    $stmt->close();
    $conn->close();

    logError("Successfully fetched " . count($messages) . " messages for case_id: $caseId");
    echo json_encode(['messages' => $messages]);

} catch (Exception $e) {
    logError("API Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'error' => 'Internal server error',
        'message' => $e->getMessage()
    ]);
}
?>