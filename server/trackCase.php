<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['caseId'])) {
    echo json_encode(["success" => false, "message" => "Missing case ID"]);
    exit;
}

$caseId = $data['caseId'];

require 'connect.php';

$stmt = $conn->prepare("SELECT progress FROM complaints WHERE case_id = ?");
$stmt->bind_param("s", $caseId);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    $row = $result->fetch_assoc();
    echo json_encode([
        "success" => true,
        "caseId" => $caseId,      
        "progress" => $row['progress']
    ]);
} else {
    echo json_encode(["success" => false, "message" => "Case not found"]);
}

$stmt->close();
$conn->close();
?>
