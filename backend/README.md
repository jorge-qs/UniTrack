# UniTrack Backend

Backend en FastAPI para el proyecto UniTrack. Expone endpoints protegidos con Supabase Auth JWT, persiste historiales en PostgreSQL y sirve predicciones utilizando el modelo entrenado ubicado en `../ml_models/models/model.pkl`.

## Requisitos previos
- Python 3.11
- PostgreSQL (local o Supabase)
- [pip](https://pip.pypa.io/) o gestor equivalente

## Configuración local

```bash
# 1) Variables de entorno
cp .env.example .env

# 2) Entorno virtual e instalación
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt

# 3) Migraciones
alembic upgrade head

# 4) Ejecutar en modo desarrollo
uvicorn app.main:app --reload --port 8000
```

### Variables obligatorias (`.env`)
- `APP_ENV`: `dev`, `test` o `prod`
- `APP_NAME`
- `API_PREFIX`: normalmente `/api/v1`
- `FRONTEND_ORIGIN`: dominio permitido por CORS (ej. `https://tu-frontend.vercel.app`)
- `AUTH_MODE`: `supabase` o `mock` (solo para desarrollo/tests)
- `SUPABASE_PROJECT_REF`, `SUPABASE_JWKS_URL`, `SUPABASE_AUDIENCE`
- `DATABASE_URL`: cadena SQLAlchemy (ej. `postgresql+psycopg2://user:pass@host:5432/postgres?sslmode=require`)
- `MODEL_PATH`: ruta relativa al modelo (`../ml_models/models/model.pkl`)
- `MODEL_VERSION`: etiqueta para trazabilidad de predicciones

## Endpoints principales
- `GET /api/v1/healthz`: verificación de salud.
- `GET /api/v1/auth/me`: devuelve el usuario autenticado (`Authorization: Bearer <token>`).
- `POST /api/v1/predict`: procesa una predicción y la guarda en BD.
- `POST /api/v1/whatif`: aplica deltas a las características para simulaciones.
- `GET /api/v1/history`: historiales paginados del usuario autenticado.

## Pruebas

```bash
pytest
```

Las pruebas usan SQLite y modo de autenticación `mock` para evitar dependencias externas.

## Docker / Railway
- `Dockerfile` listo para construir la imagen (puerto 8080).
- `docker-compose.yml` opcional para desarrollo local (`api` + `postgres`).
- Para Railway, montar este directorio, definir variables de entorno y ejecutar `uvicorn app.main:app --host 0.0.0.0 --port 8080`.

## Suposiciones
- El frontend enviará `cod_curso` y un diccionario `features` con valores numéricos.
- Si `MODEL_PATH` no existe, el servicio usa un modelo mock (score constante = 0.5) y continúa funcionando.
- Los cursos se crean automáticamente al recibir predicciones, usando el código como nombre por defecto.
