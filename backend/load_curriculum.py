"""
Script to load curriculum data (malla_curricular_2016.csv) into the database
"""
import csv
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent))

from app.db.base import SessionLocal
from app.db.models import Course


def parse_semester(sem_str: str) -> int:
    """Convert semester string (I, II, III, etc.) to number"""
    roman_to_int = {
        'I': 1, 'II': 2, 'III': 3, 'IV': 4, 'V': 5,
        'VI': 6, 'VII': 7, 'VIII': 8, 'IX': 9, 'X': 10,
        'XI': 11, 'XII': 12
    }
    return roman_to_int.get(sem_str.strip(), 0)


def parse_prerequisites(prereq_str: str) -> list:
    """Parse prerequisites string into list of course names"""
    if not prereq_str or prereq_str.strip() == '[]':
        return []

    # Remove brackets and quotes
    prereq_str = prereq_str.strip('[]').replace("'", "").replace('"', '')

    # Split by comma
    if ',' in prereq_str:
        prereqs = [p.strip() for p in prereq_str.split(',')]
    else:
        prereqs = [prereq_str.strip()] if prereq_str.strip() else []

    return [p for p in prereqs if p]


def load_curriculum(csv_path: str):
    """Load curriculum from CSV file into database"""
    db = SessionLocal()

    try:
        with open(csv_path, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)

            courses_added = 0
            courses_updated = 0

            for row in reader:
                cod_curso = row['CODIGO'].strip()
                nombre = row['CURSO'].strip()
                semestre = parse_semester(row['SEM'])
                tipo = row['TIPO'].strip()
                horas = int(row['HORAS']) if row['HORAS'] else None
                creditos = int(row['CREDITOS']) if row['CREDITOS'] else None
                prerequisitos = parse_prerequisites(row['PREREQUISITO'])

                # Check if course exists
                existing = db.query(Course).filter(Course.cod_curso == cod_curso).first()

                if existing:
                    # Update existing course
                    existing.nombre = nombre
                    existing.semestre = semestre
                    existing.tipo = tipo
                    existing.horas = horas
                    existing.creditos = creditos
                    existing.prerequisitos = prerequisitos
                    courses_updated += 1
                else:
                    # Create new course
                    course = Course(
                        cod_curso=cod_curso,
                        nombre=nombre,
                        semestre=semestre,
                        tipo=tipo,
                        horas=horas,
                        creditos=creditos,
                        prerequisitos=prerequisitos
                    )
                    db.add(course)
                    courses_added += 1

                print(f"{'Updated' if existing else 'Added'}: {cod_curso} - {nombre} (Sem {semestre}, Prereqs: {len(prerequisitos)})")

        db.commit()
        print(f"\n✅ Success! Added {courses_added} new courses, updated {courses_updated} existing courses.")

    except Exception as e:
        db.rollback()
        print(f"\n❌ Error: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    # Path to CSV file
    csv_file = Path(__file__).parent.parent / "ml_models" / "data" / "malla_curricular_2016.csv"

    if not csv_file.exists():
        print(f"❌ Error: CSV file not found at {csv_file}")
        sys.exit(1)

    print(f"📚 Loading curriculum from: {csv_file}")
    load_curriculum(str(csv_file))
