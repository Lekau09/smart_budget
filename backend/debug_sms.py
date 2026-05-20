#!/usr/bin/env python
# Debug version to identify where script hangs

import sys
print("0️⃣ Script started", flush=True)

print("1️⃣ Importing os...", flush=True)
import os
print("   ✓ os imported", flush=True)

print("2️⃣ Importing logging...", flush=True)
import logging
print("   ✓ logging imported", flush=True)

print("3️⃣ Importing re...", flush=True)
import re
print("   ✓ re imported", flush=True)

print("4️⃣ Importing pandas...", flush=True)
import pandas as pd
print("   ✓ pandas imported", flush=True)

print("5️⃣ Importing sqlalchemy...", flush=True)
from sqlalchemy import create_engine, text
print("   ✓ sqlalchemy imported", flush=True)

print("6️⃣ Importing database_config...", flush=True)
from database_config import get_db_config, build_connection_string
print("   ✓ database_config imported", flush=True)

print("7️⃣ Setting up logging...", flush=True)
logging.basicConfig(
    filename="sms_system.log",
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s"
)
print("   ✓ logging configured", flush=True)

print("8️⃣ Getting database config...", flush=True)
db_config = get_db_config()
print(f"   Config type: {db_config['type']}", flush=True)

print("9️⃣ Building connection string...", flush=True)
DB_URL = build_connection_string()
print(f"   URL built (host: {db_config['host']}:{db_config['port']})", flush=True)

print("🔟 Creating SQLAlchemy engine...", flush=True)
engine = create_engine(DB_URL)
print("   ✓ Engine created", flush=True)

print("1️⃣1️⃣ Testing database connection...", flush=True)
try:
    with engine.connect() as conn:
        print("   ✓ Connection successful!", flush=True)
except Exception as e:
    print(f"   ❌ Connection failed: {e}", flush=True)
    sys.exit(1)

print("\n✅ All imports and connections successful!")
print("Script is ready to process SMS data...")
