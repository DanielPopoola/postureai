from fastapi import APIRouter, Cookie, Depends, HTTPException, Response, status
from jose import JWTError, jwt
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import get_settings
from app.dependencies import get_current_user, get_db
from app.models.user import User
from app.schemas.auth import LoginRequest, RegisterRequest, UserResponse
from app.services.auth_service import (
    create_access_token,
    create_refresh_token,
    hash_password,
    verify_password,
)

settings = get_settings()

router = APIRouter(prefix='/auth', tags=["auth"])

COOKIE_OPTS = dict(httponly=True, secure=False, samesite="lax")  # set secure=True in prod


def _set_auth_cookies(response: Response, user_id: str):
    response.set_cookie("access_token", create_access_token(user_id), max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60, **COOKIE_OPTS)
    response.set_cookie("refresh_token", create_refresh_token(user_id), max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 86400, **COOKIE_OPTS)


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(body: RegisterRequest, response: Response, db: AsyncSession = Depends(get_db)):
    if await db.scalar(select(User).where(User.email == body.email)):
        raise HTTPException(status.HTTP_409_CONFLICT, "Email already registered")
    
    user = User(email=body.email, hashed_password=hash_password(body.password), full_name=body.full_name)
    db.add(user)
    await db.commit()
    await db.refresh(user)

    _set_auth_cookies(response, user.id)
    return user


@router.post("/login", response_model=UserResponse)
async def login(body: LoginRequest, response: Response, db: AsyncSession = Depends(get_db)):
    user = await db.scalar(select(User).where(User.email == body.email))
    if not user or not verify_password(body.password, user.hashed_password):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED , "Invalid credentials")
    
    _set_auth_cookies(response, user.id)
    return user


@router.post("/refresh", response_model=UserResponse)
async def refresh(response: Response, refresh_token: str | None = Cookie(default=None), db: AsyncSession = Depends(get_db)):
    exc = HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid refresh token")
    if not refresh_token:
        raise exc
    try:
        payload = jwt.decode(refresh_token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
        user_id: str = payload.get("sub")
    except JWTError:
        raise exc

    user = await db.scalar(select(User).where(User.id == user_id))
    if not user:
        raise exc

    _set_auth_cookies(response, user.id)
    return user


@router.post("/logout")
async def logout(response: Response):
    response.delete_cookie("access_token")
    response.delete_cookie("refresh_token")
    return {"detail": "Logged out"}


@router.get("/me", response_model=UserResponse)
async def me(user: User = Depends(get_current_user)):
    return user