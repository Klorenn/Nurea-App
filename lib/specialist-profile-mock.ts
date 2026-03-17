/**
 * Mock data for specialist profile page.
 * Mirrors the shape expected from API; use for development or fallback.
 */

import type { Specialist } from './specialist-profile-types'

export const mockSpecialist: Specialist = {
  id: 'mock-specialist-1',
  name: 'Dra. María Fernández',
  specialty: 'Psicóloga Clínica',
  tagline: 'Te acompaño a recuperar el bienestar emocional con un enfoque cálido y basado en evidencia.',
  imageUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop',
  location: 'Santiago, Chile',
  verified: true,
  rating: 4.9,
  reviewsCount: 127,
  experienceYears: 8,
  patientsCount: 340,
  certification: 'Certificado en Terapia Cognitivo Conductual',
  onlineAvailable: true,
  bio: 'Soy psicóloga clínica con más de 8 años de experiencia acompañando a personas con ansiedad, depresión y estrés. Creo en una terapia cercana, sin juicios, donde tú eres el protagonista del cambio. Mi enfoque combina evidencia científica con un trato humano que facilita la confianza y el progreso.',
  bioExtended: 'Trabajé en el sistema público de salud antes de dedicarme a la práctica privada. He realizado formaciones en terapia cognitivo-conductual, mindfulness y terapia narrativa. Me apasiona ayudar a las personas a entender sus patrones y construir herramientas concretas para el día a día.',
  education: [
    { year: '2016', institution: 'Universidad de Chile', degree: 'Magíster en Psicología Clínica' },
    { year: '2014', institution: 'Universidad de Chile', degree: 'Licenciatura en Psicología' },
  ],
  certifications: [
    'Terapia Cognitivo Conductual (TCC)',
    'Mindfulness basado en reducción del estrés (MBSR)',
    'Diploma en Psicología de la Salud',
  ],
  approaches: ['TCC', 'Mindfulness', 'Terapia narrativa', 'Activación conductual'],
  services: [
    {
      id: 's1',
      name: 'Terapia ansiedad',
      description: 'Sesiones enfocadas en manejo de ansiedad y preocupación.',
      price: 23000,
      currency: 'CLP',
      durationMinutes: 50,
    },
    {
      id: 's2',
      name: 'Terapia depresión',
      description: 'Acompañamiento para recuperar el ánimo y la motivación.',
      price: 23000,
      currency: 'CLP',
      durationMinutes: 50,
    },
    {
      id: 's3',
      name: 'Consulta inicial',
      description: 'Evaluación y plan de trabajo personalizado.',
      price: 28000,
      currency: 'CLP',
      durationMinutes: 60,
    },
  ],
  conditions: ['Ansiedad', 'Depresión', 'Estrés', 'Autoestima', 'Duelo', 'Crisis de pánico', 'Insomnio'],
  reviews: [
    {
      id: 'r1',
      authorName: 'Carmen R.',
      authorInitials: 'CR',
      rating: 5,
      comment: 'María me ayudó muchísimo. Me sentí escuchada desde la primera sesión. Totalmente recomendable.',
      createdAt: '2024-02-10',
      verified: true,
    },
    {
      id: 'r2',
      authorName: 'Andrés M.',
      authorInitials: 'AM',
      rating: 5,
      comment: 'Profesional, cercana y con herramientas concretas. Las sesiones online funcionan muy bien.',
      createdAt: '2024-01-28',
      verified: true,
    },
    {
      id: 'r3',
      authorName: 'Laura S.',
      authorInitials: 'LS',
      rating: 4,
      comment: 'Muy buena experiencia. Horarios flexibles y ambiente de confianza.',
      createdAt: '2024-01-15',
      verified: false,
    },
  ],
  faqs: [
    {
      question: '¿Cómo sé si necesito terapia?',
      answer: 'Si sientes que el malestar emocional te está afectando en el día a día (trabajo, relaciones, sueño o ánimo), es un buen momento para consultar. No hace falta estar en crisis; la terapia también sirve para prevenir y para conocerte mejor.',
    },
    {
      question: '¿Cómo es la primera sesión?',
      answer: 'En la primera sesión conversamos sobre lo que te trae, tu historia relevante y tus objetivos. Yo explico cómo trabajo y acordamos un plan. Suele durar entre 50-60 minutos.',
    },
    {
      question: '¿Atiendes online?',
      answer: 'Sí. Atiendo por videollamada de forma segura y confidencial. Solo necesitas un lugar tranquilo y buena conexión a internet.',
    },
  ],
  consultationTypes: ['online', 'in-person'],
  consultationPrice: 23000,
  slotDuration: 50,
  insuranceOptions: ['Fonasa', 'Isapre', 'Particular'],
}
