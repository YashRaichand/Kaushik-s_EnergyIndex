from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from typing import Optional

from app.core.database import get_db
from app.core.auth import get_current_user
from app.models.user import User

router = APIRouter()


class UpdateProfileRequest(BaseModel):
    name: Optional[str] = None
    organization: Optional[str] = None
    bio: Optional[str] = None


@router.get("/profile")
async def get_profile(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "email": current_user.email,
        "name": current_user.name,
        "role": current_user.role.value,
        "organization": current_user.organization,
        "bio": current_user.bio,
        "avatar_url": current_user.avatar_url,
        "is_verified": current_user.is_verified,
        "created_at": current_user.created_at,
    }


@router.put("/profile")
async def update_profile(
    data: UpdateProfileRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    for k, v in data.model_dump(exclude_none=True).items():
        setattr(current_user, k, v)
    await db.commit()
    return {"message": "Profile updated"}
