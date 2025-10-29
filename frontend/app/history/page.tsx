"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Sidebar from "@/components/sidebar"
import { Calendar } from "lucide-react"

const mockHistory = [
  {
    id: 1,
    courseCode: "CS2H1",
    courseName: "INTERACCION HUMANO COMPUTADOR",
    prediction: "Aprobar",
    score: 0.75,
    date: "2024-10-28",
  },
  {
    id: 2,
    courseCode: "CS2H2",
    courseName: "INGENIERIA DE SOFTWARE",
    prediction: "Desaprobar",
    score: 0.55,
    date: "2024-10-27",
  },
  {
    id: 3,
    courseCode: "CS2H3",
    courseName: "BASES DE DATOS",
    prediction: "Desaprobar",
    score: 0.78,
    date: "2024-10-26",
  },
]

export default function HistoryPage() {
  const router = useRouter()

  useEffect(() => {
    const user = localStorage.getItem("user")
    if (!user) router.push("/login")
  }, [router])

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Historial de Predicciones</h1>
            <p className="text-muted-foreground">Todas tus predicciones anteriores</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Predicciones Recientes</CardTitle>
              <CardDescription>Últimas predicciones realizadas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockHistory.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-secondary transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-sm font-semibold text-primary">{item.courseCode}</span>
                        <Badge variant="outline">{item.courseName}</Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        {new Date(item.date).toLocaleDateString("es-ES")}
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={item.prediction === "Aprobar" ? "bg-risk-low" : "bg-risk-high"}>
                        {item.prediction}
                      </Badge>
                      <p className="text-sm font-mono mt-1">{(item.score * 100).toFixed(0)}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
