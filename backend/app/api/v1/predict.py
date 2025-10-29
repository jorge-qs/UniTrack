from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_app_settings, get_current_user, get_db
from app.core.config import Settings
from app.core.security import AuthenticatedUser
from app.db import repository
from app.db.schemas import PredictRequest, PredictionResult
from app.ml.model_loader import ModelLoader
from app.services.inference import InferenceService
from app.services.profile_mapper import simplified_to_full_features

router = APIRouter()


@router.post("/predict", response_model=PredictionResult)
async def predict(
    payload: PredictRequest,
    db: Session = Depends(get_db),
    user: AuthenticatedUser = Depends(get_current_user),
    settings: Settings = Depends(get_app_settings),
) -> PredictionResult:
    repository.get_or_create_user(db, user_id=user.id, email=user.email)
    repository.get_or_create_course(db, course_code=payload.course_code)

    # Try to get student profile from database
    import logging
    profile = repository.get_student_profile(db, user_id=user.id)

    # If profile exists, convert to 41 features; otherwise use provided features
    if profile:
        # Convert profile to 41 features using the mapper
        import logging
        logging.info(f"✅ Using profile data: {profile.profile_data}")
        features = simplified_to_full_features(profile.profile_data, course_code=payload.course_code)
        logging.info(f"✅ Generated features - Promedio: {features.get('PROM_POND_HIST')}, Créditos: {features.get('CRED_APROB_HIST')}, Puntaje: {features.get('PTJE_INGRESO')}")
    elif payload.features:
        # Use features from request
        logging.warning(f"⚠️ No profile found, using request features: {payload.features}")
        features = payload.features
    else:
        # No profile and no features - return error with helpful message
        from fastapi import HTTPException
        raise HTTPException(
            status_code=422,
            detail="No student profile found. Please create a profile first at /api/v1/profile or provide features in the request."
        )

    label, score, details, est_grade = InferenceService.predict(features=features)
    model_version = ModelLoader.version()

    output_payload = {
        "label": label,
        "score": score,
        "details": details,
        "version": model_version,
    }

    # Try to save inference history, but don't fail if it errors
    try:
        repository.create_inference(
            db,
            user_id=user.id,
            course_code=payload.course_code,
            input_payload={"features": payload.features, "metadata": payload.metadata},
            output_payload=output_payload,
            version=model_version,
        )
    except Exception as e:
        # Log the error but continue - prediction is more important than history
        import logging
        logging.warning(f"Failed to save inference history: {e}")

    return PredictionResult(
        cod_curso=payload.course_code,
        prediction_label=label,
        score=score,
        version=model_version,
        details=details,
        estimated_grade=est_grade,
        max_grade=20.0,
    )
