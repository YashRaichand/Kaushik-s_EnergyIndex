# EDI Platform — API Documentation
**Built by Kaushik Digital | Energy Dignity Index**

Base URL: `https://edi-backend.onrender.com/api/v1`
Interactive: `https://edi-backend.onrender.com/docs` (Swagger UI)

---

## Authentication

All protected endpoints require:
```
Authorization: Bearer <access_token>
```

### POST /auth/register
```json
Request:
{
  "email": "researcher@example.com",
  "password": "securepass123",
  "name": "Dr. Priya Sharma",
  "role": "researcher",
  "organization": "IIT Delhi"
}

Response 200:
{
  "access_token": "eyJhbGciOiJIUzI1NiJ9...",
  "token_type": "bearer",
  "user": { "id": 1, "email": "...", "name": "...", "role": "researcher" }
}
```

### POST /auth/login
```json
Request:
{ "email": "user@example.com", "password": "pass" }

Response 200:
{ "access_token": "eyJ...", "token_type": "bearer", "user": {...} }
```

### POST /auth/google
```json
Request: { "code": "4/0AX4XfWh..." }
Response: { "access_token": "eyJ...", "user": {...} }
```

### GET /auth/me *(Protected)*
```json
Response: {
  "id": 1, "email": "...", "name": "...", "role": "researcher",
  "organization": "...", "is_verified": true
}
```

---

## Village Simulator (Core ML Feature)

### POST /predictions/simulate *(Protected)*

**The most important endpoint** — runs the 17-feature ML ensemble.

```json
Request:
{
  "village_name": "Sundarpada",
  "state": "Odisha",
  "population": 1620,
  "households": 380,
  "electricity_access_pct": 24.5,
  "school_count": 2,
  "hospital_count": 0,
  "income_level": 32000,
  "internet_connectivity": 0.08,
  "renewable_energy_pct": 8.0,
  "grid_reliability": 0.3,
  "night_light_intensity": 0.12,
  "literacy_rate": 48.2,
  "female_employment_rate": 18.5,
  "carbon_emissions": 1200,
  "agricultural_productivity": 0.38,
  "mobile_penetration": 0.31,
  "road_connectivity": 0.35,
  "water_access": 0.42,

  // Optional: policymaker weight overrides (must sum to 1.0)
  "weight_education": 0.30,
  "weight_healthcare": 0.20,
  "weight_economic": 0.20,
  "weight_women": 0.15,
  "weight_digital": 0.08,
  "weight_carbon": 0.07
}

Response 200:
{
  "prediction_id": 847,
  "village": "Sundarpada",
  "state": "Odisha",
  "scores": {
    "eds": 48.3,
    "development": 45.1,
    "future_impact": 62.8,
    "investment_priority": 51.7,
    "expected_roi": 4.8,
    "confidence": 87.2
  },
  "components": {
    "eds": 48.3,
    "education": 42.1,
    "healthcare": 31.5,
    "economic": 38.7,
    "women": 25.3,
    "digital": 18.9,
    "carbon": 22.4
  },
  "trajectory": [
    { "year": "Now", "EDS": 48.3, "Economic": 38.7, "Education": 42.1, "Healthcare": 31.5 },
    { "year": "Y1",  "EDS": 54.1, "Economic": 44.5, "Education": 47.2, "Healthcare": 36.8 },
    { "year": "Y2",  "EDS": 60.2, "Economic": 51.3, "Education": 52.6, "Healthcare": 42.1 },
    { "year": "Y3",  "EDS": 65.8, "Economic": 57.4, "Education": 57.9, "Healthcare": 47.3 },
    { "year": "Y4",  "EDS": 70.1, "Economic": 62.8, "Education": 62.4, "Healthcare": 51.9 },
    { "year": "Y5",  "EDS": 74.6, "Economic": 67.2, "Education": 66.8, "Healthcare": 56.2 }
  ],
  "shap_values": [
    { "feature": "Literacy Rate",        "value": 0.1842, "weight": 0.25 },
    { "feature": "Female Employment",    "value": 0.1423, "weight": 0.20 },
    { "feature": "Income Level",         "value": 0.1187, "weight": 0.18 },
    { "feature": "Hospitals per 1k",     "value": -0.0923, "weight": 0.15 },
    { "feature": "Renewable Energy",     "value": 0.0712, "weight": 0.12 },
    { "feature": "Road Connectivity",    "value": 0.0634, "weight": 0.10 },
    { "feature": "Internet Access",      "value": 0.0521, "weight": 0.09 },
    { "feature": "Water Access",         "value": 0.0489, "weight": 0.07 }
  ],
  "policy": {
    "summary": "Sundarpada shows critical energy poverty with EDS of 48.3/100...",
    "priority": "Critical",
    "investment": { "amount_crore": 3.8, "roi": "4.8x", "payback_years": 3 },
    "recommendations": [
      { "action": "Solar microgrid (200kW)", "impact": "Powers all 380 households", "timeline": "6 months", "cost_crore": 1.8 },
      { "action": "Mobile health clinic programme", "impact": "Healthcare access +65%", "timeline": "9 months", "cost_crore": 0.9 },
      { "action": "Women's SHG electrification business", "impact": "Female employment +32%", "timeline": "12 months", "cost_crore": 1.1 }
    ],
    "policy_message": "Investing ₹3.8 Crore in Sundarpada yields 4.8x Energy Dignity ROI — highest in Odisha district.",
    "dignity_insight": "Electricity here transforms kerosene-lit nights into homework, telemedicine, and connected futures."
  },
  "processing_time_ms": 847,
  "built_by": "Kaushik Digital"
}
```

### GET /predictions/history *(Protected)*
```
Query params: skip=0&limit=20
Response: Array of past predictions
```

### GET /predictions/{id} *(Protected)*
```
Response: Full prediction object
```

---

## Villages

### GET /villages/
```
Query params:
  state=Odisha
  search=sundar
  min_eds=0
  max_eds=50
  skip=0
  limit=50

Response:
{ "total": 1247, "villages": [...], "skip": 0, "limit": 50 }
```

### GET /villages/states
```json
Response: [
  { "state": "Odisha", "village_count": 3102, "avg_eds": 54.1 },
  { "state": "Bihar",  "village_count": 4123, "avg_eds": 41.2 }
]
```

### POST /villages/ *(Researcher+ role)*
```json
Request: { "name": "...", "state": "...", "population": 1500, ... }
Response: Village object with id
```

### PUT /villages/{id} *(Researcher+ role)*
### DELETE /villages/{id} *(Researcher+ role)*

---

## Reports

### POST /reports/generate *(Protected)*
```json
Request:
{
  "prediction_id": 847,
  "title": "Sundarpada EDS Analysis",
  "report_type": "full_analysis",
  "include_shap": true,
  "include_trajectory": true,
  "include_policy": true
}

Response: { "report_id": 12, "status": "ready", "title": "..." }
```

### GET /reports/ *(Protected)*
Returns list of user's reports.

---

## Analytics

### GET /analytics/dashboard *(Protected)*
```json
Response:
{
  "kpis": {
    "total_villages": 45892,
    "average_eds": 67.4,
    "total_predictions": 128450,
    "carbon_saved_tonnes": 2825900,
    "economic_impact_inr": 2294600000000,
    "recent_predictions_30d": 8240
  }
}
```

### GET /analytics/eds-trend
### GET /analytics/state-rankings
### GET /analytics/users-by-role *(Protected)*

---

## Admin *(Admin role only)*

### GET /admin/users
### PUT /admin/users/{id}/role?role=researcher
### GET /admin/stats
### GET /admin/audit-logs
### GET /admin/models/status

---

## Error Responses

```json
400 Bad Request:    { "detail": "Email already registered" }
401 Unauthorized:   { "detail": "Invalid or expired token" }
403 Forbidden:      { "detail": "Access denied. Required roles: ['admin']" }
404 Not Found:      { "detail": "Village not found" }
422 Validation:     { "detail": [{ "loc": ["body","population"], "msg": "..." }] }
429 Rate Limited:   { "detail": "Too many requests. Please slow down." }
500 Server Error:   { "detail": "Internal server error" }
```

---

*Built by **Kaushik Digital** — Measuring Human Progress Through Energy Access*
