<?php
$conn = new mysqli('localhost', 'root', '', 'smart_budget');

// Check if phone_number column exists
$show_columns = "SHOW COLUMNS FROM users";
$result = $conn->query($show_columns);

echo "Users table columns:\n";
while ($row = $result->fetch_assoc()) {
    echo "  - " . $row['Field'] . " (" . $row['Type'] . ")\n";
}

echo "\nTest user data:\n";
$result = $conn->query("SELECT id, name, email, phone_number FROM users WHERE email = 'testuser+1771440497@example.com'");
if ($result->num_rows > 0) {
    $user = $result->fetch_assoc();
    print_r($user);
} else {
    echo "User not found\n";
}

// Check a few users to see what's in the table
echo "\nAll users (limited):\n";
$result = $conn->query("SELECT id, name, email, phone_number FROM users LIMIT 5");
while ($row = $result->fetch_assoc()) {
    print_r($row);
}
?>
