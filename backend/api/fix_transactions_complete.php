<?php
require_once __DIR__ . '/../config.php';

// Add missing sms_raw_id column
$result = $conn->query("SHOW COLUMNS FROM transactions WHERE Field = 'sms_raw_id'");
if ($result->num_rows === 0) {
    echo "Adding sms_raw_id column...\n";
    $sql = "ALTER TABLE transactions ADD COLUMN sms_raw_id INT AFTER user_id";
    if ($conn->query($sql)) {
        echo "✓ Added sms_raw_id column\n";
        
        // Add foreign key for sms_raw_id
        $fk_sql = "ALTER TABLE transactions ADD FOREIGN KEY (sms_raw_id) REFERENCES sms_raw_ingest(id) ON DELETE SET NULL";
        if ($conn->query($fk_sql)) {
            echo "✓ Added foreign key for sms_raw_id\n";
        } else {
            echo "✗ Failed to add foreign key for sms_raw_id: " . $conn->error . "\n";
        }
    } else {
        echo "✗ Failed to add sms_raw_id column: " . $conn->error . "\n";
    }
} else {
    echo "✓ sms_raw_id column already exists\n";
}

// Add missing updated_at column
$result = $conn->query("SHOW COLUMNS FROM transactions WHERE Field = 'updated_at'");
if ($result->num_rows === 0) {
    echo "Adding updated_at column...\n";
    $sql = "ALTER TABLE transactions ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER created_at";
    if ($conn->query($sql)) {
        echo "✓ Added updated_at column\n";
    } else {
        echo "✗ Failed to add updated_at column: " . $conn->error . "\n";
    }
} else {
    echo "✓ updated_at column already exists\n";
}

echo "\n✓ Database schema update complete!\n";
echo "\nFinal transactions table structure:\n";
$result = $conn->query("DESCRIBE transactions");
while ($row = $result->fetch_assoc()) {
    echo "- " . $row['Field'] . " (" . $row['Type'] . ")" . ($row['Null'] === 'NO' ? ' NOT NULL' : ' NULL') . "\n";
}

$conn->close();
?>
