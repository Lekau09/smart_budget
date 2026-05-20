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
$month = intval($input['month'] ?? date('n'));
$year = intval($input['year'] ?? date('Y'));
$category_budgets = $input['category_budgets'] ?? [];

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

if (!is_array($category_budgets)) {
  http_response_code(400);
  echo json_encode(['success' => false, 'error' => 'category_budgets must be an array']);
  exit;
}

$validated_category_budgets = [];
$total_allocated = 0;

foreach ($category_budgets as $category_budget) {
  $category_name = trim($category_budget['name'] ?? '');
  $allocated_amount = floatval($category_budget['allocated_amount'] ?? 0);

  if ($category_name === '') {
    continue;
  }

  if ($allocated_amount < 0) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => "Allocated amount cannot be negative for {$category_name}"]);
    exit;
  }

  $validated_category_budgets[] = [
    'name' => $category_name,
    'allocated_amount' => $allocated_amount
  ];
  $total_allocated += $allocated_amount;
}

if ($total_allocated > $monthly_budget + 0.00001) {
  http_response_code(400);
  echo json_encode(['success' => false, 'error' => 'Total category budgets cannot exceed the monthly budget']);
  exit;
}

try {
  $conn->begin_transaction();

  // Update or insert if missing
  $stmt = $conn->prepare("SELECT id FROM user_budgets WHERE user_id = ? AND month = ? AND year = ?");
  if (!$stmt) {
    throw new Exception("Prepare failed: " . $conn->error);
  }
  
  $stmt->bind_param("iii", $user_id, $month, $year);
  if (!$stmt->execute()) {
    throw new Exception("Execute failed: " . $stmt->error);
  }
  
  $res = $stmt->get_result();
  $stmt->close();
  
  if ($res->num_rows === 0) {
    $ins = $conn->prepare("INSERT INTO user_budgets (user_id, month, year, monthly_budget, total_spent, total_saved) VALUES (?, ?, ?, ?, 0, 0)");
    if (!$ins) {
      throw new Exception("Prepare insert failed: " . $conn->error);
    }
    $ins->bind_param("iiid", $user_id, $month, $year, $monthly_budget);
    if (!$ins->execute()) {
      throw new Exception("Insert failed: " . $ins->error);
    }
    $ins->close();
  } else {
    $stmt_up = $conn->prepare("UPDATE user_budgets SET monthly_budget = ? WHERE user_id = ? AND month = ? AND year = ?");
    if (!$stmt_up) {
      throw new Exception("Prepare update failed: " . $conn->error);
    }
    $stmt_up->bind_param("diii", $monthly_budget, $user_id, $month, $year);
    if (!$stmt_up->execute()) {
      throw new Exception("Update failed: " . $stmt_up->error);
    }
    $stmt_up->close();
  }

  $delete_categories = $conn->prepare("DELETE FROM budget_categories WHERE user_id = ? AND month = ? AND year = ?");
  if (!$delete_categories) {
    throw new Exception("Prepare delete categories failed: " . $conn->error);
  }
  $delete_categories->bind_param("iii", $user_id, $month, $year);
  if (!$delete_categories->execute()) {
    throw new Exception("Delete categories failed: " . $delete_categories->error);
  }
  $delete_categories->close();

  if (!empty($validated_category_budgets)) {
    $insert_category = $conn->prepare("INSERT INTO budget_categories (user_id, month, year, category_name, allocated_amount, spent_amount) VALUES (?, ?, ?, ?, ?, 0)");
    if (!$insert_category) {
      throw new Exception("Prepare insert category failed: " . $conn->error);
    }

    foreach ($validated_category_budgets as $category_budget) {
      $category_name = $category_budget['name'];
      $allocated_amount = $category_budget['allocated_amount'];
      $insert_category->bind_param("iiisd", $user_id, $month, $year, $category_name, $allocated_amount);
      if (!$insert_category->execute()) {
        throw new Exception("Insert category budget failed: " . $insert_category->error);
      }
    }

    $insert_category->close();
  }

  $conn->commit();

  // Return the updated budget row
  $stmt2 = $conn->prepare("SELECT id, user_id, monthly_budget, total_spent, total_saved FROM user_budgets WHERE user_id = ? AND month = ? AND year = ?");
  if (!$stmt2) {
    throw new Exception("Prepare select failed: " . $conn->error);
  }
  
  $stmt2->bind_param("iii", $user_id, $month, $year);
  if (!$stmt2->execute()) {
    throw new Exception("Select failed: " . $stmt2->error);
  }
  
  $res2 = $stmt2->get_result();
  $stmt2->close();
  
  if ($res2 && $res2->num_rows) {
    $budget = $res2->fetch_assoc();
    
    // Recalculate total_spent from actual expenses for the specific month/year
    $start_date = "$year-" . str_pad($month, 2, "0", STR_PAD_LEFT) . "-01";
    $end_date = date('Y-m-t', strtotime($start_date));
    $stmt_calc = $conn->prepare("SELECT COALESCE(SUM(amount), 0) as calculated_spent FROM expenses WHERE user_id = ? AND DATE(date) BETWEEN ? AND ?");
    $stmt_calc->bind_param("iss", $user_id, $start_date, $end_date);
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
    $budget['category_budgets'] = $validated_category_budgets;
    
    echo json_encode(['success' => true, 'budget' => $budget]);
  } else {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Failed to read updated budget']);
  }
  
} catch (Exception $e) {
  if ($conn->errno === 0 || $conn->connect_errno === 0) {
    try {
      $conn->rollback();
    } catch (Throwable $rollbackError) {
    }
  }
  http_response_code(500);
  echo json_encode(['success' => false, 'error' => $e->getMessage()]);
} finally {
  $conn->close();
}
?>
