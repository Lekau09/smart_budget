<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type');

require_once __DIR__ . '/../config.php';

$user_id = intval($_GET['user_id'] ?? 0);
$limit   = min(intval($_GET['limit'] ?? 30), 100);

if (!$user_id) {
    echo json_encode(['success' => false, 'error' => 'Missing user_id', 'notifications' => []]);
    exit;
}

try {
    // Detect which column exists: 'body' or 'message'
    $col = 'body';
    $check = $conn->query("SHOW COLUMNS FROM notifications LIKE 'body'");
    if ($check->num_rows === 0) {
        $col = 'message'; // older schema used 'message'
    }

    $stmt = $conn->prepare("
        SELECT id, user_id, title, {$col} AS body, type, is_read, created_at
        FROM notifications
        WHERE user_id = ?
        ORDER BY created_at DESC
        LIMIT ?
    ");
    $stmt->bind_param('ii', $user_id, $limit);
    $stmt->execute();
    $result = $stmt->get_result();

    $notifications = [];
    while ($row = $result->fetch_assoc()) {
        $notifications[] = [
            'id'         => (int)$row['id'],
            'user_id'    => (int)$row['user_id'],
            'title'      => $row['title']      ?? '',
            'body'       => $row['body']        ?? '',
            'type'       => $row['type']        ?? 'expense',
            'is_read'    => (int)$row['is_read'],  // always int 0 or 1
            'created_at' => $row['created_at']  ?? '',
        ];
    }
    $stmt->close();

    $unread = array_reduce($notifications, fn($c,$n) => $c + ($n['is_read'] === 0 ? 1 : 0), 0);

    echo json_encode([
        'success'       => true,
        'notifications' => $notifications,
        'unread_count'  => $unread,
        'total'         => count($notifications),
    ]);

} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => $e->getMessage(), 'notifications' => []]);
}
$conn->close();
?>