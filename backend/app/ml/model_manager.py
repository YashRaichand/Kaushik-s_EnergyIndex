"""
ML Model Manager - Loads XGBoost, RandomForest, LightGBM, Ensemble
Built by Kaushik Digital
"""
import os
import joblib
import numpy as np
import structlog
from pathlib import Path
from app.core.config import settings

logger = structlog.get_logger()

FEATURE_NAMES = [
    "population", "households", "electricity_access_pct", "school_count",
    "hospital_count", "income_level", "internet_connectivity", "renewable_energy_pct",
    "grid_reliability", "night_light_intensity", "literacy_rate",
    "female_employment_rate", "carbon_emissions", "agricultural_productivity",
    "mobile_penetration", "road_connectivity", "water_access"
]


class ModelManager:
    def __init__(self):
        self.models = {}
        self.scalers = {}
        self.model_dir = Path(settings.ML_MODELS_DIR)
        self.model_dir.mkdir(parents=True, exist_ok=True)

    async def load_models(self):
        model_files = {
            "xgboost":       "xgboost_eds.pkl",
            "random_forest": "random_forest_eds.pkl",
            "lightgbm":      "lightgbm_eds.pkl",
            "ensemble":      "ensemble_eds.pkl",
            "scaler":        "feature_scaler.pkl",
        }
        for name, filename in model_files.items():
            path = self.model_dir / filename
            if path.exists():
                try:
                    obj = joblib.load(path)
                    if name == "scaler":
                        self.scalers["standard"] = obj
                    else:
                        self.models[name] = obj
                    logger.info(f"✅ Loaded model: {name}")
                except Exception as e:
                    logger.warning(f"⚠️  Could not load {name}: {e}")
            else:
                logger.warning(f"⚠️  Model file not found: {path} — using fallback")

    def predict(self, features: dict) -> dict:
        """Run prediction using ensemble or fallback to formula."""
        feature_vector = np.array([[features.get(f, 0.0) for f in FEATURE_NAMES]])

        # Scale features
        if "standard" in self.scalers:
            try:
                feature_vector = self.scalers["standard"].transform(feature_vector)
            except Exception:
                pass

        predictions = {}

        # Try each model
        for name, model in self.models.items():
            try:
                pred = float(model.predict(feature_vector)[0])
                predictions[name] = max(0.0, min(100.0, pred))
            except Exception as e:
                logger.warning(f"Model {name} prediction failed: {e}")

        if not predictions:
            # Fallback: formula-based
            return self._formula_fallback(features)

        # Ensemble average (weighted)
        weights = {"xgboost": 0.35, "random_forest": 0.25, "lightgbm": 0.30, "ensemble": 0.10}
        weighted_sum = sum(predictions.get(k, 0) * w for k, w in weights.items())
        total_weight = sum(w for k, w in weights.items() if k in predictions)
        eds = weighted_sum / total_weight if total_weight > 0 else list(predictions.values())[0]

        return {
            "eds_score": round(eds, 2),
            "model_predictions": predictions,
            "model_used": "ensemble" if len(predictions) > 1 else list(predictions.keys())[0],
            "confidence": round(min(98, 70 + eds * 0.25), 1),
        }

    def _formula_fallback(self, f: dict) -> dict:
        """EDS formula when models not available."""
        def norm(v, lo, hi): return max(0, min(1, (v - lo) / (hi - lo)))
        edu = norm(f.get("literacy_rate", 60), 20, 100) * 0.5 + norm(f.get("school_count", 2) / max(f.get("population", 1000) / 1000, 0.1), 0, 5) * 0.5
        hlt = norm(f.get("hospital_count", 1) / max(f.get("population", 1000) / 1000, 0.1), 0, 2) * 0.7 + norm(f.get("water_access", 0.5), 0, 1) * 0.3
        eco = norm(f.get("income_level", 60000), 20000, 500000) * 0.6 + norm(f.get("road_connectivity", 0.5), 0, 1) * 0.4
        wom = norm(f.get("female_employment_rate", 30), 10, 80)
        dig = norm(f.get("internet_connectivity", 0.2), 0, 1) * 0.6 + norm(f.get("mobile_penetration", 0.4), 0, 1) * 0.4
        car = norm(f.get("renewable_energy_pct", 15) / 100, 0, 1)
        eds = (0.25 * edu + 0.20 * hlt + 0.20 * eco + 0.15 * wom + 0.10 * dig + 0.10 * car) * 100
        return {
            "eds_score": round(eds, 2),
            "model_predictions": {"formula": eds},
            "model_used": "formula_fallback",
            "confidence": 72.0,
        }
