<?php
// filepath: C:\xampp\htdocs\smart_budget\api\get-goals.php
require_once __DIR__ . '/../config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
  http_response_code(405);
  echo json_encode(['success' => false, 'error' => 'Method not allowed']);
  exit;
}

$user_id = intval($_GET['user_id'] ?? 0);

if (!$user_id) {
  http_response_code(400);
  echo json_encode(['success' => false, 'error' => 'Missing user_id']);
  exit;
}

$stmt = $conn->prepare("SELECT id, goal_name, target_amount, current_amount, created_at, updated_at FROM savings_goals WHERE user_id = ? ORDER BY created_at DESC");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();

$goals = [];
while ($row = $result->fetch_assoc()) {
  $goals[] = $row;
}

$stmt->close();

echo json_encode([
  'success' => true,
  'goals' => $goals
]);
?>
