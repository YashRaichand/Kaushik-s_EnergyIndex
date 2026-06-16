-- ═══════════════════════════════════════════════════════════════
-- Energy Dignity Index (EDI) — Complete Database Schema
-- Built by Kaushik Digital | Measuring Human Progress
-- ═══════════════════════════════════════════════════════════════

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ─── ENUMS ───────────────────────────────────────────────────
CREATE TYPE user_role AS ENUM (
  'admin', 'researcher', 'policy_maker', 'investor', 'public_viewer'
);

CREATE TYPE report_status AS ENUM ('generating', 'ready', 'failed');
CREATE TYPE investment_status AS ENUM ('proposed', 'approved', 'active', 'completed');

-- ─── USERS ───────────────────────────────────────────────────
CREATE TABLE users (
  id                SERIAL PRIMARY KEY,
  email             VARCHAR(255) UNIQUE NOT NULL,
  name              VARCHAR(255) NOT NULL,
  hashed_password   VARCHAR(255),
  role              user_role DEFAULT 'public_viewer' NOT NULL,
  is_active         BOOLEAN DEFAULT TRUE,
  is_verified       BOOLEAN DEFAULT FALSE,
  avatar_url        VARCHAR(500),
  google_id         VARCHAR(255) UNIQUE,
  organization      VARCHAR(255),
  bio               TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ,
  last_login        TIMESTAMPTZ
);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role  ON users(role);

-- ─── VILLAGES ────────────────────────────────────────────────
CREATE TABLE villages (
  id                        SERIAL PRIMARY KEY,
  name                      VARCHAR(255) NOT NULL,
  state                     VARCHAR(100) NOT NULL,
  district                  VARCHAR(100),
  latitude                  DOUBLE PRECISION,
  longitude                 DOUBLE PRECISION,

  -- ML Features (17)
  population                INTEGER NOT NULL,
  households                INTEGER NOT NULL,
  electricity_access_pct    DOUBLE PRECISION NOT NULL,
  school_count              INTEGER DEFAULT 0,
  hospital_count            INTEGER DEFAULT 0,
  income_level              DOUBLE PRECISION,
  internet_connectivity     DOUBLE PRECISION DEFAULT 0,
  renewable_energy_pct      DOUBLE PRECISION DEFAULT 0,
  grid_reliability          DOUBLE PRECISION DEFAULT 0,
  night_light_intensity     DOUBLE PRECISION DEFAULT 0,
  literacy_rate             DOUBLE PRECISION,
  female_employment_rate    DOUBLE PRECISION,
  carbon_emissions          DOUBLE PRECISION,
  agricultural_productivity DOUBLE PRECISION,
  mobile_penetration        DOUBLE PRECISION DEFAULT 0,
  road_connectivity         DOUBLE PRECISION DEFAULT 0,
  water_access              DOUBLE PRECISION DEFAULT 0,

  -- Computed EDS
  eds_score                 DOUBLE PRECISION,
  eds_last_computed         TIMESTAMPTZ,

  -- Meta
  created_by                INTEGER REFERENCES users(id),
  created_at                TIMESTAMPTZ DEFAULT NOW(),
  updated_at                TIMESTAMPTZ
);
CREATE INDEX idx_villages_state     ON villages(state);
CREATE INDEX idx_villages_eds       ON villages(eds_score);
CREATE INDEX idx_villages_name_trgm ON villages USING gin(name gin_trgm_ops);

-- ─── PREDICTIONS ─────────────────────────────────────────────
CREATE TABLE predictions (
  id                      SERIAL PRIMARY KEY,
  user_id                 INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  village_id              INTEGER REFERENCES villages(id) ON DELETE SET NULL,

  -- Input snapshot (JSON of all 17 features)
  input_data              JSONB NOT NULL,

  -- Primary outputs
  eds_score               DOUBLE PRECISION NOT NULL,
  development_score       DOUBLE PRECISION,
  future_impact_score     DOUBLE PRECISION,
  investment_priority_score DOUBLE PRECISION,
  expected_roi            DOUBLE PRECISION,
  confidence_level        DOUBLE PRECISION,

  -- EDS component scores
  education_score         DOUBLE PRECISION,
  healthcare_score        DOUBLE PRECISION,
  economic_score          DOUBLE PRECISION,
  women_score             DOUBLE PRECISION,
  digital_score           DOUBLE PRECISION,
  carbon_score            DOUBLE PRECISION,

  -- AI & ML outputs
  trajectory_data         JSONB,
  shap_values             JSONB,
  policy_recommendations  JSONB,
  ai_summary              TEXT,

  -- Metadata
  model_version           VARCHAR(50),
  processing_time_ms      INTEGER,
  created_at              TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_predictions_user    ON predictions(user_id);
CREATE INDEX idx_predictions_village ON predictions(village_id);
CREATE INDEX idx_predictions_eds     ON predictions(eds_score);
CREATE INDEX idx_predictions_date    ON predictions(created_at DESC);

-- ─── REPORTS ─────────────────────────────────────────────────
CREATE TABLE reports (
  id              SERIAL PRIMARY KEY,
  user_id         INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  prediction_id   INTEGER REFERENCES predictions(id) ON DELETE SET NULL,
  title           VARCHAR(500) NOT NULL,
  report_type     VARCHAR(100) DEFAULT 'full_analysis',
  pdf_url         VARCHAR(500),
  csv_url         VARCHAR(500),
  status          report_status DEFAULT 'generating',
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_reports_user   ON reports(user_id);
CREATE INDEX idx_reports_status ON reports(status);

-- ─── MODELS ──────────────────────────────────────────────────
CREATE TABLE models (
  id              SERIAL PRIMARY KEY,
  name            VARCHAR(100) NOT NULL,
  version         VARCHAR(50)  NOT NULL,
  model_type      VARCHAR(100),
  accuracy        DOUBLE PRECISION,
  r2_score        DOUBLE PRECISION,
  mae             DOUBLE PRECISION,
  rmse            DOUBLE PRECISION,
  n_samples       INTEGER,
  features        JSONB,
  feature_importance JSONB,
  is_active       BOOLEAN DEFAULT FALSE,
  is_primary      BOOLEAN DEFAULT FALSE,
  file_path       VARCHAR(500),
  trained_at      TIMESTAMPTZ DEFAULT NOW(),
  created_by      INTEGER REFERENCES users(id)
);

-- ─── ANALYTICS ───────────────────────────────────────────────
CREATE TABLE analytics (
  id          SERIAL PRIMARY KEY,
  event_type  VARCHAR(100) NOT NULL,
  user_id     INTEGER REFERENCES users(id) ON DELETE SET NULL,
  metadata    JSONB,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_analytics_event ON analytics(event_type);
CREATE INDEX idx_analytics_date  ON analytics(created_at DESC);

-- ─── INVESTMENTS ─────────────────────────────────────────────
CREATE TABLE investments (
  id              SERIAL PRIMARY KEY,
  user_id         INTEGER NOT NULL REFERENCES users(id),
  village_id      INTEGER NOT NULL REFERENCES villages(id),
  amount_crore    DOUBLE PRECISION NOT NULL,
  expected_roi    DOUBLE PRECISION,
  investment_type VARCHAR(100),
  status          investment_status DEFAULT 'proposed',
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_investments_user    ON investments(user_id);
CREATE INDEX idx_investments_village ON investments(village_id);
CREATE INDEX idx_investments_status  ON investments(status);

-- ─── POLICY RECOMMENDATIONS ──────────────────────────────────
CREATE TABLE policy_recommendations (
  id              SERIAL PRIMARY KEY,
  prediction_id   INTEGER NOT NULL REFERENCES predictions(id) ON DELETE CASCADE,
  action          VARCHAR(500) NOT NULL,
  impact          TEXT,
  timeline        VARCHAR(100),
  cost_crore      DOUBLE PRECISION,
  roi_multiplier  DOUBLE PRECISION,
  priority        VARCHAR(50),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_policy_prediction ON policy_recommendations(prediction_id);

-- ─── AUDIT LOGS ──────────────────────────────────────────────
CREATE TABLE audit_logs (
  id            SERIAL PRIMARY KEY,
  user_id       INTEGER REFERENCES users(id) ON DELETE SET NULL,
  action        VARCHAR(255) NOT NULL,
  resource_type VARCHAR(100),
  resource_id   INTEGER,
  old_values    JSONB,
  new_values    JSONB,
  ip_address    VARCHAR(50),
  user_agent    VARCHAR(500),
  created_at    TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_audit_user   ON audit_logs(user_id);
CREATE INDEX idx_audit_action ON audit_logs(action);
CREATE INDEX idx_audit_date   ON audit_logs(created_at DESC);

-- ─── EDS WEIGHT CONFIGURATIONS (for policymakers) ────────────
CREATE TABLE eds_weight_configs (
  id                  SERIAL PRIMARY KEY,
  name                VARCHAR(255) NOT NULL,
  description         TEXT,
  weight_education    DOUBLE PRECISION DEFAULT 0.25,
  weight_healthcare   DOUBLE PRECISION DEFAULT 0.20,
  weight_economic     DOUBLE PRECISION DEFAULT 0.20,
  weight_women        DOUBLE PRECISION DEFAULT 0.15,
  weight_digital      DOUBLE PRECISION DEFAULT 0.10,
  weight_carbon       DOUBLE PRECISION DEFAULT 0.10,
  is_active           BOOLEAN DEFAULT FALSE,
  created_by          INTEGER REFERENCES users(id),
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT weights_sum CHECK (
    ABS(weight_education + weight_healthcare + weight_economic +
        weight_women + weight_digital + weight_carbon - 1.0) < 0.001
  )
);

-- Insert default EDS weights
INSERT INTO eds_weight_configs (name, description, weight_education, weight_healthcare,
  weight_economic, weight_women, weight_digital, weight_carbon, is_active) VALUES
('Default (Kaushik Digital)', 'Standard EDS weights as defined by Kaushik Digital novel algorithm',
  0.25, 0.20, 0.20, 0.15, 0.10, 0.10, TRUE);

-- ─── VIEWS ───────────────────────────────────────────────────

-- Village EDS summary view
CREATE OR REPLACE VIEW v_village_summary AS
SELECT
  v.id, v.name, v.state, v.district,
  v.population, v.electricity_access_pct,
  v.eds_score,
  CASE
    WHEN v.eds_score < 50 THEN 'Critical'
    WHEN v.eds_score < 65 THEN 'High'
    WHEN v.eds_score < 80 THEN 'Medium'
    ELSE 'Low'
  END AS priority,
  COUNT(p.id) AS prediction_count,
  MAX(p.expected_roi) AS max_roi
FROM villages v
LEFT JOIN predictions p ON p.village_id = v.id
GROUP BY v.id;

-- State EDS summary view
CREATE OR REPLACE VIEW v_state_summary AS
SELECT
  state,
  COUNT(*) AS village_count,
  AVG(eds_score) AS avg_eds,
  MIN(eds_score) AS min_eds,
  MAX(eds_score) AS max_eds,
  COUNT(*) FILTER (WHERE eds_score < 50) AS critical_count,
  SUM(population) AS total_population
FROM villages
GROUP BY state
ORDER BY avg_eds DESC;

-- Platform analytics view
CREATE OR REPLACE VIEW v_platform_stats AS
SELECT
  (SELECT COUNT(*) FROM users WHERE is_active = TRUE) AS active_users,
  (SELECT COUNT(*) FROM villages) AS total_villages,
  (SELECT COUNT(*) FROM predictions) AS total_predictions,
  (SELECT AVG(eds_score) FROM villages WHERE eds_score IS NOT NULL) AS avg_eds,
  (SELECT COUNT(*) FROM reports WHERE status = 'ready') AS reports_ready;

-- ─── COMMENTS ────────────────────────────────────────────────
COMMENT ON TABLE users IS 'Platform users with role-based access';
COMMENT ON TABLE villages IS 'Rural village data with 17 ML features for EDS prediction';
COMMENT ON TABLE predictions IS 'ML inference results including EDS, trajectories, SHAP values';
COMMENT ON TABLE reports IS 'Generated PDF/CSV reports';
COMMENT ON TABLE models IS 'ML model registry (XGBoost, RF, LightGBM, Ensemble)';
COMMENT ON TABLE analytics IS 'Platform usage events and telemetry';
COMMENT ON TABLE investments IS 'Impact investment tracking per village';
COMMENT ON TABLE policy_recommendations IS 'AI-generated policy recommendations per prediction';
COMMENT ON TABLE audit_logs IS 'Admin audit trail for compliance';
COMMENT ON TABLE eds_weight_configs IS 'Adjustable EDS formula weights for policymakers';

-- Built by Kaushik Digital | Measuring Human Progress Through Energy Access
