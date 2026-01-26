<?php
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

if (!isset($input['id']) && !isset($input['expense_id'])) {
  http_response_code(400);
  echo json_encode(['success' => false, 'error' => 'Missing required fields']);
  exit;
}

$expense_id = intval($input['expense_id'] ?? $input['id'] ?? 0);
$user_id = intval($input['user_id'] ?? 0);
if (!$expense_id || !$user_id) {
  http_response_code(400);
  echo json_encode(['success' => false, 'error' => 'Invalid expense_id or user_id']);
  exit;
}

// Get the expense amount before deleting (needed to update total_spent)
$get_expense = $conn->prepare("SELECT amount FROM expenses WHERE id = ? AND user_id = ?");
$get_expense->bind_param("ii", $expense_id, $user_id);
$get_expense->execute();
$expense_result = $get_expense->get_result();

if ($expense_result->num_rows === 0) {
  $get_expense->close();
  http_response_code(404);
  echo json_encode(['success' => false, 'error' => 'Expense not found']);
  exit;
}

$expense = $expense_result->fetch_assoc();
$expense_amount = floatval($expense['amount']);
$get_expense->close();

// Delete expense
$stmt = $conn->prepare("DELETE FROM expenses WHERE id = ? AND user_id = ?");
$stmt->bind_param("ii", $expense_id, $user_id);
if (!$stmt->execute()) {
  $stmt->close();
  http_response_code(500);
  echo json_encode(['success' => false, 'error' => 'Delete failed']);
  exit;
}
$stmt->close();

// Update total_spent in user_budgets (subtract the expense amount)
$update_budget = $conn->prepare("UPDATE user_budgets SET total_spent = total_spent - ? WHERE user_id = ?");
$update_budget->bind_param("di", $expense_amount, $user_id);
$update_budget->execute();
$update_budget->close();

// Recalculate total_spent from all remaining expenses
$sum = $conn->prepare("SELECT COALESCE(SUM(amount), 0) as total FROM expenses WHERE user_id = ?");
$sum->bind_param("i", $user_id);
$sum->execute();
$result = $sum->get_result()->fetch_assoc();
$total = floatval($result['total']);
$sum->close();

// Update budget to match recalculated total
$update = $conn->prepare("UPDATE user_budgets SET total_spent = ? WHERE user_id = ?");
$update->bind_param("di", $total, $user_id);
$update->execute();
$update->close();

// Get updated budget
$budget_stmt = $conn->prepare("SELECT id, user_id, monthly_budget, total_spent, total_saved FROM user_budgets WHERE user_id = ?");
$budget_stmt->bind_param("i", $user_id);
$budget_stmt->execute();
$budget_result = $budget_stmt->get_result();
$budget = $budget_result->fetch_assoc();
$budget_stmt->close();

// Convert budget values to numbers
$budget['id'] = intval($budget['id']);
$budget['monthly_budget'] = floatval($budget['monthly_budget']);
$budget['total_spent'] = floatval($budget['total_spent']);
$budget['total_saved'] = floatval($budget['total_saved']);

$conn->close();

http_response_code(200);
echo json_encode(['success' => true, 'message' => 'Expense deleted', 'budget' => $budget]);
?>
