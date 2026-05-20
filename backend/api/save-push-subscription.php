<?php
/**
 * Save Web Push subscription from browser
 * POST /api/save-push-subscription.php
 * Body: { user_id, endpoint, p256dh, auth }
 */
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }

require_once __DIR__ . '/../config.php';

$input   = json_decode(file_get_contents('php://input'), true);
$user_id = intval($input['user_id'] ?? 0);
$endpoint = trim($input['endpoint'] ?? '');
$p256dh   = trim($input['p256dh']   ?? '');
$auth     = trim($input['auth']     ?? '');

if (!$user_id || !$endpoint || !$p256dh || !$auth) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Missing fields']);
    exit;
}

// DELETE request = unsubscribe
if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $stmt = $conn->prepare("DELETE FROM push_subscriptions WHERE user_id = ? AND p256dh = ?");
    $stmt->bind_param('is', $user_id, $p256dh);
    $stmt->execute();
    echo json_encode(['success' => true, 'message' => 'Unsubscribed']);
    exit;
}

// INSERT or UPDATE subscription (upsert)
$stmt = $conn->prepare("
    INSERT INTO push_subscriptions (user_id, endpoint, p256dh, auth)
    VALUES (?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
        endpoint  = VALUES(endpoint),
        auth      = VALUES(auth),
        updated_at = NOW()
");
$stmt->bind_param('isss', $user_id, $endpoint, $p256dh, $auth);

if ($stmt->execute()) {
    echo json_encode(['success' => true, 'message' => 'Subscription saved']);
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Failed to save subscription']);
}
$stmt->close();
$conn->close();
?>
