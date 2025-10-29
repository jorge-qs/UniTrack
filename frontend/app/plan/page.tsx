"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Sidebar from "@/components/sidebar"
import { Trash2 } from "lucide-react"
import { getAvailableCourses, type Course } from "@/lib/services/courses"
import { getHistory, type HistoryResponse } from "@/lib/services/predictions"

export default function PlanPage() {
  const router = useRouter()
  const [draftList, setDraftList] = useState<string[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [lastScoreByCourse, setLastScoreByCourse] = useState<Record<string, number>>({})

  useEffect(() => {
    const user = localStorage.getItem("user")
    if (!user) router.push("/login")
    const draft = localStorage.getItem("draftList")
    if (draft) setDraftList(JSON.parse(draft))

    // Load real courses
    getAvailableCourses(2)
      .then((data) => setCourses(data))
      .catch(() => setCourses([]))

    // Load last scores from history
    getHistory(100, 0)
      .then((h: HistoryResponse) => {
        const map: Record<string, number> = {}
        for (const item of h.items) {
          if (!(item.cod_curso in map)) map[item.cod_curso] = item.score
        }
        setLastScoreByCourse(map)
      })
      .catch(() => setLastScoreByCourse({}))

    // Keep draft in sync
    const onVis = () => {
      const s = localStorage.getItem("draftList")
      if (s) setDraftList(JSON.parse(s))
    }
    const onStorage = (e: StorageEvent) => {
      if (e.key === "draftList") setDraftList(e.newValue ? JSON.parse(e.newValue) : [])
    }
    document.addEventListener("visibilitychange", onVis)
    window.addEventListener("storage", onStorage)
    return () => {
      document.removeEventListener("visibilitychange", onVis)
      window.removeEventListener("storage", onStorage)
    }
  }, [router])

  const draftCourses = courses.filter((c) => draftList.includes(c.cod_curso))
  const totalCredits = draftCourses.reduce((sum, c) => sum + (c.creditos ?? 0), 0)
  const avgRisk = draftCourses.length > 0
    ? (
        (draftCourses.reduce((sum, c) => sum + (lastScoreByCourse[c.cod_curso] ?? 0), 0) / draftCourses.length) *
        100
      ).toFixed(0)
    : 0

  const handleRemove = (cod: string) => {
    const newDraft = draftList.filter((c) => c !== cod)
    setDraftList(newDraft)
    localStorage.setItem("draftList", JSON.stringify(newDraft))
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Mi Plan de Matrícula</h1>
            <p className="text-muted-foreground">Borrador de cursos seleccionados</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Cursos Seleccionados</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{draftCourses.length}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Créditos Totales</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{totalCredits}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Riesgo Promedio</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{avgRisk}%</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Cursos en el Borrador</CardTitle>
              <CardDescription>Cursos que has seleccionado para matricularte</CardDescription>
            </CardHeader>
            <CardContent>
              {draftCourses.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">No hay cursos en tu borrador</p>
                  <Button onClick={() => router.push("/courses")}>Ir a seleccionar cursos</Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {draftCourses.map((course) => (
                    <div
                      key={course.cod_curso}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-secondary transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-sm font-semibold text-primary">{course.cod_curso}</span>
                          <Badge variant="outline">{course.creditos ?? 0} créditos</Badge>
                        </div>
                        <p className="text-sm font-medium">{course.nombre}</p>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => handleRemove(course.cod_curso)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
