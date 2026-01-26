<?php
// Update an existing expense transaction
require_once __DIR__ . '/../config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  http_response_code(405);
  echo json_encode(['success' => false, 'error' => 'Method not allowed']);
  exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$expense_id = intval($input['expense_id'] ?? 0);
$user_id = intval($input['user_id'] ?? 0);
$description = trim($input['description'] ?? '');
$amount = floatval($input['amount'] ?? 0);
$category = trim($input['category'] ?? 'Other');
$date = $input['date'] ?? date('Y-m-d H:i:s');

if (!$expense_id || !$user_id) {
  http_response_code(400);
  echo json_encode(['success' => false, 'error' => 'Missing expense_id or user_id']);
  exit;
}

if (!$description || $amount <= 0) {
  http_response_code(400);
  echo json_encode(['success' => false, 'error' => 'Invalid description or amount']);
  exit;
}

try {
  // Verify expense belongs to user
  $check = $conn->prepare("SELECT id FROM expenses WHERE id = ? AND user_id = ?");
  $check->bind_param("ii", $expense_id, $user_id);
  $check->execute();
  $result = $check->get_result();
  
  if ($result->num_rows === 0) {
    http_response_code(403);
    echo json_encode(['success' => false, 'error' => 'Expense not found or unauthorized']);
    exit;
  }
  $check->close();

  // Update the expense
  $stmt = $conn->prepare("
    UPDATE expenses 
    SET description = ?, amount = ?, category = ?, date = ? 
    WHERE id = ? AND user_id = ?
  ");
  $stmt->bind_param("sdssii", $description, $amount, $category, $date, $expense_id, $user_id);
  
  if (!$stmt->execute()) {
    throw new Exception('Failed to update expense');
  }
  $stmt->close();

  // Return updated expense
  $get = $conn->prepare("SELECT id, user_id, description, amount, category, date FROM expenses WHERE id = ?");
  $get->bind_param("i", $expense_id);
  $get->execute();
  $result = $get->get_result();
  
  if ($result->num_rows > 0) {
    $expense = $result->fetch_assoc();
    echo json_encode(['success' => true, 'expense' => $expense]);
  } else {
    throw new Exception('Failed to retrieve updated expense');
  }
  $get->close();

} catch (Exception $e) {
  http_response_code(500);
  echo json_encode(['success' => false, 'error' => $e->getMessage()]);
} finally {
  $conn->close();
}
?>
