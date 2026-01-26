<?php
require_once __DIR__ . '/../config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
  http_response_code(405);
  echo json_encode(['error' => 'Method not allowed']);
  exit;
}

if (!isset($_GET['id'])) {
  http_response_code(400);
  echo json_encode(['error' => 'Missing user id']);
  exit;
}

$id = intval($_GET['id']);
$stmt = $conn->prepare("SELECT id, name, email, created_at FROM users WHERE id = ?");
stmt->bind_param("i", $id);
$stmt->execute();
$res = $stmt->get_result();

if ($res->num_rows === 0) {
  http_response_code(404);
  echo json_encode(['error' => 'User not found']);
  exit;
}

$user = $res->fetch_assoc();
http_response_code(200);
echo json_encode(['user' => $user]);
$stmt->close();
?>
