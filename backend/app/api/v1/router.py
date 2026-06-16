from fastapi import APIRouter
from app.api.v1.endpoints import auth, villages, predictions, reports, analytics, admin, users

api_router = APIRouter()

api_router.include_router(auth.router,        prefix="/auth",        tags=["Authentication"])
api_router.include_router(users.router,       prefix="/users",       tags=["Users"])
api_router.include_router(villages.router,    prefix="/villages",    tags=["Villages"])
api_router.include_router(predictions.router, prefix="/predictions", tags=["Predictions & ML"])
api_router.include_router(reports.router,     prefix="/reports",     tags=["Reports"])
api_router.include_router(analytics.router,   prefix="/analytics",   tags=["Analytics"])
api_router.include_router(admin.router,       prefix="/admin",       tags=["Admin"])
