from datetime import datetime

from pydantic import BaseModel


class AlertCreate(BaseModel):
    session_id: str
    alert_type: str
    message: str


class AlertResponse(BaseModel):
    id: str
    session_id: str
    user_id: str
    triggered_at: datetime
    alert_type: str
    message: str
    acknowledged: bool

    model_config = {"from_attributes": True}