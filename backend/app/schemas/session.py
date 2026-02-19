from datetime import datetime

from pydantic import BaseModel


class SessionResponse(BaseModel):
    id: str
    user_id: str
    started_at: datetime
    ended_at: datetime | None
    duration_seconds: int | None
    avg_posture_score: float | None
    good_posture_percent: float | None
    total_alerts: int
    status: str

    model_config = {"from_attributes": True}


class EndSessionRequest(BaseModel):
    avg_posture_score: float
    good_posture_percent: float
    total_alerts: int