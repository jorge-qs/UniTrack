from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.core.security import AuthenticatedUser
from app.db import repository
from app.db.schemas import HistoryResponse, InferenceRead

router = APIRouter()


@router.get("/history", response_model=HistoryResponse)
async def get_history(
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> HistoryResponse:
    inferences, total = repository.list_user_inferences(db, user_id=user.id, limit=limit, offset=offset)
    items = [
        InferenceRead(
            id=str(inf.id),
            cod_curso=inf.cod_curso,
            prediction_label=inf.output_payload.get("label", "Desconocido"),
            score=float(inf.output_payload.get("score", 0.0)),
            version=inf.version,
            created_at=inf.created_at,
            input_payload=inf.input_payload,
            output_payload=inf.output_payload,
        )
        for inf in inferences
    ]
    return HistoryResponse(items=items, total=total, limit=limit, offset=offset)
