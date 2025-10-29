"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import Sidebar from "@/components/sidebar"
import { AlertCircle } from "lucide-react"

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  useEffect(() => {
    const userData = localStorage.getItem("user")
    const profileData = localStorage.getItem("profile")
    if (!userData) {
      router.push("/login")
    } else {
      setUser(JSON.parse(userData))
      if (profileData) setProfile(JSON.parse(profileData))
    }
  }, [router])

  const handleExport = () => {
    const data = {
      user,
      profile,
      exportDate: new Date().toISOString(),
    }
    const dataStr = JSON.stringify(data, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = "unitrack-data.json"
    link.click()
  }

  const handleDeleteAccount = () => {
    localStorage.removeItem("user")
    localStorage.removeItem("profile")
    localStorage.removeItem("draftList")
    router.push("/login")
  }

  if (!user) return null

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Mi Perfil</h1>
            <p className="text-muted-foreground">Gestiona tu información personal</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Información Personal</CardTitle>
                <CardDescription>Tus datos de cuenta</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Correo electrónico</label>
                  <Input value={user.email} disabled className="mt-1" />
                </div>
                {profile && (
                  <>
                    <div>
                      <label className="text-sm font-medium">Departamento</label>
                      <Input value={profile.department || "No especificado"} disabled className="mt-1" />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Puntaje de ingreso</label>
                      <Input value={profile.admissionScore || "No especificado"} disabled className="mt-1" />
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Acciones</CardTitle>
                <CardDescription>Gestiona tu cuenta</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button onClick={handleExport} className="w-full">
                  Descargar mis datos
                </Button>
                <Button variant="outline" className="w-full bg-transparent" onClick={() => setShowDeleteConfirm(true)}>
                  Eliminar cuenta
                </Button>
              </CardContent>
            </Card>
          </div>

          {showDeleteConfirm && (
            <Card className="mt-6 border-destructive">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <AlertCircle className="w-5 h-5" />
                  Confirmar eliminación
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm">
                  Esta acción no se puede deshacer. Se eliminarán todos tus datos, historial y borradores.
                </p>
                <div className="flex gap-3">
                  <Button variant="destructive" onClick={handleDeleteAccount}>
                    Sí, eliminar mi cuenta
                  </Button>
                  <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
                    Cancelar
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
