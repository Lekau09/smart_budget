#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Diagnostic Script: Investigate SMS with user_id=42
================================================================================
Find out:
1. What users exist in the database
2. What SMS messages have user_id=42
3. How user_id=42 ended up in sms_raw_ingest if user doesn't exist
"""

import sys
import os
from sqlalchemy import create_engine, text

# Force UTF-8 encoding
if sys.stdout.encoding != 'utf-8':
    if hasattr(sys.stdout, 'reconfigure'):
        sys.stdout.reconfigure(encoding='utf-8')

try:
    from database_config import get_db_config, build_connection_string
except ImportError:
    print("❌ database_config.py not found!", flush=True)
    sys.exit(1)

# Connect to database
db_config = get_db_config()
DB_URL = build_connection_string()

print(f"\n{'='*70}", flush=True)
print(f"🔍 INVESTIGATION: Orphaned SMS with user_id=42", flush=True)
print(f"{'='*70}\n", flush=True)

try:
    engine = create_engine(DB_URL, pool_pre_ping=True)
    with engine.connect() as conn:
        # 1. List all users in database
        print("1️⃣ USERS IN DATABASE", flush=True)
        print("-" * 70, flush=True)
        query = "SELECT id, name, email, phone_number FROM users ORDER BY id"
        result = conn.execute(text(query))
        rows = result.fetchall()
        
        user_ids = []
        if rows:
            print(f"{'ID':<5} {'Name':<25} {'Email':<30} {'Phone':<15}", flush=True)
            print("-" * 70, flush=True)
            for row in rows:
                user_id, name, email, phone = row
                user_ids.append(user_id)
                print(f"{user_id:<5} {str(name)[:24]:<25} {str(email)[:29]:<30} {str(phone or 'None'):<15}", flush=True)
            print(f"\n✓ Total {len(rows)} users found", flush=True)
            print(f"✓ User IDs in database: {sorted(user_ids)}", flush=True)
        else:
            print("❌ No users found in database!", flush=True)
        
        # 2. Check for user_id=42
        print(f"\n2️⃣ USER ID 42 STATUS", flush=True)
        print("-" * 70, flush=True)
        if 42 in user_ids:
            print("✓ User ID 42 EXISTS in users table", flush=True)
        else:
            print("❌ User ID 42 DOES NOT EXIST in users table", flush=True)
            print(f"⚠️  This is the problem! SMS exist with user_id=42 but user doesn't exist", flush=True)
        
        # 3. Find SMS with user_id=42
        print(f"\n3️⃣ SMS MESSAGES WITH user_id=42", flush=True)
        print("-" * 70, flush=True)
        query = "SELECT id, sms_from, sms_text, received_stamp, sim_slot, is_duplicate FROM sms_raw_ingest WHERE user_id = 42 ORDER BY received_stamp"
        result = conn.execute(text(query))
        rows = result.fetchall()
        
        if rows:
            print(f"Found {len(rows)} SMS messages with user_id=42:\n", flush=True)
            for i, row in enumerate(rows, 1):
                sms_id, sms_from, sms_text, received_stamp, sim_slot, is_duplicate = row
                print(f"[{i}] SMS ID: {sms_id}", flush=True)
                print(f"    From: {sms_from}", flush=True)
                print(f"    Text: {sms_text[:100]}{'...' if len(sms_text) > 100 else ''}", flush=True)
                print(f"    Received: {received_stamp} (is_duplicate={is_duplicate})", flush=True)
                print(f"    SIM: {sim_slot}\n", flush=True)
        else:
            print("ℹ️  No SMS found with user_id=42", flush=True)
        
        # 4. How did user_id=42 get into sms_raw_ingest?
        print(f"\n4️⃣ ROOT CAUSE ANALYSIS", flush=True)
        print("-" * 70, flush=True)
        
        query = "SELECT DISTINCT user_id FROM sms_raw_ingest ORDER BY user_id"
        result = conn.execute(text(query))
        rows = result.fetchall()
        sms_user_ids = [r[0] for r in rows]
        
        print(f"All user_ids in sms_raw_ingest: {sorted(sms_user_ids)}", flush=True)
        
        orphaned_users = set(sms_user_ids) - set(user_ids)
        if orphaned_users:
            print(f"\n⚠️  ORPHANED USER IDS (SMS exist but user doesn't): {sorted(orphaned_users)}", flush=True)
            for uid in sorted(orphaned_users):
                query = "SELECT COUNT(*) as cnt FROM sms_raw_ingest WHERE user_id = ?"
                result = conn.execute(text(query), [uid])
                count = result.scalar()
                print(f"   - User ID {uid}: {count} orphaned SMS message(s)", flush=True)
        else:
            print("✓ All user_ids in SMS have corresponding users in database", flush=True)
        
        # 5. How sms-ingest.php assigns user_id
        print(f"\n5️⃣ HOW SMS GET ASSIGNED user_id (via sms-ingest.php)", flush=True)
        print("-" * 70, flush=True)
        print("Process in sms-ingest.php:", flush=True)
        print("  1. Receives phone_number from URL parameter", flush=True)
        print("  2. Looks up user: SELECT id FROM users WHERE phone_number = ?", flush=True)
        print("  3. Gets user_id from that lookup", flush=True)
        print("  4. Inserts SMS with that user_id", flush=True)
        print("\nPossible causes of user_id=42 orphans:", flush=True)
        print("  - Direct SQL INSERT to sms_raw_ingest bypassing sms-ingest.php", flush=True)
        print("  - Manual database edits or test data insertion", flush=True)
        print("  - User was deleted AFTER SMS were ingested (orphaning them)", flush=True)
        
        # Check if phone_number=42 exists
        print(f"\n6️⃣ CHECKING FOR CLUES", flush=True)
        print("-" * 70, flush=True)
        query = "SELECT id, phone_number FROM users WHERE phone_number LIKE '%42%' OR phone_number = '42'"
        result = conn.execute(text(query))
        rows = result.fetchall()
        if rows:
            print("Found user(s) with '42' in phone_number:", flush=True)
            for row in rows:
                print(f"  - User ID {row[0]}: {row[1]}", flush=True)
        else:
            print("No users with '42' in phone_number", flush=True)
        
        # Summary
        print(f"\n{'='*70}", flush=True)
        print("📋 SUMMARY", flush=True)
        print(f"{'='*70}", flush=True)
        print(f"Total users in database: {len(user_ids)}", flush=True)
        print(f"User IDs present: {sorted(user_ids)}", flush=True)
        print(f"User ID 42 exists: {42 in user_ids}", flush=True)
        print(f"Orphaned user IDs: {sorted(orphaned_users) if orphaned_users else 'None'}", flush=True)
        print(f"SMS with user_id=42: {len(rows)}", flush=True)
        print(f"\n{'='*70}\n", flush=True)

except Exception as e:
    print(f"❌ Error: {str(e)}", flush=True)
    import traceback
    traceback.print_exc()
    sys.exit(1)
