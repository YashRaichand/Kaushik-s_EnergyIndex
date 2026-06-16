from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from typing import Optional
import io

from app.core.database import get_db
from app.core.auth import get_current_user
from app.models.user import User, Report, Prediction
from app.services.pdf_generator import generate_edi_report

router = APIRouter()


class ReportRequest(BaseModel):
    prediction_id: int
    title: Optional[str] = None
    report_type: str = "full_analysis"
    include_shap: bool = True
    include_trajectory: bool = True
    include_policy: bool = True


@router.post("/generate")
async def generate_report(
    data: ReportRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(select(Prediction).where(Prediction.id == data.prediction_id))
    prediction = result.scalar_one_or_none()
    if not prediction:
        raise HTTPException(status_code=404, detail="Prediction not found")

    report = Report(
        user_id=current_user.id,
        prediction_id=data.prediction_id,
        title=data.title or f"EDI Report - {prediction.input_data.get('village_name', 'Village')}",
        report_type=data.report_type,
        status="generating",
    )
    db.add(report)
    await db.commit()
    await db.refresh(report)

    # Generate PDF (in background in production, sync here for simplicity)
    try:
        pdf_bytes = await generate_edi_report(prediction, current_user)
        # In production: upload to Cloudinary, save URL
        report.status = "ready"
        await db.commit()
    except Exception as e:
        report.status = "failed"
        await db.commit()

    return {"report_id": report.id, "status": report.status, "title": report.title}


@router.get("/")
async def list_reports(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Report).where(Report.user_id == current_user.id).order_by(Report.created_at.desc())
    )
    return result.scalars().all()
