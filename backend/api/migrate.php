<?php
// Database migration - adds missing columns

require_once __DIR__ . '/../config.php';

header('Content-Type: application/json');

$migrations = [];

// Check and add total_income column if it doesn't exist
$check = $conn->query("SHOW COLUMNS FROM user_budgets LIKE 'total_income'");
if ($check->num_rows === 0) {
    if (!$conn->query("ALTER TABLE user_budgets ADD COLUMN total_income DECIMAL(12,2) DEFAULT 0")) {
        die(json_encode(['success' => false, 'error' => 'Failed to add total_income column: ' . $conn->error]));
    }
    $migrations[] = "Added total_income column to user_budgets";
}

// Verify all required tables exist
$required_tables = ['users', 'user_budgets', 'expenses', 'income', 'savings_goals', 'budget_categories'];
$tables_result = $conn->query("SHOW TABLES");
$existing_tables = [];
while ($row = $tables_result->fetch_array()) {
    $existing_tables[] = $row[0];
}

$missing = array_diff($required_tables, $existing_tables);

if (!empty($missing)) {
    die(json_encode(['success' => false, 'error' => 'Missing tables: ' . implode(', ', $missing)]));
}

echo json_encode([
    'success' => true,
    'message' => 'Database migration complete',
    'migrations' => $migrations,
    'tables_verified' => count($existing_tables)
]);
?>
