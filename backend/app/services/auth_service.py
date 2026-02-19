from datetime import  datetime, timedelta, UTC

from jose import jwt
from passlib.context import CryptContext

from app.config import get_settings

settings = get_settings()

pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


def _make_token(sub: str, expires_delta: timedelta) -> str:
    return jwt.encode(
        {"sub": sub, "exp": datetime.now(UTC) + expires_delta},
        settings.JWT_SECRET,
        algorithm=settings.JWT_ALGORITHM,
    )


def create_access_token(user_id: str) -> str:
    return _make_token(user_id, timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES))


def create_refresh_token(user_id: str) -> str:
    return _make_token(user_id, timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS))