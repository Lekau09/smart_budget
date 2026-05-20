<?php
/**
 * get-needs-review.php
 * Returns purchases where the AI couldn't confidently categorize the store.
 * These are expenses with category = 'Other' and transaction_type = 'Purchase'
 * (excludes cash withdrawals which are handled separately)
 *
 * GET /api/get-needs-review.php?user_id=X
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
    // Get purchases where category = 'Other' (AI couldn't identify store)
    // Exclude cash withdrawals — those are handled by get-uncategorized-withdrawals.php
    $stmt = $conn->prepare("
        SELECT id, description, amount, category, date, transaction_type, raw_sms
        FROM expenses
        WHERE user_id = ?
          AND category = 'Other'
          AND (
              transaction_type = 'Purchase'
              OR transaction_type IS NULL
              OR transaction_type = ''
          )
          AND (
              transaction_type NOT IN ('Cash Withdrawal', 'Cash withdrawal')
              OR transaction_type IS NULL
          )
          AND description NOT LIKE '%withdraw%'
          AND description NOT LIKE '%ATM%'
        ORDER BY date DESC
        LIMIT 20
    ");
    $stmt->bind_param('i', $user_id);
    $stmt->execute();
    $rows = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
    $stmt->close();

    echo json_encode([
        'success' => true,
        'needs_review' => $rows,
        'count' => count($rows),
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
$conn->close();
?>
