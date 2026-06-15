from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum, Text, Float, JSON, ForeignKey, BigInteger
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
import enum


class UserRole(str, enum.Enum):
    ADMIN = "admin"
    RESEARCHER = "researcher"
    POLICY_MAKER = "policy_maker"
    INVESTOR = "investor"
    PUBLIC_VIEWER = "public_viewer"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    name = Column(String(255), nullable=False)
    hashed_password = Column(String(255), nullable=True)  # null for OAuth users
    role = Column(Enum(UserRole), default=UserRole.PUBLIC_VIEWER, nullable=False)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    avatar_url = Column(String(500), nullable=True)
    google_id = Column(String(255), unique=True, nullable=True)
    organization = Column(String(255), nullable=True)
    bio = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    last_login = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    predictions = relationship("Prediction", back_populates="user")
    reports = relationship("Report", back_populates="user")


class Village(Base):
    __tablename__ = "villages"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    state = Column(String(100), nullable=False, index=True)
    district = Column(String(100), nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)

    # ML Features
    population = Column(Integer, nullable=False)
    households = Column(Integer, nullable=False)
    electricity_access_pct = Column(Float, nullable=False)
    school_count = Column(Integer, default=0)
    hospital_count = Column(Integer, default=0)
    income_level = Column(Float, nullable=True)  # Annual avg income INR
    internet_connectivity = Column(Float, default=0.0)  # 0-1
    renewable_energy_pct = Column(Float, default=0.0)
    grid_reliability = Column(Float, default=0.0)  # 0-1
    night_light_intensity = Column(Float, default=0.0)  # 0-1
    literacy_rate = Column(Float, nullable=True)
    female_employment_rate = Column(Float, nullable=True)
    carbon_emissions = Column(Float, nullable=True)  # tCO2 per year
    agricultural_productivity = Column(Float, nullable=True)
    mobile_penetration = Column(Float, default=0.0)
    road_connectivity = Column(Float, default=0.0)  # 0-1
    water_access = Column(Float, default=0.0)  # 0-1

    # Computed EDS
    eds_score = Column(Float, nullable=True)
    eds_last_computed = Column(DateTime(timezone=True), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    created_by = Column(Integer, ForeignKey("users.id"), nullable=True)

    predictions = relationship("Prediction", back_populates="village")


class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    village_id = Column(Integer, ForeignKey("villages.id"), nullable=True)

    # Input snapshot
    input_data = Column(JSON, nullable=False)

    # Outputs
    eds_score = Column(Float, nullable=False)
    development_score = Column(Float, nullable=True)
    future_impact_score = Column(Float, nullable=True)
    investment_priority_score = Column(Float, nullable=True)
    expected_roi = Column(Float, nullable=True)
    confidence_level = Column(Float, nullable=True)

    # Component scores
    education_score = Column(Float, nullable=True)
    healthcare_score = Column(Float, nullable=True)
    economic_score = Column(Float, nullable=True)
    women_score = Column(Float, nullable=True)
    digital_score = Column(Float, nullable=True)
    carbon_score = Column(Float, nullable=True)

    # AI outputs
    trajectory_data = Column(JSON, nullable=True)  # 5-year trajectory
    shap_values = Column(JSON, nullable=True)
    policy_recommendations = Column(JSON, nullable=True)
    ai_summary = Column(Text, nullable=True)

    # Meta
    model_version = Column(String(50), nullable=True)
    processing_time_ms = Column(Integer, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="predictions")
    village = relationship("Village", back_populates="predictions")
    reports = relationship("Report", back_populates="prediction")


class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    prediction_id = Column(Integer, ForeignKey("predictions.id"), nullable=True)
    title = Column(String(500), nullable=False)
    report_type = Column(String(100), default="full_analysis")
    pdf_url = Column(String(500), nullable=True)
    csv_url = Column(String(500), nullable=True)
    status = Column(String(50), default="generating")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="reports")
    prediction = relationship("Prediction", back_populates="reports")


class Analytics(Base):
    __tablename__ = "analytics"

    id = Column(Integer, primary_key=True, index=True)
    event_type = Column(String(100), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    metadata = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    action = Column(String(255), nullable=False)
    resource_type = Column(String(100), nullable=True)
    resource_id = Column(Integer, nullable=True)
    old_values = Column(JSON, nullable=True)
    new_values = Column(JSON, nullable=True)
    ip_address = Column(String(50), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class PolicyRecommendation(Base):
    __tablename__ = "policy_recommendations"

    id = Column(Integer, primary_key=True, index=True)
    prediction_id = Column(Integer, ForeignKey("predictions.id"), nullable=False)
    action = Column(String(500), nullable=False)
    impact = Column(Text, nullable=True)
    timeline = Column(String(100), nullable=True)
    cost_crore = Column(Float, nullable=True)
    roi_multiplier = Column(Float, nullable=True)
    priority = Column(String(50), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class Investment(Base):
    __tablename__ = "investments"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    village_id = Column(Integer, ForeignKey("villages.id"), nullable=False)
    amount_crore = Column(Float, nullable=False)
    expected_roi = Column(Float, nullable=True)
    investment_type = Column(String(100), nullable=True)
    status = Column(String(50), default="proposed")
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
