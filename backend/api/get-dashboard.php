<?php
// filepath: C:\xampp\htdocs\smart_budget\api\get-dashboard.php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  http_response_code(200);
  exit;
}

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

// ensure budget row exists (first-time users get zeros)
$stmt = $conn->prepare("SELECT id, monthly_budget, total_spent, total_saved FROM user_budgets WHERE user_id = ?");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$res = $stmt->get_result();
if ($res->num_rows === 0) {
  $ins = $conn->prepare("INSERT INTO user_budgets (user_id, monthly_budget, total_spent, total_saved) VALUES (?, 0, 0, 0)");
  $ins->bind_param("i", $user_id);
  $ins->execute();
  $ins->close();
  $budget = ['id' => $conn->insert_id, 'user_id' => $user_id, 'monthly_budget' => 0.00, 'total_spent' => 0.00, 'total_saved' => 0.00];
} else {
  $budget = $res->fetch_assoc();
}
$stmt->close();

// RECALCULATE total_spent from actual expenses (single source of truth)
$stmt = $conn->prepare("SELECT COALESCE(SUM(amount), 0) as calculated_spent FROM expenses WHERE user_id = ?");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$spent_result = $stmt->get_result();
$spent_row = $spent_result->fetch_assoc();
$calculated_total_spent = floatval($spent_row['calculated_spent']);
$stmt->close();

// Update budget with recalculated total_spent
$budget['total_spent'] = $calculated_total_spent;

// Convert budget values to numbers (floats)
$budget['id'] = intval($budget['id']);
$budget['monthly_budget'] = floatval($budget['monthly_budget']);
$budget['total_spent'] = floatval($budget['total_spent']);
$budget['total_saved'] = floatval($budget['total_saved']);

// recent expenses
$stmt = $conn->prepare("SELECT id, description, amount, category, date FROM expenses WHERE user_id = ? ORDER BY date DESC LIMIT 6");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$er = $stmt->get_result();
$expenses = [];
while ($r = $er->fetch_assoc()) {
  $expenses[] = $r;
}
$stmt->close();

// categories for pie
$stmt = $conn->prepare("SELECT IFNULL(category, 'Other') AS category, SUM(amount) AS total FROM expenses WHERE user_id = ? GROUP BY category");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$cr = $stmt->get_result();
$categories = [];
while ($r = $cr->fetch_assoc()) {
  $categories[] = ['name' => $r['category'], 'value' => floatval($r['total'])];
}
$stmt->close();

// goals
$stmt = $conn->prepare("SELECT id, goal_name, target_amount, current_amount FROM savings_goals WHERE user_id = ? ORDER BY created_at DESC");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$gr = $stmt->get_result();
$goals = [];
while ($r = $gr->fetch_assoc()) {
  $goals[] = $r;
}
$stmt->close();

$remaining = floatval($budget['monthly_budget']) - floatval($budget['total_spent']);
http_response_code(200);
echo json_encode([
  'success' => true,
  'budget' => $budget,
  'expenses' => $expenses,
  'categories' => $categories,
  'goals' => $goals,
  'remaining' => $remaining
]);

$conn->close();
?>