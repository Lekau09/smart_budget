<?php
/**
 * GET /api/notifications
 * Fetch notifications for the authenticated user
 * 
 * Query params:
 * - limit: number of notifications (default 20)
 * - offset: pagination offset (default 0)
 * - filter: 'all', 'unread', or notification type (default 'all')
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

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

$userId = intval($_GET['user_id'] ?? 0);
$limit = intval($_GET['limit'] ?? 20);
$offset = intval($_GET['offset'] ?? 0);
$filter = $_GET['filter'] ?? 'all';

// Validate
if (!$userId) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Missing user_id']);
    exit;
}

if ($limit > 100) $limit = 100; // Cap at 100
if ($limit < 1) $limit = 20;
if ($offset < 0) $offset = 0;

try {
    $query = "SELECT * FROM notifications WHERE user_id = ?";
    $params = [$userId];
    $types = 'i';
    
    // Apply filter
    if ($filter !== 'all') {
        if ($filter === 'unread') {
            $query .= " AND is_read = 0";
        } else {
            // Filter by type (sms, expense, income, etc.)
            $query .= " AND type = ?";
            $params[] = $filter;
            $types .= 's';
        }
    }
    
    $query .= " ORDER BY created_at DESC LIMIT ? OFFSET ?";
    $params[] = $limit;
    $params[] = $offset;
    $types .= 'ii';
    
    $stmt = $conn->prepare($query);
    $stmt->bind_param($types, ...$params);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $notifications = [];
    while ($row = $result->fetch_assoc()) {
        $notifications[] = [
            'id' => (int)$row['id'],
            'type' => $row['type'],
            'title' => $row['title'],
            'message' => $row['message'],
            'action_url' => $row['action_url'],
            'reference_id' => $row['reference_id'] ? (int)$row['reference_id'] : null,
            'reference_type' => $row['reference_type'],
            'is_read' => (bool)$row['is_read'],
            'created_at' => $row['created_at'],
            'read_at' => $row['read_at']
        ];
    }
    $stmt->close();
    
    // Get total count
    $countStmt = $conn->prepare("SELECT COUNT(*) as total FROM notifications WHERE user_id = ?");
    $countStmt->bind_param('i', $userId);
    $countStmt->execute();
    $countResult = $countStmt->get_result();
    $countRow = $countResult->fetch_assoc();
    $total = (int)$countRow['total'];
    $countStmt->close();
    
    // Get unread count
    $unreadCount = NotificationManager::getUnreadCount($conn, $userId);
    
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'notifications' => $notifications,
        'pagination' => [
            'limit' => $limit,
            'offset' => $offset,
            'total' => $total
        ],
        'unread_count' => $unreadCount
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Failed to fetch notifications: ' . $e->getMessage()
    ]);
}

$conn->close();
