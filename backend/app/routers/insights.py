from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_current_user, get_db
from app.models.session import PostureSession
from app.models.user import User
from app.schemas.insights import InsightsRequest, InsightsResponse
from app.services.insights_service import generate_insights

router = APIRouter(prefix="/insights", tags=["insights"])


@router.post("", response_model=InsightsResponse)
async def get_insights(
    body: InsightsRequest,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    session = await db.scalar(
        select(PostureSession).where(PostureSession.id == body.session_id, PostureSession.user_id == user.id)
    )
    if not session:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Session not found")

    try:
        insights = await generate_insights(body.model_dump(exclude={"session_id"}))
    except Exception as e:
        raise HTTPException(status.HTTP_502_BAD_GATEWAY, f"Gemini error: {e}")

    return InsightsResponse(session_id=body.session_id, insights=insights)