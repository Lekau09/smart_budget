<?php
/**
 * Insert Dummy SMS Data for Testing
 * Creates realistic bank transaction SMS messages
 */

// Include database configuration
require_once __DIR__ . '/database_config.php';

header('Content-Type: application/json');

try {
    // Input: user_id from POST
    $user_id = isset($_POST['user_id']) ? (int)$_POST['user_id'] : 22;
    
    // Sample SMS messages from different banks with realistic amounts
    $dummy_sms = [
        [
            'from' => '+2663233600099', // FNB Lesotho
            'text' => 'FNB AlertTM: Payment of M250.50 to SHOPRITE MASERU on 25/03/2026 14:30. Bal: M1245.75. Ref: FNB001',
            'category_hint' => 'Groceries',
        ],
        [
            'from' => '+26681234567', // Nedbank Lesotho
            'text' => 'Your Nedbank account ending in 1234 has been debited with M150.00 by ORANGE LESOTHO at 25/03/2026 14:45. Balance: M2350.00',
            'category_hint' => 'Utilities',
        ],
        [
            'from' => '+2663211111', // Standard Lesotho Bank
            'text' => 'STD: Transfer of M500.00 sent to John Doe on 25/03/2026 15:00. Your balance is M3100.50. Ref: TRN123456',
            'category_hint' => 'Food',
        ],
        [
            'from' => '+26681234567', // Nedbank - Transport
            'text' => 'Your card ending in 5678 has been charged M85.00 by UBER at 25/03/2026 15:15. Balance: M2265.00',
            'category_hint' => 'Transport',
        ],
        [
            'from' => '+2663233600099', // FNB - Entertainment
            'text' => 'FNB AlertTM: Purchase of M120.00 at CINEMA CITY MASERU on 25/03/2026 15:30. Bal: M1125.75. Ref: FNB002',
            'category_hint' => 'Entertainment',
        ],
        [
            'from' => '+26681234567', // Nedbank - Health
            'text' => 'Nedbank: Debit of M205.00 to LESOTHO PHARMACY CENTRE on 25/03/2026 15:45. Balance: M2060.00',
            'category_hint' => 'Health',
        ],
        [
            'from' => '+2663211111', // Standard - Shopping
            'text' => 'STD: Purchase of M750.00 at GAME STORE on 25/03/2026 16:00. Your balance is M2350.50. Ref: TRN789012',
            'category_hint' => 'Shopping',
        ],
    ];

    $inserted_count = 0;
    $inserted_data = [];

    foreach ($dummy_sms as $sms) {
        $sms_from = $sms['from'];
        $sms_text = $sms['text'];
        $sent_stamp = (int)(time() * 1000) - rand(5000, 30000); // 5-30 seconds ago
        $received_stamp = (int)(time() * 1000);
        $sim_slot = 'sim1';
        
        // Generate SMS hash for duplicate detection
        $hash_input = $user_id . '|' . $sms_text . '|' . $received_stamp;
        $sms_hash = hash('sha256', $hash_input);
        
        // Check if SMS already exists
        $check_stmt = $conn->prepare(
            "SELECT id FROM sms_raw_ingest WHERE user_id = ? AND sms_hash = ? LIMIT 1"
        );
        $check_stmt->bind_param("is", $user_id, $sms_hash);
        $check_stmt->execute();
        $check_result = $check_stmt->get_result();
        
        if ($check_result->num_rows === 0) {
            // Insert new SMS
            $insert_stmt = $conn->prepare(
                "INSERT INTO sms_raw_ingest 
                 (user_id, sms_from, sms_text, sent_stamp, received_stamp, sim_slot, sms_hash, is_duplicate) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, 0)"
            );
            
            $insert_stmt->bind_param(
                "isssiss",
                $user_id,
                $sms_from,
                $sms_text,
                $sent_stamp,
                $received_stamp,
                $sim_slot,
                $sms_hash
            );
            
            if ($insert_stmt->execute()) {
                $inserted_count++;
                $inserted_data[] = [
                    'id' => $conn->insert_id,
                    'from' => $sms_from,
                    'text' => $sms_text,
                    'category_hint' => $sms['category_hint'],
                    'timestamp' => date('Y-m-d H:i:s', $received_stamp / 1000),
                ];
                $insert_stmt->close();
            } else {
                error_log("Failed to insert SMS: " . $conn->error);
            }
        }
        $check_stmt->close();
    }

    // Get total SMS count for user
    $count_stmt = $conn->prepare(
        "SELECT COUNT(*) as total FROM sms_raw_ingest WHERE user_id = ? AND is_duplicate < 2"
    );
    $count_stmt->bind_param("i", $user_id);
    $count_stmt->execute();
    $count_result = $count_stmt->get_result()->fetch_assoc();
    $total_sms = $count_result['total'];

    echo json_encode([
        'success' => true,
        'message' => "Successfully inserted $inserted_count dummy SMS messages",
        'user_id' => $user_id,
        'inserted_count' => $inserted_count,
        'total_unprocessed_sms' => $total_sms,
        'inserted_data' => $inserted_data,
        'timestamp' => date('Y-m-d H:i:s')
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
        'timestamp' => date('Y-m-d H:i:s')
    ]);
}

$conn->close();
?>
