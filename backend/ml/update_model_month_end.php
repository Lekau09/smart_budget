<?php
/**
 * Month-End Model Update Script
 *
 * Collects each user's ACTUAL 4-month deviation history and the current
 * month's deviation, then passes them to the Python partial_fit script.
 *
 * For each eligible user (≥ 4 completed months of expense data):
 *   month1_deviation = spend_m-4 - budget_m-4    (feature 1)
 *   month2_deviation = spend_m-3 - budget_m-3    (feature 2)
 *   month3_deviation = spend_m-2 - budget_m-2    (feature 3)
 *   month4_deviation = spend_m-1 - budget_m-1    (feature 4)
 *   month5_deviation = spend_m   - budget_m      (target)
 *
 * Run automatically at month-end or manually:
 *   php update_model_month_end.php
 */

require_once __DIR__ . '/../config.php';

echo "==============================================\n";
echo "Month-End Model Update (Real Deviation History)\n";
echo "==============================================\n\n";

// Determine the most recent fully-completed month.
// We assume this script runs AFTER the previous month has ended,
// so we query the last 5 completed months.
$target_month   = (int)date('n', strtotime('-1 month'));
$target_year    = (int)date('Y', strtotime('-1 month'));

echo "Target month for prediction: {$target_month}/{$target_year}\n";
echo "Looking back 5 months for deviation history...\n\n";

// Step 1: Build a query that returns each user's monthly spend for the
// last 5 months (months M-4 through M).  We join expenses with
// user_budgets to get both budget and actual spend per month.

// Compute the start month/year (5 months before target)
$start_ts = strtotime("-5 month", mktime(0, 0, 0, $target_month, 1, $target_year));
$start_month = (int)date('n', $start_ts);
$start_year  = (int)date('Y', $start_ts);

$query = "
    SELECT
        e.user_id,
        MONTH(e.date)  AS m,
        YEAR(e.date)   AS y,
        ub.monthly_budget AS budget,
        COALESCE(SUM(e.amount), 0) AS spend
    FROM expenses e
    INNER JOIN user_budgets ub
        ON  e.user_id = ub.user_id
        AND MONTH(e.date) = ub.month
        AND YEAR(e.date)  = ub.year
    WHERE (YEAR(e.date)  > {$start_year}
           OR (YEAR(e.date) = {$start_year} AND MONTH(e.date) >= {$start_month}))
      AND (YEAR(e.date)  < {$target_year}
           OR (YEAR(e.date) = {$target_year} AND MONTH(e.date) <= {$target_month}))
    GROUP BY e.user_id, MONTH(e.date), YEAR(e.date), ub.monthly_budget
    ORDER BY e.user_id, y ASC, m ASC
";

$result = $conn->query($query);

if (!$result) {
    echo "[ERROR] Query failed: " . $conn->error . "\n";
    exit(1);
}

// Step 2: Group results by user and build 5-month deviation vectors
echo "Step 1: Collecting deviation histories...\n";

$user_months = [];
while ($row = $result->fetch_assoc()) {
    $uid = (int)$row['user_id'];
    $user_months[$uid][] = [
        'm'       => (int)$row['m'],
        'y'       => (int)$row['y'],
        'budget'  => (float)$row['budget'],
        'spend'   => (float)$row['spend'],
        'dev'     => (float)$row['spend'] - (float)$row['budget'],
    ];
}

// Step 3: Filter users who have data for ALL 5 months
echo "Step 2: Filtering users with complete 5-month history...\n";

$new_data = [];
$skipped  = [];

foreach ($user_months as $uid => $months) {
    if (count($months) < 5) {
        $skipped[] = "User {$uid}: only " . count($months) . " month(s) — need 5";
        continue;
    }

    // Take the LAST 5 months (most recent contiguous block)
    $last5 = array_slice($months, -5);

    // Verify contiguous: each month should increment by 1
    $contiguous = true;
    for ($i = 1; $i < 5; $i++) {
        $prev_ts = mktime(0, 0, 0, $last5[$i-1]['m'], 1, $last5[$i-1]['y']);
        $curr_ts = mktime(0, 0, 0, $last5[$i]['m'],     1, $last5[$i]['y']);
        $expected = strtotime('+1 month', $prev_ts);
        // Allow up to 2 days drift for month boundary differences
        if (abs($curr_ts - $expected) > 2 * 86400) {
            $contiguous = false;
            break;
        }
    }

    if (!$contiguous) {
        $skipped[] = "User {$uid}: 5 months found but not contiguous";
        continue;
    }

    // Build the deviation vector:
    //   features = [dev_m-4, dev_m-3, dev_m-2, dev_m-1]
    //   target   = dev_m (the most recent / target month)
    $new_data[] = [
        'month1_deviation' => $last5[0]['dev'],   // oldest  (m-4)
        'month2_deviation' => $last5[1]['dev'],   //         (m-3)
        'month3_deviation' => $last5[2]['dev'],   //         (m-2)
        'month4_deviation' => $last5[3]['dev'],   // most recent before target (m-1)
        'month5_deviation' => $last5[4]['dev'],   // TARGET (m)
        'user_id'          => $uid,
        'month_range'      => "{$last5[0]['m']}/{$last5[0]['y']} - "
                              . "{$last5[4]['m']}/{$last5[4]['y']}",
    ];
}

echo "  Users with complete 5-month history: " . count($new_data) . "\n";
echo "  Users skipped (incomplete/gaps):     " . count($skipped) . "\n";

if (!empty($skipped)) {
    echo "\n  Skipped users:\n";
    foreach ($skipped as $s) {
        echo "    - {$s}\n";
    }
    echo "\n";
}

if (empty($new_data)) {
    echo "No eligible users found. Aborting model update.\n";
    exit(0);
}

// Show summary
echo "\n  Deviation summary:\n";
$devs = array_column($new_data, 'month5_deviation');
echo "    Target deviation range: M" . min($devs) . " to M" . max($devs) . "\n";
echo "    Mean target deviation:  M" . round(array_sum($devs) / count($devs), 2) . "\n\n";

// Step 4: Build JSON payload for Python script
echo "Step 3: Calling Python partial_fit script...\n";

$script_dir     = __DIR__;
$model_path     = $script_dir . '/budget_model.pkl';
$scaler_path    = $script_dir . '/scaler.pkl';
$dataset_path   = 'C:\Users\lenyo\OneDrive\Desktop\Smart Budget_ML\budget_dataset.csv';

$payload = json_encode([
    'dataset_path' => $dataset_path,
    'model_path'   => $model_path,
    'scaler_path'  => $scaler_path,
    'new_data'     => $new_data,
], JSON_PRETTY_PRINT);

// Write to temp file for Python to read
$temp_input = tempnam(sys_get_temp_dir(), 'ml_update_');
file_put_contents($temp_input, $payload);

echo "  Payload written to: {$temp_input}\n";
echo "  New samples: " . count($new_data) . "\n\n";

// Step 5: Execute Python update script
$update_script = $script_dir . '/update_model_partial_fit.py';

if (!file_exists($update_script)) {
    echo "[ERROR] Update script not found: {$update_script}\n";
    @unlink($temp_input);
    exit(1);
}

// Find Python executable
$python_exe = null;
if (file_exists('C:\\Users\\lenyo\\anaconda3\\python.exe')) {
    $python_exe = 'C:\\Users\\lenyo\\anaconda3\\python.exe';
} else {
    $where_output = @shell_exec('where python 2>&1');
    if ($where_output && strpos($where_output, 'not found') === false) {
        $lines = explode("\n", trim($where_output));
        $python_exe = $lines[0];
    }
}
if (!$python_exe) {
    $python_exe = 'python';
}

echo "Using Python: {$python_exe}\n\n";

$command = "\"{$python_exe}\" \"{$update_script}\" \"{$temp_input}\" 2>&1";
$output = [];
$return_var = 0;
exec($command, $output, $return_var);

@unlink($temp_input);

if (!empty($output)) {
    foreach ($output as $line) {
        echo $line . "\n";
    }
}

if ($return_var !== 0) {
    echo "\n[ERROR] Model update failed with return code {$return_var}\n";
    exit(1);
}

echo "\n==============================================\n";
echo "Model Update Complete!\n";
echo "==============================================\n";
echo "  New R² score saved to model_metrics.json\n";
echo "  Updated model saved to budget_model.pkl\n";
echo "  Scaler unchanged (frozen from initial training)\n";

$conn->close();
