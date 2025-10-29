"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Sidebar from "@/components/sidebar"
import { BookOpen, Users, Video, FileText } from "lucide-react"

const mockResources = [
  {
    courseCode: "CS2H1",
    courseName: "INTERACCION HUMANO COMPUTADOR",
    resources: [
      {
        type: "book",
        title: "Design of Everyday Things",
        author: "Don Norman",
        reason: "Fundamental para entender HCI",
      },
      {
        type: "video",
        title: "UX Design Principles",
        author: "Nielsen Norman Group",
        reason: "Cubre conceptos clave del curso",
      },
      { type: "group", title: "Grupo de Estudio HCI", author: "Estudiantes", reason: "Colaboración con compañeros" },
    ],
  },
  {
    courseCode: "CS2H2",
    courseName: "INGENIERIA DE SOFTWARE",
    resources: [
      { type: "book", title: "Clean Code", author: "Robert C. Martin", reason: "Prácticas de desarrollo profesional" },
      { type: "video", title: "Software Architecture Patterns", author: "O'Reilly", reason: "Patrones de diseño" },
    ],
  },
]

function ResourceIcon({ type }: { type: string }) {
  const icons = {
    book: <BookOpen className="w-4 h-4" />,
    video: <Video className="w-4 h-4" />,
    group: <Users className="w-4 h-4" />,
    file: <FileText className="w-4 h-4" />,
  }
  return icons[type as keyof typeof icons] || icons.file
}

export default function ResourcesPage() {
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
            <h1 className="text-3xl font-bold mb-2">Recursos Recomendados</h1>
            <p className="text-muted-foreground">Materiales personalizados para mejorar tu desempeño</p>
          </div>

          <div className="space-y-6">
            {mockResources.map((course) => (
              <Card key={course.courseCode}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="font-mono text-sm text-primary">{course.courseCode}</span>
                    {course.courseName}
                  </CardTitle>
                  <CardDescription>Recursos personalizados para este curso</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {course.resources.map((resource, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-4 p-4 border rounded-lg hover:bg-secondary transition-colors"
                      >
                        <div className="mt-1 text-primary">
                          <ResourceIcon type={resource.type} />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold">{resource.title}</h4>
                          <p className="text-sm text-muted-foreground">{resource.author}</p>
                          <p className="text-sm mt-2 text-accent">💡 {resource.reason}</p>
                        </div>
                      </div>
                    ))}
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
