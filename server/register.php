<?php
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$logFile = __DIR__ . '/logs/registration.log';

function logError($data) {
    global $logFile;
    file_put_contents($logFile, json_encode($data) . PHP_EOL, FILE_APPEND);
}

require 'connect.php';

$input = json_decode(file_get_contents('php://input'), true);
$logData = [
    'time' => date('Y-m-d H:i:s'),
    'method' => $_SERVER['REQUEST_METHOD'],
    'input' => $input,
];

// Basic input validation
if (!is_array($input) 
    || empty($input['agencyName']) 
    || empty($input['email']) 
    || empty($input['password'])) {
    logError(array_merge($logData, ['error' => 'Missing required fields']));
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'All fields are required']);
    exit();
}

$email = filter_var(trim($input['email']), FILTER_VALIDATE_EMAIL);
if (!$email) {
    logError(array_merge($logData, ['error' => 'Invalid email']));
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Invalid email address']);
    exit();
}

if (strlen($input['password']) < 8) {
    logError(array_merge($logData, ['error' => 'Password too short']));
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Password must be at least 8 characters']);
    exit();
}

try {
    // Check for existing email
    $stmt = $conn->prepare("SELECT id FROM agency WHERE email = ?");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        logError(array_merge($logData, ['error' => 'Email already registered']));
        http_response_code(409);
        echo json_encode(['status' => 'error', 'message' => 'Email already in use']);
        exit();
    }

    $hashedPassword = password_hash($input['password'], PASSWORD_DEFAULT);
    $stmt = $conn->prepare("INSERT INTO agency (name, email, password) VALUES (?, ?, ?)");
    $stmt->bind_param("sss", $input['agencyName'], $email, $hashedPassword);

    if ($stmt->execute()) {
        http_response_code(201);
        echo json_encode(['status' => 'success', 'message' => 'Registration successful', 'agencyName' => $input['agencyName']]);
    } else {
        throw new Exception('Insert failed');
    }
} catch (Exception $e) {
    logError(array_merge($logData, ['error' => $e->getMessage()]));
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Registration failed, please try again later']);
} finally {
    $stmt->close();
    $conn->close();
}
