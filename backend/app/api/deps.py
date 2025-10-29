from __future__ import annotations

from typing import Iterator

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.core.config import Settings, get_settings
from app.core.security import AuthenticatedUser, AuthenticationError, verify_access_token
from app.db.base import SessionLocal

auth_scheme = HTTPBearer(auto_error=False)


def get_db() -> Iterator[Session]:
    db = SessionLocal()
    try:
        yield db
        # Commit at the end of request if no exception occurred
        db.commit()
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


def get_app_settings() -> Settings:
    return get_settings()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(auth_scheme),
    settings: Settings = Depends(get_app_settings),
) -> AuthenticatedUser:
    # In mock mode, accept requests without credentials
    if settings.is_mock_auth:
        # Use a mock token if no credentials provided
        token = credentials.credentials if credentials else "mock-token"
        try:
            return await verify_access_token(token, settings)
        except AuthenticationError as exc:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(exc)) from exc

    # In production mode, require credentials
    if credentials is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing credentials")

    try:
        return await verify_access_token(credentials.credentials, settings)
    except AuthenticationError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(exc)) from exc
