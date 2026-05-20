<?php
// Get unprocessed SMS messages for user
error_reporting(E_ALL);
ini_set('display_errors', 0);
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../helpers/NotificationManager.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit;
}

$user_id = intval($_GET['user_id'] ?? 0);
$limit = intval($_GET['limit'] ?? 10);

if (!$user_id) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Missing user_id']);
    exit;
}

try {
    // Get unprocessed SMS (is_duplicate = 0 or 1, not 2)
    // Convert Unix timestamps (in milliseconds) to datetime format
    $stmt = $conn->prepare("
        SELECT 
            id, 
            user_id,
            sms_from, 
            sms_text, 
            FROM_UNIXTIME(sent_stamp/1000) as sent_stamp, 
            FROM_UNIXTIME(received_stamp/1000) as received_stamp, 
            sim_slot, 
            created_at,
            notification_sent
        FROM sms_raw_ingest
        WHERE user_id = ? AND is_duplicate < 2
        ORDER BY received_stamp DESC
        LIMIT ?
    ");
    $stmt->bind_param("ii", $user_id, $limit);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $messages = [];
    while ($row = $result->fetch_assoc()) {
        // Create notification for SMS if not already sent
        if (!$row['notification_sent']) {
            $smsId = $row['id'];
            $smsFrom = $row['sms_from'];
            $smsText = $row['sms_text'];
            
            // Create notification
            NotificationManager::create($conn, $user_id, [
                'type' => 'sms',
                'title' => '📱 New SMS Received',
                'message' => "From: $smsFrom\n$smsText",
                'action_url' => '/dashboard',
                'reference_id' => $smsId,
                'reference_type' => 'sms'
            ]);
            
            // Mark notification as sent
            $updateStmt = $conn->prepare("UPDATE sms_raw_ingest SET notification_sent = 1 WHERE id = ?");
            $updateStmt->bind_param("i", $smsId);
            $updateStmt->execute();
            $updateStmt->close();
        }
        
        $messages[] = $row;
    }
    $stmt->close();
    
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'count' => count($messages),
        'messages' => $messages
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}

$conn->close();
