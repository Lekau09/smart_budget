<?php
/**
 * SMS Audit Log: View raw SMS ingestion records for a user
 * 
 * Usage:
 *   GET /api/sms-audit-log.php?user_id=1&limit=50
 *   Query params:
 *     - user_id (required): User ID to view logs for
 *     - limit (optional): Number of records (default: 50, max: 500)
 *     - offset (optional): Pagination offset (default: 0)
 * 
 * Response: List of raw SMS records with timestamps and duplicate status
 */

error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

require_once __DIR__ . '/../config.php';

header('Content-Type: application/json');

// Only allow GET
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Method Not Allowed']);
    exit;
}

// Parse query params
$user_id = isset($_GET['user_id']) ? (int)$_GET['user_id'] : 0;
$limit = isset($_GET['limit']) ? min((int)$_GET['limit'], 500) : 50;
$offset = isset($_GET['offset']) ? (int)$_GET['offset'] : 0;

if (!$user_id) {
    http_response_code(400);
    echo json_encode([
        'status' => 'error',
        'message' => 'Missing user_id parameter',
        'code' => 'MISSING_USER_ID'
    ]);
    exit;
}

// Check if user exists
$stmt = $conn->prepare("SELECT id FROM users WHERE id = ? LIMIT 1");
if (!$stmt) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Database error']);
    exit;
}

$stmt->bind_param('i', $user_id);
$stmt->execute();
if ($stmt->get_result()->num_rows === 0) {
    http_response_code(404);
    echo json_encode(['status' => 'error', 'message' => 'User not found']);
    $stmt->close();
    exit;
}
$stmt->close();

// Get total count
$stmt = $conn->prepare("SELECT COUNT(*) as total FROM sms_raw_ingest WHERE user_id = ?");
if (!$stmt) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Database error']);
    exit;
}

$stmt->bind_param('i', $user_id);
$stmt->execute();
$count_result = $stmt->get_result()->fetch_assoc();
$total = $count_result['total'];
$stmt->close();

// Get paginated SMS records
$stmt = $conn->prepare(
    "SELECT 
       id, 
       sms_from, 
       sms_text, 
       sent_stamp, 
       received_stamp, 
       sim_slot, 
       sms_hash, 
       is_duplicate, 
       created_at
     FROM sms_raw_ingest 
     WHERE user_id = ? 
     ORDER BY created_at DESC 
     LIMIT ? OFFSET ?"
);
if (!$stmt) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Database error']);
    exit;
}

$stmt->bind_param('iii', $user_id, $limit, $offset);
$stmt->execute();
$result = $stmt->get_result();

$records = [];
while ($row = $result->fetch_assoc()) {
    $records[] = [
        'id' => (int)$row['id'],
        'from' => $row['sms_from'],
        'text' => $row['sms_text'],
        'sent_stamp' => (int)$row['sent_stamp'],
        'received_stamp' => (int)$row['received_stamp'],
        'sim' => $row['sim_slot'],
        'hash' => $row['sms_hash'],
        'is_duplicate' => (bool)$row['is_duplicate'],
        'ingested_at' => $row['created_at']
    ];
}
$stmt->close();

http_response_code(200);
echo json_encode([
    'status' => 'success',
    'code' => 'SMS_LOGS_RETRIEVED',
    'pagination' => [
        'total' => $total,
        'limit' => $limit,
        'offset' => $offset,
        'returned' => count($records)
    ],
    'data' => $records
]);
?>
