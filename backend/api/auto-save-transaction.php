<?php
/**
 * auto-save-transaction.php
 * Called by Python SMS extractor after parsing each SMS.
 * Saves expense to DB and creates a bell notification.
 * Self-contained — no external helpers required.
 */
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }

require_once __DIR__ . '/../config.php';

$input            = json_decode(file_get_contents('php://input'), true);
$user_id          = intval($input['user_id']          ?? 0);
$amount           = floatval($input['amount']          ?? 0);
$category         = trim($input['category']            ?? 'Other');
$description      = trim($input['description']         ?? '');
$transaction_type = trim($input['transaction_type']    ?? 'Purchase');
$store            = trim($input['store']               ?? '');
$date             = trim($input['date']                ?? date('Y-m-d'));
$raw_sms          = trim($input['raw_sms']             ?? '');
$needs_manual     = isset($input['needs_manual']) ? (bool)$input['needs_manual'] : false;

if (!$user_id || $amount <= 0) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Missing user_id or amount']);
    exit;
}

// Skip transfers and deposits
if (in_array($transaction_type, ['Deposit', 'Income', 'Transfer'])) {
    echo json_encode(['success' => true, 'message' => 'Skipped - not an expense']);
    exit;
}

$is_withdrawal = ($transaction_type === 'Cash Withdrawal' || $transaction_type === 'Mobile Money Withdrawal');
if ($is_withdrawal) $category = 'Other';

// ─── Helper: create notification directly (no external class needed) ───────
function create_notification($conn, $user_id, $title, $body, $type = 'expense') {
    // Try with 'message' column (actual schema)
    $stmt = $conn->prepare(
        "INSERT INTO notifications (user_id, title, message, type, is_read, created_at)
         VALUES (?, ?, ?, ?, 0, NOW())"
    );
    if ($stmt) {
        $stmt->bind_param('isss', $user_id, $title, $body, $type);
        $result = $stmt->execute();
        $stmt->close();
        if ($result) return true;
    }
    // Fallback: try with 'body' column (alternate schema)
    $stmt2 = $conn->prepare(
        "INSERT INTO notifications (user_id, title, body, type, is_read, created_at)
         VALUES (?, ?, ?, ?, 0, NOW())"
    );
    if ($stmt2) {
        $stmt2->bind_param('isss', $user_id, $title, $body, $type);
        $stmt2->execute();
        $stmt2->close();
    }
    return true;
}

try {
    // ─── 1. Save expense ────────────────────────────────────────────────────
    $expense_id = null;

    // Try with transaction_type and raw_sms columns
    $stmt = $conn->prepare("
        INSERT INTO expenses (user_id, description, amount, category, date, transaction_type, raw_sms)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ");
    if ($stmt) {
        $stmt->bind_param('isdssss', $user_id, $description, $amount, $category, $date, $transaction_type, $raw_sms);
        if ($stmt->execute()) {
            $expense_id = $conn->insert_id;
        }
        $stmt->close();
    }

    // Fallback: without raw_sms
    if (!$expense_id) {
        $stmt = $conn->prepare("
            INSERT INTO expenses (user_id, description, amount, category, date, transaction_type)
            VALUES (?, ?, ?, ?, ?, ?)
        ");
        if ($stmt) {
            $stmt->bind_param('isdsss', $user_id, $description, $amount, $category, $date, $transaction_type);
            if ($stmt->execute()) {
                $expense_id = $conn->insert_id;
            }
            $stmt->close();
        }
    }

    // Final fallback: minimal insert
    if (!$expense_id) {
        $stmt = $conn->prepare("
            INSERT INTO expenses (user_id, description, amount, category, date)
            VALUES (?, ?, ?, ?, ?)
        ");
        $stmt->bind_param('isdss', $user_id, $description, $amount, $category, $date);
        if (!$stmt->execute()) throw new Exception("Expense insert failed: " . $stmt->error);
        $expense_id = $conn->insert_id;
        $stmt->close();
    }

    // ─── 2. Update budget total_spent (purchases only) ──────────────────────
    if (!$is_withdrawal) {
        // Try month-specific budget first
        $month = (int)date('n', strtotime($date));
        $year  = (int)date('Y', strtotime($date));

        $stmt = $conn->prepare("
            UPDATE user_budgets
            SET total_spent = total_spent + ?
            WHERE user_id = ? AND month = ? AND year = ?
        ");
        if ($stmt) {
            $stmt->bind_param('diii', $amount, $user_id, $month, $year);
            $stmt->execute();
            $affected = $stmt->affected_rows;
            $stmt->close();

            // If no month-specific row, update default (month=0)
            if ($affected === 0) {
                $stmt2 = $conn->prepare("
                    UPDATE user_budgets
                    SET total_spent = total_spent + ?
                    WHERE user_id = ? AND (month = 0 OR month IS NULL)
                ");
                if ($stmt2) {
                    $stmt2->bind_param('di', $amount, $user_id);
                    $stmt2->execute();
                    $stmt2->close();
                }
            }
        }
    }

    // ─── 3. Get current budget for alert thresholds ─────────────────────────
    $monthly   = 0;
    $spent     = 0;
    $remaining = 0;
    $stmt = $conn->prepare("
        SELECT monthly_budget, total_spent
        FROM user_budgets
        WHERE user_id = ?
        ORDER BY year DESC, month DESC LIMIT 1
    ");
    if ($stmt) {
        $stmt->bind_param('i', $user_id);
        $stmt->execute();
        $budget = $stmt->get_result()->fetch_assoc();
        $stmt->close();
        if ($budget) {
            $monthly   = floatval($budget['monthly_budget'] ?? 0);
            $spent     = floatval($budget['total_spent']    ?? 0);
            $remaining = $monthly - $spent;
        }
    }

    $store_label = $store ?: $description ?: 'Unknown';
    $amt_fmt     = number_format($amount, 2);

    // ─── 4. Create notification ──────────────────────────────────────────────
    if ($is_withdrawal) {
        $withdrawal_label = ($transaction_type === 'Mobile Money Withdrawal' ? "Mobile Money" : "Cash") . " Withdrawal";
        create_notification(
            $conn, $user_id,
            "$withdrawal_label — M{$amt_fmt}",
            "M{$amt_fmt} withdrawn from {$store_label}. Go to Transactions to categorize it.",
            'withdrawal'
        );
    } elseif ($needs_manual) {
        // Low ML confidence — needs user review
        create_notification(
            $conn, $user_id,
            "AI Needs Help — {$store_label}",
            "M{$amt_fmt} at {$store_label} couldn't be categorized confidently. Tap to review.",
            'review'
        );
    } else {
        // Normal auto-categorized purchase
        create_notification(
            $conn, $user_id,
            "Auto-categorized — {$category}",
            "M{$amt_fmt} at {$store_label} saved automatically.",
            'expense'
        );

        // Budget threshold alerts
        if ($monthly > 0) {
            $pct = ($spent / $monthly) * 100;
            if ($pct >= 100) {
                create_notification($conn, $user_id,
                    '⚠️ Budget Exceeded',
                    "You have exceeded your M" . number_format($monthly, 2) . " monthly budget.",
                    'warning'
                );
            } elseif ($pct >= 90) {
                create_notification($conn, $user_id,
                    '🔴 Budget Critical — ' . round($pct) . '% used',
                    "Only M" . number_format($remaining, 2) . " remaining this month.",
                    'warning'
                );
            } elseif ($pct >= 75) {
                create_notification($conn, $user_id,
                    '🟡 Budget Alert — ' . round($pct) . '% used',
                    "M" . number_format($remaining, 2) . " left this month.",
                    'warning'
                );
            }
        }
    }

    echo json_encode([
        'success'       => true,
        'expense_id'    => $expense_id,
        'category'      => $category,
        'amount'        => $amount,
        'remaining'     => $remaining,
        'is_withdrawal' => $is_withdrawal,
        'needs_manual'  => $needs_manual,
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
$conn->close();
?>