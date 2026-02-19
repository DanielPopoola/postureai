from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_current_user, get_db
from app.models.gamification import UserBadge, UserStreak
from app.models.user import User
from app.schemas.gamification import BadgeResponse, GamificationResponse, StreakResponse

router = APIRouter(prefix="/gamification", tags=["gamification"])


@router.get("", response_model=GamificationResponse)
async def get_gamification(db: AsyncSession = Depends(get_db), user: User = Depends(get_current_user)):
    streak = await db.scalar(select(UserStreak).where(UserStreak.user_id == user.id))
    badges = await db.scalars(select(UserBadge).where(UserBadge.user_id == user.id).order_by(UserBadge.earned_at))

    streak_data = StreakResponse.model_validate(streak) if streak else StreakResponse(current_streak=0, longest_streak=0, last_active_date=None)

    return GamificationResponse(streak=streak_data, badges=[BadgeResponse.model_validate(b) for b in badges.all()])