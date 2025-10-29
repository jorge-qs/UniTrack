"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Sidebar from "@/components/sidebar"
import { Calendar, Loader2, AlertCircle } from "lucide-react"
import { getHistory, InferenceRecord } from "@/lib/services/predictions"

export default function HistoryPage() {
  const router = useRouter()
  const [history, setHistory] = useState<InferenceRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const user = localStorage.getItem("user")
    if (!user) {
      router.push("/login")
      return
    }

    // Fetch history from backend
    const fetchHistory = async () => {
      try {
        setLoading(true)
        const response = await getHistory(50, 0)
        setHistory(response.items)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al cargar el historial")
        console.error("History fetch error:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchHistory()
  }, [router])

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Historial de Predicciones</h1>
            <p className="text-muted-foreground">
              Todas tus predicciones anteriores (conectado al endpoint /history)
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Predicciones Recientes</CardTitle>
              <CardDescription>Últimas predicciones realizadas desde el backend</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center p-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : error ? (
                <div className="flex items-center gap-2 p-4 text-destructive">
                  <AlertCircle className="w-4 h-4" />
                  <p className="text-sm">{error}</p>
                </div>
              ) : history.length === 0 ? (
                <div className="text-center p-12 text-muted-foreground">
                  <p>No hay predicciones en el historial</p>
                  <p className="text-sm mt-2">Realiza una predicción de curso para verla aquí</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {history.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-secondary transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-sm font-semibold text-primary">{item.cod_curso}</span>
                          <Badge variant="outline" className="text-xs">
                            v{item.version}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          {new Date(item.created_at).toLocaleDateString("es-ES", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge
                          className={
                            item.prediction_label === "Aprobar"
                              ? "bg-risk-low text-white"
                              : "bg-risk-high text-white"
                          }
                        >
                          {item.prediction_label}
                        </Badge>
                        <p className="text-sm font-mono mt-1">{(item.score * 100).toFixed(0)}%</p>
                      </div>
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
