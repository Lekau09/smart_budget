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

// Get optional month and year parameters (default to current month/year)
$month = isset($_GET['month']) ? intval($_GET['month']) : date('n');
$year = isset($_GET['year']) ? intval($_GET['year']) : date('Y');

// Validate month and year
if ($month < 1 || $month > 12) {
  $month = date('n');
}
if ($year < 2000 || $year > 2100) {
  $year = date('Y');
}

// ensure budget row exists for this month/year (first-time users get zeros)
$stmt = $conn->prepare("SELECT id, monthly_budget, total_spent, total_saved FROM user_budgets WHERE user_id = ? AND month = ? AND year = ?");
$stmt->bind_param("iii", $user_id, $month, $year);
$stmt->execute();
$res = $stmt->get_result();
if ($res->num_rows === 0) {
  $ins = $conn->prepare("INSERT INTO user_budgets (user_id, month, year, monthly_budget, total_spent, total_saved) VALUES (?, ?, ?, 0, 0, 0)");
  $ins->bind_param("iii", $user_id, $month, $year);
  $ins->execute();
  $ins->close();
  $budget = ['id' => $conn->insert_id, 'user_id' => $user_id, 'monthly_budget' => 0.00, 'total_spent' => 0.00, 'total_saved' => 0.00];
} else {
  $budget = $res->fetch_assoc();
}
$stmt->close();

// RECALCULATE total_spent from actual expenses for the selected month/year (single source of truth)
$start_date = "$year-" . str_pad($month, 2, "0", STR_PAD_LEFT) . "-01";
$end_date = date('Y-m-t', strtotime($start_date)); // Last day of the month

$stmt = $conn->prepare("SELECT COALESCE(SUM(amount), 0) as calculated_spent FROM expenses WHERE user_id = ? AND DATE(date) BETWEEN ? AND ?");
$stmt->bind_param("iss", $user_id, $start_date, $end_date);
$stmt->execute();
$spent_result = $stmt->get_result();
$spent_row = $spent_result->fetch_assoc();
$calculated_total_spent = floatval($spent_row['calculated_spent']);
$stmt->close();

// RECALCULATE total_saved from actual savings_goals for the selected month/year
$stmt = $conn->prepare("SELECT COALESCE(SUM(current_amount), 0) as calculated_saved FROM savings_goals WHERE user_id = ? AND month = ? AND year = ?");
$stmt->bind_param("iii", $user_id, $month, $year);
$stmt->execute();
$saved_result = $stmt->get_result();
$saved_row = $saved_result->fetch_assoc();
$calculated_total_saved = floatval($saved_row['calculated_saved']);
$stmt->close();

// Update budget with recalculated totals
$budget['total_spent'] = $calculated_total_spent;
$budget['total_saved'] = $calculated_total_saved;
$budget['period'] = ['month' => $month, 'year' => $year, 'start_date' => $start_date, 'end_date' => $end_date];

// Convert budget values to numbers (floats)
$budget['id'] = intval($budget['id']);
$budget['monthly_budget'] = floatval($budget['monthly_budget']);
$budget['total_spent'] = floatval($budget['total_spent']);
$budget['total_saved'] = floatval($budget['total_saved']);

// recent expenses from selected month/year
$stmt = $conn->prepare("SELECT id, description, amount, category, date FROM expenses WHERE user_id = ? AND DATE(date) BETWEEN ? AND ? ORDER BY date DESC LIMIT 6");
$stmt->bind_param("iss", $user_id, $start_date, $end_date);
$stmt->execute();
$er = $stmt->get_result();
$expenses = [];
while ($r = $er->fetch_assoc()) {
  $expenses[] = $r;
}
$stmt->close();

// categories for pie - filtered by month/year
$stmt = $conn->prepare("SELECT IFNULL(category, 'Other') AS category, SUM(amount) AS total FROM expenses WHERE user_id = ? AND DATE(date) BETWEEN ? AND ? GROUP BY category");
$stmt->bind_param("iss", $user_id, $start_date, $end_date);
$stmt->execute();
$cr = $stmt->get_result();
$categories = [];
while ($r = $cr->fetch_assoc()) {
  $categories[] = ['name' => $r['category'], 'value' => floatval($r['total'])];
}
$stmt->close();

// category budget allocations for the selected month/year
$stmt = $conn->prepare("SELECT category_name, allocated_amount, spent_amount FROM budget_categories WHERE user_id = ? AND month = ? AND year = ?");
$stmt->bind_param("iii", $user_id, $month, $year);
$stmt->execute();
$br = $stmt->get_result();
$category_budgets = [];
while ($r = $br->fetch_assoc()) {
  $category_budgets[] = [
    'name' => $r['category_name'],
    'allocated_amount' => floatval($r['allocated_amount']),
    'spent_amount' => floatval($r['spent_amount'] ?? 0)
  ];
}
$stmt->close();

// goals - filtered by month/year
$stmt = $conn->prepare("SELECT id, goal_name, target_amount, current_amount FROM savings_goals WHERE user_id = ? AND month = ? AND year = ? ORDER BY created_at DESC");
$stmt->bind_param("iii", $user_id, $month, $year);
$stmt->execute();
$gr = $stmt->get_result();
$goals = [];
while ($r = $gr->fetch_assoc()) {
  $goals[] = $r;
}
$stmt->close();

$remaining = floatval($budget['monthly_budget']) - floatval($budget['total_spent']) - floatval($budget['total_saved']);
http_response_code(200);
echo json_encode([
  'success' => true,
  'budget' => array_merge($budget, ['category_budgets' => $category_budgets]),
  'expenses' => $expenses,
  'categories' => $categories,
  'goals' => $goals,
  'remaining' => $remaining
]);

$conn->close();
