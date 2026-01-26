<?php
require_once __DIR__ . '/../config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  http_response_code(405);
  echo json_encode(['success' => false, 'error' => 'Method not allowed']);
  exit;
}

$input = json_decode(file_get_contents('php://input'), true);

if (!isset($input['user_id']) || !isset($input['goal_name']) || !isset($input['target_amount'])) {
  http_response_code(400);
  echo json_encode(['success' => false, 'error' => 'Missing required fields']);
  exit;
}

$user_id = intval($input['user_id']);
$goal_name = trim($input['goal_name']);
$target_amount = floatval($input['target_amount']);

if ($target_amount <= 0 || empty($goal_name)) {
  http_response_code(400);
  echo json_encode(['success' => false, 'error' => 'Invalid input']);
  exit;
}

$stmt = $conn->prepare("INSERT INTO savings_goals (user_id, goal_name, target_amount, current_amount) VALUES (?, ?, ?, 0)");
$stmt->bind_param("isd", $user_id, $goal_name, $target_amount);

if (!$stmt->execute()) {
  $stmt->close();
  http_response_code(500);
  echo json_encode(['success' => false, 'error' => 'Insert failed']);
  exit;
}

$goal_id = $stmt->insert_id;
$stmt->close();

$conn->close();

http_response_code(201);
echo json_encode([
  'success' => true,
  'goal' => [
    'id' => $goal_id,
    'goal_name' => $goal_name,
    'target_amount' => $target_amount,
    'current_amount' => 0
  ]
]);
?>
