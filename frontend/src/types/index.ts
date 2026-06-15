// ─── Village ──────────────────────────────────────────────────
export interface Village {
  id: number;
  name: string;
  state: string;
  district?: string;
  latitude?: number;
  longitude?: number;
  population: number;
  households: number;
  electricity_access_pct: number;
  school_count: number;
  hospital_count: number;
  income_level?: number;
  literacy_rate?: number;
  female_employment_rate?: number;
  renewable_energy_pct: number;
  internet_connectivity: number;
  mobile_penetration: number;
  road_connectivity: number;
  water_access: number;
  eds_score?: number;
  created_at: string;
}

// ─── Simulation Input ─────────────────────────────────────────
export interface SimulateInput {
  village_name: string;
  state: string;
  population: number;
  households: number;
  electricity_access_pct: number;
  school_count: number;
  hospital_count: number;
  income_level: number;
  internet_connectivity: number;
  renewable_energy_pct: number;
  grid_reliability: number;
  night_light_intensity: number;
  literacy_rate: number;
  female_employment_rate: number;
  carbon_emissions: number;
  agricultural_productivity: number;
  mobile_penetration: number;
  road_connectivity: number;
  water_access: number;
  weight_education?: number;
  weight_healthcare?: number;
  weight_economic?: number;
  weight_women?: number;
  weight_digital?: number;
  weight_carbon?: number;
}

// ─── Prediction Result ────────────────────────────────────────
export interface PredictionResult {
  prediction_id: number;
  village: string;
  state: string;
  scores: {
    eds: number;
    development: number;
    future_impact: number;
    investment_priority: number;
    expected_roi: number;
    confidence: number;
  };
  components: {
    eds: number;
    education: number;
    healthcare: number;
    economic: number;
    women: number;
    digital: number;
    carbon: number;
  };
  trajectory: TrajectoryPoint[];
  shap_values: SHAPValue[];
  policy: PolicyAnalysis;
  processing_time_ms: number;
}

// ─── Trajectory ───────────────────────────────────────────────
export interface TrajectoryPoint {
  year: string;
  EDS: number;
  Economic: number;
  Education: number;
  Healthcare: number;
}

// ─── SHAP ─────────────────────────────────────────────────────
export interface SHAPValue {
  feature: string;
  value: number;
  weight: number;
}

// ─── Policy ───────────────────────────────────────────────────
export interface PolicyAnalysis {
  summary: string;
  priority: "Critical" | "High" | "Medium" | "Low";
  investment: {
    amount_crore: number;
    roi: string;
    payback_years: number;
  };
  recommendations: PolicyRecommendation[];
  policy_message: string;
  dignity_insight: string;
}

export interface PolicyRecommendation {
  action: string;
  impact: string;
  timeline: string;
  cost_crore: number;
}

// ─── Dashboard KPIs ───────────────────────────────────────────
export interface DashboardKPIs {
  kpis: {
    total_villages: number;
    average_eds: number;
    total_predictions: number;
    carbon_saved_tonnes: number;
    economic_impact_inr: number;
    recent_predictions_30d: number;
  };
}

// ─── State Ranking ────────────────────────────────────────────
export interface StateRanking {
  state: string;
  eds: number;
  villages: number;
  priority: string;
}

// ─── EDS Color helpers ────────────────────────────────────────
export const edsColor = (score: number): string => {
  if (score >= 80) return "#00FF88";
  if (score >= 65) return "#00D4FF";
  if (score >= 50) return "#FFB547";
  return "#FF4757";
};

export const priorityColor = (p: string): string => {
  const map: Record<string, string> = {
    Critical: "#FF4757",
    High:     "#FFB547",
    Medium:   "#00D4FF",
    Low:      "#00FF88",
  };
  return map[p] || "#fff";
};

export const priorityBadge = (p: string): string => {
  const map: Record<string, string> = {
    Critical: "badge-critical",
    High:     "badge-high",
    Medium:   "badge-medium",
    Low:      "badge-low",
  };
  return map[p] || "badge-medium";
};
