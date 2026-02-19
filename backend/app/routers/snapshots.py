from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_current_user, get_db
from app.models.session import PostureSession
from app.models.snapshot import PostureSnapshot
from app.models.user import User
from app.schemas.snapshot import SnapshotCreate, SnapshotResponse

router = APIRouter(prefix="/snapshots", tags=["snapshots"])


@router.post("", response_model=SnapshotResponse, status_code=status.HTTP_201_CREATED)
async def create_snapshot(body: SnapshotCreate, db: AsyncSession = Depends(get_db), user: User = Depends(get_current_user)):
    # verify session belongs to user
    session = await db.scalar(select(PostureSession).where(PostureSession.id == body.session_id, PostureSession.user_id == user.id))
    if not session:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Session not found")

    snapshot = PostureSnapshot(**body.model_dump(), user_id=user.id)
    db.add(snapshot)
    await db.commit()
    await db.refresh(snapshot)
    return snapshot


@router.get("", response_model=list[SnapshotResponse])
async def list_snapshots(
    session_id: str | None = None,
    limit: int = 100,
    offset: int = 0,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    q = select(PostureSnapshot).where(PostureSnapshot.user_id == user.id)
    if session_id:
        q = q.where(PostureSnapshot.session_id == session_id)
    rows = await db.scalars(q.order_by(PostureSnapshot.captured_at.desc()).limit(limit).offset(offset))
    return rows.all()