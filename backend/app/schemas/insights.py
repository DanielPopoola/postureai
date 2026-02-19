from pydantic import BaseModel


class InsightsRequest(BaseModel):
    session_id: str
    duration_seconds: int
    avg_posture_score: float
    good_posture_percent: float
    total_alerts: int
    neck_alerts: int = 0
    shoulder_alerts: int = 0
    spine_alerts: int = 0
    break_alerts: int = 0


class Insight(BaseModel):
    type: str   # success | warning | tip
    title: str
    message: str


class InsightsResponse(BaseModel):
    session_id: str
    insights: list[Insight]