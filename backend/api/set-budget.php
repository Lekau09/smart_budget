<?php
/**
 * set-budget.php
 * Saves a budget for a specific month/year.
 * If a budget already exists for that month, it updates it.
 * If no month is passed, it updates the general budget (all months).
 */
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }

require_once __DIR__ . '/../config.php';

$input          = json_decode(file_get_contents('php://input'), true);
$user_id        = intval($input['user_id']         ?? 0);
$monthly_budget = floatval($input['monthly_budget'] ?? 0);
$month          = intval($input['month']            ?? 0); // 1–12, 0 = all months
$year           = intval($input['year']             ?? date('Y'));

if (!$user_id || $monthly_budget <= 0) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Missing user_id or invalid budget']);
    exit;
}

try {
    if ($month > 0) {
        // Check if a budget row exists for this month/year
        $check = $conn->prepare("
            SELECT id FROM user_budgets
            WHERE user_id = ? AND budget_month = ? AND budget_year = ?
        ");
        $check->bind_param('iii', $user_id, $month, $year);
        $check->execute();
        $exists = $check->get_result()->num_rows > 0;
        $check->close();

        if ($exists) {
            $stmt = $conn->prepare("
                UPDATE user_budgets
                SET monthly_budget = ?
                WHERE user_id = ? AND budget_month = ? AND budget_year = ?
            ");
            $stmt->bind_param('diii', $monthly_budget, $user_id, $month, $year);
        } else {
            // Try insert with month/year columns
            $stmt = $conn->prepare("
                INSERT INTO user_budgets (user_id, monthly_budget, total_spent, budget_month, budget_year)
                VALUES (?, ?, 0, ?, ?)
            ");
            $stmt->bind_param('idii', $user_id, $monthly_budget, $month, $year);
        }
        $stmt->execute();
        $stmt->close();
    } else {
        // No month specified — upsert the main budget row
        $check = $conn->prepare("SELECT id FROM user_budgets WHERE user_id = ?");
        $check->bind_param('i', $user_id);
        $check->execute();
        $exists = $check->get_result()->num_rows > 0;
        $check->close();

        if ($exists) {
            $stmt = $conn->prepare("UPDATE user_budgets SET monthly_budget = ? WHERE user_id = ?");
            $stmt->bind_param('di', $monthly_budget, $user_id);
        } else {
            $stmt = $conn->prepare("INSERT INTO user_budgets (user_id, monthly_budget, total_spent) VALUES (?, ?, 0)");
            $stmt->bind_param('id', $user_id, $monthly_budget);
        }
        $stmt->execute();
        $stmt->close();
    }

    echo json_encode([
        'success'        => true,
        'monthly_budget' => $monthly_budget,
        'month'          => $month,
        'year'           => $year,
    ]);

} catch (Exception $e) {
    // Fallback: if budget_month/budget_year columns don't exist yet,
    // just update the main row
    try {
        $check = $conn->prepare("SELECT id FROM user_budgets WHERE user_id = ?");
        $check->bind_param('i', $user_id);
        $check->execute();
        $exists = $check->get_result()->num_rows > 0;
        $check->close();

        if ($exists) {
            $stmt = $conn->prepare("UPDATE user_budgets SET monthly_budget = ? WHERE user_id = ?");
            $stmt->bind_param('di', $monthly_budget, $user_id);
        } else {
            $stmt = $conn->prepare("INSERT INTO user_budgets (user_id, monthly_budget, total_spent) VALUES (?, ?, 0)");
            $stmt->bind_param('id', $user_id, $monthly_budget);
        }
        $stmt->execute();
        $stmt->close();
        echo json_encode(['success' => true, 'monthly_budget' => $monthly_budget]);
    } catch (Exception $e2) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => $e2->getMessage()]);
    }
}
$conn->close();
?>
