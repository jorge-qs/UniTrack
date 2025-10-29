from __future__ import annotations

import uuid
from typing import Tuple

from sqlalchemy import Select, func, select
from sqlalchemy.exc import NoResultFound
from sqlalchemy.orm import Session

from app.db import models
from app.core.password import hash_password


def get_or_create_user(session: Session, user_id: str, email: str | None = None) -> models.User:
    try:
        stmt: Select[Tuple[models.User]] = select(models.User).where(models.User.id == uuid.UUID(user_id))
        user = session.execute(stmt).scalar_one()
        return user
    except (NoResultFound, ValueError):
        pass

    # Create a placeholder user. For external/mock auth flows, set a dummy password hash
    # to satisfy NOT NULL constraints while ensuring it's not a usable credential.
    dummy_hash = hash_password("external-auth-placeholder")
    user = models.User(id=uuid.UUID(user_id), email=email or None, password_hash=dummy_hash)
    session.add(user)
    session.flush()
    return user


def create_inference(
    session: Session,
    *,
    user_id: str,
    course_code: str,
    input_payload: dict,
    output_payload: dict,
    version: str,
) -> models.Inference:
    inference = models.Inference(
        user_id=uuid.UUID(user_id),
        cod_curso=course_code,
        input_payload=input_payload,
        output_payload=output_payload,
        version=version,
    )
    session.add(inference)
    session.flush()
    return inference


def get_or_create_course(
    session: Session,
    *,
    course_code: str,
    nombre: str | None = None,
) -> models.Course:
    stmt = select(models.Course).where(models.Course.cod_curso == course_code)
    result = session.execute(stmt).scalar_one_or_none()
    if result:
        return result

    course = models.Course(
        cod_curso=course_code,
        nombre=nombre or course_code,
    )
    session.add(course)
    session.flush()
    return course


def list_user_inferences(session: Session, *, user_id: str, limit: int = 50, offset: int = 0) -> tuple[list[models.Inference], int]:
    stmt = (
        select(models.Inference)
        .where(models.Inference.user_id == uuid.UUID(user_id))
        .order_by(models.Inference.created_at.desc())
        .limit(limit)
        .offset(offset)
    )
    items = list(session.execute(stmt).scalars().all())

    total_stmt = select(func.count(models.Inference.id)).where(models.Inference.user_id == uuid.UUID(user_id))
    total = session.execute(total_stmt).scalar_one()
    return items, total


def create_student_profile(session: Session, *, user_id: str, profile_data: dict) -> models.StudentProfileModel:
    """Create a new student profile"""
    profile = models.StudentProfileModel(
        user_id=uuid.UUID(user_id),
        profile_data=profile_data,
    )
    session.add(profile)
    session.flush()
    return profile


def get_student_profile(session: Session, *, user_id: str) -> models.StudentProfileModel | None:
    """Get student profile by user_id"""
    stmt = select(models.StudentProfileModel).where(models.StudentProfileModel.user_id == uuid.UUID(user_id))
    return session.execute(stmt).scalar_one_or_none()


def update_student_profile(session: Session, *, user_id: str, profile_data: dict) -> models.StudentProfileModel:
    """Update existing student profile"""
    stmt = select(models.StudentProfileModel).where(models.StudentProfileModel.user_id == uuid.UUID(user_id))
    profile = session.execute(stmt).scalar_one()
    profile.profile_data = profile_data
    session.flush()
    return profile
