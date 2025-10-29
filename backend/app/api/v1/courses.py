from __future__ import annotations

from typing import List

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import or_, func
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.core.security import AuthenticatedUser
from app.db.models import Course
from app.db.repository import get_student_profile
from app.db.schemas import CourseRead


router = APIRouter()


@router.get("/courses/available", response_model=List[CourseRead])
async def get_available_courses(
    db: Session = Depends(get_db),
    user: AuthenticatedUser = Depends(get_current_user),
    max_next_semesters: int = Query(1, ge=0, le=3),
) -> list[CourseRead]:
    """
    Return available courses for the current user based on their profile.

    Minimal viable logic:
    - If the user has a profile, use `semestres_cursados` to allow courses up to next semester window.
    - Only include courses without prerequisites (prerequisitos empty/None),
      since we don't yet track cursos_aprobados.
    - If no profile, return all courses without prerequisites as a fallback.
    """
    profile = get_student_profile(db, user_id=user.id)

    semestre_limit: int | None = None
    if profile is not None:
        try:
            semestres_cursados = int(profile.profile_data.get("semestres_cursados", 0))
            semestre_limit = semestres_cursados + max_next_semesters
        except (TypeError, ValueError):
            semestre_limit = None

    # Base filter: by semester window (if provided)
    base_query = db.query(Course)
    if semestre_limit is not None:
        # Only enforce upper bound to include cursos de semestres anteriores sin prerequisitos
        base_query = base_query.filter((Course.semestre == None) | (Course.semestre <= semestre_limit))  # noqa: E711

    # If we have an approved-courses list in profile, enforce prerequisites
    approved_names: set[str] = set()
    approved_codes: set[str] = set()
    if profile and isinstance(profile.profile_data, dict):
        try:
            # Normalize to uppercase without surrounding spaces for robustness
            approved_names = {str(x).strip().upper() for x in (profile.profile_data.get("cursos_aprobados", []) or [])}
            approved_codes = {str(x).strip().upper() for x in (profile.profile_data.get("cursos_aprobados_codigos", []) or [])}
        except Exception:
            approved_names = set()
            approved_codes = set()

    # If the user marked approved courses but did not set semestres_cursados, infer progress
    if (semestre_limit is None or semestre_limit == max_next_semesters) and (approved_names or approved_codes):
        try:
            cond = []
            if approved_codes:
                cond.append(func.upper(Course.cod_curso).in_(approved_codes))
            if approved_names:
                cond.append(func.upper(Course.nombre).in_(approved_names))
            if cond:
                rows = db.query(Course.semestre).filter(or_(*cond)).all()
                max_sem = max([r[0] or 0 for r in rows], default=0)
                # Use the greater of declared semestres_cursados and inferred from approved courses
                base_sem = max_sem
                try:
                    base_sem = max(base_sem, int(profile.profile_data.get("semestres_cursados", 0)))  # type: ignore[arg-type]
                except Exception:
                    pass
                semestre_limit = base_sem + max_next_semesters
        except Exception:
            pass

    def prereqs_satisfied(course: Course) -> bool:
        # If no prerequisites, it's available
        if not course.prerequisitos:
            return True
        # If we don't know approved names, default to showing only no-prereq courses
        if not approved_names:
            return False
        # All prereq names must be in approved_names
        try:
            return all((str(p).strip().upper() in approved_names) for p in course.prerequisitos)
        except Exception:
            return False

    def not_already_taken(course: Course) -> bool:
        name_ok = (course.nombre or "").strip().upper() not in approved_names
        code_ok = (course.cod_curso or "").strip().upper() not in approved_codes
        return name_ok and code_ok

    # Fetch and apply Python-side filter for prerequisites (JSON field)
    all_candidates = base_query.order_by(Course.semestre.asc().nullsfirst(), Course.cod_curso.asc()).all()
    courses = [c for c in all_candidates if prereqs_satisfied(c) and not_already_taken(c)]

    return [
        CourseRead(
            cod_curso=c.cod_curso,
            nombre=c.nombre,
            semestre=c.semestre,
            tipo=c.tipo,
            horas=c.horas,
            creditos=c.creditos,
            prerequisitos=c.prerequisitos or [],
            familia=c.familia,
            nivel=c.nivel,
        )
        for c in courses
    ]


@router.get("/courses/all", response_model=List[CourseRead])
async def list_all_courses(
    db: Session = Depends(get_db),
    user: AuthenticatedUser = Depends(get_current_user),
) -> list[CourseRead]:
    """Return all courses in the curriculum (no filtering)."""
    items = (
        db.query(Course)
        .order_by(Course.semestre.asc().nullsfirst(), Course.cod_curso.asc())
        .all()
    )
    return [
        CourseRead(
            cod_curso=c.cod_curso,
            nombre=c.nombre,
            semestre=c.semestre,
            tipo=c.tipo,
            horas=c.horas,
            creditos=c.creditos,
            prerequisitos=c.prerequisitos or [],
            familia=c.familia,
            nivel=c.nivel,
        )
        for c in items
    ]
