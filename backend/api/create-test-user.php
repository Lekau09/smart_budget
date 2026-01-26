<?php
// Quick test user creation endpoint
// POST to: http://localhost/smart_budget/api/create-test-user.php
// Body: {"email": "test@example.com", "password": "test123", "name": "Test User"}

header('Content-Type: application/json');
require_once __DIR__ . '/../config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Only POST allowed']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);

if (!$input || !isset($input['email']) || !isset($input['password']) || !isset($input['name'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing email, password, or name']);
    exit;
}

$name = trim($input['name']);
$email = trim($input['email']);
$password = password_hash($input['password'], PASSWORD_BCRYPT);

$stmt = $conn->prepare("INSERT INTO users (name, email, password) VALUES (?, ?, ?)");
if (!$stmt) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $conn->error]);
    exit;
}

$stmt->bind_param("sss", $name, $email, $password);
if (!$stmt->execute()) {
    http_response_code(400);
    echo json_encode(['error' => 'User already exists or database error: ' . $stmt->error]);
    $stmt->close();
    exit;
}

$user_id = $conn->insert_id;

// Create default budget
$budget_stmt = $conn->prepare("INSERT INTO budgets (user_id, monthly_budget) VALUES (?, 5000)");
$budget_stmt->bind_param("i", $user_id);
$budget_stmt->execute();
$budget_stmt->close();

$stmt->close();

http_response_code(201);
echo json_encode([
    'success' => true,
    'message' => 'Test user created successfully',
    'user_id' => $user_id,
    'email' => $email,
    'password_provided' => $input['password']
]);
$conn->close();
?>
