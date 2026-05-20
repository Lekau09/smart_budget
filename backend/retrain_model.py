"""
Standalone SMS classifier retraining script.
Run via:  python backend/retrain_model.py
or:       make retrain-ml
"""
import os, sys, pandas as pd, joblib
from sklearn.pipeline import Pipeline, FeatureUnion
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import SGDClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report
from datetime import datetime

BASE_DIR     = os.path.dirname(os.path.abspath(__file__))
DATASET_PATH = os.path.join(BASE_DIR, "sms_dataset_v2.csv")
MODEL_PATH   = os.path.join(BASE_DIR, "sms_classifier_v2.pkl")
SAMPLE_SIZE  = 500_000

print(f"[{datetime.now():%H:%M:%S}] Loading dataset from {DATASET_PATH}")
if not os.path.exists(DATASET_PATH):
    print("ERROR: Dataset not found. Run generate_dataset.py first.")
    sys.exit(1)

df = pd.read_csv(DATASET_PATH).dropna(subset=["sms", "category"])
df = df[df["category"].str.strip() != ""].reset_index(drop=True)
print(f"  Full dataset: {len(df):,} rows  |  Categories: {sorted(df['category'].unique())}")

if len(df) > SAMPLE_SIZE:
    df = df.sample(n=SAMPLE_SIZE, random_state=42).reset_index(drop=True)
    print(f"  Sampled {SAMPLE_SIZE:,} rows for training")

print(f"\n  Category distribution:")
for cat, cnt in df["category"].value_counts().items():
    print(f"    {cat:<16} {cnt:>8,}")

X_train, X_test, y_train, y_test = train_test_split(
    df["sms"], df["category"], test_size=0.1, random_state=42, stratify=df["category"])

word_tfidf = TfidfVectorizer(
    analyzer="word", ngram_range=(1, 3),
    max_features=60_000, sublinear_tf=True,
    min_df=2, strip_accents="unicode",
)
char_tfidf = TfidfVectorizer(
    analyzer="char_wb", ngram_range=(3, 5),
    max_features=30_000, sublinear_tf=True,
    min_df=3, strip_accents="unicode",
)
features  = FeatureUnion([("word", word_tfidf), ("char", char_tfidf)])
clf       = SGDClassifier(
    loss="modified_huber", penalty="l2", alpha=1e-4,
    max_iter=200, random_state=42, n_jobs=1, class_weight="balanced",
)
pipeline  = Pipeline([("features", features), ("clf", clf)])

print(f"\n[{datetime.now():%H:%M:%S}] Training on {len(X_train):,} samples...")
pipeline.fit(X_train, y_train)

y_pred = pipeline.predict(X_test)
acc    = (y_pred == y_test).mean()
print(f"[{datetime.now():%H:%M:%S}] Accuracy: {acc*100:.1f}%  |  Test samples: {len(X_test):,}\n")
print(classification_report(y_test, y_pred))

joblib.dump(pipeline, MODEL_PATH)
print(f"[{datetime.now():%H:%M:%S}] Model saved to {MODEL_PATH}")
print("Restart the ML API (make start-ml) to load the new model.")
