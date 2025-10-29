"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import Sidebar from "@/components/sidebar"
import { Search, AlertTriangle, AlertCircle, CheckCircle } from "lucide-react"
import { getAvailableCourses, type Course } from "@/lib/services/courses"

function RiskBadge({ risk }: { risk: "low" | "medium" | "high" }) {
  const config = {
    low: { bg: "bg-risk-low/10", text: "text-risk-low", label: "Bajo", icon: CheckCircle },
    medium: { bg: "bg-risk-medium/10", text: "text-risk-medium", label: "Medio", icon: AlertCircle },
    high: { bg: "bg-risk-high/10", text: "text-risk-high", label: "Alto", icon: AlertTriangle },
  } as const
  const c = config[risk]
  const Icon = c.icon
  return (
    <Badge className={`${c.bg} ${c.text} border-0`}>
      <Icon className="w-3 h-3 mr-1" />
      {c.label}
    </Badge>
  )
}

export default function CoursesPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [filterLevel, setFilterLevel] = useState("all")
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const user = localStorage.getItem("user")
    if (!user) router.push("/login")
    getAvailableCourses(1)
      .then((data) => setCourses(data))
      .catch((e) => setError(e?.message ?? "Error al cargar cursos"))
      .finally(() => setLoading(false))
  }, [router])

  const filtered = courses.filter((course) => {
    const matchesSearch =
      course.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.cod_curso.toLowerCase().includes(searchTerm.toLowerCase())
    const level = course.semestre && course.semestre <= 4 ? "Básico" : course.semestre && course.semestre <= 8 ? "Intermedio" : "Avanzado"
    const matchesLevel = filterLevel === "all" || level === filterLevel
    return matchesSearch && matchesLevel
  })

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Cursos Disponibles</h1>
            <p className="text-muted-foreground">Selecciona un curso para ver predicciones detalladas</p>
          </div>

          {loading && <p className="text-sm text-muted-foreground">Cargando cursos...</p>}
          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por código o nombre..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterLevel} onValueChange={setFilterLevel}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los niveles</SelectItem>
                <SelectItem value="Básico">Básico</SelectItem>
                <SelectItem value="Intermedio">Intermedio</SelectItem>
                <SelectItem value="Avanzado">Avanzado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4">
            {!loading && filtered.map((course) => (
              <Card
                key={course.cod_curso}
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => router.push(`/courses/${course.cod_curso}`)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-mono text-sm font-semibold text-primary">{course.cod_curso}</span>
                        <Badge variant="outline">{course.creditos ?? 0} créditos</Badge>
                        <Badge variant="secondary">{course.semestre ? `Sem ${course.semestre}` : ""}</Badge>
                      </div>
                      <h3 className="font-semibold text-lg mb-1">{course.nombre}</h3>
                      <p className="text-sm text-muted-foreground">Prerequisitos: {(course.prerequisitos?.length ?? 0)}</p>
                    </div>
                    <div className="flex flex-col items-end gap-3">
                      <RiskBadge risk={"low"} />
                      <Button size="sm" variant="outline">
                        Ver detalles »
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}

