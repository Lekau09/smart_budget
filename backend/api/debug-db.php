<?php
header("Content-Type: application/json");

$host = 'localhost';
$user = 'root';
$pass = '';
$db = 'smart_budget';

$conn = new mysqli($host, $user, $pass, $db);
if ($conn->connect_error) {
  echo json_encode(['error' => 'Connection failed']);
  exit;
}

// Get all users
$users = $conn->query("SELECT id, name, email FROM users");
$userList = [];
while ($row = $users->fetch_assoc()) {
  $userList[] = $row;
}

// Get expenses for user 1
$expenses = $conn->query("SELECT id, user_id, description, amount, category FROM expenses WHERE user_id = 1");
$expenseList = [];
while ($row = $expenses->fetch_assoc()) {
  $expenseList[] = $row;
}

// Get budget for user 1
$budget = $conn->query("SELECT * FROM user_budgets WHERE user_id = 1")->fetch_assoc();

$conn->close();

echo json_encode([
  'users' => $userList,
  'user_1_expenses_count' => count($expenseList),
  'user_1_expenses' => $expenseList,
  'user_1_budget' => $budget
]);
?>
