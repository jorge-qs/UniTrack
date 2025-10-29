"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import Sidebar from "@/components/sidebar"
import { AlertCircle, Loader2, Edit } from "lucide-react"
import { StudentProfileForm } from "@/components/student-profile-form"
import { profileService, type StudentProfile, type StudentProfileData } from "@/lib/services/profile"

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<StudentProfile | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (!userData) {
      router.push("/login")
    } else {
      setUser(JSON.parse(userData))
      loadProfile()
    }
  }, [router])

  const loadProfile = async () => {
    try {
      setLoading(true)
      const data = await profileService.getProfile()
      setProfile(data)
      setShowForm(!data) // Show form if no profile exists
    } catch (error) {
      console.error('Error loading profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveProfile = async (data: StudentProfileData) => {
    await profileService.saveProfile(data)
    await loadProfile()
    setShowForm(false)
  }

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
    link.download = "unitrack-profile.json"
    link.click()
  }

  const handleDeleteAccount = () => {
    localStorage.removeItem("user")
    localStorage.removeItem("profile")
    localStorage.removeItem("draftList")
    router.push("/login")
  }

  if (!user) return null

  if (loading) {
    return (
      <div className="flex h-screen bg-background">
        <Sidebar />
        <main className="flex-1 overflow-auto flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin" />
        </main>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <div className="p-8 max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Mi Perfil</h1>
            <p className="text-muted-foreground">Gestiona tu información personal y académica</p>
          </div>

          {/* Show Form or Profile View */}
          {showForm || !profile ? (
            <div>
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>
                    {profile ? 'Editar Perfil Académico' : 'Crear Perfil Académico'}
                  </CardTitle>
                  <CardDescription>
                    {profile
                      ? 'Actualiza tu información académica'
                      : 'Completa tu perfil académico para obtener predicciones personalizadas'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <StudentProfileForm
                    initialData={profile || undefined}
                    onSubmit={handleSaveProfile}
                    onCancel={profile ? () => setShowForm(false) : undefined}
                    submitLabel={profile ? 'Actualizar perfil' : 'Crear perfil'}
                  />
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Profile Summary */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Perfil Académico</CardTitle>
                      <CardDescription>Tu información académica actual</CardDescription>
                    </div>
                    <Button onClick={() => setShowForm(true)} variant="outline">
                      <Edit className="w-4 h-4 mr-2" />
                      Editar
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Promedio General</label>
                      <p className="text-lg font-semibold">{profile.promedio_general.toFixed(2)}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Créditos Aprobados</label>
                      <p className="text-lg font-semibold">{profile.creditos_aprobados}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Puntaje de Ingreso</label>
                      <p className="text-lg font-semibold">{profile.puntaje_ingreso}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Semestres Cursados</label>
                      <p className="text-lg font-semibold">{profile.semestres_cursados}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Beca</label>
                      <p className="text-lg font-semibold">{profile.tiene_beca ? 'Sí' : 'No'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Período de Ingreso</label>
                      <p className="text-lg font-semibold">{profile.periodo_ingreso}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Account Information */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Información de Cuenta</CardTitle>
                    <CardDescription>Datos de tu cuenta</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Correo electrónico</label>
                      <Input value={user.email} disabled className="mt-1" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Acciones</CardTitle>
                    <CardDescription>Gestiona tu cuenta</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button onClick={handleExport} className="w-full" variant="outline">
                      Descargar mis datos
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full bg-transparent text-destructive hover:text-destructive"
                      onClick={() => setShowDeleteConfirm(true)}
                    >
                      Eliminar cuenta
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Delete Confirmation */}
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
