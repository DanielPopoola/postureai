from datetime import date, datetime
from pydantic import BaseModel


class StreakResponse(BaseModel):
    current_streak: int
    longest_streak: int
    last_active_date: date | None
    total_sessions: int

    model_config = {"from_attributes": True}


class BadgeResponse(BaseModel):
    id: str
    badge_key: str
    earned_at: datetime
    notified: bool

    model_config = {"from_attributes": True}


class GamificationResponse(BaseModel):
    streak: StreakResponse
    badges: list[BadgeResponse]