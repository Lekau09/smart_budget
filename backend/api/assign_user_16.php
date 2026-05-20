<?php
require_once __DIR__ . '/../config.php';

echo "Assigning NULL user_id transactions to user 16...\n";

$sql = "UPDATE transactions 
        SET user_id = 16 
        WHERE user_id IS NULL AND is_categorized = 0";

if ($conn->query($sql)) {
    $affected = $conn->affected_rows;
    echo "✓ Updated $affected transactions\n";
} else {
    echo "✗ Failed: " . $conn->error . "\n";
}

// Verify
echo "\nVerifying uncategorized transactions for user 16:\n";
$sql = "SELECT id, total_amount, transaction_type, is_categorized 
        FROM transactions 
        WHERE user_id = 16 AND is_categorized = 0 
        ORDER BY id DESC 
        LIMIT 10";

$result = $conn->query($sql);
while ($row = $result->fetch_assoc()) {
    echo "- ID: {$row['id']}, Amount: {$row['total_amount']}, Type: {$row['transaction_type']}\n";
}

$conn->close();
?>
