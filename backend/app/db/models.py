from __future__ import annotations

import uuid
from datetime import datetime
from typing import Any

from sqlalchemy import JSON, ForeignKey, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.types import CHAR, TypeDecorator

from app.db.base import Base


class GUID(TypeDecorator):
    """Platform-independent GUID type."""

    impl = CHAR
    cache_ok = True

    def load_dialect_impl(self, dialect):
        if dialect.name == "postgresql":
            from sqlalchemy.dialects.postgresql import UUID as PGUUID

            return dialect.type_descriptor(PGUUID(as_uuid=True))
        return dialect.type_descriptor(CHAR(36))

    def process_bind_param(self, value: Any, dialect) -> Any:
        if value is None:
            return value
        if isinstance(value, uuid.UUID):
            return str(value)
        return str(uuid.UUID(str(value)))

    def process_result_value(self, value: Any, dialect) -> Any:
        if value is None:
            return value
        return uuid.UUID(value)


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(GUID(), primary_key=True, default=uuid.uuid4)
    email: Mapped[str] = mapped_column(String(length=255), nullable=False, unique=True)
    password_hash: Mapped[str] = mapped_column(String(length=255), nullable=False)
    full_name: Mapped[str | None] = mapped_column(String(length=255), nullable=True)
    is_active: Mapped[bool] = mapped_column(default=True)
    created_at: Mapped[datetime] = mapped_column(default=func.now())
    updated_at: Mapped[datetime] = mapped_column(default=func.now(), onupdate=func.now())

    inferences: Mapped[list["Inference"]] = relationship(back_populates="user")
    profile: Mapped["StudentProfileModel"] = relationship(back_populates="user", uselist=False)


class Course(Base):
    __tablename__ = "courses"

    cod_curso: Mapped[str] = mapped_column(String(length=32), primary_key=True)
    nombre: Mapped[str] = mapped_column(String(length=255))
    semestre: Mapped[int | None] = mapped_column(nullable=True)  # Semester number (I=1, II=2, etc.)
    tipo: Mapped[str | None] = mapped_column(String(length=10), nullable=True)  # O, EH, EP
    horas: Mapped[int | None] = mapped_column(nullable=True)
    creditos: Mapped[int | None] = mapped_column(nullable=True)
    prerequisitos: Mapped[dict[str, Any]] = mapped_column(JSON, nullable=True)  # List of prerequisite course names
    familia: Mapped[str | None] = mapped_column(String(length=255), nullable=True)
    nivel: Mapped[int | None] = mapped_column(nullable=True)

    inferences: Mapped[list["Inference"]] = relationship(back_populates="course")


class Inference(Base):
    __tablename__ = "inferences"

    id: Mapped[uuid.UUID] = mapped_column(GUID(), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(GUID(), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    cod_curso: Mapped[str] = mapped_column(String(length=32), ForeignKey("courses.cod_curso"), nullable=False)
    input_payload: Mapped[dict[str, Any]] = mapped_column("input", JSON, nullable=False)
    output_payload: Mapped[dict[str, Any]] = mapped_column("output", JSON, nullable=False)
    version: Mapped[str] = mapped_column(String(length=32), nullable=False, default="v1")
    created_at: Mapped[datetime] = mapped_column(default=func.now())

    user: Mapped["User"] = relationship(back_populates="inferences")
    course: Mapped["Course"] = relationship(back_populates="inferences")


class StudentProfileModel(Base):
    __tablename__ = "student_profiles"

    id: Mapped[uuid.UUID] = mapped_column(GUID(), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(GUID(), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True)

    # Store profile data as JSON for flexibility
    profile_data: Mapped[dict[str, Any]] = mapped_column(JSON, nullable=False)

    created_at: Mapped[datetime] = mapped_column(default=func.now())
    updated_at: Mapped[datetime] = mapped_column(default=func.now(), onupdate=func.now())

    user: Mapped["User"] = relationship(back_populates="profile")
