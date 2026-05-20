<?php
/**
 * Get Prediction API Endpoint
 * Fetches last 4 months of expense data and returns ML prediction
 */

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit;
}

require_once __DIR__ . '/../config.php';

// Get JSON input
$input = json_decode(file_get_contents('php://input'), true);

if (!$input || !isset($input['user_id'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'User ID required']);
    exit;
}

$user_id = intval($input['user_id']);

// Get current month's budget
$current_date = new DateTime();
$current_month = $current_date->format('n');
$current_year = $current_date->format('Y');

$stmt = $conn->prepare("SELECT monthly_budget FROM user_budgets WHERE user_id = ? AND month = ? AND year = ?");
$stmt->bind_param("iii", $user_id, $current_month, $current_year);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    $stmt->close();
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'No budget set for current month']);
    exit;
}

$budget_row = $result->fetch_assoc();
$monthly_budget = floatval($budget_row['monthly_budget']);
$stmt->close();

// Fetch the last 4 completed months of expense data, excluding the current month.
$query = "
    SELECT 
        DATE_FORMAT(date, '%Y-%m') as month,
        SUM(amount) as total_spend
    FROM expenses
    WHERE user_id = ?
      AND DATE(date) < DATE_FORMAT(CURDATE(), '%Y-%m-01')
    GROUP BY DATE_FORMAT(date, '%Y-%m')
    ORDER BY month DESC
    LIMIT 4
";

$stmt = $conn->prepare($query);
$stmt->bind_param("i", $user_id);
$stmt->execute();
$expense_result = $stmt->get_result();

$monthly_data = [];
while ($row = $expense_result->fetch_assoc()) {
    $monthly_data[] = [
        'month' => $row['month'],
        'spend' => floatval($row['total_spend'])
    ];
}
$stmt->close();

// Check if we have enough data for ML prediction
$months_available = count($monthly_data);

if ($months_available >= 4) {
    // Reverse to get oldest first (month1, month2, month3, month4)
    $monthly_data = array_reverse($monthly_data);
    
    // Prepare data for ML prediction
    $prediction_input = [
        'budget' => $monthly_budget,
        'month1_spend' => $monthly_data[0]['spend'],
        'month2_spend' => $monthly_data[1]['spend'],
        'month3_spend' => $monthly_data[2]['spend'],
        'month4_spend' => $monthly_data[3]['spend']
    ];

    // Call ML prediction bridge
    $predict_url = 'http://' . $_SERVER['HTTP_HOST'] . '/smart_budget/backend/ml/predict.php';

    $ch = curl_init($predict_url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($prediction_input));
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
    curl_setopt($ch, CURLOPT_TIMEOUT, 15);
    curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 10);

    $ml_response = curl_exec($ch);
    $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curl_error = curl_error($ch);
    curl_close($ch);

    // Check for curl errors first
    if ($curl_error) {
        http_response_code(500);
        error_log("[get-prediction] CURL error: {$curl_error}");
        echo json_encode([
            'success' => false,
            'error' => 'Prediction service connection failed'
        ]);
        exit;
    }

    if ($http_code !== 200) {
        http_response_code(500);
        error_log("[get-prediction] ML service returned HTTP {$http_code}: {$ml_response}");
        echo json_encode([
            'success' => false,
            'error' => "Prediction service error (HTTP {$http_code})"
        ]);
        exit;
    }

    if (!$ml_response || empty($ml_response)) {
        http_response_code(500);
        error_log("[get-prediction] ML service returned empty response");
        echo json_encode([
            'success' => false,
            'error' => 'Prediction service returned no data'
        ]);
        exit;
    }

    $ml_result = json_decode($ml_response, true);

    if (!$ml_result || !is_array($ml_result)) {
        http_response_code(500);
        error_log("[get-prediction] JSON decode failed. Response: " . substr($ml_response, 0, 500));
        echo json_encode([
            'success' => false,
            'error' => 'Invalid response format from prediction service'
        ]);
        exit;
    }

    // Check for explicit success flag
    if ($ml_result['success'] !== true) {
        http_response_code(500);
        error_log("[get-prediction] ML service failure: " . ($ml_result['error'] ?? 'Unknown error'));
        echo json_encode([
            'success' => false,
            'error' => $ml_result['error'] ?? 'Prediction service returned an error'
        ]);
        exit;
    }

    // Validate required fields from ML service
    $required_fields = ['predicted_spend', 'predicted_deviation', 'r2_score'];
    foreach ($required_fields as $field) {
        if (!isset($ml_result[$field])) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'error' => "Missing field in prediction: {$field}"
            ]);
            exit;
        }
    }

    // Return successful prediction
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'predicted_spend' => $ml_result['predicted_spend'],
        'predicted_deviation' => $ml_result['predicted_deviation'],
        'budget_used' => $monthly_budget,
        'months_used' => $months_available,
        'month_data' => $monthly_data,
        'confidence' => $ml_result['r2_score'],
        'prediction_method' => 'ml_model'
    ]);
    $conn->close();
    exit;
}

// FALLBACK: Statistical prediction for users with less than 4 months of data
// This solves the cold start problem by providing reasonable estimates

if ($months_available === 0) {
    // No historical data - use budget as the baseline prediction
    $predicted_spend = $monthly_budget;
    $predicted_deviation = 0;
    $confidence = 0.2; // Low confidence since it's just a guess
    $method = 'budget_baseline';
} elseif ($months_available === 1) {
    // One month - use that month's spending
    $spent = $monthly_data[0]['spend'];
    $predicted_spend = $spent;
    $predicted_deviation = $spent - $monthly_budget;
    $confidence = 0.3; // Very low confidence
    $method = 'single_month';
} elseif ($months_available === 2) {
    // Two months - simple average
    $total_spend = $monthly_data[0]['spend'] + $monthly_data[1]['spend'];
    $predicted_spend = $total_spend / 2;
    $predicted_deviation = $predicted_spend - $monthly_budget;
    $confidence = 0.5; // Moderate-low confidence
    $method = 'simple_average';
} else {
    // Three months - average with trend detection
    $total_spend = array_sum(array_column($monthly_data, 'spend'));
    $predicted_spend = $total_spend / 3;
    
    // Simple trend: compare recent vs older spending
    $recent = $monthly_data[0]['spend']; // Most recent month
    $older_avg = ($monthly_data[1]['spend'] + $monthly_data[2]['spend']) / 2;
    $trend = $recent - $older_avg;
    
    // Adjust prediction slightly based on trend (25% weight)
    $predicted_spend = $predicted_spend + ($trend * 0.25);
    $predicted_spend = max($predicted_spend, 0); // Ensure non-negative
    
    $predicted_deviation = $predicted_spend - $monthly_budget;
    $confidence = 0.65; // Moderate confidence
    $method = 'trend_adjusted';
}

// Return statistical prediction
http_response_code(200);
echo json_encode([
    'success' => true,
    'predicted_spend' => round($predicted_spend, 2),
    'predicted_deviation' => round($predicted_deviation, 2),
    'budget_used' => $monthly_budget,
    'months_used' => $months_available,
    'month_data' => $monthly_data,
    'confidence' => $confidence,
    'prediction_method' => $method
]);

$conn->close();
