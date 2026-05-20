<?php
/**
 * SMS Ingest Endpoint
 * 
 * Purpose:
 *   Receives SMS forwarded from SMS Forwarder app on user's phone.
 *   Validates user identity via phone_number + ingest_secret from URL.
 *   Stores raw SMS with duplicate detection.
 * 
 * Webhook Format:
 *   POST /api/sms-ingest.php?phone_number={phone}&key={secret}
 * 
 * Security Rules:
 *   1. User identity ONLY from phone_number + ingest_secret
 *   2. SMS sender (from) is NOT the user's phone
 *   3. SIM slot is metadata only, NOT used for identity
 *   4. Phone number MUST exist in database
 *   5. Ingest secret MUST match exactly
 *   6. Duplicate detection via hash of (user_id + sms_text + received_stamp)
 */

error_reporting(E_ALL);
ini_set('display_errors', 0); // Don't expose errors to client
ini_set('log_errors', 1);

// Try to load config, with fallback error handling
if (!file_exists(__DIR__ . '/../config.php')) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Configuration file not found',
        'code' => 'CONFIG_NOT_FOUND',
        'debug' => __DIR__ . '/../config.php'
    ]);
    exit;
}

require_once __DIR__ . '/../config.php';

// Check if database connection exists
if (!isset($conn) || $conn->connect_error) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Database connection failed',
        'code' => 'DB_CONNECTION_FAILED'
    ]);
    exit;
}

// Set CORS headers to allow requests from different ports
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Set JSON response header
header('Content-Type: application/json');

// ============================================================================
// STEP 1: Validate HTTP method
// ============================================================================
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'status' => 'error',
        'message' => 'Method Not Allowed',
        'code' => 'METHOD_NOT_ALLOWED'
    ]);
    exit;
}

// ============================================================================
// STEP 2: Extract and validate phone_number + ingest_secret from URL
// ============================================================================
$phone_number = isset($_GET['phone_number']) ? trim($_GET['phone_number']) : '';
$ingest_secret = isset($_GET['key']) ? trim($_GET['key']) : '';

if (!$phone_number || !$ingest_secret) {
    http_response_code(400);
    echo json_encode([
        'status' => 'error',
        'message' => 'Missing phone_number or key parameter',
        'code' => 'MISSING_CREDENTIALS'
    ]);
    exit;
}

// Basic phone number format validation
if (!preg_match('/^[\d+\-\s\(\)]{7,20}$/', $phone_number)) {
    http_response_code(400);
    echo json_encode([
        'status' => 'error',
        'message' => 'Invalid phone_number format',
        'code' => 'INVALID_PHONE_FORMAT'
    ]);
    exit;
}

// ============================================================================
// STEP 3: Look up user by phone_number
// ============================================================================
$stmt = $conn->prepare(
    "SELECT id, ingest_secret FROM users WHERE phone_number = ? LIMIT 1"
);
if (!$stmt) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Database error',
        'code' => 'DB_ERROR'
    ]);
    exit;
}

$stmt->bind_param('s', $phone_number);
if (!$stmt->execute()) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Database query failed',
        'code' => 'DB_QUERY_FAILED'
    ]);
    $stmt->close();
    exit;
}

$result = $stmt->get_result();
if ($result->num_rows === 0) {
    http_response_code(401);
    echo json_encode([
        'status' => 'error',
        'message' => 'Phone number not found',
        'code' => 'PHONE_NOT_FOUND'
    ]);
    $stmt->close();
    exit;
}

$user = $result->fetch_assoc();
$user_id = (int)$user['id'];
$stored_secret = $user['ingest_secret'];
$stmt->close();

// ============================================================================
// STEP 4: Validate ingest_secret
// ============================================================================
// Use timing-safe comparison to prevent timing attacks
if (!hash_equals($stored_secret, $ingest_secret)) {
    http_response_code(401);
    echo json_encode([
        'status' => 'error',
        'message' => 'Invalid ingest secret',
        'code' => 'INVALID_SECRET'
    ]);
    exit;
}

// ============================================================================
// STEP 5: Parse and validate POST body
// ============================================================================
$raw_input = file_get_contents('php://input');
$data = json_decode($raw_input, true);

if (!$data) {
    http_response_code(400);
    echo json_encode([
        'status' => 'error',
        'message' => 'Invalid JSON payload',
        'code' => 'INVALID_JSON'
    ]);
    exit;
}

// Extract SMS fields
$sms_from = isset($data['from']) ? trim($data['from']) : '';
$sms_text = isset($data['text']) ? $data['text'] : '';
$sent_stamp = isset($data['sentStamp']) ? (int)$data['sentStamp'] : 0;
$received_stamp = isset($data['receivedStamp']) ? (int)$data['receivedStamp'] : 0;
$sim_slot = isset($data['sim']) ? trim($data['sim']) : '';

// Validate required fields
if (!$sms_from || !$sms_text) {
    http_response_code(400);
    echo json_encode([
        'status' => 'error',
        'message' => 'Missing required fields: from and text',
        'code' => 'MISSING_FIELDS'
    ]);
    exit;
}

if ($received_stamp <= 0) {
    http_response_code(400);
    echo json_encode([
        'status' => 'error',
        'message' => 'Invalid receivedStamp',
        'code' => 'INVALID_TIMESTAMP'
    ]);
    exit;
}

// ============================================================================
// STEP 6: Generate SMS hash for duplicate detection
// ============================================================================
// Hash = hash(user_id + sms_text + received_stamp)
// This ensures duplicates are detected even if SMS is retransmitted
$hash_input = $user_id . '|' . $sms_text . '|' . $received_stamp;
$sms_hash = hash('sha256', $hash_input);

// ============================================================================
// STEP 7: Check for duplicate SMS
// ============================================================================
$stmt = $conn->prepare(
    "SELECT id FROM sms_raw_ingest WHERE user_id = ? AND sms_hash = ? LIMIT 1"
);
if (!$stmt) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Database error',
        'code' => 'DB_ERROR'
    ]);
    exit;
}

$stmt->bind_param('is', $user_id, $sms_hash);
if (!$stmt->execute()) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Duplicate detection query failed',
        'code' => 'DB_QUERY_FAILED'
    ]);
    $stmt->close();
    exit;
}

$dup_result = $stmt->get_result();
$is_duplicate = $dup_result->num_rows > 0;
$stmt->close();

// ============================================================================
// STEP 8: Store raw SMS in sms_raw_ingest table
// ============================================================================
$stmt = $conn->prepare(
    "INSERT INTO sms_raw_ingest (user_id, sms_from, sms_text, sent_stamp, received_stamp, sim_slot, sms_hash, is_duplicate)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
);
if (!$stmt) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Database error',
        'code' => 'DB_ERROR'
    ]);
    exit;
}

$is_duplicate_int = $is_duplicate ? 1 : 0;
$stmt->bind_param(
    'issiissi',
    $user_id,
    $sms_from,
    $sms_text,
    $sent_stamp,
    $received_stamp,
    $sim_slot,
    $sms_hash,
    $is_duplicate_int
);

if (!$stmt->execute()) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Failed to store SMS',
        'code' => 'INSERT_FAILED'
    ]);
    $stmt->close();
    exit;
}

$sms_raw_id = $stmt->insert_id;
$stmt->close();

// ============================================================================
// STEP 9: Write SMS to log file
// ============================================================================
$log_dir = __DIR__ . '/../logs';
if (!is_dir($log_dir)) {
    mkdir($log_dir, 0755, true);
}

$log_file = $log_dir . '/sms-ingest.txt';
$timestamp = date('Y-m-d H:i:s');
$log_entry = "[{$timestamp}] SMS RECEIVED\n";
$log_entry .= "  User ID: {$user_id}\n";
$log_entry .= "  Phone Number: {$phone_number}\n";
$log_entry .= "  From: {$sms_from}\n";
$log_entry .= "  Text: {$sms_text}\n";
$log_entry .= "  Sent: " . date('Y-m-d H:i:s', $sent_stamp / 1000) . "\n";
$log_entry .= "  Received: " . date('Y-m-d H:i:s', $received_stamp / 1000) . "\n";
$log_entry .= "  SIM Slot: {$sim_slot}\n";
$log_entry .= "  Hash: {$sms_hash}\n";
$log_entry .= "  Duplicate: " . ($is_duplicate ? 'YES' : 'NO') . "\n";
$log_entry .= "  Status: Stored (ID: {$sms_raw_id})\n";
$log_entry .= "---\n";

file_put_contents($log_file, $log_entry, FILE_APPEND);

// ============================================================================
// STEP 10: Return success response
// ============================================================================
http_response_code($is_duplicate ? 202 : 201); // 201 for new, 202 for duplicate
echo json_encode([
    'status' => 'success',
    'message' => $is_duplicate ? 'SMS stored (duplicate detected)' : 'SMS ingested successfully',
    'code' => $is_duplicate ? 'DUPLICATE_STORED' : 'SMS_INGESTED',
    'data' => [
        'sms_raw_id' => $sms_raw_id,
        'user_id' => $user_id,
        'is_duplicate' => $is_duplicate,
        'sms_hash' => $sms_hash,
        'received_at' => date('c', $received_stamp / 1000) // Convert ms to seconds
    ]
]);
?>
