"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, TrendingUp, Zap, LogOut } from "lucide-react"
import Sidebar from "@/components/sidebar"

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (!userData) {
      router.push("/login")
    } else {
      setUser(JSON.parse(userData))
    }
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("user")
    localStorage.removeItem("profile")
    router.push("/login")
  }

  if (!user) return null

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-3xl font-bold">Bienvenido, {user.email}</h1>
              <p className="text-muted-foreground mt-2">Asesor Inteligente de Cursos - UniTrack v1</p>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Cerrar sesión
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push("/courses")}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-primary" />
                  Asesor por Curso
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Predice tu riesgo de desaprobación en cursos individuales
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push("/plan")}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-accent" />
                  Mi Progreso
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Visualiza tu borrador de matrícula y riesgos</p>
              </CardContent>
            </Card>

            <Card
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => router.push("/resources")}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-500" />
                  Recursos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Recomendaciones personalizadas por curso</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Información del Sistema</CardTitle>
              <CardDescription>Cómo funciona UniTrack</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Predicción de Riesgo</h3>
                <p className="text-sm text-muted-foreground">
                  Nuestro modelo de machine learning analiza tus datos académicos, personales y socioeconómicos para
                  predecir tu probabilidad de desaprobación en cada curso.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Explicabilidad</h3>
                <p className="text-sm text-muted-foreground">
                  Visualiza los 3 factores más influyentes en tu predicción para entender qué afecta tu desempeño.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Simulación What-If</h3>
                <p className="text-sm text-muted-foreground">
                  Experimenta cómo cambios en tus características (edad, puntaje, etc.) afectarían tu riesgo.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
