<?php
// Database setup script
header("Content-Type: application/json");

$host = 'localhost';
$user = 'root';
$pass = '';
$db = 'smart_budget';

// Connect without database first
$conn = new mysqli($host, $user, $pass);
if ($conn->connect_error) {
  echo json_encode(['success' => false, 'error' => 'Connection failed: ' . $conn->connect_error]);
  exit;
}

// Create database
if (!$conn->query("CREATE DATABASE IF NOT EXISTS $db")) {
  echo json_encode(['success' => false, 'error' => 'Create DB failed: ' . $conn->error]);
  exit;
}

// Select database
$conn->select_db($db);

// Create tables
$tables = [
  "CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )",
  
  "CREATE TABLE IF NOT EXISTS user_budgets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    monthly_budget DECIMAL(12,2) DEFAULT 0,
    total_spent DECIMAL(12,2) DEFAULT 0,
    total_saved DECIMAL(12,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )",
  
  "CREATE TABLE IF NOT EXISTS expenses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    description VARCHAR(255),
    amount DECIMAL(12,2) NOT NULL,
    category VARCHAR(100),
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX(user_id, date)
  )",
  
  "CREATE TABLE IF NOT EXISTS savings_goals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    goal_name VARCHAR(255),
    target_amount DECIMAL(12,2),
    current_amount DECIMAL(12,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )",
  
  "CREATE TABLE IF NOT EXISTS budget_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    category_name VARCHAR(100),
    allocated_amount DECIMAL(12,2) DEFAULT 0,
    spent_amount DECIMAL(12,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_category (user_id, category_name)
  )"
];

foreach ($tables as $sql) {
  if (!$conn->query($sql)) {
    echo json_encode(['success' => false, 'error' => 'Create table failed: ' . $conn->error, 'sql' => $sql]);
    exit;
  }
}

// Check if user 1 has expenses, if not add sample data
$checkExpenses = $conn->query("SELECT COUNT(*) as count FROM expenses WHERE user_id = 1");
$expenseCount = $checkExpenses->fetch_assoc()['count'];

if ($expenseCount == 0) {
  // Add sample expenses for user 1
  $sampleExpenses = [
    ['Groceries', 250.50, 'Food'],
    ['Gas', 45.00, 'Transportation'],
    ['Netflix subscription', 15.99, 'Entertainment'],
    ['Coffee', 12.50, 'Food'],
    ['Electricity bill', 120.00, 'Utilities'],
    ['Gym membership', 50.00, 'Health']
  ];
  
  $expenseInsert = $conn->prepare("INSERT INTO expenses (user_id, description, amount, category, date) VALUES (?, ?, ?, ?, NOW())");
  $userId = 1;
  foreach ($sampleExpenses as $exp) {
    $expenseInsert->bind_param("isds", $userId, $exp[0], $exp[1], $exp[2]);
    $expenseInsert->execute();
  }
  $expenseInsert->close();
  
  // Update total_spent in budget for user 1
  $totalSpent = array_sum(array_column($sampleExpenses, 1));
  $updateBudget = $conn->prepare("UPDATE user_budgets SET total_spent = ? WHERE user_id = ?");
  $updateBudget->bind_param("di", $totalSpent, $userId);
  $updateBudget->execute();
  $updateBudget->close();
}
$conn->close();

echo json_encode(['success' => true, 'message' => 'Database setup completed successfully']);
?>
