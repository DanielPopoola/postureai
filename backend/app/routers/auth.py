from datetime import timedelta
from typing import Annotated

from fastapi import APIRouter, Cookie, Depends, HTTPException, Response, status
from jose import JWTError, jwt
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import get_settings
from app.dependencies import get_current_user, get_db
from app.models.user import User
from app.schemas.auth import (
    ForgotPasswordRequest,
    LoginRequest,
    RegisterRequest,
    ResetPasswordRequest,
    UserResponse,
)
from app.services.auth_service import (
    _make_token,
    create_access_token,
    create_refresh_token,
    hash_password,
    verify_password,
)
from app.services.email_service import send_password_reset

settings = get_settings()

router = APIRouter(prefix="/auth", tags=["auth"])

COOKIE_OPTS = {"httponly": True, "secure": False, "samesite": "lax"}  # set secure=True in prod


def _set_auth_cookies(response: Response, user_id: str):
    response.set_cookie(
        "access_token",
        create_access_token(user_id),
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        **COOKIE_OPTS,
    )
    response.set_cookie(
        "refresh_token",
        create_refresh_token(user_id),
        max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 86400,
        **COOKIE_OPTS,
    )


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(
    body: RegisterRequest, response: Response, db: Annotated[AsyncSession, Depends(get_db)]
):
    if await db.scalar(select(User).where(User.email == body.email)):
        raise HTTPException(status.HTTP_409_CONFLICT, "Email already registered")

    user = User(
        email=body.email, hashed_password=hash_password(body.password), full_name=body.full_name
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)

    _set_auth_cookies(response, user.id)
    return user


@router.post("/login", response_model=UserResponse)
async def login(
    body: LoginRequest, response: Response, db: Annotated[AsyncSession, Depends(get_db)]
):
    user = await db.scalar(select(User).where(User.email == body.email))
    if not user or not verify_password(body.password, user.hashed_password):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid credentials")

    _set_auth_cookies(response, user.id)
    return user


@router.post("/refresh", response_model=UserResponse)
async def refresh(
    response: Response,
    db: Annotated[AsyncSession, Depends(get_db)],
    refresh_token: str | None = Cookie(default=None),
):
    exc = HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid refresh token")
    if not refresh_token:
        raise exc
    try:
        payload = jwt.decode(
            refresh_token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM]
        )
        user_id: str = payload.get("sub")
    except JWTError as je:
        raise exc from je

    user = await db.scalar(select(User).where(User.id == user_id))
    if not user:
        raise exc

    _set_auth_cookies(response, user.id)
    return user


@router.post("/reset-password/request")
async def request_password_reset(
    body: ForgotPasswordRequest, db: Annotated[AsyncSession, Depends(get_db)]
):
    user = await db.scalar(select(User).where(User.email == body.email))
    if not user:
        return {"detail": "If that email exists, a reset link was sent"}

    token = _make_token(user.id, timedelta(minutes=30))
    reset_url = f"{settings.FRONTEND_URL}/auth/reset?token={token}"
    await send_password_reset(user.email, reset_url)
    return {"detail": "If that email exists, a reset link was sent"}


@router.post("/reset-password/confirm")
async def confirm_password_reset(
    body: ResetPasswordRequest, db: Annotated[AsyncSession, Depends(get_db)]
):
    exc = HTTPException(status.HTTP_400_BAD_REQUEST, "Invalid or expired token")
    try:
        payload = jwt.decode(body.token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
        user_id = payload.get("sub")
    except JWTError as je:
        raise exc from je

    user = await db.scalar(select(User).where(User.id == user_id))
    if not user:
        raise exc

    user.hashed_password = hash_password(body.new_password)
    await db.commit()
    return {"detail": "Password updated"}


@router.post("/logout")
async def logout(response: Response):
    response.delete_cookie("access_token")
    response.delete_cookie("refresh_token")
    return {"detail": "Logged out"}


@router.get("/me", response_model=UserResponse)
async def me(user: Annotated[User, Depends(get_current_user)]):
    return user
