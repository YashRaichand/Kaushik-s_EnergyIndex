from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel, EmailStr
import httpx

from app.core.database import get_db
from app.core.auth import hash_password, verify_password, create_access_token, get_current_user
from app.core.config import settings
from app.models.user import User, UserRole

router = APIRouter()


# ─── Schemas ─────────────────────────────────────────────────────────────────
class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    name: str
    role: UserRole = UserRole.PUBLIC_VIEWER
    organization: str = ""


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict


class GoogleTokenRequest(BaseModel):
    code: str


# ─── Register ────────────────────────────────────────────────────────────────
@router.post("/register", response_model=TokenResponse)
async def register(data: RegisterRequest, db: AsyncSession = Depends(get_db)):
    # Check existing
    result = await db.execute(select(User).where(User.email == data.email))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(
        email=data.email,
        name=data.name,
        hashed_password=hash_password(data.password),
        role=data.role,
        organization=data.organization,
        is_active=True,
        is_verified=False,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)

    token = create_access_token({"sub": str(user.id), "role": user.role.value})
    return TokenResponse(
        access_token=token,
        user={"id": user.id, "email": user.email, "name": user.name, "role": user.role.value}
    )


# ─── Login ───────────────────────────────────────────────────────────────────
@router.post("/login", response_model=TokenResponse)
async def login(data: LoginRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == data.email))
    user = result.scalar_one_or_none()

    if not user or not user.hashed_password or not verify_password(data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account deactivated")

    user.last_login = datetime.now(timezone.utc)
    await db.commit()

    token = create_access_token({"sub": str(user.id), "role": user.role.value})
    return TokenResponse(
        access_token=token,
        user={"id": user.id, "email": user.email, "name": user.name, "role": user.role.value, "is_verified": user.is_verified}
    )


# ─── Google OAuth ─────────────────────────────────────────────────────────────
@router.post("/google", response_model=TokenResponse)
async def google_auth(data: GoogleTokenRequest, db: AsyncSession = Depends(get_db)):
    async with httpx.AsyncClient() as client:
        # Exchange code for token
        token_resp = await client.post(
            "https://oauth2.googleapis.com/token",
            data={
                "code": data.code,
                "client_id": settings.GOOGLE_CLIENT_ID,
                "client_secret": settings.GOOGLE_CLIENT_SECRET,
                "redirect_uri": settings.GOOGLE_REDIRECT_URI,
                "grant_type": "authorization_code",
            }
        )
        if token_resp.status_code != 200:
            raise HTTPException(status_code=400, detail="Google OAuth failed")

        tokens = token_resp.json()
        # Get user info
        user_resp = await client.get(
            "https://www.googleapis.com/oauth2/v2/userinfo",
            headers={"Authorization": f"Bearer {tokens['access_token']}"}
        )
        google_user = user_resp.json()

    # Find or create user
    result = await db.execute(select(User).where(User.email == google_user["email"]))
    user = result.scalar_one_or_none()

    if not user:
        user = User(
            email=google_user["email"],
            name=google_user.get("name", ""),
            google_id=google_user["id"],
            avatar_url=google_user.get("picture", ""),
            is_verified=True,
            is_active=True,
            role=UserRole.PUBLIC_VIEWER,
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)
    else:
        user.google_id = google_user["id"]
        user.last_login = datetime.now(timezone.utc)
        await db.commit()

    token = create_access_token({"sub": str(user.id), "role": user.role.value})
    return TokenResponse(
        access_token=token,
        user={"id": user.id, "email": user.email, "name": user.name, "role": user.role.value}
    )


@router.get("/me")
async def get_me(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "email": current_user.email,
        "name": current_user.name,
        "role": current_user.role.value,
        "organization": current_user.organization,
        "avatar_url": current_user.avatar_url,
        "is_verified": current_user.is_verified,
    }
