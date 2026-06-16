from pydantic_settings import BaseSettings
from typing import List
import os


class Settings(BaseSettings):
    # App
    APP_NAME: str = "Energy Dignity Index"
    APP_VERSION: str = "1.0.0"
    ENVIRONMENT: str = "development"
    DEBUG: bool = False

    # Security
    SECRET_KEY: str = "change-me-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 hours

    # Database
    DATABASE_URL: str = "postgresql+asyncpg://edi_user:edi_password@localhost:5432/edi_db"

    # Redis
    REDIS_URL: str = "redis://localhost:6379"

    # CORS
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:3000",
        "https://edi-frontend.onrender.com",
        "https://kaushikdigital.com",
    ]
    ALLOWED_HOSTS: List[str] = ["*"]

    # Rate Limiting
    RATE_LIMIT_PER_MINUTE: int = 60

    # Google OAuth
    GOOGLE_CLIENT_ID: str = ""
    GOOGLE_CLIENT_SECRET: str = ""
    GOOGLE_REDIRECT_URI: str = "http://localhost:8000/api/v1/auth/google/callback"

    # Cloudinary
    CLOUDINARY_CLOUD_NAME: str = ""
    CLOUDINARY_API_KEY: str = ""
    CLOUDINARY_API_SECRET: str = ""

    # SendGrid
    SENDGRID_API_KEY: str = ""
    FROM_EMAIL: str = "noreply@kaushikdigital.com"

    # Anthropic
    ANTHROPIC_API_KEY: str = ""

    # ML
    ML_MODELS_DIR: str = "app/ml/saved_models"
    ML_DATA_DIR: str = "app/ml/data"

    # EDS Weights (adjustable by policymakers)
    EDS_WEIGHT_EDUCATION: float = 0.25
    EDS_WEIGHT_HEALTHCARE: float = 0.20
    EDS_WEIGHT_ECONOMIC: float = 0.20
    EDS_WEIGHT_WOMEN: float = 0.15
    EDS_WEIGHT_DIGITAL: float = 0.10
    EDS_WEIGHT_CARBON: float = 0.10

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
