from datetime import datetime
from fastapi import APIRouter

router = APIRouter()


@router.get("/healthz", summary="Health check")
def healthz() -> dict[str, str]:
    return {"status": "ok", "timestamp": datetime.utcnow().isoformat()}


@router.get("/health", summary="Health check")
def health() -> dict[str, str]:
    return {"status": "ok", "timestamp": datetime.utcnow().isoformat()}
