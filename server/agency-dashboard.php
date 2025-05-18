<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}


$uploadDir = __DIR__ . '/Uploads';
$logDir = __DIR__ . '/logs';
$errorLog = $logDir . '/api_errors.log';

if (!file_exists($uploadDir) && !mkdir($uploadDir, 0755, true)) {
    http_response_code(500);
    die(json_encode(['error' => 'Failed to create uploads directory']));
}


if (!file_exists($logDir) && !mkdir($logDir, 0755, true)) {
    http_response_code(500);
    die(json_encode(['error' => 'Failed to create logs directory']));
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
    require 'connect.php';

    $agency = isset($_GET['agency']) ? trim($_GET['agency']) : '';
    if (empty($agency)) {
        throw new Exception("Agency parameter is missing or empty");
    }

    $stmt = $conn->prepare("SELECT * FROM complaints WHERE agency = ? OR agency IS NULL");
    if (!$stmt) {
        throw new Exception("Prepare failed: " . $conn->error);
    }

    $stmt->bind_param("s", $agency);
    if (!$stmt->execute()) {
        throw new Exception("Execute failed: " . $stmt->error);
    }

    $result = $stmt->get_result();
    if (!$result) {
        throw new Exception("Get result failed: " . $stmt->error);
    }

    $complaints = [];
    $progressMap = [
        'pending' => 'not seen',
        'in-progress' => 'in process',
        'solved' => 'resolved',
        '' => 'not seen'
    ];

    while ($row = $result->fetch_assoc()) {
        // Normalize progress
        $progress = $row['progress'] ?? 'not seen';
        $progress = strtolower(trim($progress));
        $row['progress'] = $progressMap[$progress] ?? $progress;

        // Handle image
        if (!empty($row['image'])) {
            $row['image'] = '/Uploads/' . basename($row['image']);
        }

        $complaints[] = $row;
        error_log("agency-dashboard.php - Case ID: {$row['case_id']}, Progress: {$row['progress']}");
    }

    $stmt->close();
    $conn->close();

    echo json_encode([
        'count' => count($complaints),
        'complaints' => $complaints
    ]);

} catch (Exception $e) {
    logError("API Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'An internal server error occurred', 'logged' => true]);
}
?>