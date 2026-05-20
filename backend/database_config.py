# Database Configuration for SMS Financial System
# ================================================
# Reads from backend/.env — set DB_PASS= (blank) for XAMPP default, or fill in your password.

import os
from dotenv import load_dotenv

# Load backend/.env relative to this file's location
load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

def get_db_config():
    return {
        "host":     os.getenv("DB_HOST", "localhost"),
        "port":     int(os.getenv("DB_PORT", "3306")),
        "username": os.getenv("DB_USER", "root"),
        "password": os.getenv("DB_PASS", ""),
        "database": os.getenv("DB_NAME", "smart_budget"),
    }

def get_backend_url():
    return os.getenv("BACKEND_URL", "http://localhost/smart_budget/backend/api")

def build_connection_string():
    c = get_db_config()
    auth = f"{c['username']}:{c['password']}" if c['password'] else c['username']
    return f"mysql+pymysql://{auth}@{c['host']}:{c['port']}/{c['database']}"
