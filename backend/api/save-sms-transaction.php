<?php
// Save extracted SMS transaction as an expense
error_reporting(E_ALL);
ini_set('display_errors', 0);
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
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
$amount = floatval($input['amount'] ?? 0);
$category = trim($input['category'] ?? 'Other');
$description = trim($input['description'] ?? '');
$type = trim($input['type'] ?? 'expense');
$transaction_type = trim($input['transaction_type'] ?? 'Purchase');

if (!$user_id || !$sms_raw_id || $amount == 0) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Missing required fields']);
    exit;
}

try {
    // Get SMS details - convert timestamp from milliseconds to seconds
    $stmt = $conn->prepare("SELECT FROM_UNIXTIME(received_stamp/1000) as received_stamp FROM sms_raw_ingest WHERE id = ? AND user_id = ?");
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
    $transaction_date = $sms['received_stamp'];
    $stmt->close();
    
    // Determine if income or expense
    $is_income = ($type === 'income' || $type === 'deposit');
    $is_withdrawal = ($transaction_type === 'Cash Withdrawal' || $transaction_type === 'Mobile Money Withdrawal');
    $abs_amount = abs($amount);
    
    // Convert transaction_date to proper format (YYYY-MM-DD for expenses, can be timestamp for income)
    $date_obj = new DateTime($transaction_date);
    $date_formatted = $date_obj->format('Y-m-d');
    
    // Insert into appropriate table (expenses or income)
    if ($is_income) {
        $stmt = $conn->prepare("
            INSERT INTO income (user_id, description, amount, source, date)
            VALUES (?, ?, ?, ?, NOW())
        ");
        $stmt->bind_param("isds", $user_id, $description, $abs_amount, $category);
    } else {
        $stmt = $conn->prepare("
            INSERT INTO expenses (user_id, description, amount, category, date, transaction_type)
            VALUES (?, ?, ?, ?, ?, ?)
        ");
        $stmt->bind_param("isdsss", $user_id, $description, $abs_amount, $category, $date_formatted, $transaction_type);
    }
    
    if (!$stmt->execute()) {
        throw new Exception("Transaction insert failed: " . $stmt->error);
    }
    
    $transaction_id = $conn->insert_id;
    $stmt->close();
    
    // Mark SMS as processed
    $stmt = $conn->prepare("UPDATE sms_raw_ingest SET is_duplicate = 2 WHERE id = ?");
    $stmt->bind_param("i", $sms_raw_id);
    $stmt->execute();
    $stmt->close();
    
    // Update budget if expense
    if (!$is_income) {
        $stmt = $conn->prepare("
            UPDATE user_budgets 
            SET total_spent = total_spent + ? 
            WHERE user_id = ?
        ");
        $stmt->bind_param("di", $abs_amount, $user_id);
        $stmt->execute();
        $stmt->close();
    } else {
        // Update budget if income (savings)
        $stmt = $conn->prepare("
            UPDATE user_budgets 
            SET total_saved = total_saved + ? 
            WHERE user_id = ?
        ");
        $stmt->bind_param("di", $abs_amount, $user_id);
        $stmt->execute();
        $stmt->close();
    }
    
    // ─── Create notification for the notification bell ───────────────────────
    $notif_title = '';
    $notif_body = '';
    $notif_type = 'expense';
    
    if ($is_income) {
        $notif_title = "Income Received — M" . number_format($abs_amount, 2);
        $notif_body = "M" . number_format($abs_amount, 2) . " received from " . $description;
        $notif_type = 'income';
    } elseif ($is_withdrawal) {
        $notif_title = ($transaction_type === 'Mobile Money Withdrawal' ? "Mobile Money" : "Cash") . " Withdrawal — M" . number_format($abs_amount, 2);
        $notif_body = "M" . number_format($abs_amount, 2) . " withdrawn from " . $description . ". Tap to categorize.";
        $notif_type = 'withdrawal';
    } else {
        $notif_title = "Transaction Saved — " . $category;
        $notif_body = "M" . number_format($abs_amount, 2) . " at " . $description . " categorized as " . $category;
        $notif_type = 'expense';
    }
    
    // Try with 'message' column (actual schema)
    $notif_stmt = $conn->prepare(
        "INSERT INTO notifications (user_id, title, message, type, is_read, created_at)
         VALUES (?, ?, ?, ?, 0, NOW())"
    );
    if ($notif_stmt) {
        $notif_stmt->bind_param('isss', $user_id, $notif_title, $notif_body, $notif_type);
        $notif_result = $notif_stmt->execute();
        $notif_stmt->close();
    } else {
        // Fallback: try with 'body' column (alternate schema)
        $notif_stmt2 = $conn->prepare(
            "INSERT INTO notifications (user_id, title, body, type, is_read, created_at)
             VALUES (?, ?, ?, ?, 0, NOW())"
        );
        if ($notif_stmt2) {
            $notif_stmt2->bind_param('isss', $user_id, $notif_title, $notif_body, $notif_type);
            $notif_stmt2->execute();
            $notif_stmt2->close();
        }
    }
    
    // Log the transaction creation
    $log_dir = __DIR__ . '/../logs';
    if (!is_dir($log_dir)) {
        mkdir($log_dir, 0755, true);
    }
    
    $log_file = $log_dir . '/sms-transactions.txt';
    $timestamp = date('Y-m-d H:i:s');
    $log_entry = "[{$timestamp}] TRANSACTION CREATED\n";
    $log_entry .= "  Transaction ID: {$transaction_id}\n";
    $log_entry .= "  SMS Raw ID: {$sms_raw_id}\n";
    $log_entry .= "  User ID: {$user_id}\n";
    $log_entry .= "  Type: " . ($is_income ? 'INCOME' : 'EXPENSE') . "\n";
    $log_entry .= "  Category: {$category}\n";
    $log_entry .= "  Amount: {$abs_amount}\n";
    $log_entry .= "  Description: {$description}\n";
    $log_entry .= "  Date: {$transaction_date}\n";
    $log_entry .= "---\n";
    
    file_put_contents($log_file, $log_entry, FILE_APPEND);
    
    http_response_code(201);
    echo json_encode([
        'success' => true,
        'message' => 'Transaction created from SMS',
        'transaction_id' => $transaction_id,
        'type' => $is_income ? 'income' : 'expense',
        'category' => $category,
        'amount' => $abs_amount,
        'date' => $transaction_date
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}

$conn->close();
?>
