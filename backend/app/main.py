"""
Energy Dignity Index (EDI) - FastAPI Backend
Built by Kaushik Digital | Measuring Human Progress Through Energy Access
"""

from contextlib import asynccontextmanager
import structlog
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
import time

from app.core.config import settings
from app.core.database import engine, Base
from app.core.redis import redis_client
from app.api.v1.router import api_router
from app.ml.model_manager import ModelManager

logger = structlog.get_logger()

# ─── Lifespan ────────────────────────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("🚀 EDI Platform starting up", version=settings.APP_VERSION)

    # Init DB tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    # Load ML models
    app.state.model_manager = ModelManager()
    await app.state.model_manager.load_models()
    logger.info("✅ ML models loaded", models=list(app.state.model_manager.models.keys()))

    # Init Redis
    await redis_client.ping()
    logger.info("✅ Redis connected")

    yield

    # Shutdown
    await redis_client.close()
    await engine.dispose()
    logger.info("👋 EDI Platform shutdown complete")


# ─── App ─────────────────────────────────────────────────────────────────────
app = FastAPI(
    title="Energy Dignity Index API",
    description="AI platform measuring human progress through energy access | Built by Kaushik Digital",
    version=settings.APP_VERSION,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    lifespan=lifespan,
)

# ─── Middleware ───────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=settings.ALLOWED_HOSTS,
)

@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    response.headers["X-Built-By"] = "Kaushik Digital"
    return response

@app.middleware("http")
async def rate_limit_middleware(request: Request, call_next):
    client_ip = request.client.host
    key = f"rate_limit:{client_ip}"
    try:
        requests = await redis_client.incr(key)
        if requests == 1:
            await redis_client.expire(key, 60)  # 1 minute window
        if requests > settings.RATE_LIMIT_PER_MINUTE:
            return JSONResponse(
                status_code=429,
                content={"detail": "Too many requests. Please slow down."}
            )
    except Exception:
        pass  # Don't fail if Redis is down
    return await call_next(request)

# ─── Routes ──────────────────────────────────────────────────────────────────
app.include_router(api_router, prefix="/api/v1")

# ─── Health Check ─────────────────────────────────────────────────────────────
@app.get("/health", tags=["Health"])
async def health_check():
    return {
        "status": "healthy",
        "service": "Energy Dignity Index API",
        "version": settings.APP_VERSION,
        "built_by": "Kaushik Digital",
        "tagline": "Measuring Human Progress Through Energy Access"
    }

@app.get("/", tags=["Root"])
async def root():
    return {
        "message": "⚡ Energy Dignity Index API",
        "docs": "/docs",
        "health": "/health",
        "built_by": "Kaushik Digital"
    }
