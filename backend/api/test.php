<?php
// filepath: C:\xampp\htdocs\smart_budget\api\test.php
require_once __DIR__ . '/../config.php';

http_response_code(200);
echo json_encode([
  'success' => true,
  'message' => 'Backend is working!',
  'method' => $_SERVER['REQUEST_METHOD'],
  'timestamp' => date('Y-m-d H:i:s'),
  'database' => 'Connected'
]);
?>