#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""Minimal SMS extractor - no heavy imports at start"""

import os
import sys

# Immediate output
print("✅ Script started", flush=True)

import logging
print("✅ logging imported", flush=True)

import re
print("✅ re imported", flush=True)

# NOW try to import database config
try:
    from database_config import get_db_config, build_connection_string
    print("✅ database_config imported", flush=True)
except ImportError as e:
    print(f"❌ Cannot import database_config: {e}", flush=True)
    sys.exit(1)

# Get config
db_config = get_db_config()
print(f"\n📊 SMS Financial Data Extraction System", flush=True)
print(f"=" * 50, flush=True)
print(f"🔗 Connection Type: {db_config['type']}", flush=True)
print(f"   Host: {db_config['host']}:{db_config['port']}", flush=True)
print(f"   Database: {db_config['database']}", flush=True)
print(f"=" * 50 + "\n", flush=True)

# Setup logging
logging.basicConfig(
    filename="sms_system.log",
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s"
)

# Defer SQLAlchemy import to avoid Windows hanging issues
engine = None

# PARSING FUNCTIONS
def extract_mpesa_data(text, log_date, log_time, sender, sim):
    """Parse MPESA format"""
    data = {
        "log_date": log_date, "log_time": log_time, "sender": sender, "sim": sim,
        "trans_date": log_date, "trans_time": log_time, "transaction_type": "Withdrawal",
        "total_amount": 0.0, "recipient_source": "ATM/Merchant", "reference": "UNKNOWN"
    }
    
    tid_match = re.search(r"Transact ID\s+([A-Z0-9]+)", text)
    if tid_match:
        data["reference"] = tid_match.group(1)
    
    amt_match = re.search(r"(Withdraw|Transfer|Deposit)\s+(?:ZAR|LSL|ZWL|USD|SZL|M|R|\$|£|E)\s*([\d,]+\.?\d*)", text, re.IGNORECASE)
    if amt_match:
        try:
            data["total_amount"] = float(amt_match.group(2).replace(",", ""))
        except:
            pass
        trans_type = amt_match.group(1).lower()
        if "withdraw" in trans_type:
            data["transaction_type"] = "Withdrawal"
        elif "transfer" in trans_type:
            data["transaction_type"] = "Transfer"
    
    return data

def extract_ecocash_data(text, log_date, log_time, sender, sim):
    """Parse ECOCASH format"""
    data = {
        "log_date": log_date, "log_time": log_time, "sender": sender, "sim": sim,
        "trans_date": log_date, "trans_time": log_time, "transaction_type": "Cash Out",
        "total_amount": 0.0, "recipient_source": "Ecocash Agent", "reference": "UNKNOWN"
    }
    
    amt_match = re.search(r"(?:ZAR|LSL|ZWL|USD|SZL|M|R|\$|£|E)\s*([\d,]+\.?\d*)", text, re.IGNORECASE)
    if amt_match:
        try:
            data["total_amount"] = float(amt_match.group(1).replace(",", ""))
        except:
            pass
    
    code_match = re.search(r"Approval Code\s*:?\s*([A-Z0-9.]+)", text)
    if code_match:
        data["reference"] = code_match.group(1).strip()
    
    return data

def parse_sms_text(sms):
    """Extract transaction data from SMS"""
    from datetime import datetime
    
    meta_match = re.match(
        r"\[(\d{4}-\d{2}-\d{2})\s(\d{2}:\d{2}:\d{2})\]\s+From:\s+(.+?)\s+\|\s+Text:\s+(.+?)\s+\|\s+Sent:\s+(.+?)\s+\|\s+Received:\s+(.+?)\s+\|\s+SIM:\s+(.+)$",
        sms
    )
    
    if meta_match:
        log_date, log_time, sender, text, sent_ts, recv_ts, sim = meta_match.groups()
    else:
        now = datetime.now()
        log_date = now.strftime("%Y-%m-%d")
        log_time = now.strftime("%H:%M:%S")
        sender = "Unknown"
        sim = "Unknown"
        text = sms
    
    text_lower = text.lower()
    
    if "transact id" in text_lower or "mpesa" in text_lower:
        return extract_mpesa_data(text, log_date, log_time, sender, sim)
    elif "ecocash" in text_lower:
        return extract_ecocash_data(text, log_date, log_time, sender, sim)
    else:
        return {
            "log_date": log_date, "log_time": log_time, "sender": sender, "sim": sim,
            "trans_date": log_date, "trans_time": log_time, "transaction_type": "Other",
            "total_amount": 0.0, "recipient_source": "Unknown", "reference": "UNKNOWN"
        }

def save_transaction_to_db(data):
    """Save to database"""
    global engine
    
    try:
        # Lazy-load SQLAlchemy on first use
        if engine is None:
            print("Initializing database...", flush=True)
            from sqlalchemy import create_engine, text
            DB_URL = build_connection_string()
            engine = create_engine(DB_URL, pool_pre_ping=True)
            print("✅ Database connected", flush=True)
        
        from sqlalchemy import text
        with engine.begin() as connection:
            insert_sql = """
            INSERT INTO transactions 
            (log_date, log_time, sender, sim, trans_date, trans_time, transaction_type, total_amount, recipient_source, reference)
            VALUES 
            (:log_date, :log_time, :sender, :sim, :trans_date, :trans_time, :transaction_type, :total_amount, :recipient_source, :reference)
            """
            connection.execute(text(insert_sql), {
                "log_date": data.get("log_date"),
                "log_time": data.get("log_time"),
                "sender": data.get("sender"),
                "sim": data.get("sim"),
                "trans_date": data.get("trans_date"),
                "trans_time": data.get("trans_time"),
                "transaction_type": data.get("transaction_type"),
                "total_amount": data.get("total_amount"),
                "recipient_source": data.get("recipient_source"),
                "reference": data.get("reference")
            })
        return True
    except Exception as e:
        logging.error(f"DB error: {str(e)}")
        return False

# PROCESS FILE
if __name__ == "__main__":
    script_dir = os.path.dirname(os.path.abspath(__file__))
    
    if len(sys.argv) > 1:
        test_file = sys.argv[1]
        if not os.path.isabs(test_file):
            test_file = os.path.join(script_dir, test_file)
    else:
        test_file = os.path.join(script_dir, "sms_log.txt")
    
    if not os.path.exists(test_file):
        print(f"❌ File not found: {test_file}", flush=True)
        sys.exit(1)
    
    print(f"📂 Processing: {test_file}", flush=True)
    count = 0
    saved = 0
    
    try:
        with open(test_file, 'r', encoding='utf-8') as f:
            for line in f:
                sms = line.strip()
                if sms:
                    data = parse_sms_text(sms)
                    result = save_transaction_to_db(data)
                    count += 1
                    if result:
                        saved += 1
                        print(f"   ✅ {data['transaction_type']:12} | {data['reference']:20} | M{data['total_amount']}", flush=True)
                    else:
                        print(f"   ⚠️  {data['transaction_type']:12} | {data['reference']:20} | M{data['total_amount']} (DB error)", flush=True)
    except Exception as e:
        print(f"\n❌ Error: {e}", flush=True)
        logging.error(f"Processing error: {e}")
    
    print(f"\n✨ Done! Processed {count} transactions ({saved} saved)", flush=True)
