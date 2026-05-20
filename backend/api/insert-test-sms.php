<?php
/**
 * Simple Direct SMS Insertion for Testing
 * Insert dummy SMS directly without HTTP layer complications
 */

// Database connection
$db_host = 'localhost';
$db_user = 'root';
$db_pass = '';
$db_name = 'smart_budget';

$conn = new mysqli($db_host, $db_user, $db_pass, $db_name);

if ($conn->connect_error) {
    die(json_encode(['success' => false, 'error' => $conn->connect_error]));
}

$user_id = $_GET['user_id'] ?? 1;

// Real bank SMS samples
$sms_samples = [
    ['from' => '+2663233600099', 'text' => 'FNB AlertTM: Payment of M250.50 to SHOPRITE MASERU on 25/03/2026 14:30. Bal: M1245.75. Ref: FNB001'],
    ['from' => '+26681234567', 'text' => 'Your Nedbank account ending in 1234 has been debited with M150.00 by ORANGE LESOTHO at 25/03/2026 14:45. Balance: M2350.00'],
    ['from' => '+2663211111', 'text' => 'STD: Transfer of M500.00 sent to John Doe on 25/03/2026 15:00. Your balance is M3100.50. Ref: TRN123456'],
    ['from' => '+26681234567', 'text' => 'Your card ending in 5678 has been charged M85.00 by UBER at 25/03/2026 15:15. Balance: M2265.00'],
    ['from' => '+2663233600099', 'text' => 'FNB AlertTM: Purchase of M120.00 at CINEMA CITY MASERU on 25/03/2026 15:30. Bal: M1125.75. Ref: FNB002'],
];

$inserted = 0;

foreach ($sms_samples as $sms) {
    $sent_stamp = (int)(time() * 1000) - rand(5000, 30000);
    $received_stamp = (int)(time() * 1000);
    $hash = hash('sha256', $user_id . '|' . $sms['text'] . '|' . $received_stamp);
    
    // Check if exists
    $check = $conn->prepare("SELECT id FROM sms_raw_ingest WHERE sms_hash = ?");
    $check->bind_param("s", $hash);
    $check->execute();
    
    if ($check->get_result()->num_rows === 0) {
        $stmt = $conn->prepare("INSERT INTO sms_raw_ingest (user_id, sms_from, sms_text, sent_stamp, received_stamp, sms_hash, sim_slot, is_duplicate) VALUES (?, ?, ?, ?, ?, ?, 'sim1', 0)");
        $stmt->bind_param("isssss", $user_id, $sms['from'], $sms['text'], $sent_stamp, $received_stamp, $hash);
        $stmt->execute();
        $inserted++;
    }
}

echo json_encode([
    'success' => true,
    'inserted' => $inserted,
    'message' => "Inserted $inserted SMS messages for testing"
]);

$conn->close();
?>
