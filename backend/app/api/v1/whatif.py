from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_app_settings, get_current_user, get_db
from app.core.config import Settings
from app.core.security import AuthenticatedUser
from app.db import repository
from app.db.schemas import PredictionResult, WhatIfRequest
from app.ml.model_loader import ModelLoader
from app.services.inference import InferenceService
from app.services.profile_mapper import simplified_to_full_features

router = APIRouter()


@router.post("/whatif", response_model=PredictionResult)
async def what_if(
    payload: WhatIfRequest,
    db: Session = Depends(get_db),
    user: AuthenticatedUser = Depends(get_current_user),
    settings: Settings = Depends(get_app_settings),
) -> PredictionResult:
    repository.get_or_create_user(db, user_id=user.id, email=user.email)
    repository.get_or_create_course(db, course_code=payload.course_code)

    # Try to get student profile from database
    profile = repository.get_student_profile(db, user_id=user.id)

    # If profile exists, prefer adjusting simplified profile fields and re-map to 41 features
    if profile:
        simplified = dict(profile.profile_data)
        # First, apply deltas over simplified keys if present
        for key, delta in payload.deltas.items():
            if key in simplified and isinstance(simplified[key], (int, float)):
                simplified[key] = float(simplified[key]) + float(delta)
        # Recompute features from (possibly) adjusted simplified profile
        base_features = simplified_to_full_features(simplified, course_code=payload.course_code)

        # If there are deltas that target raw feature names (41-features), apply them too
        adjusted_features = dict(base_features)
        for key, delta in payload.deltas.items():
            if key not in simplified:
                adjusted_features[key] = float(adjusted_features.get(key, 0.0)) + float(delta)
    else:
        # No profile: start from request features and apply deltas directly
        base_features = dict(payload.features)
        adjusted_features = dict(base_features)
        for key, delta in payload.deltas.items():
            adjusted_features[key] = float(adjusted_features.get(key, 0.0)) + float(delta)

    label, score, details, est_grade = InferenceService.predict(features=adjusted_features)
    model_version = ModelLoader.version()

    output_payload = {
        "label": label,
        "score": score,
        "details": {**details, "deltas": payload.deltas},
        "version": model_version,
        "mode": "whatif",
    }

    repository.create_inference(
        db,
        user_id=user.id,
        course_code=payload.course_code,
        input_payload={"features": adjusted_features, "metadata": payload.metadata, "deltas": payload.deltas},
        output_payload=output_payload,
        version=model_version,
    )

    return PredictionResult(
        cod_curso=payload.course_code,
        prediction_label=label,
        score=score,
        version=model_version,
        details=output_payload["details"],
        estimated_grade=est_grade,
        max_grade=20.0,
    )
