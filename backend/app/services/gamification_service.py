from dataclasses import dataclass
from datetime import date, timedelta

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.gamification import UserBadge, UserStreak


@dataclass
class BadgeDefinition:
    key: str
    label: str
    check: callable  # (streak: int, badges_earned: set[str]) -> bool


BADGES: list[BadgeDefinition] = [
    BadgeDefinition("first_session", "First Step", lambda s, b: True),
    BadgeDefinition("streak_3", "3-Day Streak", lambda s, b: s >= 3),
    BadgeDefinition("streak_7", "Week Warrior", lambda s, b: s >= 7),
    BadgeDefinition("streak_30", "Monthly Master", lambda s, b: s >= 30),
]


async def update_streak_and_badges(user_id: str, db: AsyncSession) -> list[str]:
    """Update streak for today's session. Returns list of newly earned badge keys."""
    today = date.today()

    streak = await db.scalar(select(UserStreak).where(UserStreak.user_id == user_id))
    if not streak:
        streak = UserStreak(user_id=user_id, current_streak=0, longest_streak=0)
        db.add(streak)

    if streak.last_active_date == today:
        return []  # already logged today

    if streak.last_active_date == today - timedelta(days=1):
        streak.current_streak += 1
    else:
        streak.current_streak = 1  # streak broken or first session

    streak.longest_streak = max(streak.longest_streak, streak.current_streak)
    streak.last_active_date = today

    existing_keys = set(
        row for row in await db.scalars(
            select(UserBadge.badge_key).where(UserBadge.user_id == user_id)
        )
    )

    new_badges = [
        b for b in BADGES
        if b.key not in existing_keys and b.check(streak.current_streak, existing_keys)
    ]

    for badge in new_badges:
        db.add(UserBadge(user_id=user_id, badge_key=badge.key))

    await db.commit()
    return [b.key for b in new_badges]