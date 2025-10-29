from __future__ import annotations

import structlog
from fastapi import APIRouter, FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1 import auth, health, history, predict, profile, whatif, courses
from app.api.deps import get_app_settings
from app.core.logging import configure_logging


def create_app() -> FastAPI:
    configure_logging()
    logger = structlog.get_logger(__name__)

    settings = get_app_settings()
    app = FastAPI(
        title=settings.app_name,
        version=settings.model_version,
        openapi_url=f"{settings.api_prefix}/openapi.json",
    )

    # Configure CORS to allow frontend requests
    # For development, allow localhost on both 3000 and common variations
    if settings.app_env == "dev":
        allowed_origins = [
            "http://localhost:3000",
            "http://127.0.0.1:3000",
            "http://localhost:3001",
        ]
    else:
        allowed_origins = settings.allow_origins()

    logger.info("cors_configured", allowed_origins=allowed_origins, env=settings.app_env)

    app.add_middleware(
        CORSMiddleware,
        allow_origins=allowed_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
        expose_headers=["*"],
    )

    api_router = APIRouter()
    api_router.include_router(health.router, tags=["health"])
    api_router.include_router(auth.router, tags=["auth"])
    api_router.include_router(profile.router, tags=["profile"])
    api_router.include_router(predict.router, tags=["prediction"])
    api_router.include_router(whatif.router, tags=["prediction"])
    api_router.include_router(history.router, tags=["history"])
    api_router.include_router(courses.router, tags=["courses"])

    app.include_router(api_router, prefix=settings.api_prefix)

    logger.info("app_started", env=settings.app_env)
    return app


app = create_app()
