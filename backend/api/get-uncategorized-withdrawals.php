<?php
/**
 * get-uncategorized-withdrawals.php
 * Returns transactions that are specifically marked as Cash Withdrawals 
 * and have no category assigned (category = 'Other').
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

try {
    // We query from 'expenses' table because that's where auto-save-transaction.php 
    // and the rest of the budget system stores current transactions.
    $stmt = $conn->prepare("
        SELECT id, description, amount, category, date, transaction_type, raw_sms
        FROM expenses
        WHERE user_id = ?
          AND category = 'Other'
          AND (
              transaction_type IN ('Cash Withdrawal', 'Mobile Money Withdrawal', 'Cash withdrawal')
              OR description LIKE '%withdraw%'
              OR description LIKE '%ATM%'
              OR description LIKE '%cashout%'
          )
        ORDER BY date DESC
        LIMIT 20
    ");
    $stmt->bind_param('i', $user_id);
    $stmt->execute();
    $rows = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
    $stmt->close();

    // Key MUST be 'withdrawals' to match Transactions.jsx state handler
    echo json_encode([
        'success' => true,
        'withdrawals' => $rows,
        'count' => count($rows),
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
$conn->close();
?>
