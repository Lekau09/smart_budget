<?php
// filepath: C:\xampp\htdocs\smart_budget\api\signup.php
error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once __DIR__ . '/../config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  http_response_code(405);
  echo json_encode(['success' => false, 'error' => 'Method not allowed']);
  exit;
}

$input = json_decode(file_get_contents('php://input'), true);

$name = isset($input['name']) ? trim($input['name']) : '';
$email = isset($input['email']) ? trim($input['email']) : '';
$password = isset($input['password']) ? $input['password'] : '';

if (!$name || !$email || !$password) {
  http_response_code(400);
  echo json_encode(['success' => false, 'error' => 'All fields are required']);
  exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
  http_response_code(400);
  echo json_encode(['success' => false, 'error' => 'Invalid email format']);
  exit;
}

if (strlen($password) < 6) {
  http_response_code(400);
  echo json_encode(['success' => false, 'error' => 'Password must be at least 6 characters']);
  exit;
}

$stmt = $conn->prepare("SELECT id FROM users WHERE email = ?");
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

$hashed_password = password_hash($password, PASSWORD_DEFAULT);

$stmt = $conn->prepare("INSERT INTO users (name, email, password) VALUES (?, ?, ?)");
$stmt->bind_param("sss", $name, $email, $hashed_password);

if ($stmt->execute()) {
  $user_id = $conn->insert_id;
  http_response_code(201);
  echo json_encode([
    'success' => true,
    'message' => 'Signup successful',
    'user' => [
      'id' => $user_id,
      'name' => $name,
      'email' => $email
    ]
  ]);
} else {
  http_response_code(500);
  echo json_encode(['success' => false, 'error' => 'Signup failed: ' . $stmt->error]);
}

$stmt->close();
$conn->close();
?>