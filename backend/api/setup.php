<?php
// Database setup verification and installation script
// Navigate to: http://localhost/smart_budget/api/setup.php

header('Content-Type: application/json');

require_once __DIR__ . '/../config.php';

$response = [
    'status' => 'checking',
    'database' => null,
    'tables' => []
];

// Check database connection
if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Database connection failed: ' . $conn->connect_error
    ]);
    exit;
}

$response['database'] = 'Connected';

// Check if tables exist
$tables = ['users', 'budgets', 'expenses', 'goals'];
foreach ($tables as $table) {
    $result = $conn->query("SHOW TABLES LIKE '$table'");
    $response['tables'][$table] = $result && $result->num_rows > 0 ? 'exists' : 'missing';
}

// If tables are missing, try to create them
if (in_array('missing', $response['tables'])) {
    $response['action'] = 'Creating tables...';
    
    $sql_commands = [
        // Users table
        "CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            email VARCHAR(100) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )",
        
        // Budgets table
        "CREATE TABLE IF NOT EXISTS budgets (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            monthly_budget DECIMAL(10, 2) DEFAULT 0,
            total_spent DECIMAL(10, 2) DEFAULT 0,
            total_saved DECIMAL(10, 2) DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )",
        
        // Expenses table
        "CREATE TABLE IF NOT EXISTS expenses (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            description VARCHAR(255),
            amount DECIMAL(10, 2) NOT NULL,
            category VARCHAR(100),
            date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )",
        
        // Goals table
        "CREATE TABLE IF NOT EXISTS goals (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            goal_name VARCHAR(255) NOT NULL,
            target_amount DECIMAL(10, 2) NOT NULL,
            current_amount DECIMAL(10, 2) DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )"
    ];
    
    foreach ($sql_commands as $sql) {
        if (!$conn->query($sql)) {
            $response['errors'][] = 'Error creating table: ' . $conn->error;
        }
    }
    
    // Verify tables were created
    foreach ($tables as $table) {
        $result = $conn->query("SHOW TABLES LIKE '$table'");
        $response['tables'][$table] = $result && $result->num_rows > 0 ? 'created' : 'failed';
    }
}

http_response_code(200);
echo json_encode($response, JSON_PRETTY_PRINT);
$conn->close();
?>
