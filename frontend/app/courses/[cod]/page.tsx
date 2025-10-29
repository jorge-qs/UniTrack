"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import Sidebar from "@/components/sidebar"
import { ArrowLeft } from "lucide-react"

const mockCourseDetail = {
  cod: "CS2H1",
  name: "INTERACCION HUMANO COMPUTADOR",
  credits: 3,
  description: "Curso avanzado sobre interacción humano-computador",
  prediction: {
    label: "Aprobar",
    score: 0.75,
  },
  explain: [
    { feature: "Promedio General", impact: 0.21 },
    { feature: "Créditos Totales", impact: 0.15 },
    { feature: "Puntaje Ingreso", impact: 0.12 },
  ],
}

export default function CourseDetailPage() {
  const router = useRouter()
  const params = useParams()
  const [whatIfScore, setWhatIfScore] = useState(0.75)
  const [draftList, setDraftList] = useState<string[]>([])

  useEffect(() => {
    const user = localStorage.getItem("user")
    if (!user) router.push("/login")
    const draft = localStorage.getItem("draftList")
    if (draft) setDraftList(JSON.parse(draft))
  }, [router])

  const handleAddToDraft = () => {
    const newDraft = [...draftList, params.cod as string]
    setDraftList(newDraft)
    localStorage.setItem("draftList", JSON.stringify(newDraft))
  }

  const riskLevel = whatIfScore < 0.4 ? "low" : whatIfScore < 0.7 ? "medium" : "high"
  const riskColor =
    riskLevel === "low" ? "text-risk-low" : riskLevel === "medium" ? "text-risk-medium" : "text-risk-high"

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          <Button variant="ghost" size="sm" onClick={() => router.back()} className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>

          <div className="mb-8">
            <div className="flex items-start justify-between mb-4">
              <div>
                <span className="text-sm font-mono text-primary">{mockCourseDetail.cod}</span>
                <h1 className="text-3xl font-bold mt-2">{mockCourseDetail.name}</h1>
                <p className="text-muted-foreground mt-2">{mockCourseDetail.description}</p>
              </div>
              <Badge>{mockCourseDetail.credits} créditos</Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Predicción Actual</CardTitle>
                <CardDescription>Basada en tu perfil académico</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-6 bg-secondary rounded-lg">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Probabilidad de Aprobación</p>
                    <p className={`text-4xl font-bold ${riskColor}`}>{(whatIfScore * 100).toFixed(0)}%</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground mb-1">Resultado Predicho</p>
                    <Badge className="text-lg px-4 py-2">{whatIfScore > 0.5 ? "Aprobar" : "Desaprobar"}</Badge>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-4">Factores Más Influyentes</h3>
                  <div className="space-y-3">
                    {mockCourseDetail.explain.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-secondary rounded">
                        <span className="text-sm font-medium">{item.feature}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-primary" style={{ width: `${item.impact * 100}%` }} />
                          </div>
                          <span className="text-sm font-mono">{(item.impact * 100).toFixed(0)}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Acciones</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  className="w-full"
                  onClick={handleAddToDraft}
                  disabled={draftList.includes(params.cod as string)}
                >
                  {draftList.includes(params.cod as string) ? "✓ Agregado al borrador" : "Agregar a borrador"}
                </Button>
                <Button variant="outline" className="w-full bg-transparent">
                  Ver recursos
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Simulación What-If</CardTitle>
              <CardDescription>Ajusta tus características para ver cómo cambiaría tu predicción</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-sm font-medium">Promedio General</label>
                  <span className="text-sm font-mono">{whatIfScore.toFixed(2)}</span>
                </div>
                <Slider
                  value={[whatIfScore]}
                  onValueChange={(value) => setWhatIfScore(value[0])}
                  min={0}
                  max={1}
                  step={0.01}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground mt-2">Desliza para simular cambios en tu promedio</p>
              </div>

              <div className="p-4 bg-secondary rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">Predicción simulada:</p>
                <div className="flex items-center justify-between">
                  <span className={`text-2xl font-bold ${riskColor}`}>{(whatIfScore * 100).toFixed(0)}%</span>
                  <Badge>{whatIfScore > 0.5 ? "Aprobar" : "Desaprobar"}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
