<?php
// filepath: C:\xampp\htdocs\smart_budget\api\update-goal.php
require_once __DIR__ . '/../config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  http_response_code(405);
  echo json_encode(['success' => false, 'error' => 'Method not allowed']);
  exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$user_id = intval($input['user_id'] ?? 0);
$goal_id = intval($input['goal_id'] ?? 0);
$current_amount = floatval($input['current_amount'] ?? 0);

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

// Update goal
$stmt = $conn->prepare("UPDATE savings_goals SET current_amount = ? WHERE id = ? AND user_id = ?");
$stmt->bind_param("dii", $current_amount, $goal_id, $user_id);

if (!$stmt->execute()) {
  http_response_code(500);
  echo json_encode(['success' => false, 'error' => 'Update failed']);
  $stmt->close();
  exit;
}

$stmt->close();

// Return updated goal
$stmt = $conn->prepare("SELECT id, goal_name, target_amount, current_amount FROM savings_goals WHERE id = ?");
$stmt->bind_param("i", $goal_id);
$stmt->execute();
$result = $stmt->get_result();
$goal = $result->fetch_assoc();
$stmt->close();

echo json_encode(['success' => true, 'goal' => $goal]);
?>
