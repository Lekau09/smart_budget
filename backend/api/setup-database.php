<?php
/**
 * Database Setup Script
 * Creates/updates all necessary tables with proper schema
 * Run this once after deploying to ensure database is ready
 */

error_reporting(E_ALL);
ini_set('display_errors', 0);
header('Content-Type: application/json');

require_once __DIR__ . '/../config.php';

if (!$conn) {
    die(json_encode(['success' => false, 'error' => 'Database connection failed']));
}

$tables_created = [];
$tables_updated = [];
$errors = [];

// ============================================================================
// TABLE 1: users - Store user accounts with phone number for SMS identification
// ============================================================================
$sql = "CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  phone_number VARCHAR(20) UNIQUE NOT NULL,
  ingest_secret VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_phone (phone_number),
  INDEX idx_email (email)
)";

if ($conn->query($sql)) {
    $tables_created[] = 'users';
} else {
    if (strpos($conn->error, 'already exists') === false) {
        $errors[] = "users: " . $conn->error;
    } else {
        // Check if columns exist and add if missing
        $alter_sqls = [
            "ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_number VARCHAR(20) UNIQUE",
            "ALTER TABLE users ADD COLUMN IF NOT EXISTS ingest_secret VARCHAR(255) UNIQUE",
            "ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"
        ];
        foreach ($alter_sqls as $alter_sql) {
            if ($conn->query($alter_sql)) {
                $tables_updated[] = 'users (added columns)';
            }
        }
    }
}

// ============================================================================
// TABLE 2: user_budgets - Store budget information for each user
// ============================================================================
$sql = "CREATE TABLE IF NOT EXISTS user_budgets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  monthly_budget DECIMAL(12,2) DEFAULT 0,
  total_spent DECIMAL(12,2) DEFAULT 0,
  total_saved DECIMAL(12,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user (user_id)
)";

if ($conn->query($sql)) {
    $tables_created[] = 'user_budgets';
} else {
    if (strpos($conn->error, 'already exists') === false) {
        $errors[] = "user_budgets: " . $conn->error;
    }
}

// ============================================================================
// TABLE 3: expenses - Store individual expense transactions
// ============================================================================
$sql = "CREATE TABLE IF NOT EXISTS expenses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  description VARCHAR(255),
  amount DECIMAL(12,2) NOT NULL,
  category VARCHAR(100),
  date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_date (user_id, date),
  INDEX idx_category (category)
)";

if ($conn->query($sql)) {
    $tables_created[] = 'expenses';
} else {
    if (strpos($conn->error, 'already exists') === false) {
        $errors[] = "expenses: " . $conn->error;
    }
}

// ============================================================================
// TABLE 4: budget_categories - Store budget category definitions
// ============================================================================
$sql = "CREATE TABLE IF NOT EXISTS budget_categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  category_name VARCHAR(100) NOT NULL,
  allocated_amount DECIMAL(12,2),
  spent_amount DECIMAL(12,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_category (user_id, category_name),
  INDEX idx_user (user_id)
)";

if ($conn->query($sql)) {
    $tables_created[] = 'budget_categories';
} else {
    if (strpos($conn->error, 'already exists') === false) {
        $errors[] = "budget_categories: " . $conn->error;
    }
}

// ============================================================================
// TABLE 5: savings_goals - Store user savings goals
// ============================================================================
$sql = "CREATE TABLE IF NOT EXISTS savings_goals (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  goal_name VARCHAR(255) NOT NULL,
  target_amount DECIMAL(12,2),
  current_amount DECIMAL(12,2) DEFAULT 0,
  deadline DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user (user_id)
)";

if ($conn->query($sql)) {
    $tables_created[] = 'savings_goals';
} else {
    if (strpos($conn->error, 'already exists') === false) {
        $errors[] = "savings_goals: " . $conn->error;
    }
}

// ============================================================================
// TABLE 6: sms_raw_ingest - Store raw SMS data from SMS Forwarder app
// ============================================================================
$sql = "CREATE TABLE IF NOT EXISTS sms_raw_ingest (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  sms_from VARCHAR(255) NOT NULL,
  sms_text LONGTEXT NOT NULL,
  sent_stamp BIGINT,
  received_stamp BIGINT NOT NULL,
  sim_slot VARCHAR(10),
  sms_hash VARCHAR(64) UNIQUE NOT NULL,
  is_duplicate TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user (user_id),
  INDEX idx_hash (sms_hash),
  INDEX idx_received (received_stamp)
)";

if ($conn->query($sql)) {
    $tables_created[] = 'sms_raw_ingest';
} else {
    if (strpos($conn->error, 'already exists') === false) {
        $errors[] = "sms_raw_ingest: " . $conn->error;
    }
}

// ============================================================================
// TABLE 7: transactions - Store parsed financial transactions from SMS
// ============================================================================
$sql = "CREATE TABLE IF NOT EXISTS transactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  sms_raw_id INT,
  log_date VARCHAR(10),
  log_time VARCHAR(10),
  sender VARCHAR(255),
  sim VARCHAR(10),
  trans_date VARCHAR(10),
  trans_time VARCHAR(10),
  transaction_type VARCHAR(50),
  total_amount DECIMAL(12,2),
  recipient_source VARCHAR(255),
  reference VARCHAR(100),
  is_categorized TINYINT(1) DEFAULT 0,
  categorized_at TIMESTAMP NULL,
  cash_usage_category VARCHAR(100),
  cash_usage_description LONGTEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (sms_raw_id) REFERENCES sms_raw_ingest(id) ON DELETE SET NULL,
  INDEX idx_user (user_id),
  INDEX idx_transaction_type (transaction_type),
  INDEX idx_trans_date (trans_date),
  INDEX idx_reference (reference)
)";

if ($conn->query($sql)) {
    $tables_created[] = 'transactions';
} else {
    if (strpos($conn->error, 'already exists') === false) {
        $errors[] = "transactions: " . $conn->error;
    } else {
        // Check if user_id column exists and add if missing
        $check_user = $conn->query("SHOW COLUMNS FROM transactions LIKE 'user_id'");
        if ($check_user->num_rows === 0) {
            $conn->query("ALTER TABLE transactions ADD COLUMN user_id INT NOT NULL AFTER id");
            $conn->query("ALTER TABLE transactions ADD FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE");
            $tables_updated[] = 'transactions (added user_id)';
        }
    }
}

// ============================================================================
// TABLE 8: notifications - Store system notifications
// ============================================================================
$sql = "CREATE TABLE IF NOT EXISTS notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  type ENUM('sms','expense','income','budget','savings','system') NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  action_url VARCHAR(500),
  reference_id INT,
  reference_type VARCHAR(50),
  is_read TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user (user_id),
  INDEX idx_is_read (is_read),
  INDEX idx_created (created_at)
)";

if ($conn->query($sql)) {
    $tables_created[] = 'notifications';
} else {
    if (strpos($conn->error, 'already exists') === false) {
        $errors[] = "notifications: " . $conn->error;
    }
}

// ============================================================================
// TABLE 9: income - Store income transactions
// ============================================================================
$sql = "CREATE TABLE IF NOT EXISTS income (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  description VARCHAR(255),
  amount DECIMAL(12,2) NOT NULL,
  source VARCHAR(100),
  date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_date (user_id, date)
)";

if ($conn->query($sql)) {
    $tables_created[] = 'income';
} else {
    if (strpos($conn->error, 'already exists') === false) {
        $errors[] = "income: " . $conn->error;
    }
}

// ============================================================================
// TABLE 10: sms_transactions - Store parsed transaction data from SMS (legacy)
// ============================================================================
$sql = "CREATE TABLE IF NOT EXISTS sms_transactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  sms_raw_id INT,
  transaction_type VARCHAR(50),
  sender VARCHAR(255),
  amount DECIMAL(12,2),
  description VARCHAR(255),
  transaction_date DATETIME,
  parsed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (sms_raw_id) REFERENCES sms_raw_ingest(id) ON DELETE SET NULL,
  INDEX idx_user (user_id)
)";

if ($conn->query($sql)) {
    $tables_created[] = 'sms_transactions';
} else {
    if (strpos($conn->error, 'already exists') === false) {
        $errors[] = "sms_transactions: " . $conn->error;
    }
}

// Return results
http_response_code(200);
echo json_encode([
    'success' => count($errors) === 0,
    'message' => 'Database setup completed',
    'tables_created' => $tables_created,
    'tables_updated' => $tables_updated,
    'errors' => $errors,
    'total_tables' => count($tables_created) + count($tables_updated),
    'timestamp' => date('Y-m-d H:i:s')
]);

$conn->close();
?>
