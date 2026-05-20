<?php
require_once __DIR__ . '/../config.php';

echo "Updating transactions with user_id from sms_raw_ingest table...\n";

// Update transactions that have sms_raw_id by joining with sms_raw_ingest
$sql = "UPDATE transactions t 
        INNER JOIN sms_raw_ingest s ON t.sms_raw_id = s.id
        SET t.user_id = s.user_id
        WHERE t.user_id IS NULL";

$result = $conn->query($sql);
if ($result) {
    $affected = $conn->affected_rows;
    echo "✓ Updated $affected transactions with user_id from sms_raw_ingest\n";
} else {
    echo "✗ Failed to update transactions: " . $conn->error . "\n";
}

// For transactions without sms_raw_id, we need to assign them to a default user or admin
// First, let's see how many transactions need user assignment
$check_sql = "SELECT COUNT(*) as count FROM transactions WHERE user_id IS NULL";
$result = $conn->query($check_sql);
$row = $result->fetch_assoc();
$remaining = $row['count'];

if ($remaining > 0) {
    echo "\n⚠ $remaining transactions still have NULL user_id\n";
    echo "These appear to be manually created transactions without SMS links.\n";
    echo "To assign them to a user, specify the user_id in the update.\n";
} else {
    echo "✓ All transactions have been assigned user_id values!\n";
}

// Show transaction counts by user
echo "\nTransaction count by user:\n";
$sql = "SELECT u.id, u.name, COUNT(t.id) as transaction_count 
        FROM users u 
        LEFT JOIN transactions t ON u.id = t.user_id
        GROUP BY u.id, u.name
        ORDER BY transaction_count DESC";

$result = $conn->query($sql);
while ($row = $result->fetch_assoc()) {
    echo "- User {$row['id']} ({$row['name']}): {$row['transaction_count']} transactions\n";
}

$conn->close();
?>
