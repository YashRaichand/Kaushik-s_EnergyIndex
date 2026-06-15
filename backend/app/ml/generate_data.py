"""
Synthetic Dataset Generator for EDI ML Pipeline
Generates realistic village-level energy access data for India
Built by Kaushik Digital
"""
import numpy as np
import pandas as pd
from pathlib import Path
import json

np.random.seed(42)

STATES = [
    ("Uttar Pradesh", 0.3), ("Bihar", 0.25), ("Jharkhand", 0.28),
    ("Odisha", 0.35), ("Madhya Pradesh", 0.40), ("Rajasthan", 0.45),
    ("West Bengal", 0.50), ("Assam", 0.42), ("Chhattisgarh", 0.38),
    ("Maharashtra", 0.72), ("Gujarat", 0.75), ("Karnataka", 0.70),
    ("Tamil Nadu", 0.80), ("Kerala", 0.88), ("Andhra Pradesh", 0.65),
    ("Telangana", 0.68), ("Punjab", 0.78), ("Haryana", 0.74),
    ("Uttarakhand", 0.62), ("Himachal Pradesh", 0.71),
]


def compute_eds(row: dict) -> float:
    def norm(v, lo, hi): return max(0.0, min(1.0, (v - lo) / (hi - lo)))
    schools_per_1k = row["school_count"] / max(row["population"] / 1000, 0.1)
    hosp_per_1k    = row["hospital_count"] / max(row["population"] / 1000, 0.1)
    edu = norm(row["literacy_rate"], 20, 100) * 0.50 + norm(schools_per_1k, 0, 5) * 0.30 + norm(row["internet_connectivity"], 0, 1) * 0.20
    hlt = norm(hosp_per_1k, 0, 2) * 0.50 + norm(row["water_access"], 0, 1) * 0.30 + norm(row["electricity_access_pct"], 0, 100) * 0.20
    eco = norm(row["income_level"], 20000, 500000) * 0.40 + norm(row["road_connectivity"], 0, 1) * 0.30 + norm(row["agricultural_productivity"], 0, 1) * 0.30
    wom = norm(row["female_employment_rate"], 10, 80) * 0.60 + norm(row["literacy_rate"], 20, 100) * 0.40
    dig = norm(row["internet_connectivity"], 0, 1) * 0.40 + norm(row["mobile_penetration"], 0, 1) * 0.40 + norm(row["renewable_energy_pct"] / 100, 0, 1) * 0.20
    car = norm(row["renewable_energy_pct"] / 100, 0, 1) * 0.60 + norm(1 - row["carbon_emissions"] / 10000, 0, 1) * 0.40
    eds = 0.25*edu + 0.20*hlt + 0.20*eco + 0.15*wom + 0.10*dig + 0.10*car
    return round(eds * 100, 4)


def generate_dataset(n_samples: int = 10000) -> pd.DataFrame:
    records = []
    for i in range(n_samples):
        state, base_dev = STATES[i % len(STATES)]
        noise = lambda scale=0.1: np.random.normal(0, scale)
        dev = max(0.1, min(0.95, base_dev + noise(0.12)))

        pop = int(np.random.lognormal(7.5, 0.8))
        pop = max(200, min(50000, pop))
        hh  = int(pop / np.random.uniform(3.5, 5.5))

        row = {
            "village_id":              i + 1,
            "state":                   state,
            "population":              pop,
            "households":              hh,
            "electricity_access_pct":  max(0, min(100, dev * 100 + np.random.normal(0, 8))),
            "school_count":            max(0, int(pop / 800 * dev + np.random.randint(0, 3))),
            "hospital_count":          max(0, int(pop / 5000 * dev + np.random.randint(0, 2))),
            "income_level":            max(15000, dev * 400000 + np.random.normal(0, 20000)),
            "internet_connectivity":   max(0, min(1, dev * 0.9 + noise(0.08))),
            "renewable_energy_pct":    max(0, min(100, dev * 60 + np.random.normal(0, 10))),
            "grid_reliability":        max(0, min(1, dev * 0.95 + noise(0.07))),
            "night_light_intensity":   max(0, min(1, dev * 0.8 + noise(0.10))),
            "literacy_rate":           max(20, min(100, dev * 90 + np.random.normal(0, 8))),
            "female_employment_rate":  max(5, min(80, dev * 70 + np.random.normal(0, 10))),
            "carbon_emissions":        max(50, (1 - dev) * 8000 + np.random.normal(0, 500)),
            "agricultural_productivity": max(0, min(1, dev * 0.85 + noise(0.10))),
            "mobile_penetration":      max(0, min(1, dev * 0.95 + noise(0.06))),
            "road_connectivity":       max(0, min(1, dev * 0.90 + noise(0.08))),
            "water_access":            max(0, min(1, dev * 0.92 + noise(0.07))),
        }
        row["eds_score"]             = compute_eds(row)
        row["development_score"]     = round(row["eds_score"] * 0.9 + np.random.normal(0, 2), 2)
        row["future_impact_score"]   = round(min(100, row["eds_score"] * 1.3 + np.random.normal(0, 3)), 2)
        row["investment_priority"]   = round(100 - row["eds_score"] + np.random.normal(0, 2), 2)
        row["expected_roi"]          = round(max(0.5, (100 - row["eds_score"]) / 15 + np.random.normal(0, 0.3)), 2)
        records.append(row)

    df = pd.DataFrame(records)
    print(f"✅ Generated {len(df)} village records")
    print(f"   EDS range: {df['eds_score'].min():.1f} – {df['eds_score'].max():.1f}")
    print(f"   EDS mean:  {df['eds_score'].mean():.1f}")
    return df


def save_dataset(df: pd.DataFrame, output_dir: str = "app/ml/data"):
    path = Path(output_dir)
    path.mkdir(parents=True, exist_ok=True)
    df.to_csv(path / "village_dataset.csv", index=False)
    # Save sample for testing
    df.sample(min(100, len(df))).to_csv(path / "village_sample.csv", index=False)
    # Save feature stats
    stats = df.describe().to_dict()
    with open(path / "feature_stats.json", "w") as f:
        json.dump(stats, f, indent=2, default=str)
    print(f"✅ Dataset saved to {output_dir}/")
    return path / "village_dataset.csv"


if __name__ == "__main__":
    df = generate_dataset(10000)
    save_dataset(df)
    print("\n📊 Sample records:")
    print(df[["state", "population", "electricity_access_pct", "literacy_rate", "eds_score"]].head(10).to_string())
