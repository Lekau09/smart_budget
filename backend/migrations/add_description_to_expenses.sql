-- Migration: Add description column to expenses table if it doesn't exist
-- This ensures the table has all required columns for transaction editing

ALTER TABLE expenses 
ADD COLUMN IF NOT EXISTS description VARCHAR(255) DEFAULT NULL AFTER user_id;

-- Verify the column was added
SHOW COLUMNS FROM expenses;
