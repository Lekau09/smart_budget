# -*- coding: utf-8 -*-
"""
SMS Financial Data Extractor
Processes SMS logs and saves transactions to database
"""
import os
import sys
import logging
import re
from datetime import datetime

# Force UTF-8 encoding for stdout
if sys.stdout.encoding != 'utf-8':
    if hasattr(sys.stdout, 'reconfigure'):
        sys.stdout.reconfigure(encoding='utf-8')
    else:
        import io
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

print("\n📊 SMS Financial Data Extraction System", flush=True)
print("=" * 50, flush=True)

# Setup logging
logging.basicConfig(
    filename="sms_system.log",
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s"
)

# Try importing database stuff only when needed
def get_database_engine():
    """Lazy load database connection"""
    try:
        import pandas as pd
        from sqlalchemy import create_engine
        from database_config import get_db_config, build_connection_string
        
        print("🔗 Initializing database connection...", flush=True)
        db_config = get_db_config()
        print(f"   Type: {db_config['type']}", flush=True)
        print(f"   Host: {db_config['host']}:{db_config['port']}", flush=True)
        
        DB_URL = build_connection_string()
        engine = create_engine(DB_URL)
        
        # Test connection
        with engine.connect() as conn:
            pass
        print(f"✅ Database connection successful!", flush=True)
        print("=" * 50 + "\n", flush=True)
        
        return engine
    except ImportError as e:
        print(f"❌ Import Error: {str(e)}", flush=True)
        return None
    except Exception as e:
        print(f"❌ Connection Error: {str(e)}", flush=True)
        print(f"\n   Troubleshooting:", flush=True)
        if "Access denied" in str(e):
            print(f"   - Wrong username or password", flush=True)
        elif "Can't connect" in str(e):
            print(f"   - MySQL Server is not running (start XAMPP)", flush=True)
        elif "Unknown database" in str(e):
            print(f"   - Database doesn't exist - create it first", flush=True)
        return None

def save_transaction_to_db(engine, data):
    """Save transaction to database"""
    if not engine:
        return False
    try:
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
        logging.error(f"Database save error: {str(e)}")
        return False

# PARSING LOGIC
def extract_mpesa_data(text, log_date, log_time, sender, sim):
    """Parse MPESA format"""
    data = {
        "log_date": log_date, "log_time": log_time, "sender": sender, "sim": sim,
        "trans_date": log_date, "trans_time": log_time, "transaction_type": "Withdrawal",
        "total_amount": 0.0, "recipient_source": "ATM/Merchant", "reference": "UNKNOWN"
    }
    
    # Extract Transact ID
    tid_match = re.search(r"Transact ID\s+([A-Z0-9]+)", text)
    if tid_match:
        data["reference"] = tid_match.group(1)
    
    # Extract amount
    amt_match = re.search(r"(Withdraw|Transfer|Deposit)\s+M([\d.]+)", text)
    if amt_match:
        try:
            data["total_amount"] = float(amt_match.group(2))
        except:
            data["total_amount"] = 0.0
        
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
    
    # Extract amount
    amt_match = re.search(r"M\s+([\d.]+)", text)
    if amt_match:
        try:
            data["total_amount"] = float(amt_match.group(1))
        except:
            pass
    
    # Extract code
    code_match = re.search(r"Approval Code\s*:?\s*([A-Z0-9.]+)", text)
    if code_match:
        data["reference"] = code_match.group(1).strip()
    
    return data

def parse_sms_text(sms):
    """Extract transaction data from SMS"""
    # Parse structured format: [YYYY-MM-DD HH:MM:SS] From: ... | Text: ... | SIM: ...
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
        # Generic fallback
        return {
            "log_date": log_date, "log_time": log_time, "sender": sender, "sim": sim,
            "trans_date": log_date, "trans_time": log_time, "transaction_type": "Other",
            "total_amount": 0.0, "recipient_source": "Unknown", "reference": "UNKNOWN"
        }

def process_sms_text_file(file_path, engine):
    """Process SMS text file and save transactions"""
    try:
        print(f"\n📂 Processing file: {file_path}", flush=True)
        count = 0
        errors = 0
        
        with open(file_path, 'r', encoding='utf-8') as f:
            for line in f:
                sms = line.strip()
                if sms:
                    try:
                        data = parse_sms_text(sms)
                        if engine:
                            save_transaction_to_db(engine, data)
                        count += 1
                        print(f"   ✅ Parsed: {data['transaction_type']} - Ref: {data['reference']} - M{data['total_amount']}", flush=True)
                        logging.info(f"Success: {data['reference']} saved")
                    except Exception as e:
                        errors += 1
                        logging.error(f"Error parsing SMS: {str(e)}")
        
        print(f"\n✨ Finished! Processed {count} transactions ({errors} errors)", flush=True)
        logging.info(f"File processing complete: {count} successful, {errors} errors")
        
    except Exception as e:
        print(f"\n❌ Error: {str(e)}", flush=True)
        logging.error(f"File processing failed: {str(e)}")

# MAIN
if __name__ == "__main__":
    script_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Get filename from command line or use default
    if len(sys.argv) > 1:
        test_file = sys.argv[1]
        if not os.path.isabs(test_file):
            test_file = os.path.join(script_dir, test_file)
    else:
        test_file = os.path.join(script_dir, "sms_log.txt")
    
    # Check if file exists
    if not os.path.exists(test_file):
        print(f"❌ Text file '{test_file}' not found!", flush=True)
        print(f"\nUsage: python \"script_name.py\" [filename]", flush=True)
        print(f"Example: python \"script_name.py\" sms_log.txt", flush=True)
        sys.exit(1)
    
    print(f"✓ File found: {test_file}", flush=True)
    
    # Initialize database (lazy load)
    engine = get_database_engine()
    
    # Process SMS file
    process_sms_text_file(test_file, engine)
    
    print("\n✅ Done!", flush=True)
