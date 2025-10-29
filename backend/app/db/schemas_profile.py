"""
Student Profile Schemas
Contains the 41 features required by the ML model
"""

from datetime import date
from pydantic import BaseModel, Field


class StudentProfile(BaseModel):
    """Student profile with all 41 features required by the model"""

    # Demographic & Background (5 features)
    SEXO: str = Field(..., description="Gender: M/F")
    ESTADO_CIVIL: str = Field(..., description="Marital status")
    TIPO_COLEGIO_COD: str = Field(..., description="High school type code")
    FECHA_NACIMIENTO: str = Field(..., description="Birth date (YYYY-MM-DD)")
    PTJE_INGRESO: float = Field(..., description="Admission test score")

    # Academic History (8 features)
    PROM_POND_HIST: float = Field(default=0.0, description="Weighted average historical grades")
    NOTA_MAX_HIST: float = Field(default=0.0, description="Maximum historical grade")
    NOTA_MIN_HIST: float = Field(default=0.0, description="Minimum historical grade")
    NOTA_MEDIAN_HIST: float = Field(default=0.0, description="Median historical grade")
    NOTA_Q1_HIST: float = Field(default=0.0, description="Q1 historical grade")
    NOTA_Q3_HIST: float = Field(default=0.0, description="Q3 historical grade")
    ASIST_PROM_HIST: float = Field(default=0.95, description="Historical attendance percentage (0-1)")
    CRED_APROB_HIST: int = Field(default=0, description="Total credits approved historically")

    # Course Cluster-Specific History (8 features)
    PROM_POND_CLUSTER_HIST: float = Field(default=0.0, description="Weighted avg in same course cluster")
    NOTA_MAX_CLUSTER_HIST: float = Field(default=0.0, description="Max grade in cluster")
    NOTA_MIN_CLUSTER_HIST: float = Field(default=0.0, description="Min grade in cluster")
    NOTA_MEDIAN_CLUSTER_HIST: float = Field(default=0.0, description="Median grade in cluster")
    NOTA_Q1_CLUSTER_HIST: float = Field(default=0.0, description="Q1 grade in cluster")
    NOTA_Q3_CLUSTER_HIST: float = Field(default=0.0, description="Q3 grade in cluster")
    ASIST_PROM_CLUSTER_HIST: float = Field(default=0.95, description="Attendance in cluster (0-1)")
    CRED_APROB_CLUSTER_HIST: int = Field(default=0, description="Approved credits in cluster")

    # Current Course Details (5 features) - will be set dynamically per course
    COD_CURSO: int = Field(default=0, description="Course code (label encoded)")
    CREDITOS: int = Field(default=3, description="Credits in course")
    TIPO_CURSO: str = Field(default="O", description="Course type: O/EH/EP")
    HRS_CURSO: int = Field(default=4, description="Course hours")
    CLUSTER_CURSO: int = Field(default=0, description="Course cluster 0-7")

    # Student Progress & Status (7 features)
    SEM_CURSADOS: int = Field(default=0, description="Semesters completed")
    CANT_RESERVAS: int = Field(default=0, description="Number of course reserves")
    SEM: int = Field(default=1, description="Current semester")
    NIVEL_CURSO: int = Field(default=1, description="Course level")
    BECA_VIGENTE: int = Field(default=0, description="Active scholarship: 1=yes, 0=no")
    ESTADO_PASADO: str = Field(default="Regular", description="Previous status")
    HRS_INASISTENCIA_ACUM_PASADO_y: float = Field(default=0.0, description="Accumulated absences")

    # Institutional/Socioeconomic (3 features)
    FAMILIA: str = Field(default="CS", description="Family type: CS/FG/MA/ET/CB")
    CODIGO_y: int = Field(default=0, description="Course code variant")
    POBREZA_RES: float = Field(default=0.0, description="Residential poverty index")
    POBREZA_PRO: float = Field(default=0.0, description="Provincial poverty index")

    # Period & Timing (2 features)
    PER_INGRESO_NUM: float = Field(..., description="Admission period (YYYY.1 or YYYY.2)")
    PER_MATRICULA_NUM: float = Field(..., description="Registration period (YYYY.1 or YYYY.2)")

    model_config = {"extra": "allow"}


class StudentProfileSimplified(BaseModel):
    """Simplified student profile for the frontend form (most important fields)"""

    # Essential Demographics
    sexo: str = Field(..., description="Gender: M/F")
    fecha_nacimiento: str = Field(..., description="Birth date (YYYY-MM-DD)")
    estado_civil: str = Field(default="Soltero", description="Marital status")
    tipo_colegio: str = Field(..., description="High school type: Público/Privado")

    # Academic Performance
    promedio_general: float = Field(..., ge=0, le=20, description="General average (0-20)")
    creditos_aprobados: int = Field(default=0, ge=0, description="Total approved credits")
    puntaje_ingreso: float = Field(..., ge=0, le=100, description="Admission score (0-100)")

    # Current Status
    semestres_cursados: int = Field(default=0, ge=0, description="Semesters completed")
    tiene_beca: bool = Field(default=False, description="Has scholarship")
    cantidad_reservas: int = Field(default=0, ge=0, description="Number of course reserves")

    # Socioeconomic
    familia: str = Field(default="CS", description="Program family")
    periodo_ingreso: str = Field(..., description="Admission period (YYYY-1 or YYYY-2)")

    # Academic progress details (optional)
    cursos_aprobados: list[str] = Field(default_factory=list, description="Approved course names (optional)")
    cursos_aprobados_codigos: list[str] = Field(default_factory=list, description="Approved course codes (optional)")


class StudentProfileCreate(StudentProfileSimplified):
    """Schema for creating a student profile"""
    pass


class StudentProfileRead(StudentProfileSimplified):
    """Schema for reading a student profile"""
    id: str
    user_id: str
    created_at: str
    updated_at: str

    model_config = {"from_attributes": True}
