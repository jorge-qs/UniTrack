"""
Profile Mapper: Converts simplified student profile to 41 features for ML model
"""

from datetime import datetime
from typing import Dict


def simplified_to_full_features(profile_data: dict, course_code: str = "CS2H1") -> Dict[str, float]:
    """
    Convert simplified profile (from form) to 41 features required by the model.

    Args:
        profile_data: Dictionary with simplified profile fields
        course_code: Course code for the prediction

    Returns:
        Dictionary with all 41 features ready for model input
    """

    # Parse period (e.g., "2024-1" -> 2024.1)
    periodo = profile_data.get("periodo_ingreso", "2024-1")
    year, semester = periodo.split("-")
    per_ingreso_num = float(f"{year}.{semester}")
    per_matricula_num = per_ingreso_num  # Assume same for simplicity

    # Map tipo_colegio to code
    tipo_colegio_map = {
        "Público": "1",
        "Privado": "2",
        "Público - Provincial": "3",
        "Privado - Religioso": "4",
    }
    tipo_colegio_cod = tipo_colegio_map.get(profile_data.get("tipo_colegio", "Público"), "1")

    # Calculate age from fecha_nacimiento
    try:
        fecha_nac = datetime.fromisoformat(profile_data.get("fecha_nacimiento", "2000-01-01"))
        edad_actual = (datetime.now() - fecha_nac).days / 365.25
    except:
        edad_actual = 20  # Default age

    # Get simplified fields with defaults
    promedio = profile_data.get("promedio_general", 14.0)
    creditos_aprobados = profile_data.get("creditos_aprobados", 0)
    puntaje_ingreso = profile_data.get("puntaje_ingreso", 70.0)
    semestres = profile_data.get("semestres_cursados", 0)
    tiene_beca = 1 if profile_data.get("tiene_beca", False) else 0
    cantidad_reservas = profile_data.get("cantidad_reservas", 0)

    # Course cluster mapping (simplified - based on course code prefix)
    cluster_map = {
        "CS1": 1,  # Discrete Math & Theory
        "CS2": 7,  # Advanced Programming
        "CS3": 2,  # Systems & Engineering
        "FG": 3,   # General Education
        "MA": 5,   # Mathematics
        "CB": 5,   # Basic Sciences
        "ET": 2,   # Engineering
    }
    prefix = course_code[:2] if len(course_code) >= 2 else "CS"
    cluster_curso = cluster_map.get(prefix, 0)

    # Build the 41 features
    features = {
        # Demographic & Background (5)
        "SEXO": 1 if profile_data.get("sexo", "M") == "M" else 0,
        "ESTADO_CIVIL": 0,  # 0=Soltero (most common for students)
        "TIPO_COLEGIO_COD": float(tipo_colegio_cod),
        "FECHA_NACIMIENTO": edad_actual,  # Use age instead of date
        "PTJE_INGRESO": puntaje_ingreso,

        # Academic History (8) - estimated from promedio_general
        "PROM_POND_HIST": promedio if semestres > 0 else 0.0,
        "NOTA_MAX_HIST": min(promedio + 2.0, 20.0) if semestres > 0 else 0.0,
        "NOTA_MIN_HIST": max(promedio - 3.0, 0.0) if semestres > 0 else 0.0,
        "NOTA_MEDIAN_HIST": promedio if semestres > 0 else 0.0,
        "NOTA_Q1_HIST": max(promedio - 1.5, 0.0) if semestres > 0 else 0.0,
        "NOTA_Q3_HIST": min(promedio + 1.5, 20.0) if semestres > 0 else 0.0,
        "ASIST_PROM_HIST": 0.92 if semestres > 0 else 0.95,  # Slightly lower avg attendance
        "CRED_APROB_HIST": float(creditos_aprobados),

        # Course Cluster History (8) - estimated from overall history
        "PROM_POND_CLUSTER_HIST": promedio * 0.95 if semestres > 0 else 0.0,
        "NOTA_MAX_CLUSTER_HIST": min(promedio + 1.5, 20.0) if semestres > 0 else 0.0,
        "NOTA_MIN_CLUSTER_HIST": max(promedio - 2.5, 0.0) if semestres > 0 else 0.0,
        "NOTA_MEDIAN_CLUSTER_HIST": promedio * 0.98 if semestres > 0 else 0.0,
        "NOTA_Q1_CLUSTER_HIST": max(promedio - 1.2, 0.0) if semestres > 0 else 0.0,
        "NOTA_Q3_CLUSTER_HIST": min(promedio + 1.2, 20.0) if semestres > 0 else 0.0,
        "ASIST_PROM_CLUSTER_HIST": 0.93 if semestres > 0 else 0.95,
        "CRED_APROB_CLUSTER_HIST": float(creditos_aprobados * 0.3),  # ~30% in same cluster

        # Current Course Details (5)
        "COD_CURSO": float(hash(course_code) % 1000),  # Simple encoding
        "CREDITOS": 3.0,  # Default 3 credits
        "TIPO_CURSO": 0.0,  # 0=Obligatorio (most common)
        "HRS_CURSO": 4.0,  # Default 4 hours
        "CLUSTER_CURSO": float(cluster_curso),

        # Student Progress & Status (7)
        "SEM_CURSADOS": float(semestres),
        "CANT_RESERVAS": float(cantidad_reservas),
        "SEM": float(semestres + 1),  # Current semester
        "NIVEL_CURSO": 2.0,  # Default level 2
        "BECA_VIGENTE": float(tiene_beca),
        "ESTADO_PASADO": 0.0,  # 0=Regular
        "HRS_INASISTENCIA_ACUM_PASADO_y": 0.0,  # Assume no absences for new prediction

        # Institutional/Socioeconomic (4)
        "FAMILIA": 0.0,  # 0=CS (Computer Science - most common)
        "CODIGO_y": float(hash(course_code) % 100),
        "POBREZA_RES": 0.2,  # Default low poverty index
        "POBREZA_PRO": 0.25,  # Default low poverty index

        # Period & Timing (2)
        "PER_INGRESO_NUM": per_ingreso_num,
        "PER_MATRICULA_NUM": per_matricula_num,

        # Additional encoded categorical features (2)
        "TIPO_CICLO": 0.0,  # 0=Regular (most common cycle type)
        "CURSO": float(hash(course_code) % 500),  # Alternative course encoding
    }

    return features
