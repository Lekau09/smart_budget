<?php
/**
 * generate-pdf-report.php
 * Generates a monthly PDF report for a user.
 * Uses pure PHP — no external libraries required.
 * GET /api/generate-pdf-report.php?user_id=X&month=4&year=2026
 */
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }

require_once __DIR__ . '/../config.php';

$user_id = intval($_GET['user_id'] ?? 0);
$month   = intval($_GET['month']   ?? date('n'));
$year    = intval($_GET['year']    ?? date('Y'));

if (!$user_id) {
    echo json_encode(['success' => false, 'error' => 'Missing user_id']); exit;
}

// Month name
$month_names = ['','January','February','March','April','May','June',
                'July','August','September','October','November','December'];
$month_name  = $month_names[$month] ?? 'Unknown';

try {
    // Get user
    $stmt = $conn->prepare("SELECT name, email FROM users WHERE id = ?");
    $stmt->bind_param('i', $user_id);
    $stmt->execute();
    $user = $stmt->get_result()->fetch_assoc();
    $stmt->close();

    // Get budget
    $stmt = $conn->prepare("SELECT monthly_budget, total_spent FROM user_budgets WHERE user_id = ?");
    $stmt->bind_param('i', $user_id);
    $stmt->execute();
    $budget = $stmt->get_result()->fetch_assoc();
    $stmt->close();

    // Get expenses for month
    $stmt = $conn->prepare("
        SELECT description, amount, category, date
        FROM expenses
        WHERE user_id = ? AND MONTH(date) = ? AND YEAR(date) = ?
        ORDER BY date DESC
    ");
    $stmt->bind_param('iii', $user_id, $month, $year);
    $stmt->execute();
    $expenses = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
    $stmt->close();

    // Get savings goals
    $stmt = $conn->prepare("SELECT goal_name, target_amount, current_amount FROM savings_goals WHERE user_id = ?");
    $stmt->bind_param('i', $user_id);
    $stmt->execute();
    $goals = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
    $stmt->close();

    // Calculate totals by category
    $by_cat = [];
    foreach ($expenses as $e) {
        $cat = $e['category'] ?: 'Other';
        $by_cat[$cat] = ($by_cat[$cat] ?? 0) + floatval($e['amount']);
    }
    arsort($by_cat);

    $total_spent  = array_sum(array_column($expenses, 'amount'));
    $monthly_budget = floatval($budget['monthly_budget'] ?? 0);
    $remaining    = $monthly_budget - $total_spent;
    $pct_used     = $monthly_budget > 0 ? round(($total_spent / $monthly_budget) * 100, 1) : 0;

    // Build HTML for PDF
    $html = '<!DOCTYPE html><html><head>
    <meta charset="UTF-8">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Arial, sans-serif; font-size: 13px; color: #111827; background: white; padding: 32px; }
        .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 28px; padding-bottom: 20px; border-bottom: 2px solid #3B82F6; }
        .brand { font-size: 22px; font-weight: 800; color: #3B82F6; }
        .report-title { font-size: 14px; color: #6B7280; margin-top: 4px; }
        .meta { text-align: right; font-size: 12px; color: #6B7280; }
        .kpi-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 12px; margin-bottom: 24px; }
        .kpi { padding: 14px 16px; border: 1px solid #E5E7EB; border-radius: 8px; border-top: 3px solid #3B82F6; }
        .kpi.spent { border-top-color: #EF4444; }
        .kpi.remaining { border-top-color: #10B981; }
        .kpi label { font-size: 10px; color: #9CA3AF; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600; }
        .kpi .val { font-size: 20px; font-weight: 800; color: #111827; margin-top: 3px; }
        .kpi .sub { font-size: 11px; color: #6B7280; margin-top: 2px; }
        .section-title { font-size: 14px; font-weight: 700; color: #111827; margin-bottom: 10px; padding-bottom: 6px; border-bottom: 1px solid #F3F4F6; }
        .cat-row { display: flex; justify-content: space-between; align-items: center; padding: 7px 0; border-bottom: 1px solid #F9FAFB; font-size: 12px; }
        .cat-name { color: #374151; font-weight: 500; }
        .cat-amt { font-weight: 700; color: #111827; }
        .cat-pct { font-size: 11px; color: #9CA3AF; margin-left: 8px; }
        .tx-row { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 8px; padding: 7px 0; border-bottom: 1px solid #F9FAFB; font-size: 12px; }
        .tx-header { font-weight: 700; color: #6B7280; font-size: 10px; text-transform: uppercase; letter-spacing: 0.4px; }
        .goal-row { display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid #F9FAFB; }
        .progress-bar { height: 6px; background: #F3F4F6; border-radius: 99px; margin-top: 4px; overflow: hidden; }
        .progress-fill { height: 100%; border-radius: 99px; background: #3B82F6; }
        .footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #E5E7EB; font-size: 11px; color: #9CA3AF; display: flex; justify-content: space-between; }
        section { margin-bottom: 24px; }
    </style>
    </head><body>';

    $html .= '<div class="header">
        <div>
            <div class="brand">SmartSpend</div>
            <div class="report-title">Monthly Financial Report — ' . $month_name . ' ' . $year . '</div>
        </div>
        <div class="meta">
            <div>' . htmlspecialchars($user['name'] ?? '') . '</div>
            <div>' . htmlspecialchars($user['email'] ?? '') . '</div>
            <div>Generated: ' . date('d M Y') . '</div>
        </div>
    </div>';

    // KPIs
    $html .= '<div class="kpi-grid">
        <div class="kpi">
            <label>Monthly Budget</label>
            <div class="val">M' . number_format($monthly_budget, 2) . '</div>
            <div class="sub">Allocated</div>
        </div>
        <div class="kpi spent">
            <label>Total Spent</label>
            <div class="val">M' . number_format($total_spent, 2) . '</div>
            <div class="sub">' . $pct_used . '% of budget</div>
        </div>
        <div class="kpi remaining">
            <label>Remaining</label>
            <div class="val">M' . number_format(max(0, $remaining), 2) . '</div>
            <div class="sub">' . ($remaining >= 0 ? 'Available' : 'Over budget') . '</div>
        </div>
    </div>';

    // By category
    $html .= '<section><div class="section-title">Spending by Category</div>';
    foreach ($by_cat as $cat => $amt) {
        $pct = $total_spent > 0 ? round(($amt / $total_spent) * 100) : 0;
        $html .= '<div class="cat-row">
            <span class="cat-name">' . htmlspecialchars($cat) . '</span>
            <span>
                <span class="cat-amt">M' . number_format($amt, 2) . '</span>
                <span class="cat-pct">' . $pct . '%</span>
            </span>
        </div>';
    }
    $html .= '</section>';

    // Transactions
    $html .= '<section><div class="section-title">All Transactions (' . count($expenses) . ')</div>
        <div class="tx-row tx-header">
            <span>Description</span><span>Category</span><span>Date</span><span>Amount</span>
        </div>';
    foreach ($expenses as $e) {
        $html .= '<div class="tx-row">
            <span>' . htmlspecialchars(substr($e['description'] ?? '', 0, 40)) . '</span>
            <span>' . htmlspecialchars($e['category'] ?? 'Other') . '</span>
            <span>' . date('d M', strtotime($e['date'])) . '</span>
            <span style="font-weight:700;color:#EF4444;">-M' . number_format($e['amount'], 2) . '</span>
        </div>';
    }
    $html .= '</section>';

    // Savings goals
    if (!empty($goals)) {
        $html .= '<section><div class="section-title">Savings Goals</div>';
        foreach ($goals as $g) {
            $pct = $g['target_amount'] > 0
                ? min(100, round(($g['current_amount'] / $g['target_amount']) * 100))
                : 0;
            $html .= '<div class="goal-row">
                <div style="flex:1">
                    <div style="font-size:13px;font-weight:600;color:#111827">' . htmlspecialchars($g['goal_name']) . '</div>
                    <div style="font-size:11px;color:#9CA3AF;margin-top:2px">
                        M' . number_format($g['current_amount'], 2) . ' / M' . number_format($g['target_amount'], 2) . '
                    </div>
                    <div class="progress-bar" style="width:200px">
                        <div class="progress-fill" style="width:' . $pct . '%"></div>
                    </div>
                </div>
                <div style="font-size:14px;font-weight:800;color:#3B82F6">' . $pct . '%</div>
            </div>';
        }
        $html .= '</section>';
    }

    $html .= '<div class="footer">
        <span>SmartSpend — NUL Final Year Project 2026</span>
        <span>Boitumelo Lekau & Lenyolosa Lenyolosa</span>
    </div></body></html>';

    // Return HTML as base64 for frontend to open in new tab
    echo json_encode([
        'success'    => true,
        'html'       => base64_encode($html),
        'filename'   => "SmartSpend_{$month_name}_{$year}.html",
        'month_name' => $month_name,
        'year'       => $year,
        'stats'      => [
            'budget'      => $monthly_budget,
            'spent'       => $total_spent,
            'remaining'   => $remaining,
            'pct_used'    => $pct_used,
            'tx_count'    => count($expenses),
            'categories'  => $by_cat,
        ],
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
$conn->close();
?>
