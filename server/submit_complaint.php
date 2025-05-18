<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");

require 'connect.php';

// Secure configuration
define('GEMINI_API_KEY', 'AIzaSyDU4bhVL-cEXGh2fELfl89rG4kP_nOx8XM');
define('GEMINI_API_URL', 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent');
define('DEFAULT_AGENCY', 'Municipal Corporation');
define('UPLOAD_DIR', __DIR__ . '/uploads/');

// Enhanced Gemini AI analysis
function analyzeComplaint(string $complaintText): string {
    $agencies = [
        "Electricity Department", "Water Supply Authority", "Gas Services Department",
        "Public Health Department", "Police Department", "Fire Department",
        "Environmental Protection Agency", "Transportation Department", "Housing Authority",
        "Consumer Protection Agency", "Road Maintenance Department", "Sanitation Services",
        "Traffic Control Authority", "Telecommunications Department", "Waste Management Department",
        "Disaster Management Agency", "Education Department", "Social Services Department",
        "Emergency Medical Services", DEFAULT_AGENCY
    ];

    $prompt = "From this exact list: " . implode(", ", array_unique($agencies)) . 
              " - select ONLY ONE most relevant department for this complaint: \"" . 
              htmlspecialchars($complaintText) . "\". Respond ONLY with the department name.";

    $payload = [
        'contents' => [['parts' => [['text' => $prompt]]]]
    ];

    $context = stream_context_create([
        'http' => [
            'header'  => "Content-Type: application/json\r\n",
            'method'  => 'POST',
            'content' => json_encode($payload),
            'timeout' => 30
        ]
    ]);

    $response = @file_get_contents(GEMINI_API_URL . '?key=' . GEMINI_API_KEY, false, $context);
    
    if (!$response) {
        throw new Exception("AI analysis service unavailable");
    }

    $data = json_decode($response, true);
    $department = trim($data['candidates'][0]['content']['parts'][0]['text'] ?? '');

    // Strict validation
    foreach ($agencies as $validAgency) {
        if (strcasecmp(trim($department), $validAgency) === 0) {
            return $validAgency; // Return case-correct version
        }
    }

    return DEFAULT_AGENCY;
}

// Secure file upload handler
function handleUpload(): ?string {
    if (empty($_FILES['image']['tmp_name'])) {
        return null;
    }

    if (!file_exists(UPLOAD_DIR)) {
        mkdir(UPLOAD_DIR, 0755, true);
    }

    $fileInfo = finfo_open(FILEINFO_MIME_TYPE);
    $mimeType = finfo_file($fileInfo, $_FILES['image']['tmp_name']);
    finfo_close($fileInfo);

    $allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!in_array($mimeType, $allowedTypes)) {
        throw new Exception("Invalid file type. Only JPG, PNG, and GIF are allowed");
    }

    $extension = pathinfo($_FILES['image']['name'], PATHINFO_EXTENSION);
    $filename = 'complaint_' . time() . '_' . bin2hex(random_bytes(8)) . '.' . $extension;
    $targetPath = UPLOAD_DIR . $filename;

    if (!move_uploaded_file($_FILES['image']['tmp_name'], $targetPath)) {
        throw new Exception("Failed to save uploaded file");
    }

    return '/uploads/' . $filename;
}

try {
    // Validate required fields
    $required = ['name', 'phone', 'details'];
    foreach ($required as $field) {
        if (empty($_POST[$field])) {
            throw new Exception("Missing required field: $field");
        }
    }

    // Sanitize inputs
    $name = htmlspecialchars(trim($_POST['name']));
    $phone = preg_replace('/[^0-9+]/', '', $_POST['phone']);
    $details = htmlspecialchars(trim($_POST['details']));
    $latitude = filter_var($_POST['latitude'] ?? 0, FILTER_VALIDATE_FLOAT) ?: 0;
    $longitude = filter_var($_POST['longitude'] ?? 0, FILTER_VALIDATE_FLOAT) ?: 0;

    // Process complaint
    $agency = analyzeComplaint($details);
    $imagePath = handleUpload();
    $caseId = 'CASE_' . strtoupper(bin2hex(random_bytes(8)));

    // Database insertion
    $stmt = $conn->prepare("INSERT INTO complaints (
        agency, name, image, latitude, longitude, 
        number, progress, case_id, details
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");

    $progress = 'Not seen';

    // FIX: Added missing 's' for $details (string)
    $stmt->bind_param(
        "sssddssss",
        $agency, $name, $imagePath, $latitude, $longitude, $phone, $progress, $caseId, $details
    );

    if (!$stmt->execute()) {
        throw new Exception("Database operation failed: " . $stmt->error);
    }

    // Response
    echo json_encode([
        'status' => 'success',
        'data' => [
            'case_id' => $caseId,
            'agency' => $agency,
            'complaint_id' => $conn->insert_id
        ]
    ]);

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'status' => 'error',
        'message' => $e->getMessage()
    ]);
} finally {
    if (isset($stmt)) $stmt->close();
    $conn->close();
}
?>
