<?php
/**
 * Setup SMS Ingest: Initialize phone_number and ingest_secret for users
 * 
 * Usage:
 *   POST /api/setup-sms-ingest.php
 *   Body: { "user_id": 1, "phone_number": "+263712345678" }
 * 
 * Response: Generates and returns the ingest_secret
 */

error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

require_once __DIR__ . '/../config.php';

header('Content-Type: application/json');

// Validate POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'status' => 'error',
        'message' => 'Method Not Allowed',
        'code' => 'METHOD_NOT_ALLOWED'
    ]);
    exit;
}

// Parse input
$input = json_decode(file_get_contents('php://input'), true);
if (!$input) {
    http_response_code(400);
    echo json_encode([
        'status' => 'error',
        'message' => 'Invalid JSON',
        'code' => 'INVALID_JSON'
    ]);
    exit;
}

$user_id = isset($input['user_id']) ? (int)$input['user_id'] : 0;
$phone_number = isset($input['phone_number']) ? trim($input['phone_number']) : '';

if (!$user_id || !$phone_number) {
    http_response_code(400);
    echo json_encode([
        'status' => 'error',
        'message' => 'Missing user_id or phone_number',
        'code' => 'MISSING_FIELDS'
    ]);
    exit;
}

// Validate phone format
if (!preg_match('/^[\d+\-\s\(\)]{7,20}$/', $phone_number)) {
    http_response_code(400);
    echo json_encode([
        'status' => 'error',
        'message' => 'Invalid phone_number format',
        'code' => 'INVALID_PHONE_FORMAT'
    ]);
    exit;
}

// Check if user exists
$stmt = $conn->prepare("SELECT id FROM users WHERE id = ? LIMIT 1");
if (!$stmt) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Database error', 'code' => 'DB_ERROR']);
    exit;
}

$stmt->bind_param('i', $user_id);
$stmt->execute();
$result = $stmt->get_result();
if ($result->num_rows === 0) {
    http_response_code(404);
    echo json_encode([
        'status' => 'error',
        'message' => 'User not found',
        'code' => 'USER_NOT_FOUND'
    ]);
    $stmt->close();
    exit;
}
$stmt->close();

// Check if phone_number is already taken
$stmt = $conn->prepare("SELECT id FROM users WHERE phone_number = ? AND id != ? LIMIT 1");
if (!$stmt) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Database error', 'code' => 'DB_ERROR']);
    exit;
}

$stmt->bind_param('si', $phone_number, $user_id);
$stmt->execute();
$result = $stmt->get_result();
if ($result->num_rows > 0) {
    http_response_code(409);
    echo json_encode([
        'status' => 'error',
        'message' => 'Phone number already registered',
        'code' => 'PHONE_DUPLICATE'
    ]);
    $stmt->close();
    exit;
}
$stmt->close();

// Generate random ingest_secret (64 char hex string)
$ingest_secret = bin2hex(random_bytes(32));

// Update user with phone_number and ingest_secret
$stmt = $conn->prepare(
    "UPDATE users SET phone_number = ?, ingest_secret = ? WHERE id = ?"
);
if (!$stmt) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Database error', 'code' => 'DB_ERROR']);
    exit;
}

$stmt->bind_param('ssi', $phone_number, $ingest_secret, $user_id);
if (!$stmt->execute()) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Failed to update user',
        'code' => 'UPDATE_FAILED'
    ]);
    $stmt->close();
    exit;
}
$stmt->close();

http_response_code(200);
echo json_encode([
    'status' => 'success',
    'message' => 'SMS ingest credentials configured',
    'code' => 'SMS_INGEST_CONFIGURED',
    'data' => [
        'user_id' => $user_id,
        'phone_number' => $phone_number,
        'ingest_secret' => $ingest_secret,
        'webhook_url' => "POST /api/sms-ingest.php?phone_number={$phone_number}&key={$ingest_secret}"
    ]
]);
?>
