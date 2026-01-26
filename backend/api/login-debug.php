<?php
// filepath: C:\xampp\htdocs\smart_budget\api\login-debug.php
error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once __DIR__ . '/../config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  http_response_code(405);
  echo json_encode(['success' => false, 'error' => 'Only POST allowed']);
  exit;
}

$input = json_decode(file_get_contents('php://input'), true);

$email = isset($input['email']) ? trim($input['email']) : '';
$password = isset($input['password']) ? $input['password'] : '';

// Step 1: Validate input
if (!$email || !$password) {
  http_response_code(400);
  echo json_encode([
    'success' => false,
    'error' => 'Missing email or password',
    'received_email' => $email,
    'received_password' => !empty($password) ? '***' : 'empty'
  ]);
  exit;
}

// Step 2: Query database
$stmt = $conn->prepare("SELECT id, name, email, password FROM users WHERE email = ?");
if (!$stmt) {
  http_response_code(500);
  echo json_encode([
    'success' => false,
    'error' => 'Prepare failed: ' . $conn->error
  ]);
  exit;
}

$stmt->bind_param("s", $email);
if (!$stmt->execute()) {
  http_response_code(500);
  echo json_encode([
    'success' => false,
    'error' => 'Execute failed: ' . $stmt->error
  ]);
  exit;
}

$result = $stmt->get_result();

// Step 3: Check if user exists
if ($result->num_rows === 0) {
  http_response_code(401);
  echo json_encode([
    'success' => false,
    'error' => 'User not found',
    'searched_email' => $email
  ]);
  $stmt->close();
  exit;
}

$user = $result->fetch_assoc();
$stmt->close();

// Step 4: Verify password
$password_hash = $user['password'];
$password_match = password_verify($password, $password_hash);

if (!$password_match) {
  http_response_code(401);
  echo json_encode([
    'success' => false,
    'error' => 'Password verification failed',
    'debug' => [
      'email_found' => true,
      'password_hash_type' => substr($password_hash, 0, 10) . '...',
      'password_verify_result' => false,
      'password_length' => strlen($password),
      'hash_length' => strlen($password_hash)
    ]
  ]);
  exit;
}

// Step 5: Success
unset($user['password']);
http_response_code(200);
echo json_encode([
  'success' => true,
  'message' => 'Login successful',
  'user' => $user
]);

$conn->close();
?>