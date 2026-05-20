<?php
require_once __DIR__ . '/../config.php';

// Check current transactions table structure
$result = $conn->query("DESCRIBE transactions");
echo "Current transactions table structure:\n";
while ($row = $result->fetch_assoc()) {
    echo "- " . $row['Field'] . " (" . $row['Type'] . ")\n";
}

// Check if user_id column exists
$user_id_exists = false;
$result = $conn->query("SHOW COLUMNS FROM transactions WHERE Field = 'user_id'");
if ($result->num_rows > 0) {
    $user_id_exists = true;
    echo "\n✓ user_id column already exists\n";
} else {
    echo "\n✗ user_id column does not exist - adding it now...\n";
    
    // Add user_id column if it doesn't exist
    $alter_sql = "ALTER TABLE transactions ADD COLUMN user_id INT AFTER id";
    if ($conn->query($alter_sql)) {
        echo "✓ Added user_id column\n";
        
        // Add FOREIGN KEY constraint
        $fk_sql = "ALTER TABLE transactions ADD FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE";
        if ($conn->query($fk_sql)) {
            echo "✓ Added foreign key constraint\n";
        } else {
            echo "✗ Failed to add foreign key: " . $conn->error . "\n";
        }
        
        // Add index on user_id
        $index_sql = "ALTER TABLE transactions ADD INDEX idx_user (user_id)";
        if ($conn->query($index_sql)) {
            echo "✓ Added index on user_id\n";
        } else {
            echo "✗ Failed to add index: " . $conn->error . "\n";
        }
    } else {
        echo "✗ Failed to add user_id column: " . $conn->error . "\n";
    }
}

echo "\nUpdated transactions table structure:\n";
$result = $conn->query("DESCRIBE transactions");
while ($row = $result->fetch_assoc()) {
    echo "- " . $row['Field'] . " (" . $row['Type'] . ")\n";
}

$conn->close();
?>
