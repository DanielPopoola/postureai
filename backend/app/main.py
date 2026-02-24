from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

import app.models  # noqa: F401 — ensures all models are registered with Base.metadata
from app.config import get_settings
from app.routers import alerts, auth, gamification, insights, sessions, snapshots

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    yield


app = FastAPI(title="Ergonomics Coach API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(sessions.router)
app.include_router(snapshots.router)
app.include_router(alerts.router)
app.include_router(gamification.router)
app.include_router(insights.router)


@app.get("/health")
async def health():
    return {"status": "ok"}
