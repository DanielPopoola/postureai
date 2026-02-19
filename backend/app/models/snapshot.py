import uuid
from datetime import datetime

from sqlalchemy import DateTime, Float, ForeignKey, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class PostureSnapshot(Base):
    __tablename__ = "snapshots"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    session_id: Mapped[str] = mapped_column(String, ForeignKey("sessions.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id: Mapped[str] = mapped_column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    captured_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    posture_score: Mapped[float] = mapped_column(Float, nullable=False)
    posture_state: Mapped[str] = mapped_column(String, nullable=False)  # good | bad | risky
    neck_angle: Mapped[float | None] = mapped_column(Float, nullable=True)
    shoulder_tilt: Mapped[float | None] = mapped_column(Float, nullable=True)
    spine_angle: Mapped[float | None] = mapped_column(Float, nullable=True)