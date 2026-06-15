"""
EDI ML Training Pipeline
Trains XGBoost, Random Forest, LightGBM, and Ensemble models
Built by Kaushik Digital — Measuring Human Progress Through Energy Access
"""
import os
import json
import joblib
import numpy as np
import pandas as pd
from pathlib import Path
from datetime import datetime

from sklearn.model_selection import train_test_split, cross_val_score, KFold
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestRegressor, VotingRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import xgboost as xgb
import lightgbm as lgb

FEATURE_COLS = [
    "population", "households", "electricity_access_pct", "school_count",
    "hospital_count", "income_level", "internet_connectivity",
    "renewable_energy_pct", "grid_reliability", "night_light_intensity",
    "literacy_rate", "female_employment_rate", "carbon_emissions",
    "agricultural_productivity", "mobile_penetration", "road_connectivity",
    "water_access"
]
TARGET_COL = "eds_score"


def load_or_generate_data(data_dir: str = "app/ml/data") -> pd.DataFrame:
    data_path = Path(data_dir) / "village_dataset.csv"
    if not data_path.exists():
        print("📊 Generating synthetic dataset...")
        from app.ml.generate_data import generate_dataset, save_dataset
        df = generate_dataset(10000)
        save_dataset(df, data_dir)
    else:
        df = pd.read_csv(data_path)
    print(f"✅ Loaded {len(df)} records | EDS mean={df[TARGET_COL].mean():.2f}")
    return df


def prepare_features(df: pd.DataFrame):
    X = df[FEATURE_COLS].copy()
    # Feature engineering
    X["schools_per_1k"]  = X["school_count"]  / (X["population"] / 1000).clip(lower=0.1)
    X["hospitals_per_1k"] = X["hospital_count"] / (X["population"] / 1000).clip(lower=0.1)
    X["hh_size"]          = X["population"] / X["households"].clip(lower=1)
    X["electrification_gap"] = 100 - X["electricity_access_pct"]
    X["income_log"]       = np.log1p(X["income_level"])
    X["gender_literacy"]  = X["female_employment_rate"] * X["literacy_rate"] / 100
    X["digital_index"]    = (X["internet_connectivity"] + X["mobile_penetration"]) / 2
    X["clean_energy_idx"] = X["renewable_energy_pct"] / 100
    y = df[TARGET_COL]
    return X, y


def evaluate_model(name, model, X_test, y_test):
    y_pred = model.predict(X_test)
    mae  = mean_absolute_error(y_test, y_pred)
    rmse = np.sqrt(mean_squared_error(y_test, y_pred))
    r2   = r2_score(y_test, y_pred)
    acc  = max(0, 100 - mae)
    print(f"\n  📊 {name}:")
    print(f"     MAE={mae:.3f}  RMSE={rmse:.3f}  R²={r2:.4f}  Accuracy≈{acc:.1f}%")
    return {"mae": round(mae,4), "rmse": round(rmse,4), "r2": round(r2,4), "accuracy": round(acc,2)}


def train_all(data_dir="app/ml/data", models_dir="app/ml/saved_models"):
    print("\n" + "="*60)
    print("⚡ EDI ML Training Pipeline | Built by Kaushik Digital")
    print("="*60)

    Path(models_dir).mkdir(parents=True, exist_ok=True)

    # Load data
    df = load_or_generate_data(data_dir)
    X, y = prepare_features(df)

    # Train/val/test split
    X_train, X_temp, y_train, y_temp = train_test_split(X, y, test_size=0.3, random_state=42)
    X_val,   X_test, y_val,   y_test = train_test_split(X_temp, y_temp, test_size=0.5, random_state=42)
    print(f"\n📁 Split: train={len(X_train)}  val={len(X_val)}  test={len(X_test)}")

    # Scale features
    scaler = StandardScaler()
    X_train_s = scaler.fit_transform(X_train)
    X_val_s   = scaler.transform(X_val)
    X_test_s  = scaler.transform(X_test)
    joblib.dump(scaler, f"{models_dir}/feature_scaler.pkl")

    results = {}

    # ── 1. XGBoost ─────────────────────────────────────────────
    print("\n🔵 Training XGBoost Regressor...")
    xgb_model = xgb.XGBRegressor(
        n_estimators=500,
        learning_rate=0.05,
        max_depth=6,
        min_child_weight=3,
        subsample=0.8,
        colsample_bytree=0.8,
        gamma=0.1,
        reg_alpha=0.1,
        reg_lambda=1.0,
        random_state=42,
        n_jobs=-1,
        eval_metric="rmse",
        early_stopping_rounds=30,
    )
    xgb_model.fit(X_train_s, y_train,
                  eval_set=[(X_val_s, y_val)],
                  verbose=False)
    joblib.dump(xgb_model, f"{models_dir}/xgboost_eds.pkl")
    results["xgboost"] = evaluate_model("XGBoost", xgb_model, X_test_s, y_test)

    # ── 2. Random Forest ────────────────────────────────────────
    print("\n🟢 Training Random Forest...")
    rf_model = RandomForestRegressor(
        n_estimators=300,
        max_depth=12,
        min_samples_split=5,
        min_samples_leaf=2,
        max_features="sqrt",
        bootstrap=True,
        random_state=42,
        n_jobs=-1,
    )
    rf_model.fit(X_train_s, y_train)
    joblib.dump(rf_model, f"{models_dir}/random_forest_eds.pkl")
    results["random_forest"] = evaluate_model("Random Forest", rf_model, X_test_s, y_test)

    # ── 3. LightGBM ────────────────────────────────────────────
    print("\n🟡 Training LightGBM...")
    lgb_model = lgb.LGBMRegressor(
        n_estimators=500,
        learning_rate=0.05,
        max_depth=8,
        num_leaves=31,
        min_child_samples=20,
        subsample=0.8,
        colsample_bytree=0.8,
        reg_alpha=0.1,
        reg_lambda=0.1,
        random_state=42,
        n_jobs=-1,
        verbose=-1,
    )
    lgb_model.fit(
        X_train_s, y_train,
        eval_set=[(X_val_s, y_val)],
        callbacks=[lgb.early_stopping(30), lgb.log_evaluation(-1)]
    )
    joblib.dump(lgb_model, f"{models_dir}/lightgbm_eds.pkl")
    results["lightgbm"] = evaluate_model("LightGBM", lgb_model, X_test_s, y_test)

    # ── 4. Ensemble (Voting Regressor) ──────────────────────────
    print("\n🔴 Training Ensemble (Voting Regressor)...")
    ensemble = VotingRegressor(
        estimators=[
            ("xgb", xgb.XGBRegressor(n_estimators=300, learning_rate=0.05, max_depth=5, random_state=42, n_jobs=-1, verbosity=0)),
            ("rf",  RandomForestRegressor(n_estimators=200, max_depth=10, random_state=42, n_jobs=-1)),
            ("lgb", lgb.LGBMRegressor(n_estimators=300, learning_rate=0.05, max_depth=6, random_state=42, n_jobs=-1, verbose=-1)),
        ],
        weights=[0.40, 0.25, 0.35],
        n_jobs=-1,
    )
    ensemble.fit(X_train_s, y_train)
    joblib.dump(ensemble, f"{models_dir}/ensemble_eds.pkl")
    results["ensemble"] = evaluate_model("Ensemble", ensemble, X_test_s, y_test)

    # ── Feature Importance ──────────────────────────────────────
    importance = dict(zip(X.columns.tolist(), rf_model.feature_importances_.tolist()))
    importance_sorted = dict(sorted(importance.items(), key=lambda x: x[1], reverse=True))

    # ── Save metadata ───────────────────────────────────────────
    metadata = {
        "trained_at": datetime.now().isoformat(),
        "built_by": "Kaushik Digital",
        "platform": "Energy Dignity Index",
        "n_samples": len(df),
        "n_features": len(X.columns),
        "features": X.columns.tolist(),
        "results": results,
        "feature_importance": importance_sorted,
        "best_model": min(results, key=lambda k: results[k]["mae"]),
    }
    with open(f"{models_dir}/model_metadata.json", "w") as f:
        json.dump(metadata, f, indent=2)

    # ── Summary ─────────────────────────────────────────────────
    print("\n" + "="*60)
    print("✅ Training Complete!")
    print("="*60)
    for name, m in results.items():
        print(f"  {name:20s}  R²={m['r2']:.4f}  MAE={m['mae']:.3f}  Accuracy≈{m['accuracy']:.1f}%")
    best = metadata["best_model"]
    print(f"\n🏆 Best Model: {best} (MAE={results[best]['mae']:.3f})")
    print(f"\n📁 Models saved to: {models_dir}/")
    print("="*60)

    return results


if __name__ == "__main__":
    train_all()
