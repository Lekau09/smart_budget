<?php
/**
 * NotificationManager - Centralized notification creation and management
 * 
 * Usage:
 * NotificationManager::create($conn, $userId, [
 *     'type' => 'expense',
 *     'title' => 'Expense Added',
 *     'message' => 'You spent ₦5,000 on groceries',
 *     'action_url' => '/expenses',
 *     'reference_id' => 123,
 *     'reference_type' => 'expense'
 * ]);
 */

class NotificationManager {
    
    /**
     * Create a notification
     */
    public static function create($conn, $userId, $data) {
        $type = $data['type'] ?? 'system';
        $title = $data['title'] ?? '';
        $message = $data['message'] ?? '';
        $actionUrl = $data['action_url'] ?? null;
        $referenceId = $data['reference_id'] ?? null;
        $referenceType = $data['reference_type'] ?? null;
        
        if (!$userId || !$title || !$message) {
            return false;
        }
        
        try {
            $stmt = $conn->prepare("
                INSERT INTO notifications (user_id, type, title, message, action_url, reference_id, reference_type, is_read)
                VALUES (?, ?, ?, ?, ?, ?, ?, 0)
            ");
            
            $stmt->bind_param(
                'issssss',
                $userId,
                $type,
                $title,
                $message,
                $actionUrl,
                $referenceId,
                $referenceType
            );
            
            $result = $stmt->execute();
            $stmt->close();
            
            return $result;
        } catch (Exception $e) {
            error_log('NotificationManager::create failed: ' . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Mark notification as read
     */
    public static function markAsRead($conn, $notificationId, $userId) {
        try {
            $stmt = $conn->prepare("
                UPDATE notifications 
                SET is_read = 1, read_at = NOW()
                WHERE id = ? AND user_id = ?
            ");
            
            $stmt->bind_param('ii', $notificationId, $userId);
            $result = $stmt->execute();
            $stmt->close();
            
            return $result;
        } catch (Exception $e) {
            error_log('NotificationManager::markAsRead failed: ' . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Mark all notifications as read
     */
    public static function markAllAsRead($conn, $userId) {
        try {
            $stmt = $conn->prepare("
                UPDATE notifications 
                SET is_read = 1, read_at = NOW()
                WHERE user_id = ? AND is_read = 0
            ");
            
            $stmt->bind_param('i', $userId);
            $result = $stmt->execute();
            $stmt->close();
            
            return $result;
        } catch (Exception $e) {
            error_log('NotificationManager::markAllAsRead failed: ' . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Get unread count
     */
    public static function getUnreadCount($conn, $userId) {
        try {
            $stmt = $conn->prepare("
                SELECT COUNT(*) as count FROM notifications
                WHERE user_id = ? AND is_read = 0
            ");
            
            $stmt->bind_param('i', $userId);
            $stmt->execute();
            $result = $stmt->get_result();
            $row = $result->fetch_assoc();
            $stmt->close();
            
            return $row['count'] ?? 0;
        } catch (Exception $e) {
            error_log('NotificationManager::getUnreadCount failed: ' . $e->getMessage());
            return 0;
        }
    }
    
    /**
     * Delete old notifications (keep last 100)
     */
    public static function cleanup($conn, $userId) {
        try {
            // Keep only the 100 most recent notifications
            $stmt = $conn->prepare("
                DELETE FROM notifications
                WHERE user_id = ? AND id NOT IN (
                    SELECT id FROM (
                        SELECT id FROM notifications
                        WHERE user_id = ?
                        ORDER BY created_at DESC
                        LIMIT 100
                    ) AS recent
                )
            ");
            
            $stmt->bind_param('ii', $userId, $userId);
            $stmt->execute();
            $stmt->close();
            
            return true;
        } catch (Exception $e) {
            error_log('NotificationManager::cleanup failed: ' . $e->getMessage());
            return false;
        }
    }
}

?>
