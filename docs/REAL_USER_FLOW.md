# Real User Flow

Este documento describe el flujo real de usuario de UniTrack cuando se usa autenticación JWT interna y el perfil de estudiante para personalizar cursos y predicciones.

## Resumen
- Registro: usuario crea cuenta y recibe `access_token`.
- Onboarding: completa perfil y se guarda vía API.
- Cursos: se listan cursos disponibles según perfil.
- Predicción: el usuario solicita predicciones por curso y se guarda historial.

## Variables de Entorno
- Backend (`backend/.env`):
  - `AUTH_MODE=jwt`
  - `JWT_SECRET=<valor-seguro>`
  - `DATABASE_URL=sqlite:///./unitrack.db` (o Postgres)
- Frontend (`frontend/.env.local`):
  - `NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000/api/v1`

## Endpoints Backend
- `POST /api/v1/register` → crea usuario, devuelve `access_token`.
- `POST /api/v1/login` → autentica y devuelve `access_token`.
- `GET /api/v1/auth/me` → datos del usuario autenticado.
- `POST /api/v1/profile` → crea/actualiza perfil de estudiante.
- `GET /api/v1/profile` → obtiene perfil del estudiante.
- `GET /api/v1/courses/available` → cursos filtrados por perfil.
- `POST /api/v1/predict` → predicción por curso (usa perfil si existe).
- `GET /api/v1/history` → historial de predicciones.

## Flujo Detallado
1) Registro
   - Frontend llama `POST /register` con `{ email, password, full_name }`.
   - Guarda `access_token` en `localStorage` como `auth_token` y persiste `user`.

2) Onboarding
   - Usuario completa formulario (datos demográficos/Académicos).
   - Frontend llama `POST /profile` con `StudentProfileData`.

3) Cursos disponibles
   - Frontend llama `GET /courses/available`.
   - Backend filtra por `prerequisitos` vacíos y `semestre` permitido según `semestres_cursados`.

4) Predicción e historial
   - Frontend llama `POST /predict` con `cod_curso` y features (si no hay perfil). Con perfil, el backend genera features automáticamente.
   - Se guarda la inferencia en la tabla `inferences`.

## Consideraciones
- Migraciones: ejecutar Alembic para alinear el esquema con los modelos actuales.
- Producción: usar un `JWT_SECRET` fuerte y considerar cookies httpOnly.

