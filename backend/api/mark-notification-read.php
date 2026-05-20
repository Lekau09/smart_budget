<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }

require_once __DIR__ . '/../config.php';

$input   = json_decode(file_get_contents('php://input'), true);
$user_id = intval($input['user_id'] ?? 0);
$mark_all = isset($input['mark_all']) && $input['mark_all'];
$notif_id = intval($input['notification_id'] ?? 0);

if (!$user_id) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Missing user_id']);
    exit;
}

try {
    if ($mark_all) {
        // Mark ALL notifications as read for this user
        $stmt = $conn->prepare("UPDATE notifications SET is_read = 1 WHERE user_id = ?");
        $stmt->bind_param('i', $user_id);
        $stmt->execute();
        $affected = $stmt->affected_rows;
        $stmt->close();
        echo json_encode(['success' => true, 'marked' => $affected, 'all' => true]);
    } elseif ($notif_id > 0) {
        // Mark single notification as read
        $stmt = $conn->prepare("UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?");
        $stmt->bind_param('ii', $notif_id, $user_id);
        $stmt->execute();
        $stmt->close();
        echo json_encode(['success' => true, 'notification_id' => $notif_id]);
    } else {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Provide notification_id or mark_all: true']);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
$conn->close();
?>
