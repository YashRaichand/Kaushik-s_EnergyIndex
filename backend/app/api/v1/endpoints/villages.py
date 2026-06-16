from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_
from pydantic import BaseModel
from typing import Optional, List

from app.core.database import get_db
from app.core.auth import get_current_user, require_researcher
from app.models.user import User, Village

router = APIRouter()


class VillageCreate(BaseModel):
    name: str
    state: str
    district: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    population: int
    households: int
    electricity_access_pct: float
    school_count: int = 0
    hospital_count: int = 0
    income_level: Optional[float] = None
    literacy_rate: Optional[float] = None
    female_employment_rate: Optional[float] = None
    renewable_energy_pct: float = 0.0
    road_connectivity: float = 0.0
    water_access: float = 0.0
    internet_connectivity: float = 0.0
    mobile_penetration: float = 0.0


@router.get("/")
async def list_villages(
    skip: int = 0,
    limit: int = 50,
    state: Optional[str] = None,
    search: Optional[str] = None,
    min_eds: Optional[float] = None,
    max_eds: Optional[float] = None,
    db: AsyncSession = Depends(get_db),
):
    query = select(Village)
    if state:
        query = query.where(Village.state == state)
    if search:
        query = query.where(
            or_(Village.name.ilike(f"%{search}%"), Village.district.ilike(f"%{search}%"))
        )
    if min_eds is not None:
        query = query.where(Village.eds_score >= min_eds)
    if max_eds is not None:
        query = query.where(Village.eds_score <= max_eds)

    total = await db.scalar(select(func.count()).select_from(query.subquery()))
    result = await db.execute(query.offset(skip).limit(limit))
    villages = result.scalars().all()

    return {"total": total, "villages": villages, "skip": skip, "limit": limit}


@router.get("/states")
async def list_states(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Village.state, func.count(Village.id), func.avg(Village.eds_score))
        .group_by(Village.state)
        .order_by(Village.state)
    )
    rows = result.all()
    return [{"state": r[0], "village_count": r[1], "avg_eds": round(r[2] or 0, 2)} for r in rows]


@router.get("/{village_id}")
async def get_village(village_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Village).where(Village.id == village_id))
    village = result.scalar_one_or_none()
    if not village:
        raise HTTPException(status_code=404, detail="Village not found")
    return village


@router.post("/")
async def create_village(
    data: VillageCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_researcher),
):
    village = Village(**data.model_dump(), created_by=current_user.id)
    db.add(village)
    await db.commit()
    await db.refresh(village)
    return village


@router.put("/{village_id}")
async def update_village(
    village_id: int,
    data: VillageCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_researcher),
):
    result = await db.execute(select(Village).where(Village.id == village_id))
    village = result.scalar_one_or_none()
    if not village:
        raise HTTPException(status_code=404, detail="Village not found")
    for k, v in data.model_dump(exclude_unset=True).items():
        setattr(village, k, v)
    await db.commit()
    return village


@router.delete("/{village_id}")
async def delete_village(
    village_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_researcher),
):
    result = await db.execute(select(Village).where(Village.id == village_id))
    village = result.scalar_one_or_none()
    if not village:
        raise HTTPException(status_code=404, detail="Village not found")
    await db.delete(village)
    await db.commit()
    return {"message": "Village deleted"}
