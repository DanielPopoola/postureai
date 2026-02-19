from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_current_user, get_db
from app.models.session import PostureSession
from app.models.user import User
from app.schemas.session import EndSessionRequest, SessionResponse
from app.services.gamification_service import update_streak_and_badges

router = APIRouter(prefix="/sessions", tags=["sessions"])


@router.post("", response_model=SessionResponse, status_code=status.HTTP_201_CREATED)
async def start_session(db: AsyncSession = Depends(get_db), user: User = Depends(get_current_user)):
    session = PostureSession(user_id=user.id)
    db.add(session)
    await db.commit()
    await db.refresh(session)
    return session


@router.post("/{session_id}/end", response_model=SessionResponse)
async def end_session(
    session_id: str,
    body: EndSessionRequest,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    session = await db.scalar(select(PostureSession).where(PostureSession.id == session_id, PostureSession.user_id == user.id))
    if not session:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Session not found")
    if session.status == "completed":
        raise HTTPException(status.HTTP_409_CONFLICT, "Session already ended")

    now = datetime.now(timezone.utc)
    session.ended_at = now
    session.duration_seconds = int((now - session.started_at.replace(tzinfo=timezone.utc)).total_seconds())
    session.avg_posture_score = body.avg_posture_score
    session.good_posture_percent = body.good_posture_percent
    session.total_alerts = body.total_alerts
    session.status = "completed"

    await db.commit()
    await update_streak_and_badges(user.id, db)
    await db.refresh(session)
    return session


@router.get("", response_model=list[SessionResponse])
async def list_sessions(
    limit: int = 20,
    offset: int = 0,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    rows = await db.scalars(
        select(PostureSession)
        .where(PostureSession.user_id == user.id)
        .order_by(PostureSession.started_at.desc())
        .limit(limit)
        .offset(offset)
    )
    return rows.all()


@router.get("/{session_id}", response_model=SessionResponse)
async def get_session(session_id: str, db: AsyncSession = Depends(get_db), user: User = Depends(get_current_user)):
    session = await db.scalar(select(PostureSession).where(PostureSession.id == session_id, PostureSession.user_id == user.id))
    if not session:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Session not found")
    return session