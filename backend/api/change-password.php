<?php
/**
 * Change Password: Update user password
 * 
 * POST /api/change-password.php
 *   Headers: Content-Type: application/json
 *   Body: {
 *     "user_id": 16,
 *     "current_password": "oldpass123",
 *     "new_password": "newpass123"
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
$current_password = $input['current_password'] ?? '';
$new_password = $input['new_password'] ?? '';

// Validate inputs
if (!$user_id || !$current_password || !$new_password) {
  http_response_code(400);
  echo json_encode(['success' => false, 'error' => 'Missing user_id, current_password, or new_password']);
  exit;
}

// Validate new password length
if (strlen($new_password) < 6) {
  http_response_code(400);
  echo json_encode(['success' => false, 'error' => 'New password must be at least 6 characters']);
  exit;
}

// Fetch user to verify current password
$stmt = $conn->prepare("SELECT id, password FROM users WHERE id = ? LIMIT 1");
$stmt->bind_param('i', $user_id);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
  http_response_code(404);
  echo json_encode(['success' => false, 'error' => 'User not found']);
  $stmt->close();
  exit;
}

$user = $result->fetch_assoc();
$stmt->close();

// Verify current password
if (!password_verify($current_password, $user['password'])) {
  http_response_code(401);
  echo json_encode(['success' => false, 'error' => 'Current password is incorrect']);
  exit;
}

// Hash new password
$hashed_password = password_hash($new_password, PASSWORD_BCRYPT);

// Update password
$stmt = $conn->prepare("UPDATE users SET password = ? WHERE id = ?");
$stmt->bind_param('si', $hashed_password, $user_id);

if ($stmt->execute()) {
  http_response_code(200);
  echo json_encode([
    'success' => true,
    'message' => 'Password changed successfully'
  ]);
} else {
  http_response_code(500);
  echo json_encode(['success' => false, 'error' => 'Failed to change password']);
}

$stmt->close();
