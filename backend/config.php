<?php
// Basic CORS & JSON headers - Allow all origins for maximum compatibility
// The individual API files (login.php, signup.php, etc.) have their own CORS headers with *
header('Access-Control-Allow-Origin: *');
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  http_response_code(200);
  exit;
}

// Database credentials - change if you set a password for root
$host = 'localhost';
$db   = 'smart_budget';
$user = 'root';
$pass = ''; // standalone MySQL password

$conn = new mysqli($host, $user, $pass, $db);
if ($conn->connect_error) {
  http_response_code(500);
  echo json_encode(['error' => 'Database connection failed: ' . $conn->connect_error]);
  exit;
}
$conn->set_charset("utf8mb4");
