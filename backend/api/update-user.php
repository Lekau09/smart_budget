<?php
/**
 * Update User Profile: Update name, email
 * 
 * POST /api/update-user.php
 *   Headers: Content-Type: application/json
 *   Body: {
 *     "user_id": 16,
 *     "name": "John Doe",
 *     "email": "john@example.com"
 *   }
 */

header('Content-Type: application/json');

require_once __DIR__ . '/../config.php';

// Only POST allowed
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  http_response_code(405);
  echo json_encode(['success' => false, 'error' => 'Method not allowed']);
  exit;
}

// Get JSON input
$input = json_decode(file_get_contents('php://input'), true);

if (!$input) {
  http_response_code(400);
  echo json_encode(['success' => false, 'error' => 'Invalid JSON input']);
  exit;
}

$user_id = intval($input['user_id'] ?? 0);
$name = trim($input['name'] ?? '');
$email = trim($input['email'] ?? '');

// Validate inputs
if (!$user_id || !$name || !$email) {
  http_response_code(400);
  echo json_encode(['success' => false, 'error' => 'Missing or invalid user_id, name, or email']);
  exit;
}

// Validate email format
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
  http_response_code(400);
  echo json_encode(['success' => false, 'error' => 'Invalid email format']);
  exit;
}

// Check if user exists
$stmt = $conn->prepare("SELECT id FROM users WHERE id = ? LIMIT 1");
$stmt->bind_param('i', $user_id);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
  http_response_code(404);
  echo json_encode(['success' => false, 'error' => 'User not found']);
  $stmt->close();
  exit;
}
$stmt->close();

// Check if email is already taken by another user
$stmt = $conn->prepare("SELECT id FROM users WHERE email = ? AND id != ? LIMIT 1");
$stmt->bind_param('si', $email, $user_id);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
  http_response_code(409);
  echo json_encode(['success' => false, 'error' => 'Email already in use by another account']);
  $stmt->close();
  exit;
}
$stmt->close();

// Update user
$stmt = $conn->prepare("UPDATE users SET name = ?, email = ? WHERE id = ?");
$stmt->bind_param('ssi', $name, $email, $user_id);

if ($stmt->execute()) {
  // Fetch updated user
  $fetch = $conn->prepare("SELECT id, name, email, created_at FROM users WHERE id = ? LIMIT 1");
  $fetch->bind_param('i', $user_id);
  $fetch->execute();
  $result = $fetch->get_result();
  $user = $result->fetch_assoc();
  $fetch->close();

  http_response_code(200);
  echo json_encode([
    'success' => true,
    'message' => 'Profile updated successfully',
    'user' => $user
  ]);
} else {
  http_response_code(500);
  echo json_encode(['success' => false, 'error' => 'Failed to update user profile']);
}

$stmt->close();
?>
