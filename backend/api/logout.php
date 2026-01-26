<?php
// filepath: C:\xampp\htdocs\smart_budget\api\logout.php
require_once __DIR__ . '/../config.php';

http_response_code(200);
echo json_encode(['success' => true, 'message' => 'Logout successful']);
?>