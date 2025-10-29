from __future__ import annotations

import time
from dataclasses import dataclass
from functools import lru_cache
from typing import Any, Dict, Optional

import httpx
from jose import ExpiredSignatureError, JWTError, jwt

from app.core.config import Settings, get_settings


class AuthenticationError(Exception):
    """Raised when authentication cannot be completed."""


@dataclass
class AuthenticatedUser:
    id: str
    email: Optional[str] = None
    raw_claims: Dict[str, Any] | None = None


class JWKSCache:
    """Very small helper to cache JWKS responses."""

    def __init__(self) -> None:
        self._keys: Dict[str, Any] | None = None
        self._fetched_at: float = 0.0
        self._ttl_seconds: int = 300

    async def get_keys(self, url: str) -> Dict[str, Any]:
        now = time.time()
        if self._keys and now - self._fetched_at < self._ttl_seconds:
            return self._keys

        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.get(url)
            response.raise_for_status()
            data = response.json()

        self._keys = data
        self._fetched_at = now
        return data


@lru_cache
def _jwks_cache() -> JWKSCache:
    return JWKSCache()


async def verify_access_token(token: str, settings: Settings | None = None) -> AuthenticatedUser:
    settings = settings or get_settings()
    if settings.is_mock_auth:
        # In mock mode, accept any non-empty token and use static user
        if not token:
            raise AuthenticationError("Missing token")
        return AuthenticatedUser(id="00000000-0000-0000-0000-000000000000", email="mock@unitrack.local")

    # Internal JWT verification (HS256 by default)
    if settings.is_internal_jwt:
        try:
            claims = jwt.decode(token, settings.jwt_secret, algorithms=[settings.jwt_algorithm])
        except ExpiredSignatureError as exc:
            raise AuthenticationError("Token expired") from exc
        except JWTError as exc:
            raise AuthenticationError("Invalid token") from exc

        user_id = claims.get("sub")
        if not user_id:
            raise AuthenticationError("Token missing sub claim")
        return AuthenticatedUser(id=user_id, email=claims.get("email"), raw_claims=claims)

    if not settings.supabase_jwks_url:
        raise AuthenticationError("JWKS URL not configured")

    try:
        cache = _jwks_cache()
        jwks = await cache.get_keys(settings.supabase_jwks_url)
        audience = settings.supabase_audience
        unverified_header = jwt.get_unverified_header(token)
        kid = unverified_header.get("kid")
        key = next((k for k in jwks["keys"] if k["kid"] == kid), None)
        if key is None:
            raise AuthenticationError("Signing key not found")

        claims = jwt.decode(
            token,
            key,
            algorithms=[unverified_header.get("alg", "RS256")],
            audience=audience,
        )
    except ExpiredSignatureError as exc:
        raise AuthenticationError("Token expired") from exc
    except (JWTError, httpx.HTTPError, KeyError, ValueError) as exc:
        raise AuthenticationError("Invalid token") from exc

    user_id = claims.get("sub")
    if not user_id:
        raise AuthenticationError("Token missing sub claim")

    return AuthenticatedUser(id=user_id, email=claims.get("email"), raw_claims=claims)
