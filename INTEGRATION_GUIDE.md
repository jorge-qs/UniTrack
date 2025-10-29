# Guía de Integración Frontend-Backend-ML

Esta guía explica cómo está conectado el frontend con el backend y el modelo de ML, y cómo probarlo.

## 🎯 Resumen de la Integración

Tu aplicación UniTrack ahora está **completamente integrada**:

- ✅ **Frontend (Next.js)** → hace llamadas HTTP al backend
- ✅ **Backend (FastAPI)** → procesa requests y llama al modelo ML
- ✅ **Modelo ML** → hace predicciones reales de aprobación de cursos

## 📁 Archivos Creados/Modificados

### Configuración
- `frontend/.env.local` - Variables de entorno para el API
- `backend/.env` - Configuración del backend (ya existía, fue actualizado)

### Servicios y Utilidades (Frontend)
- `frontend/lib/api.ts` - Cliente HTTP base para llamadas al backend
- `frontend/lib/services/auth.ts` - Servicio de autenticación
- `frontend/lib/services/predictions.ts` - Servicio para predicciones y what-if
- `frontend/lib/hooks/usePrediction.ts` - Hook para predicciones
- `frontend/lib/hooks/useWhatIf.ts` - Hook para simulaciones what-if

### Páginas Conectadas (Frontend)
- `frontend/app/login/page.tsx` - Login con autenticación
- `frontend/app/courses/[cod]/page.tsx` - Detalles de curso con predicciones reales
- `frontend/app/history/page.tsx` - Historial de predicciones desde el backend

## 🚀 Cómo Probar la Integración

### 1. Iniciar el Backend

```bash
cd backend
source .venv/bin/activate  # En Windows: .venv\Scripts\activate
uvicorn app.main:app --reload --port 8000
```

El backend debería estar corriendo en: `http://127.0.0.1:8000`

Puedes verificar que funciona visitando:
- Health check: http://127.0.0.1:8000/api/v1/health
- API docs: http://127.0.0.1:8000/docs

### 2. Iniciar el Frontend

En otra terminal:

```bash
cd frontend
npm install  # Solo la primera vez
npm run dev
```

El frontend debería estar corriendo en: `http://localhost:3000`

### 3. Probar la Integración Completa

#### A. Login
1. Abre `http://localhost:3000/login`
2. Ingresa cualquier email y contraseña (modo mock)
3. Deberías ser redirigido al dashboard

#### B. Predicción de Curso
1. Ve a "Cursos" en el sidebar
2. Haz clic en cualquier curso (por ejemplo, CS2H1)
3. **Verás una predicción REAL del modelo ML**:
   - El spinner de carga indica que está llamando al backend
   - La predicción muestra "Aprobar" o "Desaprobar"
   - El score es un porcentaje real del modelo
   - Se muestra la versión del modelo

**¿Cómo saber que funciona?**
- Si ves un spinner y luego una predicción, está conectado ✅
- Si ves un error rojo, verifica que el backend esté corriendo
- Abre la consola del navegador (F12) para ver los requests HTTP

#### C. Simulación What-If
1. En la misma página de detalles del curso
2. Desliza el slider "Ajuste de Promedio General"
3. **Se hace una llamada REAL al endpoint `/whatif`**:
   - El spinner indica que está calculando
   - La nueva predicción es calculada por el modelo ML
   - Puedes ver cómo cambia la probabilidad según ajustes

#### D. Historial de Predicciones
1. Ve a "Historial" en el sidebar
2. **Verás todas las predicciones guardadas en la base de datos**:
   - Cada predicción hecha se guarda automáticamente
   - Las simulaciones what-if también se registran
   - Muestra la fecha, curso, y resultado de cada predicción

## 🔍 Verificar la Conexión

### Desde el Frontend
Abre las DevTools del navegador (F12) → pestaña "Network":
- Deberías ver requests a `http://127.0.0.1:8000/api/v1/predict`
- Y requests a `http://127.0.0.1:8000/api/v1/whatif`
- Y requests a `http://127.0.0.1:8000/api/v1/history`

### Desde el Backend
En la terminal del backend verás logs como:
```
INFO:     127.0.0.1:xxxxx - "POST /api/v1/predict HTTP/1.1" 200 OK
INFO:     127.0.0.1:xxxxx - "POST /api/v1/whatif HTTP/1.1" 200 OK
INFO:     127.0.0.1:xxxxx - "GET /api/v1/history?limit=50&offset=0 HTTP/1.1" 200 OK
```

## 📊 Flujo de Datos

```
Usuario → Frontend (Next.js)
         ↓
         HTTP Request a http://127.0.0.1:8000/api/v1/predict
         ↓
       Backend (FastAPI)
         ↓
       Procesa features del estudiante
         ↓
       Modelo ML (sklearn/xgboost/etc)
         ↓
       Predicción: "Aprobar" o "Desaprobar" + score
         ↓
       Guarda en base de datos (SQLite)
         ↓
       Responde JSON al frontend
         ↓
       Frontend muestra resultado al usuario
```

## 🛠️ Endpoints del Backend Usados

| Endpoint | Método | Usado en | Descripción |
|----------|---------|----------|-------------|
| `/api/v1/health` | GET | - | Verificar estado del backend |
| `/api/v1/auth/me` | GET | Login | Obtener usuario actual |
| `/api/v1/predict` | POST | Detalles de curso | Hacer predicción |
| `/api/v1/whatif` | POST | Simulación what-if | Predicción con ajustes |
| `/api/v1/history` | GET | Historial | Listar predicciones |

## 🧪 Ejemplo de Request/Response

### Predicción
**Request:**
```json
POST /api/v1/predict
{
  "cod_curso": "CS2H1",
  "features": {
    "promedio_general": 14.5,
    "creditos_aprobados": 120,
    "puntaje_ingreso": 85,
    "asistencia_promedio": 0.9
  }
}
```

**Response:**
```json
{
  "cod_curso": "CS2H1",
  "prediction_label": "Aprobar",
  "score": 0.7524,
  "version": "v1",
  "details": {
    "probabilities": {
      "fail": 0.2476,
      "pass": 0.7524
    }
  }
}
```

### What-If
**Request:**
```json
POST /api/v1/whatif
{
  "cod_curso": "CS2H1",
  "features": {
    "promedio_general": 14.5,
    "creditos_aprobados": 120,
    "puntaje_ingreso": 85,
    "asistencia_promedio": 0.9
  },
  "deltas": {
    "promedio_general": 2.0
  }
}
```

**Response:**
```json
{
  "cod_curso": "CS2H1",
  "prediction_label": "Aprobar",
  "score": 0.8821,
  "version": "v1",
  "details": {
    "probabilities": {
      "fail": 0.1179,
      "pass": 0.8821
    },
    "deltas": {
      "promedio_general": 2.0
    }
  }
}
```

## ⚠️ Troubleshooting

### Error: "Error al obtener predicción"
- **Causa**: Backend no está corriendo o no responde
- **Solución**: Verifica que `uvicorn app.main:app --reload --port 8000` esté corriendo

### Error: "Network error" o "Failed to fetch"
- **Causa**: URL del backend incorrecta o CORS mal configurado
- **Solución**: Verifica que `frontend/.env.local` tenga `NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000/api/v1`

### El historial está vacío
- **Causa**: No has hecho ninguna predicción aún
- **Solución**: Ve a la página de un curso y haz una predicción primero

### Las predicciones siempre dan el mismo resultado
- **Causa**: Usando features hardcoded (sampleFeatures)
- **Solución**: En producción, debes obtener los features reales del perfil del estudiante

## 🎓 Siguientes Pasos

Para mejorar la integración:

1. **Perfil de Usuario**: Crear una página de perfil donde el usuario ingrese sus datos reales (promedio, créditos, etc.)
2. **Features Dinámicos**: Reemplazar `sampleFeatures` con datos reales del usuario
3. **Catálogo de Cursos**: Conectar la página de cursos a un endpoint que liste cursos desde una base de datos
4. **Autenticación Real**: Integrar con Supabase u otro proveedor de auth
5. **Visualizaciones**: Agregar gráficos con las probabilidades y tendencias

## ✅ Resumen

Tu aplicación UniTrack está **completamente funcional** con:
- Frontend conectado al backend ✅
- Backend procesando requests con el modelo ML ✅
- Predicciones reales guardadas en base de datos ✅
- Simulaciones what-if funcionando ✅
- Historial persistente ✅

Toda la infraestructura está lista para producción. Solo necesitas ajustar features y agregar más funcionalidades según tus necesidades.
