"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import Sidebar from "@/components/sidebar"
import { ArrowLeft, Loader2, AlertCircle } from "lucide-react"
import { usePrediction } from "@/lib/hooks/usePrediction"
import { useWhatIf } from "@/lib/hooks/useWhatIf"
import { getAvailableCourses, type Course } from "@/lib/services/courses"

export default function CourseDetailPage() {
  const router = useRouter()
  const params = useParams()
  const [draftList, setDraftList] = useState<string[]>([])
  const [promedioAjuste, setPromedioAjuste] = useState(0)
  const [course, setCourse] = useState<Course | null>(null)

  // Hooks for API calls
  const { loading: loadingPrediction, error: predictionError, result: prediction, makePrediction } = usePrediction()
  const { loading: loadingWhatIf, error: whatIfError, result: whatIfResult, runSimulation } = useWhatIf()

  useEffect(() => {
    const user = localStorage.getItem("user")
    if (!user) router.push("/login")
    const draft = localStorage.getItem("draftList")
    if (draft) setDraftList(JSON.parse(draft))

    // Load course data and trigger prediction
    if (params.cod) {
      getAvailableCourses(2)
        .then((data) => setCourse(data.find((c) => c.cod_curso === (params.cod as string)) ?? null))
        .catch(() => setCourse(null))
      // Backend usa el perfil guardado; no es necesario enviar features
      makePrediction(params.cod as string, {})
    }
  }, [router, params.cod, makePrediction])

  const handleAddToDraft = () => {
    const newDraft = [...draftList, params.cod as string]
    setDraftList(newDraft)
    localStorage.setItem("draftList", JSON.stringify(newDraft))
  }

  const handleWhatIfSimulation = async (newAjuste: number) => {
    setPromedioAjuste(newAjuste)
    if (params.cod) {
      // Delta aplicado al promedio general
      const deltas = { promedio_general: newAjuste }
      await runSimulation(params.cod as string, {}, deltas)
    }
  }

  // Use whatIf result if available, otherwise use base prediction
  const displayResult = whatIfResult || prediction
  const score = displayResult?.score || 0
  const label = displayResult?.prediction_label || "Cargando..."
  const estimatedGrade = displayResult?.estimated_grade
  const maxGrade = displayResult?.max_grade || 20

  const riskLevel = score < 0.4 ? "low" : score < 0.7 ? "medium" : "high"
  const riskColor = riskLevel === "low" ? "text-risk-low" : riskLevel === "medium" ? "text-risk-medium" : "text-risk-high"

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
                <span className="text-sm font-mono text-primary">{params.cod}</span>
                <h1 className="text-3xl font-bold mt-2">{course?.nombre ?? "Curso"}</h1>
                <p className="text-muted-foreground mt-2">Detalle del curso</p>
              </div>
              <Badge>{course?.creditos ?? 0} créditos</Badge>
            </div>
          </div>

          {(predictionError || whatIfError) && !displayResult && (
            <Card className="mb-6 border-destructive">
              <CardContent className="flex items-center gap-2 p-4 text-destructive">
                <AlertCircle className="w-4 h-4" />
                <p className="text-sm">{predictionError || whatIfError}</p>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Predicción Actual</CardTitle>
                <CardDescription>Basada en tu perfil académico (modelo ML)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {loadingPrediction && !prediction ? (
                  <div className="flex items-center justify-center p-12">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between p-6 bg-secondary rounded-lg">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Probabilidad de Aprobación</p>
                        <p className={`text-4xl font-bold ${riskColor}`}>{(score * 100).toFixed(0)}%</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground mb-1">Resultado Predicho</p>
                        <Badge className="text-lg px-4 py-2">{label}</Badge>
                      </div>
                    </div>

                    <div className="p-4 bg-muted rounded-lg">
                      {displayResult?.version && (
                        <p className="text-xs text-muted-foreground mt-2">Versión del modelo: {displayResult.version}</p>
                      )}
                      {typeof estimatedGrade === 'number' && (
                        <p className="text-xs text-muted-foreground">Nota estimada: {estimatedGrade.toFixed(1)} / {maxGrade}</p>
                      )}
                    </div>
                  </>
                )}
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
                  {draftList.includes(params.cod as string) ? "Agregado al borrador" : "Agregar a borrador"}
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
              <CardDescription>
                Ajusta tu promedio para ver cómo cambiaría tu predicción (conectado al endpoint /whatif)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-sm font-medium">Ajuste de Promedio General</label>
                  <span className="text-sm font-mono">
                    {promedioAjuste > 0 ? "+" : ""}
                    {promedioAjuste.toFixed(2)}
                  </span>
                </div>
                <Slider
                  value={[promedioAjuste]}
                  onValueChange={(value) => handleWhatIfSimulation(value[0])}
                  min={-5}
                  max={5}
                  step={0.1}
                  className="w-full"
                  disabled={loadingWhatIf}
                />
                <p className="text-xs text-muted-foreground mt-2">Ajuste aplicado: {promedioAjuste.toFixed(2)}</p>
              </div>

              {loadingWhatIf ? (
                <div className="flex items-center justify-center p-4">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : (
                whatIfResult && (
                  <div className="p-4 bg-secondary rounded-lg">
                    <p className="text-sm text-muted-foreground mb-2">Predicción simulada:</p>
                    <div className="flex items-center justify-between">
                      <span className={`text-2xl font-bold ${riskColor}`}>{(whatIfResult.score * 100).toFixed(0)}%</span>
                      <Badge>{whatIfResult.prediction_label}</Badge>
                    </div>
                  </div>
                )
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
