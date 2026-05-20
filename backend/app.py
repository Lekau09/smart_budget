"""
SmartSpend ML API — SMS Classifier
=====================================
Naive Bayes + TF-IDF for bank SMS transaction categorisation.

Endpoints:
  POST /parse              — classify single SMS
  POST /parse_bulk         — classify up to 500 SMS
  POST /confirm_category   — teach ML from user correction
  GET  /categories         — list available categories
  GET  /model_stats        — feedback statistics
  GET  /health             — system status
"""

import re, os, joblib, threading, json
from datetime import datetime
import pandas as pd
import numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS

# SMS classifier imports
from sklearn.pipeline import Pipeline, FeatureUnion
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import SGDClassifier
from sklearn.model_selection import train_test_split
from sklearn.calibration import CalibratedClassifierCV
from sklearn.svm import LinearSVC

app = Flask(__name__)
CORS(app)

# ── SMS Classifier config ────────────────────────────────────────────────────
BASE_DIR = os.path.abspath(os.path.dirname(__file__))
DATASET_PATH  = os.path.join(BASE_DIR, "sms_dataset_v2.csv")
MODEL_PATH    = os.path.join(BASE_DIR, "sms_classifier_v2.pkl")
FEEDBACK_PATH = os.path.join(BASE_DIR, "feedback_log.csv")
RETRAIN_EVERY = 5

feedback_count_since_retrain = 0
model_lock = threading.Lock()
store_memory = {}
feedback_df  = pd.DataFrame() # Fixed: Added local feedback storage

# ─────────────────────────────────────────────────────────────────────────────
# KNOWN STORES DICT (Layer 0)
# ─────────────────────────────────────────────────────────────────────────────
KNOWN_STORES = {
    # ── Food & Restaurants ────────────────────────────────────────
    "KFC": "Food", "NANDOS": "Food", "STEERS": "Food",
    "DEBONAIRS": "Food", "HUNGRY LION": "Food", "WIMPY": "Food",
    "GALITO": "Food", "SPUR": "Food", "BARCELOS": "Food",
    "PIZZA HUT": "Food", "BURGER KING": "Food", "MCDONALDS": "Food",
    "MCDONALD'S": "Food", "ROMAN'S PIZZA": "Food", "CHICKEN LICKEN": "Food",
    "OCEAN BASKET": "Food", "FISHAWAYS": "Food", "PANAROTTIS": "Food",
    "MUGG & BEAN": "Food", "MUGG AND BEAN": "Food", "SUBWAY": "Food",
    "MIKE'S KITCHEN": "Food", "BLACK STEER": "Food", "CATTLE BARON": "Food",
    "KING PIE": "Food", "MILKY LANE": "Food", "BASKIN ROBBINS": "Food",
    "TASHAS": "Food", "DOPPIO ZERO": "Food", "SEATTLE COFFEE": "Food",
    "VIDA E CAFFE": "Food", "STARBUCKS": "Food",
    # Lesotho-specific food places
    "HOTSPOT": "Food", "BLACK LOUNGE": "Food", "LEKHALONG": "Food",
    "MASERU CLUB": "Food", "LANCERS INN": "Food", "LESOTHO SUN": "Food",
    "LAMSHINE SNACK": "Food", "QOALING GRILL": "Food", "FIRST WORLD": "Food",
    "AVANI": "Food", "SHERPA'S": "Food", "OB JOINT": "Food",
    "VATICAN GENERAL DEALER": "Food", "GENERAL DEALER": "Food",
    "KAYCEES": "Food", "LECHAENENG": "Food", "THE WILD ROMA": "Food",
    # ── Groceries ────────────────────────────────────────────────
    "SHOPRITE": "Groceries", "PICK N PAY": "Groceries", "PICK & PAY": "Groceries",
    "CHECKERS": "Groceries", "SPAR": "Groceries", "BOXER": "Groceries",
    "USAVE": "Groceries", "OK GROCER": "Groceries", "OK FOODS": "Groceries",
    "CAMBRIDGE FOOD": "Groceries", "FOOD LOVERS": "Groceries",
    "WOOLWORTHS FOOD": "Groceries", "FRUIT & VEG": "Groceries",
    "FRESH STOP": "Groceries", "CHECKERS HYPER": "Groceries",
    # ── Transport ────────────────────────────────────────────────
    "TOTAL": "Transport", "ENGEN": "Transport", "SHELL": "Transport",
    "BP": "Transport", "CALTEX": "Transport", "SASOL": "Transport",
    "THOLO ENERGY": "Transport", "ASTRON": "Transport",
    "UBER": "Transport", "BOLT": "Transport", "INDRIVER": "Transport",
    # ── Shopping ─────────────────────────────────────────────────
    "EDGARS": "Shopping", "JET": "Shopping", "ACKERMANS": "Shopping",
    "MR PRICE": "Shopping", "MRP": "Shopping", "PEP": "Shopping",
    "PEP STORES": "Shopping", "FOSCHINI": "Shopping", "TRUWORTHS": "Shopping",
    "WOOLWORTHS": "Shopping", "GAME": "Shopping", "FOOTGEAR": "Shopping",
    "SNEAKER FACTORY": "Shopping", "STUDIO 88": "Shopping",
    "TOTALSPORTS": "Shopping", "SPORTSCENE": "Shopping", "RAGE": "Shopping",
    "QUEENSPARK": "Shopping", "MARKHAM": "Shopping", "FABIANI": "Shopping",
    "COTTON ON": "Shopping", "ZARA": "Shopping", "H&M": "Shopping",
    "MR PRICE SPORT": "Shopping", "RELAY JEANS": "Shopping", "EXACT": "Shopping",
    "SHOE CITY": "Shopping", "BATA": "Shopping",
    "INCREDIBLE CONNECTION": "Shopping", "ISTORE": "Shopping",
    "SAMSUNG": "Shopping", "HUAWEI": "Shopping", "MAKRO": "Shopping",
    "HI STORE": "Shopping", "BUILDERS": "Shopping", "CASHBUILD": "Shopping",
    "TAKEALOT": "Shopping", "SUPERBALIST": "Shopping", "CNA": "Shopping",
    "EXCLUSIVE BOOKS": "Shopping", "IDENTITY": "Shopping",
    # ── Subscriptions ────────────────────────────────────────────
    "NETFLIX": "Subscriptions", "SHOWMAX": "Subscriptions",
    "DSTV": "Subscriptions", "SPOTIFY": "Subscriptions",
    "MULTICHOICE": "Subscriptions", "AMAZON PRIME": "Subscriptions",
    "DISNEY PLUS": "Subscriptions", "YOUTUBE PREMIUM": "Subscriptions",
    "APPLE ITUNES": "Subscriptions", "PLAYSTATION": "Subscriptions",
    # ── Entertainment ────────────────────────────────────────────
    "NU METRO": "Entertainment", "STER KINEKOR": "Entertainment",
    "PLANET FITNESS": "Entertainment", "CLUB ILLUSIONS": "Entertainment",
    "STEAM": "Entertainment",
    # ── Health ───────────────────────────────────────────────────
    "CLICKS": "Health", "DISCHEM": "Health", "MEDIRITE": "Health",
    "PHARMACY": "Health", "LESOTHO BOSTON": "Health", "MALUTI HOSPITAL": "Health",
    "SCOTT HOSPITAL": "Health", "MOTEBANG": "Health", "SOS MEDICAL": "Health",
    "SPEC SAVERS": "Health", "DENTAL": "Health",
    # ── Utilities ────────────────────────────────────────────────
    "LEC": "Utilities", "LEWA": "Utilities",
    "VODACOM": "Utilities", "MTN": "Utilities", "ECONET": "Utilities",
    "TELECOMS": "Utilities", "MUNICIPALITY": "Utilities",
    "OLD MUTUAL": "Utilities", "HOLLARD": "Utilities",
    "DISCOVERY": "Utilities", "LIBERTY": "Utilities",
    "METROPOLITAN": "Utilities",
}

def _normalize(s):
    """Strip punctuation and collapse spaces for fuzzy matching."""
    return re.sub(r"['\-&,.]", " ", s).upper()

def lookup_known_store(store_name):
    if not store_name:
        return None
    su  = store_name.upper().strip()
    snorm = _normalize(store_name)
    # Exact match first
    if su in KNOWN_STORES:
        return KNOWN_STORES[su]
    # Substring match on raw name
    for key, cat in KNOWN_STORES.items():
        if key in su:
            return cat
    # Normalized match (handles Pick'n pay → PICK N PAY, etc.)
    for key, cat in KNOWN_STORES.items():
        knorm = _normalize(key)
        if knorm == snorm or knorm in snorm:
            return cat
    return None

# ─────────────────────────────────────────────────────────────────────────────
# SECTION 1: SMS CLASSIFIER (unchanged from v2)
# ─────────────────────────────────────────────────────────────────────────────

def detect_bank(sms):
    s = sms.lower()
    if re.search(r"fnb[:\-\)]+", s): return "FNB"
    if "has been reserved from acc" in s or "has been debited with lsl" in s: return "Standard Lesotho Bank"
    if "transact id" in s or "m-pesa" in s or "mpesa" in s: return "M-Pesa"
    if "ecocash" in s: return "Ecocash"
    if "nedbank" in s: return "Nedbank"
    if "capitec" in s: return "Capitec"
    return "Unknown"

WITHDRAWAL_KEYWORDS = ["withdraw","withdrawn","withdrawal","cashout","cash out","cash-out","pay 2wallet","pay2wallet"]

def _is_withdrawal(text):
    tl = text.lower()
    return any(kw in tl for kw in WITHDRAWAL_KEYWORDS)

def extract_fields(sms):
    bank = detect_bank(sms)
    result = {"bank":bank,"raw_sms":sms,"amount":None,"store":None,
              "balance":None,"transaction_type":"Purchase","needs_manual_category":False}
    # Currency symbol (longest alternatives first to avoid partial matches)
    _C = r"(?:ZAR|LSL|SZL|ZWL|USD|M|R|\$|£|E)"
    for p in [
        # Specific bank formats first
        r"M([\d,]+\.?\d*)\s+withdrawn",
        r"debited with (?:LSL|ZAR|SZL)\s*([\d,]+\.?\d*)",
        r"ZAR\s+([\d,]+\.?\d*)\s+has been",
        r"Withdraw\s+" + _C + r"\s*([\d,]+\.?\d*)",
        _C + r"\s*([\d,]+\.?\d*)\s+reserved for purchase",
        # Ecocash/M-Pesa explicit amount field (e.g. "R 90 from ...", "M 200 from ...")
        r"Confirmation:\s*" + _C + r"\s*([\d,]+\.?\d*)",
        r"paid\s+" + _C + r"\s*([\d,]+\.?\d*)\s+to\s+\d",
        # Standalone currency symbol not preceded by a letter (avoids "from M..." etc.)
        r"(?<![A-Za-z])" + _C + r"\s*([\d,]+\.?\d*)",
    ]:
        m = re.search(p, sms, re.IGNORECASE)
        if m:
            result["amount"] = float(m.group(1).replace(",",""))
            break
    for p in [r"purchase\s+@\s+(.+?)\s+from\s+Smart Account",
              r"purchase via POS\s+(.+?)\s+on\s+\d",
              r"Ref\s*:\s*POS\s+(.+?)(?:\.|Balance|$)",
              r"Give " + _C + r"\s*[\d,.]+ cash to\s+(.+?)(?:\.|New M-Pesa|$)",
              r"sent to\s+\d+\s*-\s*(.+?)\s+Merchant",
              r"paid " + _C + r"\s*[\d,.]+ to\s+\d+-\s*(.+?)\s+for Merchant",
              r"transaction for " + _C + r"\s*[\d,.]+ at\s+(.+?)\s+was reserved",
              r"transaction of " + _C + r"\s*[\d,.]+ at\s+(.+?)\s+on card",
              r"at\s+([A-Z][A-Z\s]+[A-Z])\s+was reserved",
              r"from\s+\d+\s*-\s*(.+?)(?:\s*\.\s*|\s*Approval|\s*New|$)"]:
        m = re.search(p, sms, re.IGNORECASE)
        if m:
            result["store"] = m.group(1).strip()
            break
    if _is_withdrawal(sms) or "atm" in sms.lower():
        result["transaction_type"] = "Cash Withdrawal"
    elif "sent to" in sms.lower() and "merchant" not in sms.lower():
        result["transaction_type"] = "Transfer"
    elif "airtime" in sms.lower():
        result["transaction_type"] = "Airtime"
    return result

def build_sms_pipeline():
    word_tfidf = TfidfVectorizer(
        analyzer="word", ngram_range=(1, 3),
        max_features=80_000, sublinear_tf=True,
        min_df=2, strip_accents="unicode",
    )
    char_tfidf = TfidfVectorizer(
        analyzer="char_wb", ngram_range=(3, 5),
        max_features=40_000, sublinear_tf=True,
        min_df=3, strip_accents="unicode",
    )
    features = FeatureUnion([("word", word_tfidf), ("char", char_tfidf)])
    clf = SGDClassifier(
        loss="modified_huber", penalty="l2", alpha=1e-4,
        max_iter=200, random_state=42, n_jobs=-1, class_weight="balanced",
    )
    return Pipeline([("features", features), ("clf", clf)])

def train_sms_model(extra_df=None):
    print(f"[{datetime.now():%H:%M:%S}] Training SMS classifier...")
    base_df = pd.read_csv(DATASET_PATH)
    if extra_df is not None and len(extra_df) > 0:
        # Boost user-confirmed feedback by repeating it 20x so the model learns it
        boosted = pd.concat([extra_df] * 20, ignore_index=True)
        df = pd.concat([base_df, boosted], ignore_index=True)
    else:
        df = base_df
    df = df.dropna(subset=["sms", "category"])
    df = df[df["category"].str.strip() != ""]
    X_train, X_test, y_train, y_test = train_test_split(
        df["sms"], df["category"], test_size=0.1, random_state=42, stratify=df["category"])
    pipeline = build_sms_pipeline()
    pipeline.fit(X_train, y_train)
    acc = (pipeline.predict(X_test) == y_test).mean()
    print(f"  SMS Accuracy: {acc*100:.1f}%  |  Rows: {len(X_train):,}")
    joblib.dump(pipeline, MODEL_PATH)
    return pipeline

def load_or_train_sms_model():
    if os.path.exists(MODEL_PATH):
        print("Loading existing SMS model...")
        return joblib.load(MODEL_PATH)
    return train_sms_model()

def load_store_memory():
    global store_memory, feedback_df
    if os.path.exists(FEEDBACK_PATH):
        try:
            feedback_df = pd.read_csv(FEEDBACK_PATH)
            if "store" in feedback_df.columns and "category" in feedback_df.columns:
                # Count confirmations to identify learned stores
                counts = feedback_df.groupby(["store", "category"]).size().reset_index(name="counts")
                for _, row in counts.iterrows():
                    if row["counts"] >= MIN_CONFIRMATIONS:
                        store_memory[str(row["store"]).upper().strip()] = row["category"]
                print(f"  Loaded {len(store_memory)} learned stores from {len(feedback_df)} feedbacks")
        except Exception as e:
            print(f"  Store memory load error: {e}")
            feedback_df = pd.DataFrame() # Fallback to empty

MIN_CONFIRMATIONS    = 5   # Confirmations before a store is auto-learned
CONFIDENCE_THRESHOLD = 0.50

def classify_sms(sms, pre_store=None):
    fields = extract_fields(sms)
    if fields["transaction_type"] in ("Cash Withdrawal","Transfer"):
        fields["category"]="Other"; fields["confidence"]=1.0
        fields["needs_manual_category"]=False
        if pre_store and pre_store.lower() not in ("unknown", "unknown store", ""):
            fields["store"] = pre_store
        return fields
    # Use pre-extracted store name from caller only if it's meaningful
    if pre_store and pre_store.lower() not in ("unknown", "unknown store", ""):
        fields["store"] = pre_store
    store_name = fields.get("store")
    known_cat  = lookup_known_store(store_name)
    if known_cat:
        fields["category"]=known_cat; fields["confidence"]=1.0
        fields["needs_manual_category"]=False; fields["source"]="hardcoded"
        print(f"  Hardcoded: {store_name} -> {known_cat}"); return fields
    if store_name:
        key = store_name.upper().strip()
        if key in store_memory:
            fields["category"]=store_memory[key]; fields["confidence"]=1.0
            fields["needs_manual_category"]=False; fields["source"]="memory"
            print(f"  Memory hit: {store_name} -> {fields['category']}"); return fields
    with model_lock:
        proba  = sms_model.predict_proba([sms])[0]
        classes= sms_model.classes_
    top_idx    = proba.argmax()
    confidence = float(proba[top_idx])
    predicted  = classes[top_idx]
    fields["confidence"]=round(confidence,4); fields["source"]="ml"
    if confidence >= CONFIDENCE_THRESHOLD:
        fields["category"]=predicted; fields["needs_manual_category"]=False
    else:
        fields["category"]="Other"; fields["needs_manual_category"]=True
        fields["suggested_category"]=predicted
    top3 = proba.argsort()[-3:][::-1]
    fields["top_predictions"] = [
        {"category":classes[i],"confidence":round(float(proba[i]),4)} for i in top3]
    return fields

def retrain_sms_with_feedback():
    global sms_model
    retrain_df = pd.DataFrame()
    if os.path.exists(FEEDBACK_PATH):
        retrain_df = pd.read_csv(FEEDBACK_PATH)
    new_model = train_sms_model(extra_df=retrain_df if len(retrain_df) > 0 else None)
    with model_lock:
        sms_model = new_model
    print(f"[{datetime.now():%H:%M:%S}] SMS model retrained with {len(retrain_df)} feedback rows")


# ─────────────────────────────────────────────────────────────────────────────
# FLASK ROUTES — SMS Classifier
# ─────────────────────────────────────────────────────────────────────────────

@app.route("/health", methods=["GET"])
def health():
    fc = len(pd.read_csv(FEEDBACK_PATH)) if os.path.exists(FEEDBACK_PATH) else 0
    return jsonify({
        "status":            "ok",
        "model_loaded":      sms_model is not None,
        "feedback_rows":     fc,
        "store_memory_size": len(store_memory),
    })

@app.route("/parse", methods=["POST"])
def parse_sms():
    data = request.get_json()
    if not data or "sms" not in data:
        return jsonify({"error":"Missing 'sms' field"}), 400
    pre_store = data.get("store", "").strip() or None
    return jsonify(classify_sms(data["sms"].strip(), pre_store=pre_store))

@app.route("/parse_bulk", methods=["POST"])
def parse_bulk():
    data = request.get_json()
    if not data or "messages" not in data:
        return jsonify({"error":"Missing 'messages'"}), 400
    msgs = data["messages"]
    if not isinstance(msgs, list) or len(msgs) == 0:
        return jsonify({"error":"messages must be non-empty list"}), 400
    if len(msgs) > 500:
        return jsonify({"error":"Max 500 per request"}), 400
    return jsonify({"results":[classify_sms(s) for s in msgs],"count":len(msgs)})

@app.route("/confirm_category", methods=["POST"])
def confirm_category():
    """
    Teach the classifier from a user correction.
    Cash Withdrawals are NEVER used to train — the cash could be spent on anything.
    Only actual purchase transactions train the category model.
    """
    global feedback_count_since_retrain, store_memory, feedback_df
    data = request.get_json()
    if not data or "category" not in data:
        return jsonify({"error":"Missing category"}), 400

    store_name       = data.get("store") or data.get("description") or ""
    sms_text         = data.get("sms") or store_name
    category         = data["category"]
    transaction_type = str(data.get("transaction_type") or "Purchase").strip()

    # ── Block withdrawals from training the classifier ────────────────────────
    WITHDRAWAL_TYPES    = {"Cash Withdrawal", "Cash withdrawal", "ATM", "Withdrawal"}
    WITHDRAWAL_KEYWORDS = ["withdraw", "withdrawn", "cashout", "cash out",
                           "cash-out", "atm", "pay 2wallet", "pay2wallet"]
    sms_lower   = sms_text.lower()
    store_lower = str(store_name).lower()

    is_withdrawal = (
        transaction_type in WITHDRAWAL_TYPES or
        any(kw in sms_lower   for kw in WITHDRAWAL_KEYWORDS) or
        any(kw in store_lower for kw in WITHDRAWAL_KEYWORDS)
    )

    if is_withdrawal:
        print(f"  [SKIP] Withdrawal not trained: '{store_name}' "
              f"— cash destination unknown")
        return jsonify({
            "success":  True,
            "trained":  False,
            "reason":   "Cash withdrawals do not train the category classifier",
            "store":    store_name,
            "category": category,
        })
    # ── Confirmation threshold: store only learns after MIN_CONFIRMATIONS ──────
    # First 1-4 times: logged in feedback but NOT added to store_memory
    # 5th+ confirmation: added to store_memory -> auto-categorized from now on
    MIN_CONFIRMATIONS = 5

    if store_name and str(store_name).strip():
        key = str(store_name).upper().strip()

        # Count how many times this store+category combo has been confirmed
        confirmed_count = 1  # this confirmation
        if not feedback_df.empty:
            mask = (
                feedback_df.get('store', pd.Series()).str.upper().str.strip() == key
            ) & (
                feedback_df.get('category', pd.Series()) == category
            )
            confirmed_count += int(mask.sum())

        if confirmed_count >= MIN_CONFIRMATIONS:
            store_memory[key] = category
            print(f"  Memory learned: '{store_name}' -> '{category}' "
                  f"({confirmed_count} confirmations — now auto-categorizing)")
        else:
            remaining = MIN_CONFIRMATIONS - confirmed_count
            print(f"  Memory pending: '{store_name}' -> '{category}' "
                  f"({confirmed_count}/{MIN_CONFIRMATIONS} — needs {remaining} more)")

    new_row = pd.DataFrame([{
        "sms": sms_text, "category": category, "store": store_name,
        "bank": data.get("bank",""), "amount": data.get("amount",0),
        "confirmed_at": datetime.now().isoformat(),
    }])
    if os.path.exists(FEEDBACK_PATH):
        new_row.to_csv(FEEDBACK_PATH, mode="a", header=False, index=False)
    else:
        new_row.to_csv(FEEDBACK_PATH, index=False)
    
    # Update global feedback_df with the new row
    feedback_df = pd.concat([feedback_df, new_row], ignore_index=True)
    
    feedback_count_since_retrain += 1
    retrain_triggered = False
    if feedback_count_since_retrain >= RETRAIN_EVERY:
        feedback_count_since_retrain = 0
        threading.Thread(target=retrain_sms_with_feedback, daemon=True).start()
        retrain_triggered = True
    # Calculate confirmation progress for response
    conf_count = 1
    if not feedback_df.empty and store_name:
        k = str(store_name).upper().strip()
        mask = (
            feedback_df.get('store', pd.Series()).str.upper().str.strip() == k
        ) & (feedback_df.get('category', pd.Series()) == category)
        conf_count = int(mask.sum())

    learned = conf_count >= MIN_CONFIRMATIONS
    return jsonify({
        "success":             True,
        "store":               store_name,
        "category":            category,
        "learned":             learned,
        "confirmations":       conf_count,
        "confirmations_needed": max(0, MIN_CONFIRMATIONS - conf_count),
        "message": (
            f"✓ '{store_name}' will now always be categorized as {category}"
            if learned else
            f"Noted! {max(0, MIN_CONFIRMATIONS - conf_count)} more confirmations "
            f"needed before '{store_name}' is auto-categorized"
        ),
        "memory_size":         len(store_memory),
        "retrain_triggered":   retrain_triggered,
    })

CATEGORIES = [
    {"name": "Food",          "color": "#EF4444"},
    {"name": "Groceries",     "color": "#F59E0B"},
    {"name": "Transport",     "color": "#3B82F6"},
    {"name": "Entertainment", "color": "#8B5CF6"},
    {"name": "Health",        "color": "#10B981"},
    {"name": "Utilities",     "color": "#0DDCEF"},
    {"name": "Shopping",      "color": "#EC4899"},
    {"name": "Subscriptions", "color": "#06B6D4"},
    {"name": "Other",         "color": "#64748B"},
]

@app.route("/categories", methods=["GET"])
def get_categories():
    return jsonify({"categories": CATEGORIES})

@app.route("/model_stats", methods=["GET"])
def model_stats():
    fc, cc = 0, {}
    if os.path.exists(FEEDBACK_PATH):
        df = pd.read_csv(FEEDBACK_PATH)
        fc = len(df)
        cc = df["category"].value_counts().to_dict()
    return jsonify({"feedback_total":fc,"feedback_by_category":cc,
                    "store_memory":store_memory,"store_memory_size":len(store_memory),
                    "model_file":MODEL_PATH,"retrain_threshold":RETRAIN_EVERY})


# ─────────────────────────────────────────────────────────────────────────────
# STARTUP
# ─────────────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    print("=" * 60)
    print("  SmartSpend ML API — SMS Classifier")
    print("=" * 60)
    sms_model = load_or_train_sms_model()
    load_store_memory()
    print(f"\n  API ready on http://localhost:5000")
    print(f"  Store memory: {len(store_memory)} stores loaded")
    print(f"\n  Endpoints:")
    print(f"    POST /parse              — classify single SMS")
    print(f"    POST /parse_bulk         — classify up to 500 SMS")
    print(f"    POST /confirm_category   — teach ML from user correction")
    print(f"    GET  /categories         — list available categories")
    print(f"    GET  /model_stats        — feedback statistics")
    print(f"    GET  /health             — system status\n")
    app.run(debug=True, port=5000, use_reloader=False)