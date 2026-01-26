<?php
// filepath: C:\xampp\htdocs\smart_budget\api\add-expense.php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  http_response_code(200);
  exit;
}

require_once __DIR__ . '/../config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  http_response_code(405);
  echo json_encode(['success' => false, 'error' => 'Method not allowed']);
  exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$user_id = intval($input['user_id'] ?? 0);
$description = trim($input['description'] ?? '');
$amount = floatval($input['amount'] ?? 0);
$category = trim($input['category'] ?? 'Other');
$date = isset($input['date']) ? $input['date'] : date('Y-m-d H:i:s');

if (!$user_id || $amount <= 0) {
  http_response_code(400);
  echo json_encode(['success' => false, 'error' => 'Invalid user_id or amount']);
  exit;
}

// Insert expense
$stmt = $conn->prepare("INSERT INTO expenses (user_id, description, amount, category, date) VALUES (?, ?, ?, ?, ?)");
$stmt->bind_param("isdss", $user_id, $description, $amount, $category, $date);
if (!$stmt->execute()) {
  http_response_code(500);
  echo json_encode(['success' => false, 'error' => 'Failed to insert expense']);
  $stmt->close();
  $conn->close();
  exit;
}
$expense_id = $conn->insert_id;
$stmt->close();

// Update budget totals
$stmt = $conn->prepare("SELECT id FROM user_budgets WHERE user_id = ?");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$res = $stmt->get_result();

if ($res->num_rows === 0) {
  // Create budget row if missing
  $ins = $conn->prepare("INSERT INTO user_budgets (user_id, monthly_budget, total_spent, total_saved) VALUES (?, 0, ?, 0)");
  $ins->bind_param("id", $user_id, $amount);
  $ins->execute();
  $ins->close();
} else {
  // Update total_spent
  $upd = $conn->prepare("UPDATE user_budgets SET total_spent = total_spent + ? WHERE user_id = ?");
  $upd->bind_param("di", $amount, $user_id);
  $upd->execute();
  $upd->close();
}
$stmt->close();

// Return the newly created expense and updated budget
$stmt2 = $conn->prepare("SELECT id, user_id, description, amount, category, date FROM expenses WHERE id = ?");
$stmt2->bind_param("i", $expense_id);
$stmt2->execute();
$res2 = $stmt2->get_result();
$expense = $res2->fetch_assoc();
$stmt2->close();

$stmt3 = $conn->prepare("SELECT id, user_id, monthly_budget, total_spent, total_saved FROM user_budgets WHERE user_id = ?");
$stmt3->bind_param("i", $user_id);
$stmt3->execute();
$res3 = $stmt3->get_result();
$budget = $res3->fetch_assoc();
$stmt3->close();

// Recalculate total_spent from actual expenses for accuracy
$stmt4 = $conn->prepare("SELECT COALESCE(SUM(amount), 0) as calculated_spent FROM expenses WHERE user_id = ?");
$stmt4->bind_param("i", $user_id);
$stmt4->execute();
$spent_result = $stmt4->get_result();
$spent_row = $spent_result->fetch_assoc();
$budget['total_spent'] = floatval($spent_row['calculated_spent']);
$stmt4->close();

// Convert to numbers
$budget['id'] = intval($budget['id']);
$budget['monthly_budget'] = floatval($budget['monthly_budget']);
$budget['total_spent'] = floatval($budget['total_spent']);
$budget['total_saved'] = floatval($budget['total_saved']);

http_response_code(200);
echo json_encode([
  'success' => true,
  'expense' => $expense,
  'budget' => $budget
]);

$conn->close();
?>
