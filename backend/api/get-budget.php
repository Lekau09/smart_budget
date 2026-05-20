<?php
/**
 * GET BUDGET DATA
 * Returns: total budget, spent amount, and breakdown by category
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require_once __DIR__ . '/database_config.php';

try {
    if (!isset($_GET['user_id'])) {
        throw new Exception('Missing user_id');
    }

    $user_id = intval($_GET['user_id']);
    $db = get_db_connection();

    // Get user's monthly budget
    $budgetQuery = "SELECT monthly_budget FROM users WHERE id = ?";
    $stmt = $db->prepare($budgetQuery);
    $stmt->execute([$user_id]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        throw new Exception('User not found');
    }

    $monthlyBudget = floatval($user['monthly_budget'] ?? 5000);

    // Get current month's transactions
    $startOfMonth = date('Y-m-01');
    $endOfMonth = date('Y-m-t 23:59:59');

    $transactionQuery = "
        SELECT 
            SUM(amount) as total_spent,
            category,
            COUNT(*) as count
        FROM transactions
        WHERE user_id = ? 
            AND created_at >= ?
            AND created_at <= ?
            AND type = 'expense'
        GROUP BY category
    ";

    $stmt = $db->prepare($transactionQuery);
    $stmt->execute([$user_id, $startOfMonth, $endOfMonth]);
    $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $breakdown = [];
    $totalSpent = 0;

    foreach ($results as $row) {
        $amount = floatval($row['total_spent']);
        $breakdown[$row['category']] = $amount;
        $totalSpent += $amount;
    }

    echo json_encode([
        'success' => true,
        'budget' => $monthlyBudget,
        'spent' => $totalSpent,
        'remaining' => $monthlyBudget - $totalSpent,
        'breakdown' => $breakdown,
        'month' => date('F Y'),
        'period' => [
            'start' => $startOfMonth,
            'end' => $endOfMonth
        ]
    ]);

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?>
