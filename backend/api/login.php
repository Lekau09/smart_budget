<?php
// filepath: C:\xampp\htdocs\smart_budget\api\login.php
error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once __DIR__ . '/../config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  http_response_code(405);
  echo json_encode(['success' => false, 'error' => 'Method not allowed. Only POST requests are accepted.']);
  exit;
}

$input = json_decode(file_get_contents('php://input'), true);

if ($input === null) {
  http_response_code(400);
  echo json_encode(['success' => false, 'error' => 'Invalid JSON input']);
  exit;
}

$email = isset($input['email']) ? trim($input['email']) : '';
$password = isset($input['password']) ? $input['password'] : '';

if (!$email || !$password) {
  http_response_code(400);
  echo json_encode(['success' => false, 'error' => 'Email and password required']);
  exit;
}

$stmt = $conn->prepare("SELECT id, name, email, password FROM users WHERE email = ?");
if (!$stmt) {
  http_response_code(500);
  echo json_encode(['success' => false, 'error' => 'Database error: ' . $conn->error]);
  exit;
}

$stmt->bind_param("s", $email);
if (!$stmt->execute()) {
  http_response_code(500);
  echo json_encode(['success' => false, 'error' => 'Query failed: ' . $stmt->error]);
  exit;
}

$result = $stmt->get_result();

if ($result->num_rows === 0) {
  http_response_code(401);
  echo json_encode(['success' => false, 'error' => 'User not found']);
  $stmt->close();
  exit;
}

$user = $result->fetch_assoc();
$stmt->close();

if (!password_verify($password, $user['password'])) {
  http_response_code(401);
  echo json_encode(['success' => false, 'error' => 'Password incorrect']);
  exit;
}

unset($user['password']);

http_response_code(200);
echo json_encode([
  'success' => true,
  'message' => 'Login successful',
  'user' => $user
]);

$conn->close();
?>