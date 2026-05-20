<?php
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

require_once __DIR__ . '/../config.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);

if (!$input) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Invalid JSON input']);
    exit;
}

$transaction_id = $input['transaction_id'] ?? null;
$category = $input['category'] ?? null;
$description = $input['description'] ?? '';
$user_id = intval($input['user_id'] ?? 0);

if (!$transaction_id || !$category || !$user_id) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Missing transaction_id, category, or user_id']);
    exit;
}

$conn->begin_transaction();

$check_sql = "SELECT id, amount, user_id FROM transactions WHERE id = ?";
$stmt = $conn->prepare($check_sql);

if (!$stmt) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Prepare failed: ' . $conn->error]);
    $conn->close();
    exit;
}

$stmt->bind_param("i", $transaction_id);
$stmt->execute();
$result = $stmt->get_result();
$transaction = $result->fetch_assoc();
$stmt->close();

if (!$transaction) {
    http_response_code(404);
    echo json_encode(['success' => false, 'error' => 'Transaction not found']);
    $conn->rollback();
    $conn->close();
    exit;
}

// Convert amount to float
$transaction['amount'] = floatval($transaction['amount']);

// Use the transaction's user_id (it's already linked to a user from SMS extraction)
// This allows any logged-in user to categorize uncategorized transactions
if (!$transaction['user_id']) {
    // If transaction has no user_id, assign it to the requesting user
    $transaction['user_id'] = $user_id;
    $update_user = $conn->prepare("UPDATE transactions SET user_id = ? WHERE id = ?");
    $update_user->bind_param("ii", $user_id, $transaction_id);
    $update_user->execute();
    $update_user->close();
}

// Update the transactions table with the category
$update_sql = "UPDATE transactions 
               SET category = ?, 
                   updated_at = NOW()
               WHERE id = ?";

$stmt = $conn->prepare($update_sql);

if (!$stmt) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Prepare failed: ' . $conn->error]);
    $conn->rollback();
    $conn->close();
    exit;
}

$stmt->bind_param("si", $category, $transaction_id);
if (!$stmt->execute()) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Update failed: ' . $stmt->error]);
    $conn->rollback();
    $stmt->close();
    $conn->close();
    exit;
}
$stmt->close();

$expense_description = "Cash withdrawal categorized as: $category";
if ($description) {
    $expense_description .= " - " . $description;
}

$insert_sql = "INSERT INTO expenses 
               (user_id, amount, category, description, date, created_at) 
               VALUES (?, ?, ?, ?, ?, NOW())";

$stmt = $conn->prepare($insert_sql);

if (!$stmt) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Prepare failed: ' . $conn->error]);
    $conn->rollback();
    $conn->close();
    exit;
}

$expense_date = date('Y-m-d');
$amount = floatval($transaction['amount']);
$transaction_user_id = intval($transaction['user_id']);
$stmt->bind_param("idsss", $transaction_user_id, $amount, $category, $expense_description, $expense_date);
if (!$stmt->execute()) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Insert failed: ' . $stmt->error]);
    $conn->rollback();
    $stmt->close();
    $conn->close();
    exit;
}
$expense_id = $conn->insert_id;
$stmt->close();

// Update user_budgets.total_spent (like add-expense.php does)
$budget_check = $conn->prepare("SELECT id FROM user_budgets WHERE user_id = ?");
$budget_check->bind_param("i", $transaction_user_id);
$budget_check->execute();
$budget_res = $budget_check->get_result();

if ($budget_res->num_rows === 0) {
    // Create budget row if missing
    $budget_ins = $conn->prepare("INSERT INTO user_budgets (user_id, monthly_budget, total_spent, total_saved) VALUES (?, 0, ?, 0)");
    $budget_ins->bind_param("id", $transaction_user_id, $transaction['amount']);
    $budget_ins->execute();
    $budget_ins->close();
} else {
    // Update total_spent by adding the expense amount
    $budget_upd = $conn->prepare("UPDATE user_budgets SET total_spent = total_spent + ? WHERE user_id = ?");
    $budget_upd->bind_param("di", $transaction['amount'], $transaction_user_id);
    $budget_upd->execute();
    $budget_upd->close();
}
$budget_check->close();

$conn->commit();

http_response_code(200);
echo json_encode([
    'success' => true,
    'message' => 'Cash withdrawal categorized successfully',
    'transaction_id' => $transaction_id,
    'category' => $category,
    'expense_id' => $expense_id,
    'amount_added_to_spent' => floatval($transaction['amount'])
]);

$conn->close();
