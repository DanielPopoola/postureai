from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_current_user, get_db
from app.models.alert import PostureAlert
from app.models.session import PostureSession
from app.models.user import User
from app.schemas.alert import AlertCreate, AlertResponse

router = APIRouter(prefix="/alerts", tags=["alerts"])


@router.post("", response_model=AlertResponse, status_code=status.HTTP_201_CREATED)
async def create_alert(body: AlertCreate, db: AsyncSession = Depends(get_db), user: User = Depends(get_current_user)):
    session = await db.scalar(select(PostureSession).where(PostureSession.id == body.session_id, PostureSession.user_id == user.id))
    if not session:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Session not found")

    alert = PostureAlert(**body.model_dump(), user_id=user.id)
    db.add(alert)
    await db.commit()
    await db.refresh(alert)
    return alert


@router.get("", response_model=list[AlertResponse])
async def list_alerts(
    session_id: str | None = None,
    limit: int = 50,
    offset: int = 0,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    q = select(PostureAlert).where(PostureAlert.user_id == user.id)
    if session_id:
        q = q.where(PostureAlert.session_id == session_id)
    rows = await db.scalars(q.order_by(PostureAlert.triggered_at.desc()).limit(limit).offset(offset))
    return rows.all()


@router.patch("/{alert_id}/acknowledge", response_model=AlertResponse)
async def acknowledge_alert(alert_id: str, db: AsyncSession = Depends(get_db), user: User = Depends(get_current_user)):
    alert = await db.scalar(select(PostureAlert).where(PostureAlert.id == alert_id, PostureAlert.user_id == user.id))
    if not alert:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Alert not found")
    alert.acknowledged = True
    await db.commit()
    await db.refresh(alert)
    return alert