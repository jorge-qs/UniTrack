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

// Mock courses data
const mockCourses = [
  { cod: "CS2H1", name: "INTERACCION HUMANO COMPUTADOR", credits: 3, level: "Avanzado", risk: "low", riskScore: 0.25 },
  { cod: "CS2H2", name: "INGENIERIA DE SOFTWARE", credits: 4, level: "Avanzado", risk: "medium", riskScore: 0.55 },
  { cod: "CS2H3", name: "BASES DE DATOS", credits: 3, level: "Intermedio", risk: "high", riskScore: 0.78 },
  { cod: "CS2H4", name: "ALGORITMOS AVANZADOS", credits: 4, level: "Avanzado", risk: "medium", riskScore: 0.62 },
  { cod: "CS2H5", name: "SISTEMAS OPERATIVOS", credits: 3, level: "Intermedio", risk: "low", riskScore: 0.35 },
]

function RiskBadge({ risk }: { risk: string }) {
  const config = {
    low: { bg: "bg-risk-low/10", text: "text-risk-low", label: "Bajo", icon: CheckCircle },
    medium: { bg: "bg-risk-medium/10", text: "text-risk-medium", label: "Medio", icon: AlertCircle },
    high: { bg: "bg-risk-high/10", text: "text-risk-high", label: "Alto", icon: AlertTriangle },
  }
  const c = config[risk as keyof typeof config]
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
  const [courses, setCourses] = useState(mockCourses)

  useEffect(() => {
    const user = localStorage.getItem("user")
    if (!user) router.push("/login")
  }, [router])

  const filtered = courses.filter((course) => {
    const matchesSearch =
      course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.cod.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesLevel = filterLevel === "all" || course.level === filterLevel
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
            {filtered.map((course) => (
              <Card
                key={course.cod}
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => router.push(`/courses/${course.cod}`)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-mono text-sm font-semibold text-primary">{course.cod}</span>
                        <Badge variant="outline">{course.credits} créditos</Badge>
                        <Badge variant="secondary">{course.level}</Badge>
                      </div>
                      <h3 className="font-semibold text-lg mb-1">{course.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        Riesgo de desaprobación: {(course.riskScore * 100).toFixed(0)}%
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-3">
                      <RiskBadge risk={course.risk} />
                      <Button size="sm" variant="outline">
                        Ver detalles →
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
