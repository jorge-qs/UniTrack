# 🧾 Prompt FINAL para Codex — Backend de **UniTrack** (lista para deploy)

> **Contexto:** Ya existe el **frontend** (Next.js/Vercel). Necesitamos un **backend en Python** con autenticación de usuarios mediante **Supabase Auth (JWT)** y una **BD PostgreSQL en Supabase**. Debe exponer endpoints para predicción por curso, historiales y what‑if, y estar **listo para desplegar en Railway** con Docker. Soporta **múltiples usuarios**.

---

## 0) Decisiones de arquitectura (fijas)
- **Backend:** Python 3.11 + **FastAPI** + Uvicorn.
- **Auth:** **Supabase Auth** (JWT RS256). El backend debe **verificar el JWT** usando **JWKS** (`https://<PROJECT-REF>.supabase.co/auth/v1/keys`) y extraer `sub` como `user_id`.
- **BD:** **PostgreSQL en Supabase**. Conexión por `DATABASE_URL` (psycopg2). ORM **SQLAlchemy 2** + **Alembic**.
- **ML:** Cargar `model.pkl` (scikit‑learn + joblib) en memoria (singleton). Featurizado consistente.
- **CORS:** Permitir **solo** el dominio del frontend en Vercel.
- **Deploy:** **Railway** (o Render) usando **Dockerfile**.
- **Pruebas:** pytest + httpx. Mocks si no existe `model.pkl`.
- **Logs:** `structlog` + logs de uvicorn. Sin imprimir secretos.

> El backend es **independiente** del frontend y quedará en `/backend`. El monorepo tiene también `/ml_models` (contiene `models/model.pkl`).

---

## 1) Estructura que debes generar (en `/backend`)

```
backend/
├─ app/
│  ├─ main.py
│  ├─ api/
│  │  ├─ deps.py
│  │  ├─ v1/
│  │  │  ├─ auth.py        # GET /auth/me
│  │  │  ├─ predict.py     # POST /predict
│  │  │  ├─ whatif.py      # POST /whatif
│  │  │  ├─ history.py     # GET  /history
│  │  │  └─ health.py      # GET  /healthz
│  ├─ core/
│  │  ├─ config.py         # settings/env/CORS
│  │  ├─ security.py       # verify JWT via Supabase JWKS
│  │  └─ logging.py
│  ├─ db/
│  │  ├─ base.py           # engine, SessionLocal
│  │  ├─ models.py         # SQLAlchemy models
│  │  ├─ schemas.py        # Pydantic schemas
│  │  ├─ repository.py     # CRUD helpers
│  │  └─ migrations/       # Alembic
│  ├─ ml/
│  │  ├─ model_loader.py   # singleton para cargar ../ml_models/models/model.pkl
│  │  └─ featurizer.py     # mapeo/orden/validación de features
│  └─ services/
│     └─ inference.py      # wrapper de predict/predict_proba
├─ tests/
│  ├─ test_health.py
│  ├─ test_auth_me.py
│  ├─ test_predict_mock.py
│  └─ conftest.py
├─ requirements.txt
├─ Dockerfile
├─ .env.example
├─ docker-compose.yml      # (opcional para dev: api + postgres)
└─ README.md
```

**Nota:** El monorepo tiene al lado:
```
UniTrack/
├─ ml_models/
│  ├─ models/        # aquí vive model.pkl
│  ├─ data/
│  └─ src/
├─ frontend/
└─ backend/          # (generar aquí)
```

---

## 2) Variables de entorno (coloca en `.env.example` y usa en `config.py`)

```bash
# App
APP_ENV=prod
APP_NAME=UniTrack API
API_PREFIX=/api/v1
FRONTEND_ORIGIN=https://<tu-frontend>.vercel.app

# Auth (Supabase JWT)
AUTH_MODE=supabase
SUPABASE_PROJECT_REF=xxxxxxx
SUPABASE_JWKS_URL=https://<PROJECT-REF>.supabase.co/auth/v1/keys
SUPABASE_AUDIENCE=authenticated

# Database (Supabase Postgres)
DATABASE_URL=postgresql+psycopg2://user:pass@host:5432/postgres?sslmode=require

# ML model path (relativo al monorepo)
MODEL_PATH=../ml_models/models/model.pkl
```

- `config.py` debe leer estas variables y exponer un objeto de settings.
- **CORS:** usa `FRONTEND_ORIGIN` para `allow_origins=[FRONTEND_ORIGIN]`.

---

## 3) Esquema de datos (SQLAlchemy + Alembic)

Modelos mínimos:

- **User** (no crear si usamos Supabase; pero define tipo para FK):
  - `id: UUID` (pk, tomado de `sub` del JWT),
  - `email: str` (opcional para trazas),
  - `created_at: timestamptz`.

- **Inference**
  - `id: UUID` (pk)
  - `user_id: UUID` (fk a User.id)
  - `cod_curso: str`
  - `input: JSONB`
  - `output: JSONB`
  - `version: str`
  - `created_at: timestamptz` (default `now()`)

- **Course** (opcional, para catálogo)
  - `cod_curso: str` (pk)
  - `nombre: str`
  - `creditos: int`
  - `familia: str`
  - `nivel: int`

Incluye:
- **migración inicial** en Alembic,
- índices razonables (por `user_id`, `created_at`).

---

## 4) Endpoints (contratos)

### `GET /api/v1/healthz`
- **200 OK** → `{ "status": "ok" }`

### `GET /api/v1/auth/me`
- **Auth:** Header `Authorization: Bearer <JWT>` (Supabase).
- **Acción:** Verifica JWT con JWKS, valida `audience`, extrae `sub` y (si está en claims) `email`.
- **200 OK** → `{ "id": "<uuid>", "email": "..." }`

### `POST /api/v1/predict`
- **Auth:** Bearer JWT.
- **Body:**
```json
{
  "cod_persona": 8839,
  "cod_curso": "CS2H1",
  "features": { "PTJE_INGRESO": 133.0, "EDAD": 21, "CREDITOS": 3 }
}
```
- **Proceso:**
  - Validar con Pydantic.
  - `featurizer.py` produce vector ordenado.
  - `model_loader.py` retorna modelo cacheado (singleton).
  - Ejecuta `predict` (y `predict_proba` si existe).
  - Guarda en `inferences` con `user_id` (del JWT), `input`, `output`, `version`.
- **200 OK:**
```json
{
  "id": "<uuid-inference>",
  "prediction": { "label": "Aprobar", "score": 0.78 },
  "explain": [
    {"feature": "AVG_NG", "impact": 0.21},
    {"feature": "PRCTJE-NPC-S", "impact": 0.15},
    {"feature": "CREDITOS", "impact": -0.06}
  ],
  "version": "model_vX.Y"
}
```

### `POST /api/v1/whatif`
- **Auth:** Bearer JWT.
- **Body:** igual a `/predict` + campo `deltas` (p.ej. `{ "horas_estudio": +2 }`).
- **Resp:** mismo formato que `/predict`. Si no hay lógica, simular con +/- 0.02 en `score`.

### `GET /api/v1/history?limit=50&offset=0`
- **Auth:** Bearer JWT.
- **Resp 200:** lista paginada **solo** del usuario (`WHERE user_id = sub`).

*(Opcional)* `GET /api/v1/courses` — devuelve catálogo desde BD (si poblamos `courses`).

---

## 5) Seguridad
- Verificar JWT RS256 con **JWKS**.
- Validar `exp`, `nbf`, `aud` = `SUPABASE_AUDIENCE`.
- **CORS** restringido a `FRONTEND_ORIGIN`.
- **No loggear** tokens ni `DATABASE_URL`.
- Manejo de errores con `HTTPException` y respuestas JSON coherentes.

---

## 6) Carga del modelo y featurizado
- `model_loader.py`:
  - Usa `MODEL_PATH` (por env). Si archivo no existe, habilita modo **mock** (devuelve `score=0.5` fijo) y loguea warning.
  - Carga con `joblib.load` y cachea en módulo (singleton).
- `featurizer.py`:
  - Función `to_feature_vector(payload: dict) -> np.ndarray`.
  - Se encarga de tipos, orden de columnas y faltantes.
  - Si `features` no cumple, lanzar 422.

Incluye **tests** con payload de ejemplo.

---

## 7) Requisitos e instalación local

**requirements.txt** (mínimo):
```
fastapi
uvicorn[standard]
pydantic
sqlalchemy
psycopg2-binary
alembic
python-jose[cryptography]
httpx
structlog
python-dotenv
joblib
scikit-learn
```

**README.md** debe incluir:
```bash
# 1) Crear entorno y variables
cp .env.example .env

# 2) Instalar
python -m venv .venv && source .venv/bin/activate  # (Windows: .venv\Scripts\activate)
pip install -r requirements.txt

# 3) Migraciones
alembic upgrade head

# 4) Ejecutar
uvicorn app.main:app --reload --port 8000
```

---

## 8) Docker y Deploy (Railway)

**Dockerfile** (python:3.11-slim):
- Instalar `gcc`, `libpq-dev` (para psycopg2).
- Copiar código, `pip install -r requirements.txt`.
- Exponer `8080`.
- `CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8080"]`.

**Pasos Railway (README):**
1. Conectar repo de `backend/` a Railway.
2. En **Variables**: setear
   - `APP_ENV=prod`
   - `API_PREFIX=/api/v1`
   - `FRONTEND_ORIGIN=https://<tu-frontend>.vercel.app`
   - `AUTH_MODE=supabase`
   - `SUPABASE_JWKS_URL=https://<PROJECT-REF>.supabase.co/auth/v1/keys`
   - `SUPABASE_AUDIENCE=authenticated`
   - `DATABASE_URL=...` (Supabase)
   - `MODEL_PATH=../ml_models/models/model.pkl` (si el monorepo está unido)
3. Desplegar. Probar `GET /api/v1/healthz`.

---

## 9) Tests (pytest)

- `test_health.py` → 200 ok.
- `test_auth_me.py` → usando token válido de pruebas (o modo mock).
- `test_predict_mock.py` → mockear `model_loader` para respuesta estable.

Incluye `pytest.ini` y usa `httpx.AsyncClient`.

---

## 10) Entregables obligatorios
1. Árbol de archivos **exacto** (sección 1) bajo `/backend`.
2. Código **funcional** con **README** claro para local y Railway.
3. `.env.example` completo (todas las vars).
4. Migración inicial de Alembic.
5. Tests básicos pasando.
6. CORS, verificación JWT y guardado en BD funcionando.

---

## 11) Aceptación (Definition of Done)
- `GET /api/v1/healthz` devuelve `{"status":"ok"}` en Railway.
- `GET /api/v1/auth/me` responde 200 con `id` al enviar `Authorization: Bearer <token>` de Supabase.
- `POST /api/v1/predict` guarda una inferencia en BD y devuelve JSON con `prediction` y `version`.
- `GET /api/v1/history` retorna **solo** las inferencias del usuario autenticado.
- Con `MODEL_PATH` inexistente, el backend entra en **modo mock** sin caerse.

---

## 12) Nota para Codex
- No dependas del código del frontend.
- Documenta suposiciones en el README.
- Escribe código limpio, tipado y con manejo de errores consistente.
