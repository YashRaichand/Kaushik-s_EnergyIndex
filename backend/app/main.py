"""
Energy Dignity Index (EDI) - FastAPI Backend
Built by Kaushik Digital | Measuring Human Progress Through Energy Access
"""
from contextlib import asynccontextmanager
import structlog
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import time

from app.core.config import settings
from app.core.database import engine, Base
from app.api.v1.router import api_router
from app.ml.model_manager import ModelManager

logger = structlog.get_logger()

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("🚀 EDI Platform starting up", version=settings.APP_VERSION)

    # Init DB tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    logger.info("✅ Database connected")

    # Load ML models
    app.state.model_manager = ModelManager()
    await app.state.model_manager.load_models()
    logger.info("✅ ML models loaded")

    # Redis — optional
    try:
        from app.core.redis import redis_client
        await redis_client.ping()
        logger.info("✅ Redis connected")
    except Exception:
        logger.warning("⚠️ Redis not available — continuing without cache")

    yield

    try:
        from app.core.redis import redis_client
        await redis_client.close()
    except Exception:
        pass
    await engine.dispose()
    logger.info("👋 EDI shutdown complete")


app = FastAPI(
    title="Energy Dignity Index API",
    description="Built by Kaushik Digital | Measuring Human Progress Through Energy Access",
    version=settings.APP_VERSION,
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# ── CORS — allow all origins so mobile/frontend works ──────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def add_headers(request: Request, call_next):
    start = time.time()
    response = await call_next(request)
    response.headers["X-Process-Time"] = str(round(time.time() - start, 4))
    response.headers["X-Built-By"] = "Kaushik Digital"
    return response

app.include_router(api_router, prefix="/api/v1")

@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "service": "Energy Dignity Index API",
        "version": settings.APP_VERSION,
        "built_by": "Kaushik Digital",
    }

@app.get("/")
async def root():
    return {"message": "⚡ EDI API | Built by Kaushik Digital", "docs": "/docs"}
