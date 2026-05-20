<?php
/**
 * ML Prediction Bridge
 * Calls Python script to run ML prediction
 */

// Only set headers if running via web server
if (isset($_SERVER['REQUEST_METHOD'])) {
    header('Content-Type: application/json');
    
    // Only allow POST requests
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode(['success' => false, 'error' => 'Method not allowed']);
        exit;
    }
    
    // Get JSON input from HTTP request
    $input = json_decode(file_get_contents('php://input'), true);
} else {
    // CLI mode - read from stdin
    $input = json_decode(file_get_contents('php://stdin'), true);
}

if (!$input || !isset($input['budget']) || !isset($input['month1_spend']) || 
    !isset($input['month2_spend']) || !isset($input['month3_spend']) || !isset($input['month4_spend'])) {
    if (isset($_SERVER['REQUEST_METHOD'])) {
        http_response_code(400);
    }
    echo json_encode(['success' => false, 'error' => 'Missing required parameters']);
    exit;
}

// Build input for Python script
$python_input = json_encode([
    'budget' => floatval($input['budget']),
    'month1_spend' => floatval($input['month1_spend']),
    'month2_spend' => floatval($input['month2_spend']),
    'month3_spend' => floatval($input['month3_spend']),
    'month4_spend' => floatval($input['month4_spend'])
]);

// Path to Python script
$script_dir = __DIR__;
$python_script = $script_dir . '/run_prediction.py';

// Check if Python script exists
if (!file_exists($python_script)) {
    if (isset($_SERVER['REQUEST_METHOD'])) {
        http_response_code(500);
    }
    echo json_encode(['success' => false, 'error' => 'Prediction service unavailable']);
    exit;
}

// Write input to temp file
$temp_input = tempnam(sys_get_temp_dir(), 'ml_pred_');
file_put_contents($temp_input, $python_input);

// Find Python executable - try multiple methods
$python_exe = null;

// Method 1: Try 'python' in PATH (Windows: where python)
if (!$python_exe) {
    $where_output = @shell_exec('where python 2>&1');
    if ($where_output && strlen($where_output) > 0 && strpos($where_output, 'not found') === false) {
        $lines = explode("\n", trim($where_output));
        $python_exe = $lines[0]; // Get first match
    }
}

// Method 2: Try 'python3'
if (!$python_exe) {
    $where_output = @shell_exec('where python3 2>&1');
    if ($where_output && strlen($where_output) > 0 && strpos($where_output, 'not found') === false) {
        $lines = explode("\n", trim($where_output));
        $python_exe = $lines[0];
    }
}

// Method 3: Use full path if we know it's Anaconda
if (!$python_exe && file_exists('C:\\Users\\lenyo\\anaconda3\\python.exe')) {
    $python_exe = 'C:\\Users\\lenyo\\anaconda3\\python.exe';
}

// Method 4: Fallback to 'python'
if (!$python_exe) {
    $python_exe = 'python';
}

// Log found Python
error_log("[predict.php] Python location: {$python_exe}");
error_log("[predict.php] Python exists: " . (file_exists($python_exe) ? 'YES' : 'NO (using PATH lookup)'));

// Build command - pass temp file as argument (more reliable on Windows)
// Python script will read from command line argument
$command = "\"{$python_exe}\" \"{$python_script}\" \"{$temp_input}\" 2>&1";
error_log("[predict.php] Executing: {$command}");

// Execute Python script with output buffering
$output = [];
$return_var = 0;
exec($command, $output, $return_var);
error_log("[predict.php] Return code: {$return_var}");
if (!empty($output)) {
    error_log("[predict.php] Output: " . implode(" | ", array_slice($output, 0, 3)));
}

// Clean up temp file
@unlink($temp_input);

// Check if execution succeeded
if ($return_var !== 0) {
    $error_output = implode("\n", $output);
    if (isset($_SERVER['REQUEST_METHOD'])) {
        http_response_code(500);
    }
    error_log("[predict.php] Python script failed with return code {$return_var}");
    error_log("[predict.php] Output: " . substr($error_output, 0, 500));
    echo json_encode([
        'success' => false, 
        'error' => 'ML prediction failed',
        'return_code' => $return_var
    ]);
    exit;
}

// Parse Python output - combine all lines and clean whitespace
$output_text = trim(implode("\n", $output));

if (empty($output_text)) {
    if (isset($_SERVER['REQUEST_METHOD'])) {
        http_response_code(500);
    }
    echo json_encode([
        'success' => false,
        'error' => 'No output from prediction service'
    ]);
    exit;
}

$result = json_decode($output_text, true);

// Validate result
if (!$result) {
    if (isset($_SERVER['REQUEST_METHOD'])) {
        http_response_code(500);
    }
    echo json_encode([
        'success' => false,
        'error' => 'Invalid JSON response from prediction service',
        'raw_output' => $output_text
    ]);
    exit;
}

// Check for error in result
if ($result['success'] === false || isset($result['error'])) {
    if (isset($_SERVER['REQUEST_METHOD'])) {
        http_response_code(500);
    }
    echo json_encode([
        'success' => false,
        'error' => $result['error'] ?? 'Prediction service returned an error'
    ]);
    exit;
}

// Validate required fields
if (!isset($result['predicted_spend']) || !isset($result['predicted_deviation'])) {
    if (isset($_SERVER['REQUEST_METHOD'])) {
        http_response_code(500);
    }
    echo json_encode([
        'success' => false,
        'error' => 'Missing required fields in prediction result',
        'received' => $result
    ]);
    exit;
}

// Return successful result
if (isset($_SERVER['REQUEST_METHOD'])) {
    http_response_code(200);
}
echo json_encode([
    'success' => true,
    'predicted_spend' => $result['predicted_spend'],
    'predicted_deviation' => $result['predicted_deviation'],
    'r2_score' => $result['r2_score']
]);
