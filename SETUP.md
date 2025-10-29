# 🚀 Setup Rápido - UniTrack

Guía paso a paso para que tus compañeros puedan usar el proyecto.

---

## ✅ Pre-requisitos

Instalar:
- **Python 3.10+** → https://www.python.org/downloads/
- **Node.js 18+** → https://nodejs.org/
- **pnpm** → `npm install -g pnpm`
- **Git LFS** → `git lfs install` (para los modelos)

---

## 📦 Instalación

### 1. Clonar el Repositorio

```bash
git clone <tu-repositorio>
cd UniTrack
```

### 2. Configurar Backend

```bash
cd backend

# Crear entorno virtual
python -m venv .venv

# Activar entorno virtual
# En Linux/Mac:
source .venv/bin/activate

# En Windows:
.venv\Scripts\activate

# Instalar dependencias
pip install -r requirements.txt

# Configurar variables de entorno
cp .env.example .env
# Editar .env si es necesario (por defecto está listo para usar)

# Inicializar base de datos
python init_db.py

# Cargar cursos de la malla curricular
python load_curriculum.py
```

**Salida esperada:**
```
✅ Database initialized successfully
✅ Success! Added 71 new courses
```

### 3. Configurar Frontend

```bash
# En otra terminal
cd frontend

# Instalar dependencias
pnpm install

# Configurar variables de entorno (opcional, ya tiene defaults)
# Crear .env.local si quieres personalizar:
echo "NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000/api/v1" > .env.local
```

---

## 🎮 Ejecutar el Proyecto

### Backend (Terminal 1)

```bash
cd backend
source .venv/bin/activate  # o .venv\Scripts\activate en Windows
uvicorn app.main:app --reload --port 8000
```

**Deberías ver:**
```
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Application startup complete.
```

### Frontend (Terminal 2)

```bash
cd frontend
pnpm dev
```

**Deberías ver:**
```
▲ Next.js 14.x.x
- Local:        http://localhost:3000
```

---

## 🧪 Verificar que Funciona

### 1. Verificar Backend

Abrir en navegador: http://127.0.0.1:8000/docs

Deberías ver la documentación interactiva de la API.

### 2. Verificar Frontend

Abrir en navegador: http://localhost:3000

Deberías ver la página de login de UniTrack.

### 3. Crear Usuario de Prueba

```bash
# Opción A: Desde el frontend
# Ve a http://localhost:3000/register y crea una cuenta

# Opción B: Desde curl
curl -X POST http://127.0.0.1:8000/api/v1/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "full_name": "Usuario Test"
  }'
```

### 4. Login

```
Email: test@example.com
Password: password123
```

---

## 📁 Estructura de Archivos Importantes

```
UniTrack/
├── backend/
│   ├── .venv/              # NO COMMITEAR (ignorado por git)
│   ├── .env                # NO COMMITEAR (ignorado por git)
│   ├── .env.example        # SÍ COMMITEAR
│   ├── requirements.txt    # SÍ COMMITEAR
│   ├── init_db.py         # SÍ COMMITEAR
│   ├── load_curriculum.py # SÍ COMMITEAR
│   ├── unitrack.db        # NO COMMITEAR (ignorado por git)
│   └── app/               # SÍ COMMITEAR
├── frontend/
│   ├── node_modules/      # NO COMMITEAR (ignorado por git)
│   ├── .next/            # NO COMMITEAR (ignorado por git)
│   ├── .env.local        # NO COMMITEAR (ignorado por git)
│   ├── package.json      # SÍ COMMITEAR
│   └── pnpm-lock.yaml    # SÍ COMMITEAR
└── ml_models/
    ├── models/
    │   └── *.pkl         # SÍ COMMITEAR (con Git LFS)
    └── data/
        └── malla_curricular_2016.csv  # SÍ COMMITEAR
```

---

## 🔧 Configuración Avanzada

### Cambiar Puerto del Backend

```bash
# En lugar de 8000, usa otro puerto
uvicorn app.main:app --reload --port 8080

# Actualizar .env.local del frontend
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8080/api/v1
```

### Usar PostgreSQL en lugar de SQLite

Editar `backend/.env`:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/unitrack
```

### Cambiar Modelo ML

Editar `backend/.env`:
```env
MODEL_PATH=../ml_models/models/RandomForest.pkl
MODEL_VERSION=v1-randomforest
```

---

## 🐛 Problemas Comunes

### Error: "ModuleNotFoundError"

**Causa:** Falta instalar dependencias
**Solución:**
```bash
cd backend
pip install -r requirements.txt
```

### Error: "Database is locked"

**Causa:** Base de datos en uso por otro proceso
**Solución:**
```bash
cd backend
rm -f unitrack.db-shm unitrack.db-wal
# Reiniciar el backend
```

### Error: "port 8000 is already in use"

**Causa:** Otro proceso usando el puerto
**Solución:**
```bash
# Cambiar de puerto
uvicorn app.main:app --reload --port 8001
```

### Error: "pnpm: command not found"

**Causa:** pnpm no instalado
**Solución:**
```bash
npm install -g pnpm
```

### Frontend no conecta al Backend

**Verificar:**
1. Backend está corriendo en puerto 8000
2. `.env.local` tiene la URL correcta
3. No hay errores en la consola del navegador (F12)

---

## 🧹 Limpiar y Reinstalar

Si algo sale mal, puedes limpiar todo:

```bash
# Backend
cd backend
rm -rf .venv unitrack.db unitrack.db-*
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python init_db.py
python load_curriculum.py

# Frontend
cd frontend
rm -rf node_modules .next
pnpm install
```

---

## ✅ Checklist Final

Antes de compartir el proyecto, verifica:

- [ ] `.gitignore` está configurado correctamente
- [ ] `.env.example` existe en backend
- [ ] `requirements.txt` está actualizado
- [ ] `package.json` y `pnpm-lock.yaml` están commitados
- [ ] Modelos `.pkl` están en Git LFS
- [ ] CSV de malla curricular está incluido
- [ ] `README.md` está completo
- [ ] `SETUP.md` (este archivo) está incluido
- [ ] No hay archivos `.env` o `.db` en el commit
- [ ] No hay carpeta `.venv` o `node_modules` en el commit

---

## 🎉 ¡Listo!

Tu proyecto está configurado y listo para que otros lo usen.

**Próximos pasos para tus compañeros:**
1. Clonar el repo
2. Seguir esta guía
3. Ejecutar backend y frontend
4. Registrarse en http://localhost:3000/register
5. ¡Usar UniTrack!
