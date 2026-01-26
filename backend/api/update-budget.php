<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  http_response_code(200);
  exit;
}

require_once __DIR__ . '/../config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  http_response_code(405);
  echo json_encode(['success' => false, 'error' => 'Method not allowed']);
  exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$user_id = intval($input['user_id'] ?? 0);
$monthly_budget = floatval($input['monthly_budget'] ?? 0);

if (!$user_id) {
  http_response_code(400);
  echo json_encode(['success' => false, 'error' => 'Missing user_id']);
  exit;
}

if ($monthly_budget < 0) {
  http_response_code(400);
  echo json_encode(['success' => false, 'error' => 'Budget amount cannot be negative']);
  exit;
}

try {
  // Update or insert if missing
  $stmt = $conn->prepare("SELECT id FROM user_budgets WHERE user_id = ?");
  if (!$stmt) {
    throw new Exception("Prepare failed: " . $conn->error);
  }
  
  $stmt->bind_param("i", $user_id);
  if (!$stmt->execute()) {
    throw new Exception("Execute failed: " . $stmt->error);
  }
  
  $res = $stmt->get_result();
  $stmt->close();
  
  if ($res->num_rows === 0) {
    $ins = $conn->prepare("INSERT INTO user_budgets (user_id, monthly_budget, total_spent, total_saved) VALUES (?, ?, 0, 0)");
    if (!$ins) {
      throw new Exception("Prepare insert failed: " . $conn->error);
    }
    $ins->bind_param("id", $user_id, $monthly_budget);
    if (!$ins->execute()) {
      throw new Exception("Insert failed: " . $ins->error);
    }
    $ins->close();
  } else {
    $stmt_up = $conn->prepare("UPDATE user_budgets SET monthly_budget = ? WHERE user_id = ?");
    if (!$stmt_up) {
      throw new Exception("Prepare update failed: " . $conn->error);
    }
    $stmt_up->bind_param("di", $monthly_budget, $user_id);
    if (!$stmt_up->execute()) {
      throw new Exception("Update failed: " . $stmt_up->error);
    }
    $stmt_up->close();
  }

  // Return the updated budget row
  $stmt2 = $conn->prepare("SELECT id, user_id, monthly_budget, total_spent, total_saved FROM user_budgets WHERE user_id = ?");
  if (!$stmt2) {
    throw new Exception("Prepare select failed: " . $conn->error);
  }
  
  $stmt2->bind_param("i", $user_id);
  if (!$stmt2->execute()) {
    throw new Exception("Select failed: " . $stmt2->error);
  }
  
  $res2 = $stmt2->get_result();
  $stmt2->close();
  
  if ($res2 && $res2->num_rows) {
    $budget = $res2->fetch_assoc();
    
    // Recalculate total_spent from actual expenses for accuracy
    $stmt_calc = $conn->prepare("SELECT COALESCE(SUM(amount), 0) as calculated_spent FROM expenses WHERE user_id = ?");
    $stmt_calc->bind_param("i", $user_id);
    $stmt_calc->execute();
    $spent_result = $stmt_calc->get_result();
    $spent_row = $spent_result->fetch_assoc();
    $budget['total_spent'] = floatval($spent_row['calculated_spent']);
    $stmt_calc->close();
    
    // Convert budget values to numbers
    $budget['id'] = intval($budget['id']);
    $budget['monthly_budget'] = floatval($budget['monthly_budget']);
    $budget['total_spent'] = floatval($budget['total_spent']);
    $budget['total_saved'] = floatval($budget['total_saved']);
    
    echo json_encode(['success' => true, 'budget' => $budget]);
  } else {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Failed to read updated budget']);
  }
  
} catch (Exception $e) {
  http_response_code(500);
  echo json_encode(['success' => false, 'error' => $e->getMessage()]);
} finally {
  $conn->close();
}
?>