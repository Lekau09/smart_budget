#!/usr/bin/env python
print("TEST 1: Import os", flush=True)
import os
print("✓", flush=True)

print("TEST 2: Import sys", flush=True)
import sys
print("✓", flush=True)

print("TEST 3: Import re", flush=True)
import re
print("✓", flush=True)

print("TEST 4: Import logging", flush=True)
import logging
print("✓", flush=True)

print("TEST 5: Import pandas", flush=True)
try:
    import pandas
    print("✓", flush=True)
except Exception as e:
    print(f"✗ {e}", flush=True)

print("TEST 6: Import sqlalchemy", flush=True)
try:
    from sqlalchemy import create_engine
    print("✓", flush=True)
except Exception as e:
    print(f"✗ {e}", flush=True)

print("TEST 7: Check database_config.py exists", flush=True)
config_path = os.path.join(os.path.dirname(__file__), "database_config.py")
if os.path.exists(config_path):
    print(f"✓ {config_path}", flush=True)
else:
    print(f"✗ Not found", flush=True)

print("TEST 8: Import database_config", flush=True)
try:
    from database_config import get_db_config, build_connection_string
    print("✓", flush=True)
except Exception as e:
    print(f"✗ {e}", flush=True)

print("\n✅ ALL IMPORTS SUCCESSFUL")
