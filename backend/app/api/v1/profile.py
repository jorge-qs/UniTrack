from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.core.security import AuthenticatedUser
from app.db import repository
from app.db.schemas_profile import StudentProfileCreate, StudentProfileRead, StudentProfileSimplified

router = APIRouter()


@router.post("/profile", response_model=StudentProfileRead, status_code=status.HTTP_201_CREATED)
async def create_or_update_profile(
    profile: StudentProfileCreate,
    db: Session = Depends(get_db),
    user: AuthenticatedUser = Depends(get_current_user),
) -> StudentProfileRead:
    """Create or update student profile"""
    repository.get_or_create_user(db, user_id=user.id, email=user.email)

    # Check if profile already exists
    existing_profile = repository.get_student_profile(db, user_id=user.id)

    if existing_profile:
        # Update existing profile
        updated_profile = repository.update_student_profile(db, user_id=user.id, profile_data=profile.model_dump())
        return StudentProfileRead(
            id=str(updated_profile.id),
            user_id=str(updated_profile.user_id),
            created_at=updated_profile.created_at.isoformat(),
            updated_at=updated_profile.updated_at.isoformat(),
            **updated_profile.profile_data,
        )
    else:
        # Create new profile
        new_profile = repository.create_student_profile(db, user_id=user.id, profile_data=profile.model_dump())
        return StudentProfileRead(
            id=str(new_profile.id),
            user_id=str(new_profile.user_id),
            created_at=new_profile.created_at.isoformat(),
            updated_at=new_profile.updated_at.isoformat(),
            **new_profile.profile_data,
        )


@router.get("/profile", response_model=StudentProfileRead | None)
async def get_profile(
    db: Session = Depends(get_db),
    user: AuthenticatedUser = Depends(get_current_user),
) -> StudentProfileRead | None:
    """Get student profile"""
    repository.get_or_create_user(db, user_id=user.id, email=user.email)

    profile = repository.get_student_profile(db, user_id=user.id)

    if not profile:
        return None

    return StudentProfileRead(
        id=str(profile.id),
        user_id=str(profile.user_id),
        created_at=profile.created_at.isoformat(),
        updated_at=profile.updated_at.isoformat(),
        **profile.profile_data,
    )
