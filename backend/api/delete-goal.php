<?php
// filepath: C:\xampp\htdocs\smart_budget\api\delete-goal.php
require_once __DIR__ . '/../config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  http_response_code(405);
  echo json_encode(['success' => false, 'error' => 'Method not allowed']);
  exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$user_id = intval($input['user_id'] ?? 0);
$goal_id = intval($input['goal_id'] ?? 0);

if (!$user_id || !$goal_id) {
  http_response_code(400);
  echo json_encode(['success' => false, 'error' => 'Missing user_id or goal_id']);
  exit;
}

// Verify goal belongs to user
$stmt = $conn->prepare("SELECT id FROM savings_goals WHERE id = ? AND user_id = ?");
$stmt->bind_param("ii", $goal_id, $user_id);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
  http_response_code(404);
  echo json_encode(['success' => false, 'error' => 'Goal not found']);
  $stmt->close();
  exit;
}

$stmt->close();

// Delete goal
$stmt = $conn->prepare("DELETE FROM savings_goals WHERE id = ? AND user_id = ?");
$stmt->bind_param("ii", $goal_id, $user_id);

if (!$stmt->execute()) {
  http_response_code(500);
  echo json_encode(['success' => false, 'error' => 'Delete failed']);
  $stmt->close();
  exit;
}

$stmt->close();

echo json_encode(['success' => true]);
?>
