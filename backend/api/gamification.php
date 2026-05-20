<?php
/**
 * gamification.php
 * Calculates real gamification data from the user's actual spending history.
 * GET /api/gamification.php?user_id=X
 *
 * Returns: level, xp, streak, badges, challenges
 */
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }

require_once __DIR__ . '/../config.php';

$user_id = intval($_GET['user_id'] ?? 0);
if (!$user_id) {
    echo json_encode(['success' => false, 'error' => 'Missing user_id']);
    exit;
}

// ─────────────────────────────────────────────────────────────────
// 1. RAW STATS FROM DATABASE
// ─────────────────────────────────────────────────────────────────

// Total transactions
$stmt = $conn->prepare("SELECT COUNT(*) FROM expenses WHERE user_id = ?");
$stmt->bind_param('i', $user_id);
$stmt->execute();
$total_transactions = $stmt->get_result()->fetch_row()[0];
$stmt->close();

// Total categorized (not 'Other')
$stmt = $conn->prepare("SELECT COUNT(*) FROM expenses WHERE user_id = ? AND category != 'Other'");
$stmt->bind_param('i', $user_id);
$stmt->execute();
$categorized = $stmt->get_result()->fetch_row()[0];
$stmt->close();

// Total SMS auto-imported
$stmt = $conn->prepare("SELECT COUNT(*) FROM expenses WHERE user_id = ? AND description != '' AND description IS NOT NULL");
$stmt->bind_param('i', $user_id);
$stmt->execute();
$sms_imported = $stmt->get_result()->fetch_row()[0];
$stmt->close();

// Total saved (from savings goals)
$stmt = $conn->prepare("SELECT COALESCE(SUM(current_amount), 0) FROM savings_goals WHERE user_id = ?");
$stmt->bind_param('i', $user_id);
$stmt->execute();
$total_saved = floatval($stmt->get_result()->fetch_row()[0]);
$stmt->close();

// Completed savings goals
$stmt = $conn->prepare("SELECT COUNT(*) FROM savings_goals WHERE user_id = ? AND current_amount >= target_amount");
$stmt->bind_param('i', $user_id);
$stmt->execute();
$completed_goals = $stmt->get_result()->fetch_row()[0];
$stmt->close();

// Months under budget
$stmt = $conn->prepare("
    SELECT COUNT(*) FROM (
        SELECT MONTH(date) as m, YEAR(date) as y,
               SUM(amount) as spent
        FROM expenses
        WHERE user_id = ?
        GROUP BY y, m
        HAVING spent <= (
            SELECT monthly_budget FROM user_budgets WHERE user_id = ? LIMIT 1
        )
    ) as under_budget_months
");
$stmt->bind_param('ii', $user_id, $user_id);
$stmt->execute();
$under_budget_months = intval($stmt->get_result()->fetch_row()[0]);
$stmt->close();

// Consecutive day streak — count distinct days with at least 1 expense, working backwards from today
$stmt = $conn->prepare("
    SELECT DISTINCT DATE(date) as expense_date
    FROM expenses
    WHERE user_id = ?
    ORDER BY expense_date DESC
");
$stmt->bind_param('i', $user_id);
$stmt->execute();
$rows = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
$stmt->close();

$streak = 0;
$check_date = new DateTime('today');
foreach ($rows as $row) {
    $expense_date = new DateTime($row['expense_date']);
    $diff = $check_date->diff($expense_date)->days;
    if ($diff === 0 || $diff === 1) {
        $streak++;
        $check_date = $expense_date;
    } else {
        break;
    }
}

// ─────────────────────────────────────────────────────────────────
// 2. XP CALCULATION
// ─────────────────────────────────────────────────────────────────
$xp = 0;
$xp += $total_transactions  * 10;   // 10 XP per transaction
$xp += $categorized         * 5;    // 5 XP per categorized expense
$xp += $completed_goals     * 100;  // 100 XP per completed goal
$xp += $under_budget_months * 50;   // 50 XP per month under budget
$xp += $streak              * 5;    // 5 XP per streak day
if ($total_saved >= 500)  $xp += 25;
if ($total_saved >= 2000) $xp += 50;

// Level calculation (each level costs 20% more XP)
$level    = 1;
$xp_needed = 100;
$cumulative = 0;
while ($cumulative + $xp_needed <= $xp) {
    $cumulative += $xp_needed;
    $level++;
    $xp_needed = intval($xp_needed * 1.2);
}
$progress_pct = $xp_needed > 0
    ? min(100, round((($xp - $cumulative) / $xp_needed) * 100))
    : 100;

// ─────────────────────────────────────────────────────────────────
// 3. BADGES — all calculated from real data
// ─────────────────────────────────────────────────────────────────
$all_badges = [
    [
        'id'     => 'first_transaction',
        'name'   => 'First Step',
        'icon'   => '🎯',
        'desc'   => 'Add your first transaction',
        'earned' => $total_transactions >= 1,
    ],
    [
        'id'     => 'week_streak',
        'name'   => 'Week Warrior',
        'icon'   => '🔥',
        'desc'   => 'Track expenses for 7 days in a row',
        'earned' => $streak >= 7,
    ],
    [
        'id'     => 'budget_keeper',
        'name'   => 'Budget Keeper',
        'icon'   => '🛡️',
        'desc'   => 'Stay under budget for a full month',
        'earned' => $under_budget_months >= 1,
    ],
    [
        'id'     => 'savings_starter',
        'name'   => 'Saver',
        'icon'   => '🐷',
        'desc'   => 'Save M500 towards any goal',
        'earned' => $total_saved >= 500,
    ],
    [
        'id'     => 'goal_getter',
        'name'   => 'Goal Getter',
        'icon'   => '🏆',
        'desc'   => 'Complete your first savings goal',
        'earned' => $completed_goals >= 1,
    ],
    [
        'id'     => 'categorizer',
        'name'   => 'Organizer',
        'icon'   => '📂',
        'desc'   => 'Categorize 20 transactions',
        'earned' => $categorized >= 20,
    ],
    [
        'id'     => 'sms_pro',
        'name'   => 'SMS Pro',
        'icon'   => '📱',
        'desc'   => 'Auto-import 10 transactions via SMS',
        'earned' => $sms_imported >= 10,
    ],
    [
        'id'     => 'rising_star',
        'name'   => 'Rising Star',
        'icon'   => '⭐',
        'desc'   => 'Reach Level 5',
        'earned' => $level >= 5,
    ],
    [
        'id'     => 'budget_master',
        'name'   => 'Budget Master',
        'icon'   => '👑',
        'desc'   => 'Stay under budget 3 months in a row',
        'earned' => $under_budget_months >= 3,
    ],
    [
        'id'     => 'big_saver',
        'name'   => 'Big Saver',
        'icon'   => '💰',
        'desc'   => 'Save M2,000 in total',
        'earned' => $total_saved >= 2000,
    ],
    [
        'id'     => 'consistent',
        'name'   => 'Consistent',
        'icon'   => '📅',
        'desc'   => 'Track 30 transactions total',
        'earned' => $total_transactions >= 30,
    ],
    [
        'id'     => 'goal_crusher',
        'name'   => 'Goal Crusher',
        'icon'   => '🎯',
        'desc'   => 'Complete 3 savings goals',
        'earned' => $completed_goals >= 3,
    ],
];

// ─────────────────────────────────────────────────────────────────
// 4. CHALLENGES — monthly goals with real progress
// ─────────────────────────────────────────────────────────────────

// Get this month's spending total
$this_month = date('n');
$this_year  = date('Y');
$stmt = $conn->prepare("
    SELECT COALESCE(SUM(amount), 0)
    FROM expenses
    WHERE user_id = ? AND MONTH(date) = ? AND YEAR(date) = ?
");
$stmt->bind_param('iii', $user_id, $this_month, $this_year);
$stmt->execute();
$month_spent = floatval($stmt->get_result()->fetch_row()[0]);
$stmt->close();

// Get monthly budget
$stmt = $conn->prepare("SELECT COALESCE(monthly_budget, 0) FROM user_budgets WHERE user_id = ? LIMIT 1");
$stmt->bind_param('i', $user_id);
$stmt->execute();
$monthly_budget = floatval($stmt->get_result()->fetch_row()[0]);
$stmt->close();

// Transactions added this month
$stmt = $conn->prepare("
    SELECT COUNT(*) FROM expenses
    WHERE user_id = ? AND MONTH(date) = ? AND YEAR(date) = ?
");
$stmt->bind_param('iii', $user_id, $this_month, $this_year);
$stmt->execute();
$month_transactions = intval($stmt->get_result()->fetch_row()[0]);
$stmt->close();

// Budget used percentage this month
$budget_pct = $monthly_budget > 0 ? ($month_spent / $monthly_budget) * 100 : 0;
$under_budget_this_month = $budget_pct < 100;

$challenges = [
    [
        'id'       => 'track_10',
        'title'    => 'Track 10 transactions',
        'desc'     => 'Add 10 expenses this month',
        'xp'       => 50,
        'progress' => min(100, round(($month_transactions / 10) * 100)),
        'complete' => $month_transactions >= 10,
    ],
    [
        'id'       => 'stay_under_budget',
        'title'    => 'Stay under budget',
        'desc'     => 'Finish the month within your M' . number_format($monthly_budget, 0) . ' budget',
        'xp'       => 75,
        'progress' => $under_budget_this_month
            ? min(99, round(100 - $budget_pct))
            : 0,
        'complete' => false, // can only complete at month end
    ],
    [
        'id'       => 'categorize_all',
        'title'    => 'Categorize everything',
        'desc'     => 'Have no uncategorized transactions this month',
        'xp'       => 30,
        'progress' => $month_transactions > 0
            ? min(100, round(($categorized / max($total_transactions, 1)) * 100))
            : 0,
        'complete' => $month_transactions > 0 && $categorized >= $total_transactions,
    ],
    [
        'id'       => 'streak_5',
        'title'    => '5-day tracking streak',
        'desc'     => 'Track expenses for 5 days in a row',
        'xp'       => 40,
        'progress' => min(100, round(($streak / 5) * 100)),
        'complete' => $streak >= 5,
    ],
];

// ─────────────────────────────────────────────────────────────────
// 5. RESPONSE
// ─────────────────────────────────────────────────────────────────
echo json_encode([
    'success'     => true,
    'xp'          => $xp,
    'level'       => $level,
    'next_xp'     => $xp_needed,
    'progress_pct'=> $progress_pct,
    'streak'      => $streak,
    'badges'      => $all_badges,
    'challenges'  => $challenges,
    'stats'       => [
        'total_transactions' => $total_transactions,
        'categorized'        => $categorized,
        'sms_imported'       => $sms_imported,
        'total_saved'        => $total_saved,
        'completed_goals'    => $completed_goals,
        'under_budget_months'=> $under_budget_months,
        'streak'             => $streak,
    ],
]);

$conn->close();
?>
