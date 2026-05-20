<?php
// Extract SMS transactions and create expense records
// Detects transaction types from SMS content

error_reporting(E_ALL);
ini_set('display_errors', 0);
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/../config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$user_id = intval($input['user_id'] ?? 0);
$sms_raw_id = intval($input['sms_raw_id'] ?? 0);

if (!$user_id || !$sms_raw_id) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Missing user_id or sms_raw_id']);
    exit;
}

try {
    // Get SMS message
    $stmt = $conn->prepare("
        SELECT id, sms_from, sms_text, received_stamp 
        FROM sms_raw_ingest 
        WHERE id = ? AND user_id = ?
    ");
    $stmt->bind_param("ii", $sms_raw_id, $user_id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        http_response_code(404);
        echo json_encode(['success' => false, 'error' => 'SMS not found']);
        $stmt->close();
        exit;
    }
    
    $sms = $result->fetch_assoc();
    $stmt->close();
    
    // Extract transaction details from SMS
    $extraction = extractTransactionFromSMS($sms['sms_text'], $sms['sms_from']);
    
    // Log the extraction to file
    $log_dir = __DIR__ . '/../logs';
    if (!is_dir($log_dir)) {
        mkdir($log_dir, 0755, true);
    }
    
    $log_file = $log_dir . '/sms-extraction.txt';
    $timestamp = date('Y-m-d H:i:s');
    $log_entry = "[{$timestamp}] SMS EXTRACTION\n";
    $log_entry .= "  SMS Raw ID: {$sms_raw_id}\n";
    $log_entry .= "  User ID: {$user_id}\n";
    $log_entry .= "  From: " . $sms['sms_from'] . "\n";
    $log_entry .= "  Text: " . substr($sms['sms_text'], 0, 100) . (strlen($sms['sms_text']) > 100 ? '...' : '') . "\n";
    $log_entry .= "  Type: " . $extraction['type'] . "\n";
    $log_entry .= "  Category: " . $extraction['category'] . "\n";
    $log_entry .= "  Amount: " . ($extraction['amount'] ?? 'N/A') . "\n";
    $log_entry .= "  Confidence: " . $extraction['confidence'] . "%\n";
    $log_entry .= "  Description: " . ($extraction['description'] ?? 'N/A') . "\n";
    $log_entry .= "---\n";
    
    file_put_contents($log_file, $log_entry, FILE_APPEND);
    
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'sms' => $sms,
        'extraction' => $extraction,
        'requires_user_input' => $extraction['type'] === 'cash_withdrawal'
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}

$conn->close();

// ====================================
// SMS EXTRACTION LOGIC
// ====================================

function extractTransactionFromSMS($text, $sender) {
    $text = strtolower($text);
    $result = [
        'type' => 'unknown',
        'amount' => null,
        'category' => 'Other',
        'description' => null,
        'confidence' => 0,
        'details' => []
    ];
    
    // ===== CASH WITHDRAWAL PATTERNS =====
    if (preg_match('/withdrawal|withdrew|withdraw|cash out|cashout|cash withdrawal|atm|atm withdrawal|cashed out|give\s+m[\d,.]+\s+cash\s+to/i', $text)) {
        $result['type'] = 'cash_withdrawal';
        $result['category'] = 'Cash';
        
        // Extract amount
        if (preg_match('/(?:withdrawal|withdrew|withdrawn|amount).*?(?:of\s+)?([ZUS$E£]{0,3})?([\d,]+\.?\d*)/i', $text, $matches)) {
            $amount = str_replace(',', '', $matches[2]);
            $result['amount'] = floatval($amount);
            $result['confidence'] = 95;
            $result['description'] = "Cash withdrawal - {$amount} from {$sender}";
            $result['details']['requires_category'] = true;
        }
    }
    
    // ===== TRANSFER PATTERNS =====
    else if (preg_match('/transfer(?:red|s)?|sent|send|pay(?:ment)?|remit|sent.*to|amount.*sent/i', $text)) {
        $result['type'] = 'transfer_out';
        $result['category'] = 'Transfer';
        
        if (preg_match('/(?:transfer|sent|pay|amount).*?(?:of\s+)?(?:USD\s+|ZWL\s+)?([ZUS$E£]{0,3})?([\d,]+\.?\d*)/i', $text, $matches)) {
            $amount = str_replace(',', '', $matches[2]);
            $result['amount'] = floatval($amount);
            $result['confidence'] = 85;
        }
    }
    
    // ===== AIRTIME PATTERNS =====
    else if (preg_match('/airtime|bundle|data|top-?up|topup|recharge|credit/i', $text)) {
        $result['type'] = 'airtime';
        $result['category'] = 'Utilities';
        
        if (preg_match('/(?:airtime|bundle|data|amount|cost|charge).*?(?:of\s+)?(?:USD\s+|ZWL\s+)?([ZUS$E£]{0,3})?([\d,]+\.?\d*)/i', $text, $matches)) {
            $amount = str_replace(',', '', $matches[2]);
            $result['amount'] = floatval($amount);
            $result['confidence'] = 80;
        }
    }
    
    // ===== PAYMENT PATTERNS =====
    else if (preg_match('/payment|paid|charge|debit|purchased|buy|bought|fee|subscription/i', $text)) {
        $result['type'] = 'payment';
        
        // Detect specific categories
        if (preg_match('/electricity|power|bill|light/i', $text)) {
            $result['category'] = 'Utilities';
        } else if (preg_match('/water|supply/i', $text)) {
            $result['category'] = 'Utilities';
        } else if (preg_match('/internet|wifi|broadband|mobile/i', $text)) {
            $result['category'] = 'Utilities';
        } else if (preg_match('/food|grocery|shop|mall|store|restaurant/i', $text)) {
            $result['category'] = 'Food';
        } else if (preg_match('/health|medical|pharmacy|doctor|hospital/i', $text)) {
            $result['category'] = 'Health';
        } else if (preg_match('/education|school|tuition|course/i', $text)) {
            $result['category'] = 'Education';
        } else if (preg_match('/transport|bus|taxi|fuel|gas/i', $text)) {
            $result['category'] = 'Transport';
        } else if (preg_match('/entertainment|movie|game|cinema/i', $text)) {
            $result['category'] = 'Entertainment';
        }
        
        if (preg_match('/(?:payment|charge|amount|cost).*?(?:of\s+)?(?:USD\s+|ZWL\s+)?([ZUS$E£]{0,3})?([\d,]+\.?\d*)/i', $text, $matches)) {
            $amount = str_replace(',', '', $matches[2]);
            $result['amount'] = floatval($amount);
            $result['confidence'] = 70;
        }
    }
    
    // ===== BALANCE/INFO PATTERNS =====
    else if (preg_match('/balance|account balance|available|current balance/i', $text)) {
        $result['type'] = 'balance_info';
        $result['category'] = 'Information';
        
        if (preg_match('/(?:balance|available).*?(?:USD\s+|ZWL\s+)?([ZUS$E£]{0,3})?([\d,]+\.?\d*)/i', $text, $matches)) {
            $amount = str_replace(',', '', $matches[2]);
            $result['amount'] = floatval($amount);
            $result['confidence'] = 90;
            $result['description'] = "Account balance: {$amount}";
        }
    }
    
    // ===== DEPOSIT/INCOME PATTERNS =====
    else if (preg_match('/deposit|received|credit|income|salary|received.*amount|sent.*you|transferred.*to.*you|credited/i', $text)) {
        $result['type'] = 'income';
        $result['category'] = 'Income';
        
        if (preg_match('/(?:deposit|received|credit|amount|salary).*?(?:of\s+)?(?:USD\s+|ZWL\s+)?([ZUS$E£]{0,3})?([\d,]+\.?\d*)/i', $text, $matches)) {
            $amount = str_replace(',', '', $matches[2]);
            $result['amount'] = floatval($amount);
            $result['confidence'] = 80;
            $result['amount'] = -floatval($amount); // Income is negative
        }
    }
    
    // Extract amount if not already done
    if ($result['amount'] === null) {
        if (preg_match('/([ZUS$E£]{1,3})?([\d,]+\.?\d*)/i', $text, $matches)) {
            $amount = str_replace(',', '', $matches[2]);
            $result['amount'] = floatval($amount);
            $result['confidence'] = 40;
        }
    }
    
    return $result;
}
