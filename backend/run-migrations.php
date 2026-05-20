<?php
// Migration runner - Execute pending migrations
// This file can be called from the app to ensure database is up to date

require_once __DIR__ . '/../config.php';

// Define migrations
$migrations = [
  'add_description_to_expenses' => "
    ALTER TABLE expenses 
    ADD COLUMN IF NOT EXISTS description VARCHAR(255) DEFAULT NULL AFTER user_id
  "
];

try {
  foreach ($migrations as $name => $sql) {
    echo "Running migration: $name\n";
    if ($conn->query($sql) === TRUE) {
      echo "✓ Migration '$name' completed successfully\n";
    } else {
      echo "✗ Migration '$name' failed: " . $conn->error . "\n";
    }
  }
  
  // Verify expenses table structure
  $result = $conn->query("DESCRIBE expenses");
  echo "\n=== Current expenses table structure ===\n";
  while($row = $result->fetch_assoc()) {
    echo $row['Field'] . " (" . $row['Type'] . ")\n";
  }
  
  echo "\n✓ Database migration check complete!\n";
  
} catch (Exception $e) {
  echo "Migration error: " . $e->getMessage();
} finally {
  $conn->close();
}
?>
