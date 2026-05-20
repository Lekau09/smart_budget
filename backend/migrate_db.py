import pymysql
from database_config import get_db_config

def migrate():
    config = get_db_config()
    print(f"Connecting to {config['host']}:{config['port']} / {config['database']}...")
    
    try:
        conn = pymysql.connect(
            host=config['host'],
            user=config['username'],
            password=config['password'],
            database=config['database'],
            port=config['port']
        )
        cursor = conn.cursor()
        
        print("1. Syncing 'expenses' table...")
        # Check if columns exist
        cursor.execute("SHOW COLUMNS FROM expenses")
        columns = [col[0] for col in cursor.fetchall()]
        
        if 'transaction_type' not in columns:
            print("  + Adding 'transaction_type' to expenses")
            cursor.execute("ALTER TABLE expenses ADD COLUMN transaction_type VARCHAR(50) DEFAULT NULL AFTER date")
            
        if 'raw_sms' not in columns:
            print("  + Adding 'raw_sms' to expenses")
            cursor.execute("ALTER TABLE expenses ADD COLUMN raw_sms LONGTEXT DEFAULT NULL AFTER transaction_type")

        print("2. Syncing 'notifications' table...")
        # Update ENUM type
        # We need to redefine the column to add 'withdrawal', 'review', and 'warning'
        cursor.execute("ALTER TABLE notifications MODIFY COLUMN type ENUM('sms','expense','income','budget','savings','system','withdrawal','review','warning') NOT NULL")
        print("  + Updated notification 'type' ENUM")

        print("3. Syncing 'user_budgets' table...")
        # Check if we need to rename columns or just add compatibility aliases
        cursor.execute("SHOW COLUMNS FROM user_budgets")
        budget_cols = [col[0] for col in cursor.fetchall()]
        
        if 'month' in budget_cols and 'budget_month' not in budget_cols:
            # We'll stick to 'month' and 'year' in the DB but fix the PHP code to use those
            # Alternatively, we can add aliases, but renaming is cleaner. 
            # For now, I'll just change the PHP code as planned.
            print("  - Schema uses 'month'/'year'. PHP will be updated to match.")

        print("4. Updating schema version...")
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS schema_version (
                version INT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                description TEXT,
                applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        cursor.execute("REPLACE INTO schema_version (version, name, description, applied_at) VALUES (3, 'Sync Fix', 'Syncing PHP and DB schema for transaction saving', NOW())")

        conn.commit()
        print("\nSUCCESS: Migration successful!")
        
    except Exception as e:
        print(f"\nFAILURE: Migration failed: {e}")
    finally:
        if 'conn' in locals():
            conn.close()

if __name__ == "__main__":
    migrate()
