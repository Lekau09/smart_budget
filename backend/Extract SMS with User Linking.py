# -*- coding: utf-8 -*-
"""
SMS Financial Data Extraction — User Linking
=============================================
Rules:
  Purchase  → auto-categorized silently (bell only, no popup)
  Withdrawal → popup category picker so user says what cash was used for
  Transfer/Deposit → skipped

Withdrawal keywords caught:
  withdraw, withdrawn, withdrawal, cashout, cash out, pay 2wallet, pay2wallet

Real SMS formats supported:
  FNB:           FNB:-) M480.00 withdrawn from Smart Account..233594 @ Opercent ATM
  Standard Bank: Your Acc XX6932 has been debited... Ref : Pay 2wallet ECO
  Standard Bank: ZAR 51.00 has been reserved from Acc: XX4131 for purchase via POS
  Standard Bank: Your Acc XX6932 has been debited with LSL 262.48... Ref : POS MR PRICE
  Ecocash:       Ecocash: CashOut Confirmation: M 200 from 29453-NeoLekoekoe Leribe
  Ecocash:       You have paid M32 to 84191- Ob Joint MSU for Merchant Payment
  M-Pesa:        Transact ID ... Withdraw M50.00 from 6118 - MTN General Cafe
  M-Pesa:        Give M300.00 cash to Lamshine Snack bar
  M-Pesa:        M56.00 sent to 33152 - VATICAN GENERAL DEALER Merchant
"""

import os, sys, time, logging, re, requests, argparse
from datetime import datetime
from sqlalchemy import create_engine, text
import io

if sys.stdout.encoding != 'utf-8':
    if hasattr(sys.stdout, 'reconfigure'):
        sys.stdout.reconfigure(encoding='utf-8')
    else:
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

try:
    from database_config import get_db_config, build_connection_string, get_backend_url
except ImportError:
    print("❌ database_config.py not found!", flush=True); exit()

logging.basicConfig(filename="sms_extraction.log", level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s")

db_config = get_db_config()
DB_URL    = build_connection_string()

print(f"\n📊 SMS Financial Data Extraction System", flush=True)
print(f"=" * 60, flush=True)
print(f"🔗 Host: {db_config['host']}:{db_config['port']}  DB: {db_config['database']}", flush=True)
print(f"=" * 60 + "\n", flush=True)

try:
    engine = create_engine(DB_URL, pool_pre_ping=True, pool_size=10, max_overflow=20,
        pool_timeout=5, connect_args={'connect_timeout':5,'read_timeout':5,'write_timeout':5})
    print("✅ Database engine created!", flush=True)
except Exception as e:
    print(f"❌ Engine Error: {e}", flush=True); exit()

print("🔌 Testing database connection...", flush=True)
try:
    with engine.connect() as conn:
        conn.execute(text("SELECT 1"))
        print("✅ Database connection successful!\n", flush=True)
except Exception as e:
    print(f"❌ Connection Error: {e}", flush=True); exit()

# ─────────────────────────────────────────────────────────────
# WITHDRAWAL DETECTION
# Catches all real withdrawal formats seen in the wild
# ─────────────────────────────────────────────────────────────

WITHDRAWAL_KEYWORDS = [
    'withdraw',     # M-Pesa: "Withdraw M50.00 from..."
    'withdrawn',    # FNB: "M480.00 withdrawn from Smart Account"
    'withdrawal',   # generic
    'cashout',      # Ecocash: "CashOut Confirmation"
    'cash out',
    'cash-out',
    'pay 2wallet',  # Standard Bank → Ecocash top-up: "Ref : Pay 2wallet ECO"
    'pay2wallet',
]

def _is_withdrawal(text):
    tl = text.lower()
    return any(kw in tl for kw in WITHDRAWAL_KEYWORDS)

# Matches any supported currency symbol/code (order: longest first to avoid partial matches)
CURRENCY_RE = r"(?:ZAR|LSL|SZL|ZWL|USD|M|R|\$|£|E)"

# ─────────────────────────────────────────────────────────────
# STORE → CATEGORY LOOKUP
# ─────────────────────────────────────────────────────────────

STORE_CATEGORIES = {
    "KFC":"Food","NANDOS":"Food","STEERS":"Food","DEBONAIRS":"Food",
    "HUNGRY LION":"Food","ROMAN'S PIZZA":"Food","CHICKEN LICKEN":"Food",
    "WIMPY":"Food","GALITO":"Food","OCEAN BASKET":"Food","FISHAWAYS":"Food",
    "SPUR":"Food","PANAROTTIS":"Food","MUGG & BEAN":"Food","MUGG AND BEAN":"Food",
    "BURGER KING":"Food","SUBWAY":"Food","PIZZA HUT":"Food","BARCELOS":"Food",
    "MIKE'S KITCHEN":"Food","BLACK STEER":"Food","CATTLE BARON":"Food",
    "KING PIE":"Food","MILKY LANE":"Food","BASKIN ROBBINS":"Food",
    "MCDONALD'S":"Food","MCDONALDS":"Food","TASHAS":"Food","DOPPIO ZERO":"Food",
    "SEATTLE COFFEE":"Food","VIDA E CAFFE":"Food","STARBUCKS":"Food",
    "BLACK LOUNGE":"Food","HOTSPOT":"Food","LEKHALONG":"Food",
    "MASERU CLUB":"Food","LANCERS INN":"Food","LESOTHO SUN":"Food",
    "LAMSHINE SNACK":"Food","QOALING GRILL":"Food","FIRST WORLD":"Food",
    "AVANI":"Food","SHERPA'S":"Food","OB JOINT":"Food",
    "VATICAN GENERAL DEALER":"Food","GENERAL DEALER":"Food",
    "SHOPRITE":"Groceries","PICK N PAY":"Groceries","PICK & PAY":"Groceries",
    "CHECKERS":"Groceries","SPAR":"Groceries","BOXER":"Groceries",
    "USAVE":"Groceries","OK GROCER":"Groceries","OK FOODS":"Groceries",
    "CAMBRIDGE FOOD":"Groceries","FOOD LOVERS":"Groceries",
    "WOOLWORTHS FOOD":"Groceries","FRUIT & VEG":"Groceries",
    "FRESH STOP":"Groceries","CHECKERS HYPER":"Groceries",
    "TOTAL":"Transport","ENGEN":"Transport","SHELL":"Transport",
    "BP":"Transport","CALTEX":"Transport","SASOL":"Transport",
    "THOLO ENERGY":"Transport","ASTRON":"Transport",
    "UBER":"Transport","BOLT":"Transport","INDRIVER":"Transport",
    "EDGARS":"Shopping","JET":"Shopping","ACKERMANS":"Shopping",
    "MR PRICE":"Shopping","MRP":"Shopping","PEP":"Shopping","PEP STORES":"Shopping",
    "FOSCHINI":"Shopping","TRUWORTHS":"Shopping","EXACT":"Shopping",
    "RELAY JEANS":"Shopping","TOTALSPORTS":"Shopping",
    "SPORTSCENE":"Shopping","SNEAKER FACTORY":"Shopping","STUDIO 88":"Shopping",
    "FOOTGEAR":"Shopping","SHOE CITY":"Shopping","BATA":"Shopping",
    "RAGE":"Shopping","QUEENSPARK":"Shopping","MARKHAM":"Shopping",
    "FABIANI":"Shopping","G-STAR":"Shopping","COTTON ON":"Shopping",
    "ZARA":"Shopping","H&M":"Shopping","MR PRICE SPORT":"Shopping",
    "WOOLWORTHS":"Shopping","GAME":"Shopping","HI STORE":"Shopping",
    "INCREDIBLE CONNECTION":"Shopping","ISTORE":"Shopping",
    "SAMSUNG":"Shopping","HUAWEI":"Shopping","MAKRO":"Shopping",
    "BUILDERS":"Shopping","CASHBUILD":"Shopping","TAKEALOT":"Shopping",
    "SUPERBALIST":"Shopping","CNA":"Shopping","EXCLUSIVE BOOKS":"Shopping",
    "IDENTITY":"Shopping","RELAY":"Shopping",
    "NU METRO":"Entertainment","STER KINEKOR":"Entertainment",
    "PLANET FITNESS":"Entertainment","CLUB ILLUSIONS":"Entertainment",
    "STEAM":"Entertainment",
    "NETFLIX":"Subscriptions","SHOWMAX":"Subscriptions",
    "MULTICHOICE":"Subscriptions","AMAZON PRIME":"Subscriptions",
    "SPOTIFY":"Subscriptions","DISNEY PLUS":"Subscriptions",
    "YOUTUBE PREMIUM":"Subscriptions","PLAYSTATION":"Subscriptions",
    "APPLE ITUNES":"Subscriptions","DSTV":"Subscriptions",
    "CLICKS":"Health","DISCHEM":"Health","MEDIRITE":"Health",
    "PHARMACY":"Health","LESOTHO BOSTON":"Health","MALUTI HOSPITAL":"Health",
    "SCOTT HOSPITAL":"Health","MOTEBANG":"Health","SOS MEDICAL":"Health",
    "SPEC SAVERS":"Health","DENTAL":"Health",
    "LEC":"Utilities","LEWA":"Utilities","VODACOM":"Utilities",
    "ECONET":"Utilities","MTN":"Utilities","TELECOMS":"Utilities",
    "HOLLARD":"Utilities","OLD MUTUAL":"Utilities","DISCOVERY":"Utilities",
    "MUNICIPALITY":"Utilities","METROPOLITAN":"Utilities","LIBERTY":"Utilities",
}

def lookup_store_category(store_name):
    if not store_name: return None
    su = store_name.upper().strip()
    if su in STORE_CATEGORIES: return STORE_CATEGORIES[su]
    for key, cat in STORE_CATEGORIES.items():
        if key in su: return cat
    return None

# ─────────────────────────────────────────────────────────────
# USER LOOKUP
# ─────────────────────────────────────────────────────────────

def get_user_by_id(user_id):
    try:
        with engine.begin() as c:
            r = c.execute(text("SELECT id,phone_number,name,email FROM users WHERE id=:uid"),{"uid":user_id})
            u = r.fetchone()
            return {'id':u[0],'phone_number':u[1],'name':u[2],'email':u[3]} if u else None
    except Exception as e:
        logging.error(f"get_user_by_id {user_id}: {e}"); return None

def get_user_by_phone(phone_number):
    try:
        with engine.begin() as c:
            r = c.execute(text("SELECT id,name,email FROM users WHERE phone_number=:p"),{"p":phone_number})
            u = r.fetchone()
            return {'id':u[0],'name':u[1],'email':u[2]} if u else None
    except Exception as e:
        logging.error(f"get_user_by_phone {phone_number}: {e}"); return None

# ─────────────────────────────────────────────────────────────
# SAVE TO transactions TABLE
# ─────────────────────────────────────────────────────────────

def save_transaction_to_db(data, user_id):
    try:
        with engine.begin() as c:
            c.execute(text("""
                INSERT INTO transactions
                (user_id,sms_raw_id,log_date,log_time,sender,sim,
                 trans_date,trans_time,transaction_type,total_amount,
                 recipient_source,reference,is_categorized)
                VALUES
                (:user_id,:sms_raw_id,:log_date,:log_time,:sender,:sim,
                 :trans_date,:trans_time,:transaction_type,:total_amount,
                 :recipient_source,:reference,0)
            """),{
                "user_id":user_id,"sms_raw_id":data.get("sms_raw_id"),
                "log_date":data.get("log_date"),"log_time":data.get("log_time"),
                "sender":data.get("sender"),"sim":data.get("sim"),
                "trans_date":data.get("trans_date"),"trans_time":data.get("trans_time"),
                "transaction_type":data.get("transaction_type"),
                "total_amount":data.get("total_amount"),
                "recipient_source":data.get("recipient_source"),
                "reference":data.get("reference"),
            })
        return True
    except Exception as e:
        logging.error(f"save_transaction_to_db: {e}")
        print(f"   ❌ DB Error: {e}", flush=True); return False

# ─────────────────────────────────────────────────────────────
# NOTIFY FRONTEND
# ─────────────────────────────────────────────────────────────

def notify_frontend(user_id, data):
    """
    Purchase  → saved + silent bell notification (no popup)
    Withdrawal → saved + popup asking user what the cash was spent on
    Transfer/Deposit → skipped
    """
    tx_type = data.get("transaction_type", "Purchase")
    if tx_type in ("Transfer", "Deposit", "Income"):
        return
    try:
        payload = {
            "user_id":          user_id,
            "amount":           data.get("total_amount", 0),
            "category":         data.get("category", "Other"),
            "description":      data.get("recipient_source", ""),
            "transaction_type": tx_type,
            "store":            data.get("recipient_source", ""),
            "needs_manual":     data.get("needs_manual_category", False),
            "date":             data.get("trans_date", ""),
            "raw_sms":          data.get("raw_sms", ""),
        }
        response = requests.post(
            get_backend_url() + "/auto-save-transaction.php",
            json=payload, timeout=5
        )
        if response.status_code == 200:
            result = response.json()
            if result.get("success"):
                if result.get("is_withdrawal"):
                    print(f"      💳 Withdrawal saved → popup will ask user what cash was for", flush=True)
                else:
                    remaining = result.get("remaining", 0)
                    print(f"      💾 Purchase saved | Cat: {data.get('category','Other')} | Budget left: M{remaining:.2f}", flush=True)
            else:
                print(f"      ⚠️  Save failed: {result.get('error')}", flush=True)
        else:
            print(f"      ⚠️  HTTP {response.status_code}", flush=True)
    except Exception as e:
        print(f"      ⚠️  notify_frontend: {e}", flush=True)

# ─────────────────────────────────────────────────────────────
# ML API
# ─────────────────────────────────────────────────────────────

def call_ml_api(sms_text, store_name=None):
    try:
        payload = {'sms': sms_text}
        if store_name:
            payload['store'] = store_name  # pass pre-extracted store so ML skips re-extraction
        r = requests.post('http://localhost:5000/parse', json=payload, timeout=5)
        if r.status_code == 200: return r.json()
    except Exception: pass
    return None

# ─────────────────────────────────────────────────────────────
# PARSERS
# ─────────────────────────────────────────────────────────────

def _base(log_date, log_time, sender, sim):
    return {
        "log_date":log_date,"log_time":log_time,"sender":sender,"sim":sim,
        "trans_date":log_date,"trans_time":log_time,
        "transaction_type":"Purchase","total_amount":0.0,
        "recipient_source":"","reference":"",
        "category":"Other","raw_sms":"",
    }

def _classify_purchase(data, sms_text, store_name=None):
    """
    For purchases:
    1. Direct store lookup
    2. ML API (if confidence >= 55%)
    3. Default to "Other" silently — NO popup, no manual prompt
    """
    effective_store = store_name or data.get("recipient_source", "")
    # Don't treat empty/default values as a real store name
    if effective_store.lower() in ("", "unknown", "unknown store"):
        effective_store = ""
    cat = lookup_store_category(effective_store)
    if cat:
        data["category"] = cat
        return data
    ml = call_ml_api(sms_text, store_name=effective_store or None)
    if ml:
        ml_cat  = ml.get("category")
        ml_conf = ml.get("confidence", 0)
        if ml.get("store"):
            data["recipient_source"] = ml["store"]
        ml_type = ml.get("transaction_type","")
        if ml_type in ("Cash Withdrawal","Transfer","Airtime"):
            data["transaction_type"] = ml_type
        # Use ML category if confident, otherwise silently default to Other
        data["category"] = ml_cat if (ml_cat and ml_conf >= 0.55) else "Other"
    else:
        data["category"] = "Other"
    return data

def _set_withdrawal(data, store_label="Cash Withdrawal"):
    """Mark as Cash Withdrawal — no category needed, popup will handle it"""
    data["transaction_type"] = "Cash Withdrawal"
    data["category"]         = "Other"
    data["recipient_source"] = store_label
    return data


def extract_fnb_data(text, log_date, log_time, sender, sim):
    """
    Purchase: FNB:-) M129.99 reserved for purchase @ Shoprite Ladybrand from Smart Account..233594
    Withdrawal: FNB:-) M480.00 withdrawn from Smart Account..233594 @ Opercent ATM. 5Feb 10:24
    """
    data = _base(log_date, log_time, sender, sim)
    data["raw_sms"] = text
    tl = text.lower()

    # Amount
    m = re.search(CURRENCY_RE + r"\s*([\d,]+\.?\d*)\s+(?:withdrawn|reserved for purchase)", text, re.IGNORECASE)
    if not m: m = re.search(CURRENCY_RE + r"\s*([\d,]+\.?\d*)", text, re.IGNORECASE)
    if m: data["total_amount"] = float(m.group(1).replace(",",""))

    # Reference
    acc = re.search(r"Account\.\.(\d+)", text)
    if acc: data["reference"] = f"ACC{acc.group(1)}"

    # Withdrawal detection (includes "withdrawn" keyword)
    if _is_withdrawal(text):
        # Extract ATM location: "@ Opercent ATM"
        loc = re.search(r"@\s+(.+?)\s+ATM", text, re.IGNORECASE)
        label = (loc.group(1).strip() + " ATM") if loc else "FNB ATM"
        return _set_withdrawal(data, label)

    # Transfer
    if "transferred" in tl:
        data["transaction_type"] = "Transfer"
        data["category"] = "Other"; return data

    # Purchase — extract store name
    store = re.search(r"purchase\s+@\s+(.+?)\s+from\s+Smart Account", text, re.IGNORECASE)
    if store: data["recipient_source"] = store.group(1).strip()
    data["transaction_type"] = "Purchase"
    return _classify_purchase(data, text, data["recipient_source"])


def extract_standard_lesotho_data(text, log_date, log_time, sender, sim):
    """
    Format 1 (purchase): ZAR 51.00 has been reserved from Acc: XX4131 for purchase via POS First World Tr
    Format 2 (purchase): Your Acc XX6932 has been debited with LSL 262.48... Ref : POS MR PRICE
    Format 3 (withdrawal): Your Acc XX6932 has been debited with LSL 100.00... Ref : Pay 2wallet ECO
    """
    data = _base(log_date, log_time, sender, sim)
    data["raw_sms"] = text
    tl = text.lower()

    # Withdrawal detection first (Pay 2wallet, withdrawn, ATM)
    if _is_withdrawal(text):
        # Amount
        m = re.search(r"debited with LSL\s*([\d,]+\.?\d*)", text, re.IGNORECASE)
        if not m: m = re.search(r"ZAR\s+([\d,]+\.?\d*)", text, re.IGNORECASE)
        if not m: m = re.search(r"LSL\s*([\d,]+\.?\d*)", text, re.IGNORECASE)
        if m: data["total_amount"] = float(m.group(1).replace(",",""))
        # Acc reference
        acc = re.search(r"Acc[\s:]+?(XX\d+)", text, re.IGNORECASE)
        if acc: data["reference"] = acc.group(1)
        # Label — e.g. "Pay 2wallet ECO"
        ref = re.search(r"Ref\s*:\s*(.+?)(?:\.|Balance|$)", text, re.IGNORECASE)
        label = ref.group(1).strip() if ref else "Standard Bank Withdrawal"
        return _set_withdrawal(data, label)

    # Format 1: ZAR X has been reserved for purchase via POS
    m = re.search(r"ZAR\s+([\d,]+\.?\d*)\s+has been (?:reserved|withdrawn)", text, re.IGNORECASE)
    if m:
        data["total_amount"] = float(m.group(1).replace(",",""))
        acc = re.search(r"Acc:\s*(XX\d+)", text, re.IGNORECASE)
        if acc: data["reference"] = acc.group(1)
        store = re.search(r"purchase via POS\s+(.+?)\s+on\s+\d", text, re.IGNORECASE)
        if store: data["recipient_source"] = store.group(1).strip()
        data["transaction_type"] = "Purchase"
        return _classify_purchase(data, text, data["recipient_source"])

    # Format 2: debited with LSL X ... Ref : POS STORE
    m2 = re.search(r"debited with LSL\s*([\d,]+\.?\d*)", text, re.IGNORECASE)
    if m2:
        data["total_amount"] = float(m2.group(1).replace(",",""))
        acc = re.search(r"Acc\s+(XX\d+)", text, re.IGNORECASE)
        if acc: data["reference"] = acc.group(1)
        store = re.search(r"Ref\s*:\s*POS\s+(.+?)(?:\.|Balance|$)", text, re.IGNORECASE)
        if store: data["recipient_source"] = store.group(1).strip()
        data["transaction_type"] = "Purchase"
        return _classify_purchase(data, text, data["recipient_source"])

    # Fallback
    data["transaction_type"] = "Purchase"
    return _classify_purchase(data, text)

def extract_mpesa_data(text, log_date, log_time, sender, sim):
    """
    Withdrawal: Transact ID ... Withdraw M50.00 from 6118 - MTN General Cafe
    Purchase:   Give M300.00 cash to Lamshine Snack bar
    Purchase:   M56.00 sent to 33152 - VATICAN GENERAL DEALER Merchant
    Transfer:   M500 sent to +26756XXXXXXX (phone number, no store)
    """
    data = _base(log_date, log_time, sender, sim)
    data["raw_sms"] = text
    tl = text.lower()

    # Transaction ID
    tid = re.search(r"(?:Transact ID|Confirmed\.?)\s*([A-Z0-9]{8,})", text, re.IGNORECASE)
    if tid: data["reference"] = tid.group(1)

    # Amount — try specific patterns first
    m = re.search(r"Give\s+" + CURRENCY_RE + r"\s*([\d,]+\.?\d*)", text, re.IGNORECASE)
    if not m: m = re.search(r"Withdraw\s+" + CURRENCY_RE + r"\s*([\d,]+\.?\d*)", text, re.IGNORECASE)
    if not m: m = re.search(CURRENCY_RE + r"\s*([\d,]+\.?\d*)\s+sent", text, re.IGNORECASE)
    if not m: m = re.search(CURRENCY_RE + r"\s*([\d,]+\.?\d*)", text, re.IGNORECASE)
    if m: data["total_amount"] = float(m.group(1).replace(",",""))

    # WITHDRAWAL: "Withdraw M... from ..." or "sent to ... - Name" (if flagged as withdrawal)
    if _is_withdrawal(text):
        agent = re.search(r"from\s+\d+\s*-\s*(.+?)(?:\.|New|Customer|$)", text, re.IGNORECASE)
        if not agent:
            agent = re.search(r"sent to\s+[\d+]{7,}\s*-\s*(.+?)(?:\s+on\s+\d|New|Customer|\.|$)", text, re.IGNORECASE)
        if not agent:
            # Try to get agent number as fallback identifier
            agent_num = re.search(r"(?:from|to)\s+(\d{4,})", text, re.IGNORECASE)
            label = f"Agent {agent_num.group(1)}" if agent_num else "M-Pesa Withdrawal"
        else:
            label = agent.group(1).strip() or "M-Pesa Withdrawal"
        return _set_withdrawal(data, label)

    # PURCHASE format 0: "You have paid M32 to 84191- Ob Joint MSU for Merchant Payment"
    if "you have paid" in tl and "merchant payment" in tl:
        merchant = re.search(r"paid " + CURRENCY_RE + r"\s*[\d,.]+\s+to\s+[\d]+[-\s]+(.+?)\s+for\s+Merchant", text, re.IGNORECASE)
        if not merchant:
            merchant = re.search(r"to\s+[\d]+-\s*(.+?)\s+for\s+Merchant", text, re.IGNORECASE)
        if merchant: data["recipient_source"] = merchant.group(1).strip()
        data["transaction_type"] = "Purchase"
        return _classify_purchase(data, text, data["recipient_source"] or None)

    # PURCHASE format 1: "Give <currency>... cash to Store"
    if re.search(r"give\s+" + CURRENCY_RE, tl) and "cash to" in tl:
        merchant = re.search(r"Give " + CURRENCY_RE + r"\s*[\d,.]+ cash to\s+(.+?)(?:\.|New M-Pesa|$)", text, re.IGNORECASE)
        if merchant: data["recipient_source"] = merchant.group(1).strip()
        data["transaction_type"] = "Purchase"
        return _classify_purchase(data, text, data["recipient_source"])

    # PURCHASE format 2: "sent to NNNN - STORE Merchant"
    if "sent to" in tl and "merchant" in tl:
        merchant = re.search(r"sent to\s+\d+\s*-\s*(.+?)\s+Merchant", text, re.IGNORECASE)
        if merchant: data["recipient_source"] = merchant.group(1).strip()
        data["transaction_type"] = "Purchase"
        return _classify_purchase(data, text, data["recipient_source"])

    # TRANSFER: "sent to <phone number>" (no store/merchant keyword)
    if "sent to" in tl:
        data["transaction_type"] = "Transfer"
        data["category"] = "Other"; return data

    # DEPOSIT
    if "deposit" in tl or "received" in tl or "credited" in tl:
        data["transaction_type"] = "Deposit"
        data["category"] = "Income"; return data

    # Default M-Pesa unknown → withdrawal (safer)
    return _set_withdrawal(data, "M-Pesa")


def extract_ecocash_data(text, log_date, log_time, sender, sim):
    """
    Withdrawal: Ecocash: CashOut Confirmation: M 200 from 29453-NeoLekoekoe Leribe
    Purchase:   You have paid M32 to 84191- Ob Joint MSU for Merchant Payment
    """
    data = _base(log_date, log_time, sender, sim)
    data["raw_sms"] = text
    tl = text.lower()

    # Approval code as reference
    code = re.search(r"Approval Code\s*:?\s*([A-Z0-9.]+)", text, re.IGNORECASE)
    if code: data["reference"] = code.group(1).strip().rstrip(".")

    # Amount
    m = re.search(CURRENCY_RE + r"\s*([\d,]+\.?\d*)", text, re.IGNORECASE)
    if m: data["total_amount"] = float(m.group(1).replace(",",""))

    # WITHDRAWAL: any cashout/withdraw keyword
    if _is_withdrawal(text):
        merchant = re.search(r"from\s+[\d]+-(.+?)(?:\.|Approval|New|$)", text, re.IGNORECASE)
        if not merchant:
            agent_num = re.search(r"from\s+(\d{4,})", text, re.IGNORECASE)
            label = f"Agent {agent_num.group(1)}" if agent_num else "Ecocash Withdrawal"
        else:
            label = merchant.group(1).strip() or "Ecocash Withdrawal"
        return _set_withdrawal(data, label)

    # PURCHASE: Merchant Payment keyword
    if "merchant" in tl and ("paid" in tl or "payment" in tl):
        merchant = re.search(r"paid " + CURRENCY_RE + r"\s*[\d,.]+ to\s+\d+-\s*(.+?)\s+for Merchant", text, re.IGNORECASE)
        if not merchant:
            merchant = re.search(r"to\s+\d+-\s*(.+?)(?:\s+for Merchant|\s+Approval|\.)", text, re.IGNORECASE)
        if merchant: data["recipient_source"] = merchant.group(1).strip()
        data["transaction_type"] = "Purchase"
        return _classify_purchase(data, text, data["recipient_source"])

    # Transfer / received
    if "transfer" in tl or "sent" in tl:
        data["transaction_type"] = "Transfer"; data["category"] = "Other"; return data
    if "received" in tl or "deposit" in tl:
        data["transaction_type"] = "Deposit"; data["category"] = "Income"; return data

    # Default Ecocash unknown → withdrawal
    return _set_withdrawal(data, "Ecocash")


def parse_sms_text(sms):
    meta = re.match(
        r"\[(\d{4}-\d{2}-\d{2})\s(\d{2}:\d{2}:\d{2})\]\s+From:\s+(.+?)\s+\|\s+Text:\s+(.+?)\s+\|\s+Sent:\s+(.+?)\s+\|\s+Received:\s+(.+?)\s+\|\s+SIM:\s+(.+)$",
        sms
    )
    if meta:
        log_date, log_time, sender, text, _, _, sim = meta.groups()
    else:
        now=datetime.now(); log_date=now.strftime("%Y-%m-%d"); log_time=now.strftime("%H:%M:%S")
        sender="Unknown"; sim="Unknown"; text=sms

    tl = text.lower()
    if re.search(r"fnb[:\-\)]+", tl):
        return extract_fnb_data(text, log_date, log_time, sender, sim)
    elif ("has been reserved from acc" in tl or "available balance is lsl" in tl
          or "has been debited with lsl" in tl or "helpline: 266" in tl):
        return extract_standard_lesotho_data(text, log_date, log_time, sender, sim)
    elif "transact id" in tl or "m-pesa" in tl or "mpesa" in tl or "give m" in tl:
        return extract_mpesa_data(text, log_date, log_time, sender, sim)
    elif "you have paid" in tl and "merchant payment" in tl:
        # M-Pesa/Ecocash merchant payment: "You have paid M32 to 84191- Store for Merchant Payment"
        return extract_mpesa_data(text, log_date, log_time, sender, sim)
    elif "ecocash" in tl:
        return extract_ecocash_data(text, log_date, log_time, sender, sim)
    else:
        # Unknown bank — check for withdrawal keywords first
        data = _base(log_date, log_time, sender, sim)
        data["raw_sms"] = text
        if _is_withdrawal(text):
            m = re.search(CURRENCY_RE + r"\s*([\d,]+\.?\d*)", text, re.IGNORECASE)
            if m: data["total_amount"] = float(m.group(1).replace(",",""))
            return _set_withdrawal(data, "Cash Withdrawal")
        m = re.search(CURRENCY_RE + r"\s*([\d,]+\.?\d*)", text, re.IGNORECASE)
        if m: data["total_amount"] = float(m.group(1).replace(",",""))
        data["transaction_type"] = "Purchase"
        return _classify_purchase(data, text)

# ─────────────────────────────────────────────────────────────
# DATABASE HELPERS
# ─────────────────────────────────────────────────────────────

def get_unprocessed_sms_for_user(user_id):
    try:
        with engine.begin() as c:
            r = c.execute(text("""
                SELECT id,sms_text,received_stamp,sim_slot,sms_from
                FROM sms_raw_ingest WHERE user_id=:uid AND is_duplicate<2
                ORDER BY received_stamp ASC
            """),{"uid":user_id})
            return [{'id':row[0],'text':row[1],'received_stamp':row[2],'sim_slot':row[3],'sms_from':row[4]} for row in r.fetchall()]
    except Exception as e:
        logging.error(f"get_unprocessed_sms_for_user: {e}"); return []

def get_all_unprocessed_sms():
    try:
        with engine.begin() as c:
            r = c.execute(text("""
                SELECT id,user_id,sms_text,received_stamp,sim_slot,sms_from
                FROM sms_raw_ingest WHERE is_duplicate<2
                ORDER BY user_id,received_stamp ASC
            """))
            return [{'id':row[0],'user_id':row[1],'text':row[2],'received_stamp':row[3],'sim_slot':row[4],'sms_from':row[5]} for row in r.fetchall()]
    except Exception as e:
        logging.error(f"get_all_unprocessed_sms: {e}"); return []

def mark_sms_as_processed(sms_id):
    try:
        with engine.begin() as c:
            c.execute(text("UPDATE sms_raw_ingest SET is_duplicate=2 WHERE id=:id"),{"id":sms_id})
        return True
    except Exception as e:
        logging.error(f"mark_sms_as_processed: {e}"); return False

# ─────────────────────────────────────────────────────────────
# PROCESS ONE SMS
# ─────────────────────────────────────────────────────────────

def _process_single_sms(sms, user_id):
    try:
        received_ts = sms['received_stamp']
        try:
            dt=datetime.fromtimestamp(received_ts/1000)
            log_date=dt.strftime("%Y-%m-%d"); log_time=dt.strftime("%H:%M:%S")
        except Exception:
            now=datetime.now(); log_date=now.strftime("%Y-%m-%d"); log_time=now.strftime("%H:%M:%S")

        data = parse_sms_text(sms['text'])
        data['log_date']=log_date; data['log_time']=log_time
        data['sim']=sms.get('sim_slot') or "Unknown"
        data['sender']=sms.get('sms_from') or "Unknown"
        data['trans_date']=log_date; data['trans_time']=log_time
        data['sms_raw_id']=sms['id']
        if not data.get('raw_sms'): data['raw_sms']=sms['text']

        if data.get('total_amount', 0) <= 0:
            logging.info(f"Skipping SMS {sms['id']}: No valid amount found.")
            mark_sms_as_processed(sms['id'])
            return False, data

        if save_transaction_to_db(data, user_id):
            mark_sms_as_processed(sms['id'])
            notify_frontend(user_id, data)
            return True, data
        return False, data
    except Exception as e:
        logging.error(f"_process_single_sms {sms['id']}: {e}"); return False, {}

# ─────────────────────────────────────────────────────────────
# BATCH PROCESSORS
# ─────────────────────────────────────────────────────────────

def _print_result(idx, data, prefix="  "):
    tx = data['transaction_type']
    cat = data.get('category','')
    amt = data['total_amount']
    store = data['recipient_source']
    flag = " 💳 →POPUP" if tx == "Cash Withdrawal" else ""
    print(f"{prefix}✅ [{idx}] {tx:18} | {cat:14} | M{amt:9.2f} | {store}{flag}", flush=True)

def process_all_sms_from_database():
    print("📊 Fetching all unprocessed SMS...", flush=True)
    all_sms = get_all_unprocessed_sms()
    if not all_sms: print("✅ No unprocessed SMS", flush=True); return True
    print(f"📈 Found {len(all_sms)} unprocessed SMS\n", flush=True)
    sms_by_user = {}
    for sms in all_sms: sms_by_user.setdefault(sms['user_id'],[]).append(sms)
    total_saved = total_failed = 0
    for user_id, user_sms_list in sms_by_user.items():
        user = get_user_by_id(user_id)
        if not user: print(f"⚠️  User {user_id} not found", flush=True); continue
        print(f"\n👤 {user['name']} (ID:{user_id}) — {len(user_sms_list)} SMS", flush=True)
        saved = failed = 0
        for idx, sms in enumerate(user_sms_list, 1):
            ok, data = _process_single_sms(sms, user_id)
            if ok: saved += 1; _print_result(idx, data)
            else:  failed += 1; print(f"  ❌ [{idx}] Failed", flush=True)
        total_saved += saved; total_failed += failed
        print(f"  → {saved} saved, {failed} failed", flush=True)
    print(f"\n🎉 Done! {total_saved} saved, {total_failed} failed", flush=True)
    return True

def process_sms_from_database(user_id, user_name):
    print(f"👤 {user_name} (ID:{user_id})", flush=True)
    sms_list = get_unprocessed_sms_for_user(user_id)
    if not sms_list: print("✅ No new SMS", flush=True); return True
    print(f"📊 Found {len(sms_list)} unprocessed SMS", flush=True)
    saved = failed = 0
    for idx, sms in enumerate(sms_list, 1):
        ok, data = _process_single_sms(sms, user_id)
        if ok: saved += 1; _print_result(idx, data)
        else:  failed += 1; print(f"  ❌ [{idx}] Failed", flush=True)
    print(f"\n✨ Done: {saved} saved, {failed} failed", flush=True)
    return True

# ─────────────────────────────────────────────────────────────
# CONTINUOUS SCHEDULER
# ─────────────────────────────────────────────────────────────

def run_scheduler_mode():
    print(f"\n🚀 CONTINUOUS MODE — checking every 1 second\nPress Ctrl+C to stop\n", flush=True)
    iteration = 0
    try:
        while True:
            iteration += 1
            timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            try:
                all_sms = get_all_unprocessed_sms()
                if all_sms:
                    print(f"\n[{timestamp}] #{iteration} — {len(all_sms)} new SMS", flush=True)
                    sms_by_user = {}
                    for sms in all_sms: sms_by_user.setdefault(sms['user_id'],[]).append(sms)
                    total_saved = 0
                    for user_id, user_sms_list in sms_by_user.items():
                        user = get_user_by_id(user_id)
                        if not user: continue
                        for sms in user_sms_list:
                            ok, data = _process_single_sms(sms, user_id)
                            if ok:
                                total_saved += 1
                                _print_result("", data, prefix=f"  ✅ {user['name']:15} |")
                    if total_saved: logging.info(f"Iteration {iteration}: {total_saved} saved")
                else:
                    if iteration % 10 == 0:
                        print(f"[{timestamp}] #{iteration} — waiting...", flush=True)
            except Exception as e:
                print(f"[{timestamp}] ⚠️ {e}", flush=True)
                logging.error(f"Iteration {iteration}: {e}")
            time.sleep(1)
    except KeyboardInterrupt:
        print(f"\n🛑 Stopped after {iteration} iterations", flush=True); sys.exit(0)

# ─────────────────────────────────────────────────────────────
# MAIN
# ─────────────────────────────────────────────────────────────

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument('phone_number', nargs='?', default=None)
    parser.add_argument('--continuous', action='store_true')
    args = parser.parse_args()

    print(f"\n🚀 SMS Financial Data Extraction\n{'='*60}", flush=True)

    if args.phone_number is None:
        run_scheduler_mode()
    elif args.continuous:
        user = get_user_by_phone(args.phone_number)
        if not user: print(f"❌ User not found: {args.phone_number}", flush=True); sys.exit(1)
        print(f"✅ User: {user['name']} — continuous mode\n", flush=True)
        iteration = 0
        try:
            while True:
                iteration += 1
                process_sms_from_database(user['id'], user['name'])
                time.sleep(1)
        except KeyboardInterrupt:
            print(f"\n🛑 Stopped after {iteration} iterations", flush=True); sys.exit(0)
    else:
        user = get_user_by_phone(args.phone_number)
        if not user: print(f"❌ User not found: {args.phone_number}", flush=True); sys.exit(1)
        print(f"✅ User: {user['name']}\n", flush=True)
        process_sms_from_database(user['id'], user['name'])