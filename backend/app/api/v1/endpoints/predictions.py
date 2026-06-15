import time
import hashlib
import json
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from pydantic import BaseModel, Field
from typing import Optional
import anthropic

from app.core.database import get_db
from app.core.auth import get_current_user, require_researcher
from app.core.redis import get_cached_prediction, cache_prediction
from app.core.config import settings
from app.models.user import User, Prediction, PolicyRecommendation

router = APIRouter()


# ─── Input Schema ────────────────────────────────────────────────────────────
class VillageSimulateRequest(BaseModel):
    village_name: str = "Unknown Village"
    state: str = "Unknown"
    population: int = Field(..., ge=100, le=1_000_000)
    households: int = Field(..., ge=20, le=200_000)
    electricity_access_pct: float = Field(..., ge=0, le=100)
    school_count: int = Field(0, ge=0, le=100)
    hospital_count: int = Field(0, ge=0, le=50)
    income_level: float = Field(50000.0, ge=5000, le=1_000_000)
    internet_connectivity: float = Field(0.2, ge=0, le=1)
    renewable_energy_pct: float = Field(10.0, ge=0, le=100)
    grid_reliability: float = Field(0.5, ge=0, le=1)
    night_light_intensity: float = Field(0.3, ge=0, le=1)
    literacy_rate: float = Field(60.0, ge=0, le=100)
    female_employment_rate: float = Field(30.0, ge=0, le=100)
    carbon_emissions: float = Field(500.0, ge=0)
    agricultural_productivity: float = Field(0.5, ge=0, le=1)
    mobile_penetration: float = Field(0.4, ge=0, le=1)
    road_connectivity: float = Field(0.5, ge=0, le=1)
    water_access: float = Field(0.6, ge=0, le=1)
    # Adjustable EDS weights (policy maker can override)
    weight_education: Optional[float] = None
    weight_healthcare: Optional[float] = None
    weight_economic: Optional[float] = None
    weight_women: Optional[float] = None
    weight_digital: Optional[float] = None
    weight_carbon: Optional[float] = None


# ─── EDS Calculator ──────────────────────────────────────────────────────────
def compute_eds_components(data: VillageSimulateRequest) -> dict:
    def norm(value, min_v, max_v):
        return max(0.0, min(1.0, (value - min_v) / (max_v - min_v)))

    # Component calculations (each 0-1)
    schools_per_1k = data.school_count / max(data.population / 1000, 0.1)
    hospitals_per_1k = data.hospital_count / max(data.population / 1000, 0.1)

    education = (
        norm(data.literacy_rate, 20, 100) * 0.50 +
        norm(schools_per_1k, 0, 5) * 0.30 +
        norm(data.internet_connectivity, 0, 1) * 0.20
    )
    healthcare = (
        norm(hospitals_per_1k, 0, 2) * 0.50 +
        norm(data.water_access, 0, 1) * 0.30 +
        norm(data.electricity_access_pct, 0, 100) * 0.20
    )
    economic = (
        norm(data.income_level, 20000, 500000) * 0.40 +
        norm(data.road_connectivity, 0, 1) * 0.30 +
        norm(data.agricultural_productivity, 0, 1) * 0.30
    )
    women = (
        norm(data.female_employment_rate, 10, 80) * 0.60 +
        norm(data.literacy_rate, 20, 100) * 0.40
    )
    digital = (
        norm(data.internet_connectivity, 0, 1) * 0.40 +
        norm(data.mobile_penetration, 0, 1) * 0.40 +
        norm(data.renewable_energy_pct, 0, 100) * 0.20
    )
    carbon = (
        norm(data.renewable_energy_pct, 0, 100) * 0.60 +
        norm(1 - data.carbon_emissions / 10000, 0, 1) * 0.40
    )

    # Use custom or default weights
    w_edu = data.weight_education or settings.EDS_WEIGHT_EDUCATION
    w_hlt = data.weight_healthcare or settings.EDS_WEIGHT_HEALTHCARE
    w_eco = data.weight_economic or settings.EDS_WEIGHT_ECONOMIC
    w_wom = data.weight_women or settings.EDS_WEIGHT_WOMEN
    w_dig = data.weight_digital or settings.EDS_WEIGHT_DIGITAL
    w_car = data.weight_carbon or settings.EDS_WEIGHT_CARBON

    # Normalize weights
    total_w = w_edu + w_hlt + w_eco + w_wom + w_dig + w_car
    if abs(total_w - 1.0) > 0.01:
        w_edu /= total_w; w_hlt /= total_w; w_eco /= total_w
        w_wom /= total_w; w_dig /= total_w; w_car /= total_w

    eds = (
        w_edu * education +
        w_hlt * healthcare +
        w_eco * economic +
        w_wom * women +
        w_dig * digital +
        w_car * carbon
    )

    return {
        "eds": round(eds * 100, 2),
        "education": round(education * 100, 2),
        "healthcare": round(healthcare * 100, 2),
        "economic": round(economic * 100, 2),
        "women": round(women * 100, 2),
        "digital": round(digital * 100, 2),
        "carbon": round(carbon * 100, 2),
    }


def generate_trajectory(components: dict, years: int = 5) -> list:
    """Generate 5-year EDS trajectory post-electrification."""
    trajectory = []
    base_eds = components["eds"] / 100
    for i in range(years + 1):
        boost = i * 0.05 * (1 - base_eds)
        trajectory.append({
            "year": f"Y{i}" if i > 0 else "Now",
            "EDS": round(min(100, (base_eds + boost) * 100), 1),
            "Economic": round(min(100, (components["economic"] / 100 + i * 0.06) * 100), 1),
            "Education": round(min(100, (components["education"] / 100 + i * 0.05) * 100), 1),
            "Healthcare": round(min(100, (components["healthcare"] / 100 + i * 0.04) * 100), 1),
        })
    return trajectory


def compute_shap_values(data: VillageSimulateRequest, components: dict) -> list:
    """Approximate SHAP values for interpretability."""
    features = [
        ("Literacy Rate", 0.25, data.literacy_rate / 100 - 0.6),
        ("Female Employment", 0.20, data.female_employment_rate / 100 - 0.4),
        ("Income Level", 0.18, (data.income_level - 80000) / 500000),
        ("Hospitals per 1k", 0.15, data.hospital_count / max(data.population / 1000, 0.1) / 2 - 0.3),
        ("Renewable Energy", 0.12, data.renewable_energy_pct / 100 - 0.2),
        ("Road Connectivity", 0.10, data.road_connectivity - 0.5),
        ("Internet Access", 0.08, data.internet_connectivity - 0.3),
        ("Water Access", 0.07, data.water_access - 0.5),
        ("Grid Reliability", 0.06, data.grid_reliability - 0.5),
        ("Agricultural Prod.", 0.05, data.agricultural_productivity - 0.5),
    ]
    return [
        {"feature": f, "value": round(w * v, 4), "weight": w}
        for f, w, v in features
    ]


# ─── Main Simulate Endpoint ──────────────────────────────────────────────────
@router.post("/simulate")
async def simulate_village(
    request_data: VillageSimulateRequest,
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    start_time = time.time()

    # Cache check
    cache_key = hashlib.md5(
        json.dumps(request_data.model_dump(), sort_keys=True).encode()
    ).hexdigest()
    cached = await get_cached_prediction(cache_key)
    if cached:
        return cached

    # Compute EDS
    components = compute_eds_components(request_data)
    trajectory = generate_trajectory(components)
    shap_values = compute_shap_values(request_data, components)

    # Derived scores
    development_score = round((components["eds"] * 0.4 + components["economic"] * 0.3 + components["education"] * 0.3), 2)
    future_impact_score = round(min(100, components["eds"] * 1.35), 2)
    investment_priority = round(100 - components["eds"], 2)
    expected_roi = round(max(1.0, (100 - components["eds"]) / 15), 2)
    confidence = round(min(98, 75 + components["eds"] * 0.2), 1)

    # AI Policy via Anthropic
    policy = None
    try:
        client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)
        prompt = f"""You are an Energy Dignity Index AI analyst built by Kaushik Digital.

Village: {request_data.village_name}, {request_data.state}
Population: {request_data.population:,} | Households: {request_data.households:,}
Electricity Access: {request_data.electricity_access_pct}% | Literacy: {request_data.literacy_rate}%
Female Employment: {request_data.female_employment_rate}% | Income: ₹{request_data.income_level:,.0f}/yr
Schools: {request_data.school_count} | Hospitals: {request_data.hospital_count}
Renewable: {request_data.renewable_energy_pct}% | Internet: {request_data.internet_connectivity:.0%}
Computed EDS: {components['eds']}/100

Return ONLY valid JSON (no markdown) with this exact structure:
{{
  "summary": "2 sentences about the village's energy dignity situation",
  "priority": "Critical|High|Medium|Low",
  "investment": {{"amount_crore": 2.5, "roi": "3.2x", "payback_years": 4}},
  "recommendations": [
    {{"action": "...", "impact": "...", "timeline": "6 months", "cost_crore": 1.2}},
    {{"action": "...", "impact": "...", "timeline": "12 months", "cost_crore": 0.5}},
    {{"action": "...", "impact": "...", "timeline": "18 months", "cost_crore": 0.8}}
  ],
  "policy_message": "One powerful sentence for policymakers with specific ROI numbers",
  "dignity_insight": "One human-centered sentence about the dignity transformation electricity brings"
}}"""

        response = client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=1000,
            messages=[{"role": "user", "content": prompt}]
        )
        raw = response.content[0].text.strip()
        raw = raw.replace("```json", "").replace("```", "").strip()
        policy = json.loads(raw)
    except Exception as e:
        policy = {
            "summary": f"Village {request_data.village_name} shows significant potential for energy dignity improvement with EDS of {components['eds']}/100.",
            "priority": "High" if components["eds"] < 60 else "Medium",
            "investment": {"amount_crore": round(expected_roi * 0.8, 1), "roi": f"{expected_roi}x", "payback_years": int(5 / expected_roi * 3)},
            "recommendations": [
                {"action": "Solar microgrid installation", "impact": "Powers 80% of households", "timeline": "6 months", "cost_crore": 1.2},
                {"action": "Digital literacy & connectivity", "impact": "Increases internet adoption by 40%", "timeline": "12 months", "cost_crore": 0.4},
                {"action": "Women's energy SHG programme", "impact": "25% increase in female employment", "timeline": "18 months", "cost_crore": 0.6},
            ],
            "policy_message": f"Investing ₹{round(expected_roi * 0.8, 1)} Crore in {request_data.village_name} yields {expected_roi}x Energy Dignity ROI.",
            "dignity_insight": "Bringing electricity here transforms kerosene-lit evenings into connected, dignified futures."
        }

    # Save to DB
    prediction = Prediction(
        user_id=current_user.id,
        input_data=request_data.model_dump(),
        eds_score=components["eds"],
        development_score=development_score,
        future_impact_score=future_impact_score,
        investment_priority_score=investment_priority,
        expected_roi=expected_roi,
        confidence_level=confidence,
        education_score=components["education"],
        healthcare_score=components["healthcare"],
        economic_score=components["economic"],
        women_score=components["women"],
        digital_score=components["digital"],
        carbon_score=components["carbon"],
        trajectory_data=trajectory,
        shap_values=shap_values,
        policy_recommendations=policy,
        ai_summary=policy.get("summary", ""),
        processing_time_ms=int((time.time() - start_time) * 1000),
    )
    db.add(prediction)
    await db.commit()
    await db.refresh(prediction)

    result = {
        "prediction_id": prediction.id,
        "village": request_data.village_name,
        "state": request_data.state,
        "scores": {
            "eds": components["eds"],
            "development": development_score,
            "future_impact": future_impact_score,
            "investment_priority": investment_priority,
            "expected_roi": expected_roi,
            "confidence": confidence,
        },
        "components": components,
        "trajectory": trajectory,
        "shap_values": shap_values,
        "policy": policy,
        "processing_time_ms": prediction.processing_time_ms,
        "built_by": "Kaushik Digital",
    }

    await cache_prediction(cache_key, result)
    return result


@router.get("/history")
async def prediction_history(
    skip: int = 0,
    limit: int = 20,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Prediction)
        .where(Prediction.user_id == current_user.id)
        .order_by(desc(Prediction.created_at))
        .offset(skip).limit(limit)
    )
    predictions = result.scalars().all()
    return [
        {
            "id": p.id,
            "village": p.input_data.get("village_name", "Unknown"),
            "eds_score": p.eds_score,
            "expected_roi": p.expected_roi,
            "created_at": p.created_at.isoformat() if p.created_at else None,
        }
        for p in predictions
    ]


@router.get("/{prediction_id}")
async def get_prediction(
    prediction_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(select(Prediction).where(Prediction.id == prediction_id))
    prediction = result.scalar_one_or_none()
    if not prediction:
        raise HTTPException(status_code=404, detail="Prediction not found")
    if prediction.user_id != current_user.id and current_user.role.value != "admin":
        raise HTTPException(status_code=403, detail="Access denied")
    return prediction
