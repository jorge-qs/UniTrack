from __future__ import annotations

from datetime import datetime
from typing import Any, Dict, Optional

from pydantic import BaseModel, Field


class UserCreate(BaseModel):
    id: str
    email: Optional[str] = None


class UserRead(BaseModel):
    id: str
    email: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class PredictRequest(BaseModel):
    course_code: str = Field(..., alias="cod_curso")
    features: Dict[str, float] = Field(default_factory=dict)  # Allow empty dict
    metadata: Dict[str, Any] | None = None

    model_config = {"allow_population_by_field_name": True}


class WhatIfRequest(PredictRequest):
    deltas: Dict[str, float] = Field(default_factory=dict)


class PredictionResult(BaseModel):
    course_code: str = Field(..., alias="cod_curso")
    prediction_label: str
    score: float
    version: str
    details: Dict[str, Any]
    estimated_grade: float | None = None
    max_grade: float | None = None

    model_config = {"populate_by_name": True}


class InferenceRead(BaseModel):
    id: str
    course_code: str = Field(..., alias="cod_curso")
    prediction_label: str
    score: float
    version: str
    created_at: datetime
    input_payload: Dict[str, Any]
    output_payload: Dict[str, Any]

    model_config = {"from_attributes": True, "populate_by_name": True}


class HistoryResponse(BaseModel):
    items: list[InferenceRead]
    total: int
    limit: int
    offset: int


class CourseRead(BaseModel):
    cod_curso: str
    nombre: str
    semestre: int | None = None
    tipo: str | None = None
    horas: int | None = None
    creditos: int | None = None
    prerequisitos: list[str] | None = None
    familia: str | None = None
    nivel: int | None = None

    model_config = {"from_attributes": True}
