export type UserRole = 'patient' | 'professional' | 'admin'
export type ConsultationType = 'online' | 'in-person' | 'both'
export type AppointmentStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed'
export type AppointmentType = 'online' | 'in-person'
export type VerificationStatus = 'pending' | 'under_review' | 'verified' | 'rejected'
export type SpecialtyCategory = 'medical' | 'wellness' | 'dental' | 'diagnostics'

export interface Profile {
  id: string
  first_name: string | null
  last_name: string | null
  role: UserRole
  date_of_birth: string | null
  avatar_url: string | null
  phone: string | null
  email_verified: boolean
  health_insurance: string | null
  created_at: string
  updated_at: string
}

export interface Professional {
  id: string
  specialty: string | null
  specialty_id: string | null
  bio: string | null
  university: string | null
  location: string | null
  consultation_type: ConsultationType
  consultation_price: number
  online_price: number
  in_person_price: number
  rating: number
  review_count: number
  verified: boolean
  years_experience: number
  languages: string[]
  availability: Record<string, unknown>
  stellar_wallet: string | null
  registration_number: string | null
  registration_institution: string | null
  // KYP Verification fields
  professional_license_number: string | null
  verification_status: VerificationStatus
  verification_date: string | null
  verification_document_url: string | null
  verification_document_name: string | null
  verification_notes: string | null
  verified_by: string | null
  license_expiry_date: string | null
  license_issuing_institution: string | null
  license_country: string | null
  created_at: string
  updated_at: string
}

export interface ProfessionalWithProfile extends Professional {
  profiles: Profile
  specialties?: Specialty
}

export interface Appointment {
  id: string
  patient_id: string
  professional_id: string
  appointment_date: string
  appointment_time: string
  duration_minutes: number
  type: AppointmentType
  status: AppointmentStatus
  is_online: boolean
  payment_status: string | null
  price: number
  meeting_link: string | null
  meeting_room_id: string | null
  video_platform: string | null
  meeting_expires_at: string | null
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  name_es: string
  name_en: string
  slug: string
  description_es: string | null
  description_en: string | null
  icon: string | null
  sort_order: number
  created_at: string
}

export interface Specialty {
  id: string
  category_id: string
  parent_id: string | null
  name_es: string
  name_en: string
  slug: string
  icon: string | null
  requires_license: boolean
  is_active: boolean
  sort_order: number
  created_at: string
}

export interface SpecialtyWithCategory extends Specialty {
  categories: Category
}

export interface Review {
  id: string
  professional_id: string
  patient_id: string
  rating: number
  comment: string | null
  is_anonymous: boolean
  created_at: string
  updated_at: string
}

export interface Favorite {
  id: string
  patient_id: string
  professional_id: string
  created_at: string
}

export interface ProfessionalSpecialty {
  id: string
  professional_id: string
  specialty_id: string
  is_primary: boolean
  certification_url: string | null
  certified_at: string | null
  created_at: string
}

export interface ProfessionalSpecialtyWithDetails extends ProfessionalSpecialty {
  specialties: Specialty
}

export interface ProfessionalWithSpecialties extends Professional {
  profiles: Profile
  professional_specialties?: ProfessionalSpecialtyWithDetails[]
}
