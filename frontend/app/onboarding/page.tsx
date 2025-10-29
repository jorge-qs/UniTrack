"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { profileService } from "@/lib/services/profile"

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    birthDate: "",
    gender: "",
    department: "",
    admissionScore: "",
    scholarshipStatus: "",
    collegeType: "",
  })

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value })
  }

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1)
    } else {
      // Map onboarding fields to StudentProfileData and save to backend
      const toProfile = {
        sexo: (formData.gender as "M" | "F") || "M",
        fecha_nacimiento: formData.birthDate || "2000-01-01",
        estado_civil: "Soltero",
        tipo_colegio: formData.collegeType === "private" ? "Privado" : "Publico",
        promedio_general: 14.0,
        creditos_aprobados: 0,
        puntaje_ingreso: Number(formData.admissionScore || 0),
        semestres_cursados: 0,
        tiene_beca: formData.scholarshipStatus === "1",
        cantidad_reservas: 0,
        familia: "CS",
        periodo_ingreso: "2024-1",
      }
      profileService
        .saveProfile(toProfile)
        .then(() => router.push("/dashboard"))
        .catch(() => router.push("/dashboard"))
    }
  }

  const handleBack = () => {
    if (step > 1) setStep(step - 1)
  }

  const progress = (step / 3) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Completa tu perfil</CardTitle>
          <CardDescription>
            Paso {step} de 3 - Esta información nos ayuda a personalizar tus predicciones
          </CardDescription>
          <Progress value={progress} className="mt-4" />
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {step === 1 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Fecha de nacimiento</label>
                  <Input
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) => handleChange("birthDate", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Género</label>
                  <Select value={formData.gender} onValueChange={(value) => handleChange("gender", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona tu género" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="M">Masculino</SelectItem>
                      <SelectItem value="F">Femenino</SelectItem>
                      <SelectItem value="O">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Departamento de procedencia</label>
                  <Input
                    placeholder="Ej: Arequipa"
                    value={formData.department}
                    onChange={(e) => handleChange("department", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Puntaje de ingreso</label>
                  <Input
                    type="number"
                    placeholder="Ej: 133"
                    value={formData.admissionScore}
                    onChange={(e) => handleChange("admissionScore", e.target.value)}
                  />
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Tipo de colegio</label>
                  <Select value={formData.collegeType} onValueChange={(value) => handleChange("collegeType", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona tipo de colegio" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Público</SelectItem>
                      <SelectItem value="private">Privado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Estado de beca</label>
                  <Select
                    value={formData.scholarshipStatus}
                    onValueChange={(value) => handleChange("scholarshipStatus", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="¿Tienes beca?" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">No tengo beca</SelectItem>
                      <SelectItem value="1">Tengo beca</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            <div className="flex gap-3 justify-between pt-4">
              <Button variant="outline" onClick={handleBack} disabled={step === 1}>
                Atrás
              </Button>
              <Button onClick={handleNext}>{step === 3 ? "Completar" : "Siguiente"}</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
