import { api } from '../api'

export interface StudentProfileData {
  // Essential Demographics
  sexo: 'M' | 'F'
  fecha_nacimiento: string // YYYY-MM-DD
  estado_civil: string
  tipo_colegio: string // Público/Privado

  // Academic Performance
  promedio_general: number // 0-20
  creditos_aprobados: number
  puntaje_ingreso: number // 0-100

  // Current Status
  semestres_cursados: number
  tiene_beca: boolean
  cantidad_reservas: number

  // Socioeconomic
  familia: string
  periodo_ingreso: string // YYYY-1 or YYYY-2

  // Optional advanced progress
  cursos_aprobados?: string[]
}

export interface StudentProfile extends StudentProfileData {
  id: string
  user_id: string
  created_at: string
  updated_at: string
}

export const profileService = {
  /**
   * Get the current user's profile
   */
  async getProfile(): Promise<StudentProfile | null> {
    try {
      const response = await api.get<StudentProfile>('/profile')
      return response
    } catch (error: any) {
      if (error.status === 404) {
        return null
      }
      throw error
    }
  },

  /**
   * Create or update the current user's profile
   */
  async saveProfile(data: StudentProfileData): Promise<StudentProfile> {
    const response = await api.post<StudentProfile>('/profile', data)
    return response
  },

  /**
   * Delete the current user's profile
   */
  async deleteProfile(): Promise<void> {
    await api.delete<void>('/profile')
  }
}
