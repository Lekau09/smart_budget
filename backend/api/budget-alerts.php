<?php
/**
 * budget-alerts.php
 * Checks budget thresholds and creates alerts.
 * Called after every expense save.
 * GET /api/budget-alerts.php?user_id=X
 */
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }

require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../helpers/NotificationManager.php';

$user_id = intval($_GET['user_id'] ?? $_POST['user_id'] ?? 0);
if (!$user_id) { echo json_encode(['success'=>false,'error'=>'Missing user_id']); exit; }

try {
    // Get budget + real spent from expenses
    $stmt = $conn->prepare("
        SELECT ub.monthly_budget,
               COALESCE(SUM(e.amount),0) AS total_spent
        FROM user_budgets ub
        LEFT JOIN expenses e ON e.user_id = ub.user_id
            AND MONTH(e.date) = MONTH(CURDATE())
            AND YEAR(e.date)  = YEAR(CURDATE())
        WHERE ub.user_id = ?
        GROUP BY ub.monthly_budget
    ");
    $stmt->bind_param('i', $user_id);
    $stmt->execute();
    $row = $stmt->get_result()->fetch_assoc();
    $stmt->close();

    if (!$row) { echo json_encode(['success'=>true,'alerts'=>[]]); exit; }

    $budget    = floatval($row['monthly_budget']);
    $spent     = floatval($row['total_spent']);
    $remaining = $budget - $spent;
    $pct       = $budget > 0 ? ($spent / $budget) * 100 : 0;
    $alerts    = [];

    // Check which alerts already sent this month to avoid duplicates
    $stmt = $conn->prepare("
        SELECT title FROM notifications
        WHERE user_id = ? AND type = 'budget'
          AND MONTH(created_at) = MONTH(CURDATE())
          AND YEAR(created_at)  = YEAR(CURDATE())
    ");
    $stmt->bind_param('i', $user_id);
    $stmt->execute();
    $res = $stmt->get_result();
    $sent = [];
    while ($r = $res->fetch_assoc()) $sent[] = $r['title'];
    $stmt->close();

    // 50% alert
    if ($pct >= 50 && $pct < 75) {
        $title = '📊 Half your budget used';
        if (!in_array($title, $sent)) {
            NotificationManager::create($conn, $user_id, [
                'type'       => 'budget',
                'title'      => $title,
                'message'    => "You've used 50% of your budget. M" . number_format($remaining,2) . " remaining.",
                'action_url' => '/dashboard',
            ]);
            $alerts[] = $title;
        }
    }

    // 75% alert
    if ($pct >= 75 && $pct < 90) {
        $title = '⚠️ Budget Alert — 75% used';
        if (!in_array($title, $sent)) {
            NotificationManager::create($conn, $user_id, [
                'type'       => 'budget',
                'title'      => $title,
                'message'    => "You've used 75% of your monthly budget. Only M" . number_format($remaining,2) . " left.",
                'action_url' => '/dashboard',
            ]);
            $alerts[] = $title;
        }
    }

    // 90% alert
    if ($pct >= 90 && $pct < 100) {
        $title = '🚨 Budget Critical — 90% used';
        if (!in_array($title, $sent)) {
            NotificationManager::create($conn, $user_id, [
                'type'       => 'budget',
                'title'      => $title,
                'message'    => "Only M" . number_format($remaining,2) . " left this month. Slow down spending!",
                'action_url' => '/dashboard',
            ]);
            $alerts[] = $title;
        }
    }

    // 100% exceeded
    if ($pct >= 100) {
        $excess = $spent - $budget;
        $title  = '🔴 Budget Exceeded!';
        if (!in_array($title, $sent)) {
            NotificationManager::create($conn, $user_id, [
                'type'       => 'budget',
                'title'      => $title,
                'message'    => "You've exceeded your budget by M" . number_format($excess,2) . " this month.",
                'action_url' => '/dashboard',
            ]);
            $alerts[] = $title;
        }
    }

    echo json_encode([
        'success'    => true,
        'budget'     => $budget,
        'spent'      => $spent,
        'remaining'  => $remaining,
        'percentage' => round($pct, 1),
        'alerts_sent'=> $alerts,
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success'=>false,'error'=>$e->getMessage()]);
}
$conn->close();
?>
