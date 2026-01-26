<?php
// filepath: C:\xampp\htdocs\smart_budget\api\get-expenses.php
require_once __DIR__ . '/../config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
  http_response_code(405);
  echo json_encode(['success' => false, 'error' => 'Method not allowed']);
  exit;
}

if (!isset($_GET['user_id'])) {
  http_response_code(400);
  echo json_encode(['success' => false, 'error' => 'User ID required']);
  exit;
}

$user_id = intval($_GET['user_id']);
$limit = intval($_GET['limit'] ?? 50);
$offset = intval($_GET['offset'] ?? 0);

// Get all expenses for user
$stmt = $conn->prepare("SELECT id, user_id, description, amount, category, date FROM expenses WHERE user_id = ? ORDER BY date DESC LIMIT ? OFFSET ?");
$stmt->bind_param("iii", $user_id, $limit, $offset);
$stmt->execute();
$res = $stmt->get_result();

$expenses = [];
while ($row = $res->fetch_assoc()) {
  $expenses[] = $row;
}
$stmt->close();

http_response_code(200);
echo json_encode([
  'success' => true,
  'expenses' => $expenses
]);

$conn->close();
?>
