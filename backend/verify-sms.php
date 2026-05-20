<?php
$db_host = 'localhost';
$db_user = 'root';
$db_pass = '';
$db_name = 'smart_budget';

$conn = new mysqli($db_host, $db_user, $db_pass, $db_name);

// Get inserted SMS
$result = $conn->query("SELECT id, sms_from, sms_text, is_duplicate, FROM_UNIXTIME(received_stamp/1000) as received_at FROM sms_raw_ingest WHERE user_id = 22 ORDER BY created_at DESC LIMIT 5");

echo "✓ SMS Messages Inserted (User 22):\n\n";
$count = 1;
while ($row = $result->fetch_assoc()) {
    echo "$count. ID: {$row['id']}\n";
    echo "   From: {$row['sms_from']}\n";
    echo "   Status: " . ($row['is_duplicate'] == 0 ? "UNPROCESSED" : "PROCESSED") . "\n";
    echo "   Text: " . substr($row['sms_text'], 0, 80) . "...\n";
    echo "   Received: {$row['received_at']}\n\n";
    $count++;
}

$conn->close();
?>
