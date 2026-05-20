<?php
/**
 * POST /api/notification-read
 * Mark notification(s) as read
 * 
 * POST body:
 * {
 *   "user_id": 16,
 *   "notification_id": 123  // or "all" to mark all as read
 * }
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../helpers/NotificationManager.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);

$userId = intval($input['user_id'] ?? 0);
$notificationId = $input['notification_id'] ?? null;

if (!$userId) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Missing user_id']);
    exit;
}

try {
    if ($notificationId === 'all') {
        // Mark all as read
        NotificationManager::markAllAsRead($conn, $userId);
        http_response_code(200);
        echo json_encode(['success' => true, 'message' => 'All notifications marked as read']);
    } else {
        $notificationId = intval($notificationId);
        if (!$notificationId) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Invalid notification_id']);
            exit;
        }
        
        // Mark single as read
        NotificationManager::markAsRead($conn, $notificationId, $userId);
        http_response_code(200);
        echo json_encode(['success' => true, 'message' => 'Notification marked as read']);
    }
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Failed to mark as read: ' . $e->getMessage()
    ]);
}

$conn->close();
?>
