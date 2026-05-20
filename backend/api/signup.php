<?php
ob_start();
ini_set('display_errors', 0);
error_reporting(0);

function send_json_error($code, $msg) {
  ob_clean();
  http_response_code($code);
  header('Content-Type: application/json');
  header('Access-Control-Allow-Origin: *');
  echo json_encode(['success' => false, 'error' => $msg]);
  exit;
}

set_exception_handler(function($e) { send_json_error(500, $e->getMessage()); });
set_error_handler(function($no, $str) { send_json_error(500, $str); });
register_shutdown_function(function() {
  $e = error_get_last();
  if ($e && in_array($e['type'], [E_ERROR, E_PARSE, E_CORE_ERROR, E_COMPILE_ERROR])) {
    send_json_error(500, $e['message']);
  }
});

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  http_response_code(200);
  exit;
}

require_once __DIR__ . '/../config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  http_response_code(405);
  echo json_encode(['success' => false, 'error' => 'Method not allowed']);
  exit;
}

$input = json_decode(file_get_contents('php://input'), true);

$name = isset($input['name']) ? trim($input['name']) : '';
$email = isset($input['email']) ? trim($input['email']) : '';
$phone_number = isset($input['phone_number']) ? trim($input['phone_number']) : '';
$password = isset($input['password']) ? $input['password'] : '';

if (!$name || !$email || !$phone_number || !$password) {
  http_response_code(400);
  echo json_encode(['success' => false, 'error' => 'All fields are required']);
  exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
  http_response_code(400);
  echo json_encode(['success' => false, 'error' => 'Invalid email format']);
  exit;
}

// Validate phone number format (7-20 chars, digits, +, -, spaces, parentheses)
if (!preg_match('/^[\d+\-\s\(\)]{7,20}$/', $phone_number)) {
  http_response_code(400);
  echo json_encode(['success' => false, 'error' => 'Invalid phone number format']);
  exit;
}

if (strlen($password) < 6) {
  http_response_code(400);
  echo json_encode(['success' => false, 'error' => 'Password must be at least 6 characters']);
  exit;
}

$stmt = $conn->prepare("SELECT id FROM users WHERE email = ?");
if (!$stmt) send_json_error(500, 'DB prepare failed: ' . $conn->error);
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
  http_response_code(409);
  echo json_encode(['success' => false, 'error' => 'Email already registered']);
  $stmt->close();
  exit;
}
$stmt->close();

// Check if phone number is already registered
$stmt = $conn->prepare("SELECT id FROM users WHERE phone_number = ?");
if (!$stmt) send_json_error(500, 'DB prepare failed: ' . $conn->error);
$stmt->bind_param("s", $phone_number);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
  http_response_code(409);
  echo json_encode(['success' => false, 'error' => 'Phone number already registered']);
  $stmt->close();
  exit;
}
$stmt->close();

$hashed_password = password_hash($password, PASSWORD_DEFAULT);

// Generate random ingest_secret (64 hex characters = 32 random bytes)
$ingest_secret = bin2hex(random_bytes(32));

$stmt = $conn->prepare("INSERT INTO users (name, email, password, phone_number, ingest_secret) VALUES (?, ?, ?, ?, ?)");
if (!$stmt) send_json_error(500, 'DB prepare failed: ' . $conn->error);
$stmt->bind_param("sssss", $name, $email, $hashed_password, $phone_number, $ingest_secret);

if ($stmt->execute()) {
  $user_id = $conn->insert_id;
  
  // Initialize user budget with 0 values
  $init_stmt = $conn->prepare("INSERT INTO user_budgets (user_id, monthly_budget, total_spent, total_saved) VALUES (?, 0, 0, 0)");
  $init_stmt->bind_param("i", $user_id);
  $init_stmt->execute();
  $init_stmt->close();
  
  // Generate webhook URL with full domain
  $protocol = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https' : 'http';
  $host = $_SERVER['HTTP_HOST'];
  $webhook_url = $protocol . "://" . $host . "/smart_budget/backend/api/sms-ingest.php?phone_number=" . urlencode($phone_number) . "&key=" . $ingest_secret;
  
  http_response_code(201);
  echo json_encode([
    'success' => true,
    'message' => 'Signup successful',
    'user' => [
      'id' => $user_id,
      'name' => $name,
      'email' => $email,
      'phone_number' => $phone_number
    ],
    'sms_ingest' => [
      'ingest_secret' => $ingest_secret,
      'webhook_url' => $webhook_url,
      'note' => 'Use this webhook URL in your SMS Forwarder app'
    ]
  ]);
} else {
  http_response_code(500);
  echo json_encode(['success' => false, 'error' => 'Signup failed: ' . $stmt->error]);
}

$stmt->close();
$conn->close();
?>