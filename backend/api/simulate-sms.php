<?php
/**
 * simulate-sms.php
 * Accepts a raw SMS text and runs it through the exact same pipeline
 * as the Python SMS extractor: ML classification → auto-save → notification.
 * Used for testing without a real phone.
 */
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }

$input   = json_decode(file_get_contents('php://input'), true);
$user_id = intval($input['user_id'] ?? 0);
$sms     = trim($input['sms_text']  ?? '');

if (!$user_id || !$sms) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'user_id and sms_text are required']);
    exit;
}

// ── Step 1: Call ML API /parse ────────────────────────────────────────────────
$ml_url     = 'http://localhost:5000/parse';
$ml_payload = json_encode(['sms' => $sms]);

$ml_ctx = stream_context_create([
    'http' => [
        'method'  => 'POST',
        'header'  => "Content-Type: application/json\r\n",
        'content' => $ml_payload,
        'timeout' => 8,
    ]
]);

$ml_raw = @file_get_contents($ml_url, false, $ml_ctx);
if (!$ml_raw) {
    http_response_code(503);
    echo json_encode(['success' => false, 'error' => 'ML API is offline. Start it with: make start-ml']);
    exit;
}

$ml = json_decode($ml_raw, true);
if (!$ml) {
    http_response_code(502);
    echo json_encode(['success' => false, 'error' => 'ML API returned invalid response']);
    exit;
}

// ── Step 2: Skip transfers/deposits (same logic as extractor) ─────────────────
$tx_type = $ml['transaction_type'] ?? 'Purchase';
if (in_array($tx_type, ['Transfer', 'Deposit', 'Income'])) {
    echo json_encode([
        'success'          => true,
        'skipped'          => true,
        'reason'           => "Transaction type '$tx_type' is skipped (not an expense)",
        'ml_classification' => $ml,
    ]);
    exit;
}

// ── Step 3: Build auto-save payload (mirrors what extractor sends) ────────────
$category     = $ml['category']         ?? 'Other';
$store        = $ml['store']            ?? '';
$amount       = floatval($ml['amount']  ?? 0);
$needs_manual = (bool)($ml['needs_manual_category'] ?? false);
$confidence   = floatval($ml['confidence'] ?? 0);

if ($amount <= 0) {
    echo json_encode([
        'success'          => true,
        'skipped'          => true,
        'reason'           => 'No amount detected in this SMS',
        'ml_classification' => $ml,
    ]);
    exit;
}

$save_payload = json_encode([
    'user_id'          => $user_id,
    'amount'           => $amount,
    'category'         => $category,
    'description'      => $store ?: 'Unknown',
    'transaction_type' => $tx_type,
    'store'            => $store,
    'needs_manual'     => $needs_manual,
    'date'             => date('Y-m-d'),
    'raw_sms'          => $sms,
]);

// ── Step 4: Call auto-save-transaction.php ────────────────────────────────────
$save_url = 'http://localhost' . (isset($_SERVER['SERVER_PORT']) && $_SERVER['SERVER_PORT'] != '80'
    ? ':' . $_SERVER['SERVER_PORT'] : '')
    . '/smart_budget/backend/api/auto-save-transaction.php';

$save_ctx = stream_context_create([
    'http' => [
        'method'  => 'POST',
        'header'  => "Content-Type: application/json\r\n",
        'content' => $save_payload,
        'timeout' => 8,
    ]
]);

$save_raw    = @file_get_contents($save_url, false, $save_ctx);
$save_result = $save_raw ? json_decode($save_raw, true) : ['success' => false, 'error' => 'Save failed'];

// ── Step 5: Return full result for the UI ─────────────────────────────────────
echo json_encode([
    'success'    => true,
    'skipped'    => false,
    'ml' => [
        'category'         => $category,
        'amount'           => $amount,
        'store'            => $store,
        'transaction_type' => $tx_type,
        'confidence'       => $confidence,
        'needs_manual'     => $needs_manual,
        'source'           => $ml['source'] ?? 'ml',
        'top_predictions'  => $ml['top_predictions'] ?? [],
    ],
    'saved'      => $save_result['success'] ?? false,
    'expense_id' => $save_result['expense_id'] ?? null,
    'remaining'  => $save_result['remaining']  ?? null,
]);
