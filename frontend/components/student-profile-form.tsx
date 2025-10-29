"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertCircle, Loader2, CheckCircle2 } from "lucide-react"
import type { StudentProfileData } from "@/lib/services/profile"
import { getAllCourses, type Course } from "@/lib/services/courses"

interface StudentProfileFormProps {
  initialData?: Partial<StudentProfileData>
  onSubmit: (data: StudentProfileData) => Promise<void>
  onCancel?: () => void
  submitLabel?: string
}

export function StudentProfileForm({
  initialData,
  onSubmit,
  onCancel,
  submitLabel = "Guardar perfil"
}: StudentProfileFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState<StudentProfileData>({
    sexo: initialData?.sexo || 'M',
    fecha_nacimiento: initialData?.fecha_nacimiento || '',
    estado_civil: initialData?.estado_civil || 'Soltero',
    tipo_colegio: initialData?.tipo_colegio || 'Público',
    promedio_general: initialData?.promedio_general || 0,
    creditos_aprobados: initialData?.creditos_aprobados || 0,
    puntaje_ingreso: initialData?.puntaje_ingreso || 0,
    semestres_cursados: initialData?.semestres_cursados || 0,
    tiene_beca: initialData?.tiene_beca || false,
    cantidad_reservas: initialData?.cantidad_reservas || 0,
    familia: initialData?.familia || 'CS',
    periodo_ingreso: initialData?.periodo_ingreso || '',
    cursos_aprobados: initialData?.cursos_aprobados || [],
  })
  const [courses, setCourses] = useState<Course[]>([])
  const [search, setSearch] = useState("")
  const [selectedApprovedCodes, setSelectedApprovedCodes] = useState<string[]>([])

  const [aprobadosInput, setAprobadosInput] = useState<string>((initialData?.cursos_aprobados || []).join(', '))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      // Validate required fields
      if (!formData.fecha_nacimiento) {
        throw new Error('La fecha de nacimiento es requerida')
      }
      if (!formData.periodo_ingreso) {
        throw new Error('El período de ingreso es requerido')
      }
      if (formData.promedio_general < 0 || formData.promedio_general > 20) {
        throw new Error('El promedio general debe estar entre 0 y 20')
      }
      if (formData.puntaje_ingreso < 0 || formData.puntaje_ingreso > 100) {
        throw new Error('El puntaje de ingreso debe estar entre 0 y 100')
      }

      const payload: StudentProfileData = {
        ...formData,
        cursos_aprobados_codigos: selectedApprovedCodes,
        cursos_aprobados: selectedApprovedCodes
          .map((code) => courses.find((c) => c.cod_curso === code)?.nombre)
          .filter(Boolean) as string[],
      }

      await onSubmit(payload)
      setSuccess(true)

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000)
    } catch (err: any) {
      setError(err.message || 'Error al guardar el perfil')
    } finally {
      setLoading(false)
    }
  }

  const updateField = (field: keyof StudentProfileData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // Load all courses once to populate the selector
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    getAllCourses().then(setCourses).catch(() => setCourses([]))
  }, [])

  // When initialData arrives/changes, populate the form
  useEffect(() => {
    if (!initialData) return
    setFormData((prev) => ({
      ...prev,
      sexo: initialData.sexo ?? prev.sexo,
      fecha_nacimiento: initialData.fecha_nacimiento ?? prev.fecha_nacimiento,
      estado_civil: initialData.estado_civil ?? prev.estado_civil,
      tipo_colegio: initialData.tipo_colegio ?? prev.tipo_colegio,
      promedio_general: initialData.promedio_general ?? prev.promedio_general,
      creditos_aprobados: initialData.creditos_aprobados ?? prev.creditos_aprobados,
      puntaje_ingreso: initialData.puntaje_ingreso ?? prev.puntaje_ingreso,
      semestres_cursados: initialData.semestres_cursados ?? prev.semestres_cursados,
      tiene_beca: initialData.tiene_beca ?? prev.tiene_beca,
      cantidad_reservas: initialData.cantidad_reservas ?? prev.cantidad_reservas,
      familia: initialData.familia ?? prev.familia,
      periodo_ingreso: initialData.periodo_ingreso ?? prev.periodo_ingreso,
      cursos_aprobados: initialData.cursos_aprobados ?? prev.cursos_aprobados,
    }))
    // Preselect by codes if present; otherwise try to map names to codes
    if (initialData.cursos_aprobados_codigos && initialData.cursos_aprobados_codigos.length > 0) {
      setSelectedApprovedCodes(initialData.cursos_aprobados_codigos)
    } else if (initialData.cursos_aprobados && initialData.cursos_aprobados.length > 0 && courses.length > 0) {
      const nameSet = new Set(initialData.cursos_aprobados.map((s) => s.trim().toUpperCase()))
      const codes = courses.filter((c) => nameSet.has((c.nombre || '').trim().toUpperCase())).map((c) => c.cod_curso)
      setSelectedApprovedCodes(codes)
    }
  }, [initialData, courses])

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Demographics Section */}
      <Card>
        <CardHeader>
          <CardTitle>Información Demográfica</CardTitle>
          <CardDescription>Datos personales básicos</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sexo">Sexo *</Label>
              <Select value={formData.sexo} onValueChange={(value) => updateField('sexo', value)}>
                <SelectTrigger id="sexo">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="M">Masculino</SelectItem>
                  <SelectItem value="F">Femenino</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fecha_nacimiento">Fecha de Nacimiento *</Label>
              <Input
                id="fecha_nacimiento"
                type="date"
                value={formData.fecha_nacimiento}
                onChange={(e) => updateField('fecha_nacimiento', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="estado_civil">Estado Civil</Label>
              <Select value={formData.estado_civil} onValueChange={(value) => updateField('estado_civil', value)}>
                <SelectTrigger id="estado_civil">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Soltero">Soltero(a)</SelectItem>
                  <SelectItem value="Casado">Casado(a)</SelectItem>
                  <SelectItem value="Divorciado">Divorciado(a)</SelectItem>
                  <SelectItem value="Viudo">Viudo(a)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipo_colegio">Tipo de Colegio *</Label>
              <Select value={formData.tipo_colegio} onValueChange={(value) => updateField('tipo_colegio', value)}>
                <SelectTrigger id="tipo_colegio">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Público">Público</SelectItem>
                  <SelectItem value="Privado">Privado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Academic Performance Section */}
      <Card>
        <CardHeader>
          <CardTitle>Rendimiento Académico</CardTitle>
          <CardDescription>Tu desempeño académico actual</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="promedio_general">Promedio General (0-20) *</Label>
              <Input
                id="promedio_general"
                type="number"
                step="0.01"
                min="0"
                max="20"
                value={formData.promedio_general}
                onChange={(e) => updateField('promedio_general', parseFloat(e.target.value) || 0)}
                required
              />
              <p className="text-xs text-muted-foreground">Escala de 0 a 20</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="creditos_aprobados">Créditos Aprobados</Label>
              <Input
                id="creditos_aprobados"
                type="number"
                min="0"
                value={formData.creditos_aprobados}
                onChange={(e) => updateField('creditos_aprobados', parseInt(e.target.value) || 0)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="puntaje_ingreso">Puntaje de Ingreso (0-100) *</Label>
              <Input
                id="puntaje_ingreso"
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={formData.puntaje_ingreso}
                onChange={(e) => updateField('puntaje_ingreso', parseFloat(e.target.value) || 0)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="semestres_cursados">Semestres Cursados</Label>
              <Input
                id="semestres_cursados"
                type="number"
                min="0"
                value={formData.semestres_cursados}
                onChange={(e) => updateField('semestres_cursados', parseInt(e.target.value) || 0)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status & Financial Section */}
      <Card>
        <CardHeader>
          <CardTitle>Estado Actual</CardTitle>
          <CardDescription>Información sobre becas y situación académica</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tiene_beca">¿Tienes Beca?</Label>
              <Select
                value={formData.tiene_beca ? 'Si' : 'No'}
                onValueChange={(value) => updateField('tiene_beca', value === 'Si')}
              >
                <SelectTrigger id="tiene_beca">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Si">Sí</SelectItem>
                  <SelectItem value="No">No</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cantidad_reservas">Cantidad de Reservas</Label>
              <Input
                id="cantidad_reservas"
                type="number"
                min="0"
                value={formData.cantidad_reservas}
                onChange={(e) => updateField('cantidad_reservas', parseInt(e.target.value) || 0)}
              />
              <p className="text-xs text-muted-foreground">Número de veces que reservaste matrícula</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="periodo_ingreso">Período de Ingreso *</Label>
              <Input
                id="periodo_ingreso"
                type="text"
                placeholder="2024-1"
                value={formData.periodo_ingreso}
                onChange={(e) => updateField('periodo_ingreso', e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground">Formato: YYYY-1 o YYYY-2</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="familia">Familia de Programa</Label>
              <Select value={formData.familia} onValueChange={(value) => updateField('familia', value)}>
                <SelectTrigger id="familia">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CS">Ciencias (CS)</SelectItem>
                  <SelectItem value="FG">Formación General (FG)</SelectItem>
                  <SelectItem value="MA">Matemáticas (MA)</SelectItem>
                  <SelectItem value="ET">Estudios Técnicos (ET)</SelectItem>
                  <SelectItem value="CB">Ciencias Básicas (CB)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Advanced Progress (optional) */}
      <Card>
        <CardHeader>
          <CardTitle>Progreso Avanzado (opcional)</CardTitle>
          <CardDescription>Ingresa cursos aprobados para liberar prerrequisitos</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="buscar">Buscar curso</Label>
              <Input id="buscar" placeholder="Escribe para filtrar" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-64 overflow-auto border rounded-md p-2">
              {courses
                .filter((c) =>
                  (c.nombre || "").toLowerCase().includes(search.toLowerCase()) ||
                  (c.cod_curso || "").toLowerCase().includes(search.toLowerCase()),
                )
                .map((c) => {
                  const selected = selectedApprovedCodes.includes(c.cod_curso)
                  return (
                    <button
                      type="button"
                      key={c.cod_curso}
                      onClick={() => {
                        setSelectedApprovedCodes((prev) =>
                          prev.includes(c.cod_curso) ? prev.filter((n) => n !== c.cod_curso) : [...prev, c.cod_curso],
                        )
                      }}
                      className={`flex items-center justify-between rounded-md px-3 py-2 text-left border ${
                        selected ? 'bg-secondary border-primary' : 'hover:bg-muted'
                      }`}
                   >
                      <span className="text-sm">
                        <span className="font-mono text-xs text-primary mr-2">{c.cod_curso}</span>
                        {c.nombre}
                      </span>
                      {selected && <CheckCircle2 className="w-4 h-4 text-primary" />}
                    </button>
                  )
                })}
            </div>
            {selectedApprovedCodes.length > 0 && (
              <div className="text-xs text-muted-foreground">
                Seleccionados: {selectedApprovedCodes.length}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Error/Success Messages */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="w-5 h-5" />
              <p className="text-sm">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {success && (
        <Card className="border-green-500">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle2 className="w-5 h-5" />
              <p className="text-sm">Perfil guardado exitosamente</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button type="submit" disabled={loading} className="flex-1">
          {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {submitLabel}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
            Cancelar
          </Button>
        )}
      </div>
    </form>
  )
}
