import { api } from "../api"

export interface Course {
  cod_curso: string
  nombre: string
  semestre?: number | null
  tipo?: string | null
  horas?: number | null
  creditos?: number | null
  prerequisitos?: string[] | null
  familia?: string | null
  nivel?: number | null
}

export async function getAvailableCourses(maxNextSemesters: number = 1): Promise<Course[]> {
  const qs = `?max_next_semesters=${encodeURIComponent(maxNextSemesters)}`
  return api.get<Course[]>(`/courses/available${qs}`)
}

export async function getAllCourses(): Promise<Course[]> {
  return api.get<Course[]>(`/courses/all`)
}
