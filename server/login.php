<?php
session_start();


$allowedOrigin = "http://localhost:5173";
header("Access-Control-Allow-Origin: $allowedOrigin");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");


if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require 'connect.php';


$input = json_decode(file_get_contents('php://input'), true);

if (!is_array($input) || empty($input['email']) || empty($input['password'])) {
    http_response_code(400);
    echo json_encode([
        'status' => 'error',
        'message' => 'Email and password are required'
    ]);
    exit();
}

$email = trim($input['email']);
$password = $input['password'];

try {
    // Get agency from database
    $stmt = $conn->prepare("SELECT id, name, email, password FROM agency WHERE email = ?");
    if (!$stmt) {
        throw new Exception('Database preparation failed');
    }

    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();

    // Verify agency exists
    if ($result->num_rows === 0) {
        http_response_code(401);
        echo json_encode([
            'status' => 'error',
            'message' => 'Invalid credentials'
        ]);
        exit();
    }

    $agency = $result->fetch_assoc();

    // Verify password
    if (!password_verify($password, $agency['password'])) {
        http_response_code(401);
        echo json_encode([
            'status' => 'error',
            'message' => 'Invalid credentials'
        ]);
        exit();
    }

    // Create session
    $_SESSION['agency_id'] = $agency['id'];
    $_SESSION['agency_name'] = $agency['name'];
    $_SESSION['agency_email'] = $agency['email'];
    $_SESSION['logged_in'] = true;

    // Return success response with agency data
    http_response_code(200);
    echo json_encode([
        'status' => 'success',
        'message' => 'Login successful',
        'agency' => [
            'id' => $agency['id'],
            'name' => $agency['name'],
            'email' => $agency['email']
        ]
    ]);

} catch (Exception $e) {
    error_log("Login Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'An error occurred during login'
    ]);
} finally {
    if (isset($stmt)) $stmt->close();
    $conn->close();
}
?>