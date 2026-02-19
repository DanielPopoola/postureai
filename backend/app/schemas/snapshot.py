from datetime import datetime

from pydantic import BaseModel


class SnapshotCreate(BaseModel):
    session_id: str
    posture_score: float
    posture_state: str
    neck_angle: float | None = None
    shoulder_tilt: float | None = None
    spine_angle: float | None = None


class SnapshotResponse(BaseModel):
    id: str
    session_id: str
    user_id: str
    captured_at: datetime
    posture_score: float
    posture_state: str
    neck_angle: float | None
    shoulder_tilt: float | None
    spine_angle: float | None

    model_config = {"from_attributes": True}