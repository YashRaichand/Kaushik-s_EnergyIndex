"""
ML Pipeline Tests — Built by Kaushik Digital
"""
import pytest
import numpy as np


def test_eds_formula_bounds():
    """EDS should be bounded 0-100 for all inputs."""
    from app.api.v1.endpoints.predictions import compute_eds_components, VillageSimulateRequest

    extremes = [
        dict(population=200, households=50, electricity_access_pct=0, school_count=0,
             hospital_count=0, income_level=10000, internet_connectivity=0,
             renewable_energy_pct=0, grid_reliability=0, night_light_intensity=0,
             literacy_rate=10, female_employment_rate=5, carbon_emissions=20000,
             agricultural_productivity=0, mobile_penetration=0, road_connectivity=0,
             water_access=0, village_name="Low", state="Test"),
        dict(population=50000, households=10000, electricity_access_pct=100, school_count=20,
             hospital_count=10, income_level=1000000, internet_connectivity=1,
             renewable_energy_pct=100, grid_reliability=1, night_light_intensity=1,
             literacy_rate=100, female_employment_rate=80, carbon_emissions=0,
             agricultural_productivity=1, mobile_penetration=1, road_connectivity=1,
             water_access=1, village_name="High", state="Test"),
    ]
    for params in extremes:
        req = VillageSimulateRequest(**params)
        result = compute_eds_components(req)
        assert 0 <= result["eds"] <= 100
        for component in ["education", "healthcare", "economic", "women", "digital", "carbon"]:
            assert 0 <= result[component] <= 100


def test_eds_weights_sum_to_one():
    """Default EDS weights must sum to 1.0."""
    from app.core.config import settings
    total = (settings.EDS_WEIGHT_EDUCATION + settings.EDS_WEIGHT_HEALTHCARE +
             settings.EDS_WEIGHT_ECONOMIC + settings.EDS_WEIGHT_WOMEN +
             settings.EDS_WEIGHT_DIGITAL + settings.EDS_WEIGHT_CARBON)
    assert abs(total - 1.0) < 0.001


def test_trajectory_generation():
    """Trajectory should be monotonically improving."""
    from app.api.v1.endpoints.predictions import generate_trajectory
    components = {"eds": 50, "education": 45, "healthcare": 40, "economic": 55, "women": 35, "digital": 30, "carbon": 40}
    traj = generate_trajectory(components, years=5)
    assert len(traj) == 6  # Now + 5 years
    eds_values = [t["EDS"] for t in traj]
    for i in range(1, len(eds_values)):
        assert eds_values[i] >= eds_values[i-1], "EDS should not decrease over time"


def test_shap_values_structure():
    """SHAP values should have correct structure."""
    from app.api.v1.endpoints.predictions import compute_shap_values, VillageSimulateRequest
    req = VillageSimulateRequest(
        village_name="Test", state="Test", population=2000, households=500,
        electricity_access_pct=50, school_count=3, hospital_count=1,
        income_level=50000, internet_connectivity=0.2, renewable_energy_pct=20,
        grid_reliability=0.5, night_light_intensity=0.3, literacy_rate=60,
        female_employment_rate=35, carbon_emissions=600, agricultural_productivity=0.5,
        mobile_penetration=0.4, road_connectivity=0.6, water_access=0.55,
    )
    components = {"eds": 65, "education": 60, "healthcare": 55, "economic": 70, "women": 50, "digital": 45, "carbon": 55}
    shap = compute_shap_values(req, components)
    assert len(shap) > 0
    for item in shap:
        assert "feature" in item
        assert "value" in item
        assert isinstance(item["value"], float)


def test_data_generator():
    """Dataset generator should produce valid records."""
    from app.ml.generate_data import generate_dataset
    df = generate_dataset(100)
    assert len(df) == 100
    assert "eds_score" in df.columns
    assert df["eds_score"].between(0, 100).all()
    assert df["population"].gt(0).all()
    assert not df.isnull().any().any(), "Dataset should not contain nulls"


def test_model_manager_fallback():
    """ModelManager should use formula fallback when no models loaded."""
    from app.ml.model_manager import ModelManager
    mm = ModelManager()
    result = mm._formula_fallback({
        "literacy_rate": 60, "female_employment_rate": 35,
        "income_level": 50000, "hospital_count": 1, "population": 2000,
        "school_count": 3, "renewable_energy_pct": 20,
        "internet_connectivity": 0.2, "mobile_penetration": 0.4,
        "road_connectivity": 0.6, "water_access": 0.55,
    })
    assert 0 <= result["eds_score"] <= 100
    assert result["model_used"] == "formula_fallback"
