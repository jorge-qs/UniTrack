# ✅ Pre-Commit Checklist

Verifica estos puntos antes de hacer commit y push.

---

## 📦 Archivos a INCLUIR (commitear)

✅ Código fuente:
- [ ] `backend/app/` (todo el código Python)
- [ ] `frontend/app/`, `frontend/components/`, `frontend/lib/` (código React/TypeScript)
- [ ] `ml_models/data/malla_curricular_2016.csv` (4KB, sí incluir)

✅ Configuración:
- [ ] `backend/requirements.txt`
- [ ] `backend/.env.example` (NO el `.env`)
- [ ] `backend/init_db.py`
- [ ] `backend/load_curriculum.py`
- [ ] `frontend/package.json`
- [ ] `frontend/pnpm-lock.yaml`
- [ ] `.gitignore`

✅ Documentación:
- [ ] `README.md`
- [ ] `SETUP.md`
- [ ] `ESTADO_ACTUAL.md`
- [ ] Cualquier otro `.md` en `docs/`

✅ Modelos ML (con Git LFS):
- [ ] `ml_models/models/*.pkl` (si Git LFS está configurado)

---

## 🚫 Archivos a EXCLUIR (NO commitear)

❌ Entornos virtuales:
- [ ] `backend/.venv/` o `backend/venv/`
- [ ] `frontend/node_modules/`
- [ ] `frontend/.next/`

❌ Configuración local:
- [ ] `backend/.env` (contiene secrets)
- [ ] `frontend/.env.local`

❌ Bases de datos:
- [ ] `backend/*.db`
- [ ] `backend/*.db-shm`
- [ ] `backend/*.db-wal`

❌ Archivos de sistema:
- [ ] `.DS_Store` (Mac)
- [ ] `Thumbs.db` (Windows)
- [ ] `.vscode/` (configuración local de IDE)

❌ Archivos temporales:
- [ ] `__pycache__/`
- [ ] `*.pyc`
- [ ] `.ipynb_checkpoints/`

---

## 🔍 Verificaciones de Seguridad

🔐 Secrets y claves:
- [ ] NO hay contraseñas en el código
- [ ] NO hay API keys hardcodeadas
- [ ] NO hay tokens en los archivos
- [ ] `.env` está en `.gitignore`
- [ ] `.env.example` NO contiene valores reales

---

## 🧪 Tests Antes de Commit

### Backend
```bash
cd backend
source .venv/bin/activate

# 1. Verificar que el servidor inicia
uvicorn app.main:app --port 8000 &
sleep 3

# 2. Test health endpoint
curl http://127.0.0.1:8000/api/v1/health

# 3. Test register endpoint
curl -X POST http://127.0.0.1:8000/api/v1/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test123@test.com","password":"test123","full_name":"Test"}'

# 4. Matar el servidor
kill %1
```

### Frontend
```bash
cd frontend

# 1. Verificar que no hay errores de TypeScript
pnpm run build

# 2. Si build tiene éxito, está listo
```

---

## 📊 Tamaños de Archivos

Verificar que no estés commiteando archivos muy grandes:

```bash
# Ver archivos más grandes en el staging area
git ls-files -s | awk '{print $4 "\t" $2}' | sort -n -r | head -20
```

**Límites sugeridos:**
- Archivos de código: < 1MB
- Modelos ML: < 100MB (usar Git LFS)
- CSV de datos: < 10MB
- Imágenes: < 5MB

---

## 🔄 Git LFS para Modelos

Si los modelos `.pkl` son muy grandes (>50MB), usar Git LFS:

```bash
# Instalar Git LFS (una sola vez)
git lfs install

# Trackear archivos .pkl
git lfs track "*.pkl"

# Commitear .gitattributes
git add .gitattributes
git commit -m "Add Git LFS for model files"

# Ahora puedes commitear los modelos
git add ml_models/models/*.pkl
git commit -m "Add ML models with Git LFS"
```

---

## 📝 Mensaje de Commit Sugerido

```bash
git add .
git commit -m "feat: Complete UniTrack system with real auth and ML predictions

- Add real authentication with bcrypt and JWT
- Add 71 courses from UTEC curriculum 2016
- Add student profile system (12 fields -> 41 ML features)
- Add personalized course filtering with prerequisites
- Add LightGBM model integration (R²=0.72)
- Add complete frontend with login, register, profile, courses
- Add setup documentation (README.md, SETUP.md)
- Backend: FastAPI with SQLite
- Frontend: Next.js with TypeScript
- Ready for production use"
```

---

## 🚀 Push Final

```bash
# Verificar estado
git status

# Ver qué archivos se van a subir
git diff --cached --name-only

# Push
git push origin main

# Si es tu primer push o hay cambios en Git LFS
git lfs push origin main
```

---

## ✅ Verificación Post-Push

Después de hacer push, verifica en GitHub/GitLab:

1. [ ] README.md se ve bien en la página principal
2. [ ] Archivos `.env` NO están visibles
3. [ ] Carpeta `.venv` NO está visible
4. [ ] Carpeta `node_modules` NO está visible
5. [ ] Modelos `.pkl` se descargaron correctamente (Git LFS)
6. [ ] CSV de malla curricular está disponible
7. [ ] requirements.txt está completo

---

## 🧹 Limpiar Antes de Commit

Si accidentalmente agregaste archivos que no deberías:

```bash
# Remover del staging area (pero mantener en disco)
git reset HEAD <archivo>

# Remover completamente (¡cuidado!)
git rm --cached <archivo>

# Actualizar .gitignore y aplicar
echo "nuevo_patron_a_ignorar" >> .gitignore
git rm -r --cached .
git add .
git commit -m "Update .gitignore"
```

---

## 📋 Resumen Final

Antes de hacer commit, asegúrate de que:

✅ El código funciona (backend + frontend corriendo)
✅ No hay secrets o passwords en el código
✅ `.gitignore` está correcto
✅ Documentación está completa
✅ No hay archivos innecesarios (`.venv`, `node_modules`, `.db`)
✅ Git LFS está configurado para modelos grandes
✅ Mensaje de commit es descriptivo

---

**¡Listo para compartir!** 🎉
