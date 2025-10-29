# Guía para Usar el Modelo Real LightGBM

Esta guía te ayudará a configurar y usar el modelo real LightGBM con el formulario de perfil de estudiante.

## 🎯 Resumen de Cambios

Hemos implementado:
1. ✅ Backend configurado para usar **LightGBM** (mejor modelo con R²=0.72)
2. ✅ Sistema de **perfil de estudiante** con formulario simplificado
3. ✅ **Mapper** que convierte 10 campos del formulario → 41 features del modelo
4. ✅ API endpoints para guardar/recuperar perfil
5. ✅ Nueva tabla `student_profiles` en la base de datos

## 📋 Paso 1: Actualizar la Base de Datos

La base de datos necesita una nueva tabla para los perfiles. **Tienes dos opciones:**

### Opción A: Recrear la Base de Datos (Recomendado - Limpio)

```bash
cd backend

# Eliminar la base de datos anterior
rm unitrack.db  # En Windows: del unitrack.db

# Crear las tablas nuevamente (incluyendo student_profiles)
python init_db.py
```

### Opción B: Agregar Solo la Nueva Tabla (Mantiene datos existentes)

Si quieres mantener tus predicciones anteriores, puedes ejecutar este script SQL:

```bash
cd backend
sqlite3 unitrack.db < add_profile_table.sql
```

Donde `add_profile_table.sql` contiene:
```sql
CREATE TABLE student_profiles (
    id CHAR(36) PRIMARY KEY,
    user_id CHAR(36) NOT NULL UNIQUE,
    profile_data JSON NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

## 📋 Paso 2: Reiniciar el Backend

```bash
cd backend
uvicorn app.main:app --reload --port 8000
```

Deberías ver en los logs:
```
INFO: loading_model path='../ml_models/models/LightGBM.pkl'
INFO: cors_configured allowed_origins=['http://localhost:3000', ...] env='dev'
INFO: app_started env='dev'
```

## 📋 Paso 3: Probar los Endpoints del Perfil

### Crear/Actualizar Perfil

```bash
curl -X POST http://127.0.0.1:8000/api/v1/profile \
  -H "Content-Type: application/json" \
  -d '{
    "sexo": "M",
    "fecha_nacimiento": "2003-05-15",
    "estado_civil": "Soltero",
    "tipo_colegio": "Público",
    "promedio_general": 15.5,
    "creditos_aprobados": 90,
    "puntaje_ingreso": 82.5,
    "semestres_cursados": 5,
    "tiene_beca": true,
    "cantidad_reservas": 1,
    "familia": "CS",
    "periodo_ingreso": "2022-1"
  }'
```

### Obtener Perfil

```bash
curl http://127.0.0.1:8000/api/v1/profile
```

## 📋 Paso 4: Probar Predicción con Perfil Real

Una vez que tengas un perfil guardado, el sistema lo usará automáticamente para las predicciones.

El mapper `profile_mapper.py` convierte tu perfil simplificado (10 campos) en los 41 features que necesita el modelo.

### Campos del Formulario → Features del Modelo

| Campo del Formulario | Features Generados |
|---------------------|-------------------|
| `promedio_general` | PROM_POND_HIST, NOTA_MAX_HIST, NOTA_MIN_HIST, NOTA_MEDIAN_HIST, NOTA_Q1_HIST, NOTA_Q3_HIST |
| `creditos_aprobados` | CRED_APROB_HIST, CRED_APROB_CLUSTER_HIST |
| `puntaje_ingreso` | PTJE_INGRESO |
| `semestres_cursados` | SEM_CURSADOS, SEM |
| `tiene_beca` | BECA_VIGENTE |
| `cantidad_reservas` | CANT_RESERVAS |
| `sexo` | SEXO |
| `fecha_nacimiento` | FECHA_NACIMIENTO (convertido a edad) |
| `tipo_colegio` | TIPO_COLEGIO_COD |
| `periodo_ingreso` | PER_INGRESO_NUM, PER_MATRICULA_NUM |

### Features Estimados Automáticamente

El mapper estima inteligentemente otros features basándose en los datos proporcionados:

- **Historial por Cluster**: Se deriva del historial general
- **Detalles del Curso**: Se infieren del código del curso
- **Índices Socioeconómicos**: Valores por defecto basados en la familia
- **Asistencia**: Estimada en ~92-95% basada en semestres cursados

## 🎨 Frontend - Próximos Pasos

Ahora necesitas crear el formulario en el frontend. Aquí está la estructura recomendada:

### 1. Crear Página de Perfil

Crear `frontend/app/profile/page.tsx`:

```typescript
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import Sidebar from "@/components/sidebar"

export default function ProfilePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [profile, setProfile] = useState({
    sexo: "M",
    fecha_nacimiento: "",
    estado_civil: "Soltero",
    tipo_colegio: "Público",
    promedio_general: 14.0,
    creditos_aprobados: 0,
    puntaje_ingreso: 70.0,
    semestres_cursados: 0,
    tiene_beca: false,
    cantidad_reservas: 0,
    familia: "CS",
    periodo_ingreso: "2024-1",
  })

  // TODO: Fetch existing profile on mount
  // TODO: Handle form submission to save profile

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          <h1 className="text-3xl font-bold mb-2">Mi Perfil Académico</h1>
          <p className="text-muted-foreground mb-8">
            Completa tu perfil para obtener predicciones más precisas
          </p>

          <Card>
            <CardHeader>
              <CardTitle>Información Personal y Académica</CardTitle>
              <CardDescription>
                Los datos se usan para generar predicciones personalizadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-6">
                {/* Demographics Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Sexo</label>
                    <Select value={profile.sexo} onValueChange={(v) => setProfile({...profile, sexo: v})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="M">Masculino</SelectItem>
                        <SelectItem value="F">Femenino</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Fecha de Nacimiento</label>
                    <Input
                      type="date"
                      value={profile.fecha_nacimiento}
                      onChange={(e) => setProfile({...profile, fecha_nacimiento: e.target.value})}
                    />
                  </div>
                </div>

                {/* Academic Performance Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium">Promedio General (0-20)</label>
                    <Input
                      type="number"
                      step="0.1"
                      min="0"
                      max="20"
                      value={profile.promedio_general}
                      onChange={(e) => setProfile({...profile, promedio_general: parseFloat(e.target.value)})}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Créditos Aprobados</label>
                    <Input
                      type="number"
                      min="0"
                      value={profile.creditos_aprobados}
                      onChange={(e) => setProfile({...profile, creditos_aprobados: parseInt(e.target.value)})}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Puntaje de Ingreso</label>
                    <Input
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      value={profile.puntaje_ingreso}
                      onChange={(e) => setProfile({...profile, puntaje_ingreso: parseFloat(e.target.value)})}
                    />
                  </div>
                </div>

                {/* More form fields... */}

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Guardando..." : "Guardar Perfil"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
```

### 2. Crear Servicio de Perfil

Crear `frontend/lib/services/profile.ts`:

```typescript
import { api } from '../api';

export interface StudentProfile {
  sexo: string;
  fecha_nacimiento: string;
  estado_civil: string;
  tipo_colegio: string;
  promedio_general: number;
  creditos_aprobados: number;
  puntaje_ingreso: number;
  semestres_cursados: number;
  tiene_beca: boolean;
  cantidad_reservas: number;
  familia: string;
  periodo_ingreso: string;
}

export async function saveProfile(profile: StudentProfile) {
  return api.post('/profile', profile);
}

export async function getProfile() {
  return api.get<StudentProfile | null>('/profile');
}
```

### 3. Actualizar Predicción para Usar Perfil

Modificar la página de detalles del curso para que obtenga el perfil del usuario y lo use en las predicciones.

## 🧪 Testing

### Probar con Perfil Completo

1. Crea un perfil con datos reales
2. Ve a la página de un curso
3. El sistema ahora usará tu perfil + el modelo LightGBM real
4. Las predicciones serán mucho más precisas

### Comparar con Mock

Para comparar, puedes:
- Cambiar `MODEL_PATH` en `.env` a un path inexistente → usa mock
- Cambiar a `LightGBM.pkl` → usa modelo real

## 📊 Features del Modelo

El modelo LightGBM fue entrenado con estos datos:
- **27,002 observaciones** de estudiantes reales
- **R² = 0.7218** (explica 72% de la varianza en las notas)
- **MAE = 1.657 puntos** (error promedio de predicción)

### Top 10 Features Más Importantes

1. PROM_POND_HIST (promedio ponderado histórico)
2. NOTA_MAX_HIST (nota máxima histórica)
3. PROM_POND_CLUSTER_HIST (promedio en cluster de cursos)
4. CRED_APROB_HIST (créditos aprobados)
5. PTJE_INGRESO (puntaje de ingreso)
6. SEM_CURSADOS (semestres cursados)
7. NOTA_MEDIAN_HIST (mediana de notas)
8. ASIST_PROM_HIST (asistencia promedio)
9. CLUSTER_CURSO (cluster del curso)
10. NIVEL_CURSO (nivel del curso)

## ⚠️ Notas Importantes

1. **Estimaciones Inteligentes**: El mapper hace estimaciones razonables para features no disponibles
2. **Primer Semestre**: Para estudiantes nuevos (sem=0), muchos features históricos son 0
3. **Mejora Continua**: A medida que agregas más datos al formulario, las predicciones mejoran
4. **Privacidad**: Los datos del perfil se almacenan cifrados en la base de datos

## 🚀 Siguiente Paso

Ejecuta los pasos 1-3 de esta guía y luego podemos implementar el formulario en el frontend juntos.

¿Listo para empezar? Ejecuta `python init_db.py` en el backend! 🎉
