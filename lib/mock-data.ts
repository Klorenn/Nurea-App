/**
 * Datos mock para el profesional de prueba
 * Este profesional se usa para testing y desarrollo
 */

export const TEST_PROFESSIONAL_ID = "test-professional-001"

export const mockProfessional = {
  id: TEST_PROFESSIONAL_ID,
  name: "Dr. Elena Vargas",
  title: "Psicóloga Clínica",
  specialty: "Psicología Clínica",
  specialtyEn: "Clinical Psychology",
  yearsExperience: 12,
  location: "Santiago, Chile",
  rating: 4.9,
  reviewsCount: 124,
  price: 45000,
  consultationPrice: 45000,
  languages: ["Español", "Inglés"],
  bio: "Mi nombre es Elena y llevo más de 12 años acompañando a personas en sus procesos de crecimiento personal y bienestar emocional. Mi enfoque es cercano y empático, porque creo que cada persona es única y merece un espacio seguro para expresarse.",
  bioExtended: "Trabajo principalmente con adultos que enfrentan ansiedad, depresión o están pasando por momentos de cambio en sus vidas. No uso un lenguaje complicado ni términos médicos innecesarios - prefiero hablar contigo de forma clara y directa, como lo haría un amigo que realmente te escucha.",
  services: ["Terapia Individual", "Acompañamiento en Ansiedad", "Apoyo en Momentos Difíciles", "Crecimiento Personal"],
  consultationTypes: ["online", "in-person"],
  consultationType: "both" as const,
  availability: {
    monday: { available: true, hours: "09:00 - 18:00" },
    tuesday: { available: true, hours: "09:00 - 18:00" },
    wednesday: { available: true, hours: "09:00 - 18:00" },
    thursday: { available: true, hours: "09:00 - 18:00" },
    friday: { available: true, hours: "09:00 - 14:00" },
    saturday: { available: false, hours: null },
    sunday: { available: false, hours: null },
  },
  documents: [
    { id: "1", name: "Registro Profesional", type: "PDF", size: "245 KB" },
    { id: "2", name: "Certificado de Especialidad", type: "PDF", size: "1.2 MB" },
  ],
  professionalRegistration: {
    number: "PSI-12345",
    institution: "Colegio de Psicólogos de Chile",
    verified: true,
  },
  imageUrl: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop",
  verified: true,
  isOnline: true,
  availableToday: true,
  availableUntil: "7:00 PM",
  patientsServed: 342,
  reviews: [
    {
      id: 1,
      user: "Nicolas M.",
      rating: 5,
      date: "Hace 2 semanas",
      text: "Elena es excepcionalmente empática y profesional. Su acompañamiento ha sido transformador para mi salud mental.",
    },
    {
      id: 2,
      user: "Camila S.",
      rating: 5,
      date: "Hace 1 mes",
      text: "Excelente experiencia. Las sesiones online son muy convenientes y la plataforma funciona perfectamente.",
    },
  ],
}

/**
 * Formato para búsqueda (compatible con search/page.tsx)
 */
export const mockProfessionalForSearch = {
  id: TEST_PROFESSIONAL_ID,
  name: "Dr. Elena Vargas",
  specialty: "Psicóloga Clínica",
  specialtyEn: "Clinical Psychologist",
  location: "Online / Santiago",
  rating: 4.9,
  patientsServed: 342,
  price: 45000,
  languages: ["ES", "EN"],
  image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop",
  verified: true,
  isOnline: true,
  availableToday: true,
  availableUntil: "7:00 PM",
}

/**
 * Verifica si un ID corresponde al profesional de prueba
 */
export function isTestProfessional(id: string | null | undefined): boolean {
  return id === TEST_PROFESSIONAL_ID
}

/**
 * Verifica si los datos mock deben ser usados (solo en desarrollo)
 */
export function shouldUseMockData(): boolean {
  return process.env.NODE_ENV === 'development'
}

