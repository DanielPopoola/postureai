from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_current_user, get_db
from app.models.gamification import UserBadge, UserStreak
from app.models.session import PostureSession
from app.models.user import User
from app.schemas.gamification import BadgeResponse, GamificationResponse, StreakResponse

router = APIRouter(prefix="/gamification", tags=["gamification"])


@router.get("", response_model=GamificationResponse)
async def get_gamification(db: AsyncSession = Depends(get_db), user: User = Depends(get_current_user)):
    streak = await db.scalar(select(UserStreak).where(UserStreak.user_id == user.id))
    badges = await db.scalars(select(UserBadge).where(UserBadge.user_id == user.id).order_by(UserBadge.earned_at))
    total_sessions = await db.scalar(select(func.count()).select_from(PostureSession).where(PostureSession.user_id == user.id)) or 0

    streak_data = StreakResponse(
        current_streak=streak.current_streak if streak else 0,
        longest_streak=streak.longest_streak if streak else 0,
        last_active_date=streak.last_active_date if streak else None,
        total_sessions=total_sessions,
    )

    return GamificationResponse(streak=streak_data, badges=[BadgeResponse.model_validate(b) for b in badges.all()])