"""
Evaluate the budget prediction model and save actual R² metrics.
This script loads the trained model, tests it against REAL user data,
and saves the real R² score to model_metrics.json.

Uses real dataset from: C:/Users/lenyo/OneDrive/Desktop/Smart Budget_ML/budget_dataset.csv

Run this script whenever the model is retrained:
  python evaluate_model.py
"""

import json
import os
import numpy as np
import joblib
import pandas as pd

# Get script directory
script_dir = os.path.dirname(os.path.abspath(__file__))

# Path to real dataset
dataset_path = r"C:\Users\lenyo\OneDrive\Desktop\Smart Budget_ML\budget_dataset.csv"

# Load model and scaler
model_path = os.path.join(script_dir, 'budget_model.pkl')
scaler_path = os.path.join(script_dir, 'scaler.pkl')
metrics_path = os.path.join(script_dir, 'model_metrics.json')

print("Loading model and scaler...")
model = joblib.load(model_path)
scaler = joblib.load(scaler_path)
print("[OK] Model and scaler loaded successfully")

# Load real dataset
print(f"\nLoading real dataset from: {dataset_path}")
if not os.path.exists(dataset_path):
    print("[ERROR] Dataset not found!")
    print("Please ensure the dataset file exists at the specified path.")
    exit(1)

df = pd.read_csv(dataset_path)
print(f"[OK] Loaded {len(df)} user records with 5 months of data each")

# The model predicts month5 deviation based on months 1-4 deviations
# Features: [month1Deviation, month2Deviation, month3Deviation, month4Deviation]
# Target: month5Deviation (what we're trying to predict)

print(f"\nPreparing test data...")
print(f"   Features: month1-month4 deviations")
print(f"   Target: month5 deviation (to predict)")

# Extract features (first 4 months of deviations)
X_test = df[['month1Deviation', 'month2Deviation', 'month3Deviation', 'month4Deviation']].values

# Extract actual target (month5 deviation)
y_actual = df['month5Deviation'].values

print(f"\nDataset Statistics:")
print(f"   Total samples: {len(df)}")
print(f"   Feature range: M{X_test.min():.0f} to M{X_test.max():.0f}")
print(f"   Target range:  M{y_actual.min():.0f} to M{y_actual.max():.0f}")
print(f"   Mean deviation: M{y_actual.mean():.2f}")
print(f"   Std deviation:  M{y_actual.std():.2f}")

# Scale features
print(f"\nScaling features and making predictions...")
X_test_scaled = scaler.transform(X_test)

# Make predictions
y_predicted = model.predict(X_test_scaled)

# Calculate metrics
from sklearn.metrics import r2_score, mean_absolute_error, mean_squared_error

r2 = r2_score(y_actual, y_predicted)
mae = mean_absolute_error(y_actual, y_predicted)
rmse = np.sqrt(mean_squared_error(y_actual, y_predicted))

# Calculate MAPE (Mean Absolute Percentage Error)
# Avoid division by zero
mask = y_actual != 0
mape = np.mean(np.abs((y_actual[mask] - y_predicted[mask]) / y_actual[mask])) * 100

print(f"\nModel Evaluation Results:")
print(f"  R² Score:  {r2:.4f}")
print(f"  MAE:       M{mae:.2f}")
print(f"  RMSE:      M{rmse:.2f}")
print(f"  MAPE:      {mape:.2f}%")

# Show first 20 predictions vs actual
print(f"\nPrediction Details (first 20 samples):")
print(f"  {'Actual':>8}  {'Predicted':>10}  {'Error':>8}")
print(f"  {'-'*8}  {'-'*10}  {'-'*8}")
for actual, predicted in zip(y_actual[:20], y_predicted[:20]):
    error = predicted - actual
    print(f"  M{actual:>6.0f}  M{predicted:>8.0f}  M{error:+>6.0f}")

# Save metrics to file
metrics = {
    "r2_score": round(float(r2), 4),
    "mae": round(float(mae), 2),
    "rmse": round(float(rmse), 2),
    "mape": round(float(mape), 2),
    "test_samples": len(df),
    "evaluated_at": __import__('datetime').datetime.now().isoformat(),
    "model_type": "SGDRegressor",
    "feature_count": 4,
    "features": ["month1_deviation", "month2_deviation", "month3_deviation", "month4_deviation"],
    "dataset": "Real user spending data (500 users, 5 months each)"
}

print(f"\nSaving metrics to {metrics_path}...")
with open(metrics_path, 'w') as f:
    json.dump(metrics, f, indent=2)

print("[OK] Model metrics saved successfully!")
print(f"\nR² Score Interpretation:")
if r2 >= 0.9:
    print("  EXCELLENT - Model explains 90%+ of variance")
elif r2 >= 0.7:
    print("  GOOD - Model explains 70-90% of variance")
elif r2 >= 0.5:
    print("  MODERATE - Model explains 50-70% of variance")
elif r2 >= 0.3:
    print("  FAIR - Model explains 30-50% of variance")
else:
    print("  POOR - Model explains <30% of variance, needs improvement")
