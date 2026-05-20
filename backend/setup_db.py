#!/usr/bin/env python3
"""Setup database schema and create test user"""

from sqlalchemy import create_engine, text

engine = create_engine('mysql+pymysql://root:@localhost/smart_budget')

print("\n📊 Setting up SmartSpend Database Schema")
print("=" * 60)

# Read and execute schema
with open('backend/schema.sql', 'r') as f:
    sql_content = f.read()

# Split by semicolon and execute each statement
statements = [s.strip() for s in sql_content.split(';') if s.strip()]

with engine.begin() as connection:
    for statement in statements:
        try:
            connection.execute(text(statement))
        except Exception as e:
            if 'already exists' not in str(e):
                print(f'⚠️  {e}')
    
    # Ensure test user exists
    check_user = connection.execute(text('SELECT COUNT(*) FROM users WHERE id=1'))
    if check_user.fetchone()[0] == 0:
        connection.execute(text('INSERT INTO users (id, name, email, password, phone_number, ingest_secret) VALUES (1, "Admin User", "admin@smartspend.test", "hashed_password", "+1234567890", "test_ingest_secret_1234567890")'))
        print('✅ Created test user (ID: 1) - Admin User')
    else:
        print('✅ Test user already exists (ID: 1)')

print("✅ Database schema updated successfully!")
print("=" * 60)
print("\n📋 Tables Created:")
print("   • users")
print("   • user_budgets")
print("   • expenses")
print("   • savings_goals")
print("   • budget_categories")
print("   • sms_raw_ingest")
print("   • sms_transactions")
print("   • transactions (NEW - linked to users)")
print("\n✨ Ready to extract and process SMS transactions!")
