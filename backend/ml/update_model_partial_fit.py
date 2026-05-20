"""
Update SGDRegressor Model with Partial Fit (Online Learning)

This script:
1. Loads the existing SGDRegressor model and scaler
2. Loads historical dataset (budget_dataset.csv)
3. Adds new month-end data from users (with REAL 4-month deviation history)
4. Performs partial_fit to update the model incrementally
5. Recalculates R² score on combined dataset using the EXISTING scaler
6. Saves updated model and metrics (scaler is NEVER replaced)

IMPORTANT — Two critical invariants must be maintained:
  (a) The StandardScaler is fitted ONCE during initial training and NEVER
      refitted.  All new data — training, evaluation, and prediction — must
      be transformed using the frozen mu and sigma from the original scaler.
  (b) The feature vector for each new sample must contain the user's ACTUAL
      deviations from months N-4 through N-1.  These are real historical
      values, not simulated or proportional estimates.

Run via update_model_month_end.php or manually:
  python update_model_partial_fit.py <input_json_file>

Input JSON format (new_data entries):
{
  "dataset_path": "...",
  "model_path": "...",
  "scaler_path": "...",
  "new_data": [
    {
      "month1_deviation": 400.00,
      "month2_deviation": -100.00,
      "month3_deviation": 400.00,
      "month4_deviation": -300.00,
      "month5_deviation": 500.00
    },
    ...
  ]
}

Each entry must contain ALL FIVE deviation values.  The first four are the
feature vector (X); the fifth is the target (y).  These must be the user's
actual, recorded deviations — not estimates, not proportions.
"""

import json
import os
import sys
import numpy as np
import pandas as pd
import joblib
from sklearn.linear_model import SGDRegressor
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import r2_score, mean_absolute_error, mean_squared_error
from datetime import datetime

# Suppress warnings
import warnings
warnings.filterwarnings('ignore', category=UserWarning)
warnings.filterwarnings('ignore', category=DeprecationWarning)

# Get script directory
script_dir = os.path.dirname(os.path.abspath(__file__))

# ─── Read input ───────────────────────────────────────────────────────────────
if len(sys.argv) < 2:
    print("[ERROR] No input file provided")
    print("Usage: python update_model_partial_fit.py <input_json_file>")
    sys.exit(1)

input_file = sys.argv[1]
with open(input_file, 'r') as f:
    input_data = json.loads(f.read())

dataset_path   = input_data['dataset_path']
model_path     = input_data['model_path']
scaler_path    = input_data['scaler_path']
new_month_data = input_data['new_data']

print("=" * 50)
print("Month-End Model Update (Online Learning)")
print("=" * 50)
print()

# ─── Step 1: Load existing model and scaler ───────────────────────────────────
print("Loading existing model and scaler...")
if not os.path.exists(model_path) or not os.path.exists(scaler_path):
    print("[ERROR] Model or scaler files not found!")
    print("Expected:")
    print(f"  {model_path}")
    print(f"  {scaler_path}")
    sys.exit(1)

model  = joblib.load(model_path)
scaler = joblib.load(scaler_path)

print("[OK] Model and scaler loaded")
print(f"  Model type:  {type(model).__name__}")
print(f"  Scaler mean:  {np.round(scaler.mean_, 2)}")
print(f"  Scaler scale: {np.round(scaler.scale_, 2)}")
print()

# ─── Step 2: Load historical dataset ─────────────────────────────────────────
print("Loading historical dataset...")
if not os.path.exists(dataset_path):
    print(f"[ERROR] Dataset not found: {dataset_path}")
    sys.exit(1)

hist_df = pd.read_csv(dataset_path)
print(f"[OK] Loaded {len(hist_df)} historical records")
print(f"  Features: month1-month4 deviations")
print(f"  Target:   month5 deviation")
print()

# ─── Step 3: Prepare new data with REAL deviation history ─────────────────────
print("Preparing new month-end data...")
print(f"  New samples to add: {len(new_month_data)}")

FEATURE_COLS = ['month1_deviation', 'month2_deviation',
                'month3_deviation', 'month4_deviation']
TARGET_COL   = 'month5_deviation'

REQUIRED_FIELDS = FEATURE_COLS + [TARGET_COL]

new_features = []
new_targets  = []
rejected     = []

for i, entry in enumerate(new_month_data):
    # Validate: all 5 deviation fields must be present and numeric
    missing = [f for f in REQUIRED_FIELDS if f not in entry]
    if missing:
        rejected.append(f"  Entry {i}: missing fields {missing}")
        continue

    try:
        feats = [float(entry[f]) for f in FEATURE_COLS]
        tgt   = float(entry[TARGET_COL])
    except (ValueError, TypeError) as e:
        rejected.append(f"  Entry {i}: non-numeric value — {e}")
        continue

    new_features.append(feats)
    new_targets.append(tgt)

if rejected:
    print("  Rejected entries (missing or invalid fields):")
    for r in rejected:
        print(r)
    print()

if not new_features:
    print("[ERROR] No valid new data entries. Aborting update.")
    sys.exit(1)

X_new = np.array(new_features)
y_new = np.array(new_targets)

print(f"  New feature matrix shape: {X_new.shape}")
print(f"  New target range:         M{y_new.min():.0f} to M{y_new.max():.0f}")
print(f"  Feature stats:")
for j, col in enumerate(FEATURE_COLS):
    print(f"    {col}: mean=M{X_new[:,j].mean():.0f}, "
          f"std=M{X_new[:,j].std():.0f}")
print()

# ─── Step 4: Scale new features using the EXISTING (frozen) scaler ────────────
# FIX: Previously this script created a NEW StandardScaler and fitted it on
# the combined dataset, then saved it — overwriting the original scaler.
# That was wrong because the SGD model's weights were trained on features
# scaled with the ORIGINAL mu and sigma.  Changing the scaler changes the
# feature space, making the existing weights invalid.
#
# CORRECT APPROACH: Always use scaler.transform() with the frozen scaler.
print("Scaling new features (using EXISTING frozen scaler)...")
X_new_scaled = scaler.transform(X_new)
print("[OK] Features scaled — scaler NOT refitted")
print(f"  Scaled feature means (should be near 0 if new data matches "
      f"original distribution):")
for j, col in enumerate(FEATURE_COLS):
    print(f"    {col}: {X_new_scaled[:,j].mean():.4f}")
print()

# ─── Step 5: Update model weights with partial_fit ────────────────────────────
print("Updating model with partial_fit (online learning)...")
# Run 10 epochs on the new data to give it meaningful influence without
# catastrophically overriding the 50,000 gradient steps from initial training.
N_EPOCHS = 10
for epoch in range(N_EPOCHS):
    model.partial_fit(X_new_scaled, y_new)

print(f"[OK] Model updated — {N_EPOCHS} partial_fit epochs on {len(X_new)} "
      f"sample(s)")
print()

# ─── Step 6: Evaluate on combined dataset using the EXISTING scaler ───────────
# FIX: Previously this script created a NEW scaler, fitted it on the combined
# data, and evaluated the model using that new scaler.  This produced an
# artificially optimistic R² because the fresh scaler perfectly matched the
# combined dataset's distribution, while the model's weights were optimised
# for the ORIGINAL scaling.
#
# CORRECT APPROACH: Transform the combined features with the ORIGINAL scaler,
# then evaluate.  This tells us how well the updated model performs when
# features are scaled consistently with training.

print("Recalculating R² score on combined dataset (using EXISTING scaler)...")

# Historical features and target
X_hist = hist_df[['month1Deviation', 'month2Deviation',
                   'month3Deviation', 'month4Deviation']].values
y_hist = hist_df['month5Deviation'].values

# Combine historical + new
X_combined = np.vstack([X_hist, X_new])
y_combined = np.concatenate([y_hist, y_new])

print(f"  Combined dataset size: {len(X_combined)} samples")
print(f"  Historical:            {len(X_hist)} samples")
print(f"  New:                   {len(X_new)} samples")

# Scale combined features using the FROZEN scaler (never refit)
X_combined_scaled = scaler.transform(X_combined)

# Evaluate the updated model
y_combined_pred = model.predict(X_combined_scaled)

r2   = r2_score(y_combined, y_combined_pred)
mae  = mean_absolute_error(y_combined, y_combined_pred)
rmse = np.sqrt(mean_squared_error(y_combined, y_combined_pred))

# Calculate MAPE (avoid division by zero)
mask = y_combined != 0
mape = np.mean(np.abs((y_combined[mask] - y_combined_pred[mask])
                      / y_combined[mask])) * 100

print(f"\nUpdated Model Performance:")
print(f"  R² Score:  {r2:.4f}")
print(f"  MAE:       M{mae:.2f}")
print(f"  RMSE:      M{rmse:.2f}")
print(f"  MAPE:      {mape:.2f}%")
print()

# ─── Step 7: Save updated model (scaler is NOT replaced) ──────────────────────
print("Saving updated model...")
joblib.dump(model, model_path)
# NOTE: We do NOT save the scaler here.  The original scaler was loaded in
# Step 1, used for transforming new data, and remains unchanged.  Saving it
# again would be redundant (it hasn't changed) and could accidentally
# overwrite it with a different scaler if the code were modified.
print(f"[OK] Model saved to {model_path}")
print(f"     Scaler unchanged (frozen at initial training)")
print()

# ─── Step 8: Save updated metrics ─────────────────────────────────────────────
metrics = {
    "r2_score":              round(float(r2), 4),
    "mae":                   round(float(mae), 2),
    "rmse":                  round(float(rmse), 2),
    "mape":                  round(float(mape), 2),
    "test_samples":          int(len(X_combined)),
    "historical_samples":    int(len(X_hist)),
    "new_samples":           int(len(X_new)),
    "evaluated_at":          datetime.now().isoformat(),
    "model_type":            "SGDRegressor (with online learning)",
    "feature_count":         4,
    "features":              ["month1_deviation", "month2_deviation",
                               "month3_deviation", "month4_deviation"],
    "dataset":               (f"Combined: {len(X_hist)} historical + "
                               f"{len(X_new)} new month-end samples"),
    "scaler_status":         "Frozen from initial training — NOT refitted",
    "partial_fit_epochs":    N_EPOCHS,
}

metrics_path = os.path.join(script_dir, 'model_metrics.json')
print(f"Saving metrics to {metrics_path}...")
with open(metrics_path, 'w') as f:
    json.dump(metrics, f, indent=2)

print("[OK] Metrics saved successfully!")
print()

# ─── Interpretation ───────────────────────────────────────────────────────────
print("=" * 50)
print("R² Score Interpretation:")
print("=" * 50)
if r2 >= 0.9:
    print("EXCELLENT — Model explains 90%+ of variance")
elif r2 >= 0.7:
    print("GOOD — Model explains 70-90% of variance")
elif r2 >= 0.5:
    print("MODERATE — Model explains 50-70% of variance")
elif r2 >= 0.3:
    print("FAIR — Model explains 30-50% of variance")
else:
    print("POOR — Model explains <30% of variance, needs improvement")

print()
print("Note: R² will fluctuate as the model learns from new data.")
print("This is NORMAL and EXPECTED for online learning systems.")
print("The model adapts to changing user spending patterns over time.")
print()

# ─── Validation summary ───────────────────────────────────────────────────────
print("=" * 50)
print("Update Summary:")
print("=" * 50)
print(f"  Samples added:     {len(X_new)}")
print(f"  Samples rejected:  {len(rejected)}")
print(f"  Scaler refitted:   NO (frozen from initial training)")
print(f"  Model retrained:   NO (partial_fit only, {N_EPOCHS} epochs)")
print(f"  R² change:         See model_metrics.json for baseline comparison")
print()
