import dotenv from "dotenv"
dotenv.config({ path: ".env.local" })

console.log(
  "Claves SUPABASE detectadas (seed-realistic-data):",
  Object.keys(process.env).filter((k) => k.toUpperCase().includes("SUPABASE"))
)

/**
 * Script de seed con datos realistas para Supabase
 * 
 * Incluye:
 * - Profesionales con horarios configurables
 * - Reviews variadas y realistas
 * - Citas pasadas y futuras
 * - Idiomas y documentos públicos
 * 
 * Ejecutar con: npx tsx scripts/seed-realistic-data.ts
 * 
 * Requiere variables de entorno:
 * - NEXT_PUBLIC_SUPABASE_URL
 * - SUPABASE_SERVICE_ROLE_KEY (o NEXT_PUBLIC_SUPABASE_ANON_KEY como fallback)
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY deben estar configurados')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Datos de profesionales realistas
const professionalsData = [
  {
    profile: {
      first_name: 'María',
      last_name: 'González',
      email: 'maria.gonzalez@nurea.dev',
      avatar_url: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop&auto=format',
    },
    professional: {
      specialty: 'Psicólogo',
      bio: 'Psicóloga clínica con especialización en terapia cognitivo-conductual y manejo de ansiedad. Más de 8 años de experiencia ayudando a pacientes a superar desafíos emocionales y mejorar su bienestar mental.',
      bio_extended: 'Licenciada en Psicología de la Universidad de Chile, con Magíster en Psicología Clínica. Certificada en Terapia Cognitivo-Conductual (TCC) y Mindfulness. Experiencia trabajando con adultos y adolescentes en temas de ansiedad, depresión, estrés y relaciones interpersonales. Enfoque empático y orientado a resultados.',
      consultation_type: 'both',
      consultation_price: 45000,
      online_price: 40000,
      in_person_price: 50000,
      location: 'Santiago, Chile',
      years_experience: 8,
      verified: true,
      languages: ['ES', 'EN'],
      availability: {
        monday: { 
          online: { available: true, hours: '09:00 - 18:00' },
          'in-person': { available: true, hours: '10:00 - 17:00' }
        },
        tuesday: { 
          online: { available: true, hours: '09:00 - 18:00' },
          'in-person': { available: true, hours: '10:00 - 17:00' }
        },
        wednesday: { 
          online: { available: true, hours: '09:00 - 18:00' },
          'in-person': { available: false, hours: '' }
        },
        thursday: { 
          online: { available: true, hours: '09:00 - 18:00' },
          'in-person': { available: true, hours: '10:00 - 17:00' }
        },
        friday: { 
          online: { available: true, hours: '09:00 - 14:00' },
          'in-person': { available: true, hours: '10:00 - 14:00' }
        },
        saturday: { 
          online: { available: false, hours: '' },
          'in-person': { available: false, hours: '' }
        },
        sunday: { 
          online: { available: false, hours: '' },
          'in-person': { available: false, hours: '' }
        },
      },
      services: ['Terapia Individual', 'Terapia de Pareja', 'Manejo de Ansiedad', 'TCC', 'Mindfulness'],
      bank_account: '1234567890',
      bank_name: 'Banco de Chile',
      registration_number: 'PSI-12345',
      registration_institution: 'Colegio de Psicólogos de Chile',
    }
  },
  {
    profile: {
      first_name: 'Carlos',
      last_name: 'Rodríguez',
      email: 'carlos.rodriguez@nurea.dev',
      avatar_url: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop&auto=format',
    },
    professional: {
      specialty: 'Nutricionista',
      bio: 'Nutricionista clínico especializado en control de peso, nutrición deportiva y manejo de enfermedades crónicas. Enfoque en alimentación saludable y sostenible.',
      bio_extended: 'Nutricionista Universidad de Valparaíso, con Diplomado en Nutrición Deportiva y Certificación en Manejo de Diabetes. Experiencia en consulta privada y atención en clínicas. Ayudo a mis pacientes a alcanzar sus objetivos de salud a través de planes nutricionales personalizados y realistas.',
      consultation_type: 'both',
      consultation_price: 35000,
      online_price: 30000,
      in_person_price: 40000,
      location: 'Valparaíso, Chile',
      years_experience: 6,
      verified: true,
      languages: ['ES'],
      availability: {
        monday: { 
          online: { available: true, hours: '10:00 - 19:00' },
          'in-person': { available: true, hours: '10:00 - 19:00' }
        },
        tuesday: { 
          online: { available: true, hours: '10:00 - 19:00' },
          'in-person': { available: false, hours: '' }
        },
        wednesday: { 
          online: { available: true, hours: '10:00 - 19:00' },
          'in-person': { available: true, hours: '10:00 - 19:00' }
        },
        thursday: { 
          online: { available: true, hours: '10:00 - 19:00' },
          'in-person': { available: false, hours: '' }
        },
        friday: { 
          online: { available: true, hours: '10:00 - 17:00' },
          'in-person': { available: true, hours: '10:00 - 17:00' }
        },
        saturday: { 
          online: { available: true, hours: '09:00 - 13:00' },
          'in-person': { available: false, hours: '' }
        },
        sunday: { 
          online: { available: false, hours: '' },
          'in-person': { available: false, hours: '' }
        },
      },
      services: ['Control de Peso', 'Nutrición Deportiva', 'Nutrición Clínica', 'Planes Personalizados'],
      bank_account: '0987654321',
      bank_name: 'Banco Estado',
      registration_number: 'NUT-67890',
      registration_institution: 'Colegio de Nutricionistas de Chile',
    }
  },
  {
    profile: {
      first_name: 'Ana',
      last_name: 'Martínez',
      email: 'ana.martinez@nurea.dev',
      avatar_url: 'https://images.unsplash.com/photo-1594824694479-07ae59e0e02b?w=400&h=400&fit=crop&auto=format',
    },
    professional: {
      specialty: 'Kinesiólogo',
      bio: 'Kinesióloga especializada en rehabilitación deportiva y terapia física. Certificada en técnicas de punción seca y terapia manual avanzada.',
      bio_extended: 'Kinesióloga Universidad de Concepción, con especialización en Rehabilitación Deportiva. Certificada en Punción Seca, Terapia Manual Ortopédica y Drenaje Linfático. Experiencia trabajando con deportistas de élite y pacientes con lesiones musculoesqueléticas. Enfoque integral y personalizado en cada tratamiento.',
      consultation_type: 'in-person',
      consultation_price: 40000,
      online_price: 0,
      in_person_price: 40000,
      location: 'Concepción, Chile',
      years_experience: 7,
      verified: true,
      languages: ['ES'],
      availability: {
        monday: { 
          online: { available: false, hours: '' },
          'in-person': { available: true, hours: '08:00 - 20:00' }
        },
        tuesday: { 
          online: { available: false, hours: '' },
          'in-person': { available: true, hours: '08:00 - 20:00' }
        },
        wednesday: { 
          online: { available: false, hours: '' },
          'in-person': { available: true, hours: '08:00 - 20:00' }
        },
        thursday: { 
          online: { available: false, hours: '' },
          'in-person': { available: true, hours: '08:00 - 20:00' }
        },
        friday: { 
          online: { available: false, hours: '' },
          'in-person': { available: true, hours: '08:00 - 18:00' }
        },
        saturday: { 
          online: { available: false, hours: '' },
          'in-person': { available: true, hours: '09:00 - 14:00' }
        },
        sunday: { 
          online: { available: false, hours: '' },
          'in-person': { available: false, hours: '' }
        },
      },
      services: ['Rehabilitación Deportiva', 'Terapia Manual', 'Punción Seca', 'Kinesiotaping', 'Ejercicio Terapéutico'],
      bank_account: '1122334455',
      bank_name: 'Scotiabank',
      registration_number: 'KIN-11111',
      registration_institution: 'Colegio de Kinesiólogos de Chile',
    }
  },
  {
    profile: {
      first_name: 'Roberto',
      last_name: 'Silva',
      email: 'roberto.silva@nurea.dev',
      avatar_url: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&h=400&fit=crop&auto=format',
    },
    professional: {
      specialty: 'Médico general',
      bio: 'Médico general con amplia experiencia en atención primaria y medicina familiar. Enfoque preventivo y atención integral del paciente.',
      bio_extended: 'Médico Cirujano Universidad de Chile, con especialización en Medicina Familiar. Más de 12 años de experiencia en atención primaria y consulta privada. Experto en manejo de patologías comunes, medicina preventiva y seguimiento de enfermedades crónicas. Enfoque humanista y cercano con los pacientes.',
      consultation_type: 'both',
      consultation_price: 50000,
      online_price: 45000,
      in_person_price: 55000,
      location: 'Santiago, Chile',
      years_experience: 12,
      verified: true,
      languages: ['ES', 'EN', 'PT'],
      availability: {
        monday: { 
          online: { available: true, hours: '08:00 - 20:00' },
          'in-person': { available: true, hours: '09:00 - 19:00' }
        },
        tuesday: { 
          online: { available: true, hours: '08:00 - 20:00' },
          'in-person': { available: true, hours: '09:00 - 19:00' }
        },
        wednesday: { 
          online: { available: true, hours: '08:00 - 20:00' },
          'in-person': { available: true, hours: '09:00 - 19:00' }
        },
        thursday: { 
          online: { available: true, hours: '08:00 - 20:00' },
          'in-person': { available: true, hours: '09:00 - 19:00' }
        },
        friday: { 
          online: { available: true, hours: '08:00 - 18:00' },
          'in-person': { available: true, hours: '09:00 - 17:00' }
        },
        saturday: { 
          online: { available: true, hours: '09:00 - 13:00' },
          'in-person': { available: false, hours: '' }
        },
        sunday: { 
          online: { available: false, hours: '' },
          'in-person': { available: false, hours: '' }
        },
      },
      services: ['Atención Primaria', 'Medicina Familiar', 'Medicina Preventiva', 'Manejo de Enfermedades Crónicas'],
      bank_account: '5566778899',
      bank_name: 'Banco Santander',
      registration_number: 'MED-22222',
      registration_institution: 'Colegio Médico de Chile',
    }
  }
]

// Datos de pacientes de prueba
const testPatients = [
  {
    profile: {
      first_name: 'Juan',
      last_name: 'Pérez',
      email: 'juan.perez@test.nurea.dev',
      avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&auto=format',
    }
  },
  {
    profile: {
      first_name: 'Laura',
      last_name: 'Fernández',
      email: 'laura.fernandez@test.nurea.dev',
      avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&auto=format',
    }
  },
  {
    profile: {
      first_name: 'Diego',
      last_name: 'Morales',
      email: 'diego.morales@test.nurea.dev',
      avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&auto=format',
    }
  }
]

async function seedProfessionals() {
  console.log('🌱 Sembrando profesionales...')
  
  const professionalIds: string[] = []
  
  for (const { profile, professional } of professionalsData) {
    try {
      // Generar UUID para el profesional
      const professionalId = crypto.randomUUID()
      professionalIds.push(professionalId)
      
      // Crear perfil
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: professionalId,
          first_name: profile.first_name,
          last_name: profile.last_name,
          avatar_url: profile.avatar_url,
          role: 'professional',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'id'
        })

      if (profileError) {
        console.error(`❌ Error creando perfil para ${profile.email}:`, profileError)
        continue
      }

      // Crear profesional
      const { error: profError } = await supabase
        .from('professionals')
        .upsert({
          id: professionalId,
          ...professional,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'id'
        })

      if (profError) {
        console.error(`❌ Error creando profesional ${profile.first_name} ${profile.last_name}:`, profError)
        continue
      }

      console.log(`✅ Profesional creado: ${profile.first_name} ${profile.last_name} (${professional.specialty})`)
    } catch (error) {
      console.error(`❌ Error procesando profesional ${profile.first_name} ${profile.last_name}:`, error)
    }
  }

  return professionalIds
}

async function seedPatients() {
  console.log('🌱 Sembrando pacientes de prueba...')
  
  const patientIds: string[] = []
  
  for (const { profile } of testPatients) {
    try {
      const patientId = crypto.randomUUID()
      patientIds.push(patientId)
      
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: patientId,
          first_name: profile.first_name,
          last_name: profile.last_name,
          avatar_url: profile.avatar_url,
          role: 'patient',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'id'
        })

      if (profileError) {
        console.error(`❌ Error creando perfil paciente ${profile.email}:`, profileError)
        continue
      }

      console.log(`✅ Paciente creado: ${profile.first_name} ${profile.last_name}`)
    } catch (error) {
      console.error(`❌ Error procesando paciente ${profile.first_name} ${profile.last_name}:`, error)
    }
  }

  return patientIds
}

async function seedAppointments(professionalIds: string[], patientIds: string[]) {
  console.log('🌱 Sembrando citas (pasadas y futuras)...')
  
  if (professionalIds.length === 0 || patientIds.length === 0) {
    console.warn('⚠️ No hay profesionales o pacientes para crear citas')
    return []
  }

  const now = new Date()
  const appointments = []

  // Citas pasadas (completadas)
  for (let i = 0; i < 10; i++) {
    const daysAgo = Math.floor(Math.random() * 30) + 1 // 1-30 días atrás
    const appointmentDate = new Date(now)
    appointmentDate.setDate(appointmentDate.getDate() - daysAgo)
    
    const hours = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00']
    const appointmentTime = hours[Math.floor(Math.random() * hours.length)]
    
    const professionalId = professionalIds[Math.floor(Math.random() * professionalIds.length)]
    const patientId = patientIds[Math.floor(Math.random() * patientIds.length)]
    const type = Math.random() > 0.5 ? 'online' : 'in-person'
    
    const { data: professional } = await supabase
      .from('professionals')
      .select('consultation_price, online_price, in_person_price')
      .eq('id', professionalId)
      .single()
    
    const price = type === 'online' 
      ? (professional?.online_price || professional?.consultation_price || 35000)
      : (professional?.in_person_price || professional?.consultation_price || 40000)
    
    appointments.push({
      professional_id: professionalId,
      patient_id: patientId,
      appointment_date: appointmentDate.toISOString().split('T')[0],
      appointment_time: appointmentTime,
      duration_minutes: 60,
      type: type,
      status: 'completed',
      price: price,
      payment_status: 'paid',
      created_at: new Date(appointmentDate.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: appointmentDate.toISOString(),
    })
  }

  // Citas futuras (pending y confirmed)
  for (let i = 0; i < 8; i++) {
    const daysAhead = Math.floor(Math.random() * 30) + 1 // 1-30 días adelante
    const appointmentDate = new Date(now)
    appointmentDate.setDate(appointmentDate.getDate() + daysAhead)
    
    const hours = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00']
    const appointmentTime = hours[Math.floor(Math.random() * hours.length)]
    
    const professionalId = professionalIds[Math.floor(Math.random() * professionalIds.length)]
    const patientId = patientIds[Math.floor(Math.random() * patientIds.length)]
    const type = Math.random() > 0.5 ? 'online' : 'in-person'
    const status = Math.random() > 0.5 ? 'pending' : 'confirmed'
    
    const { data: professional } = await supabase
      .from('professionals')
      .select('consultation_price, online_price, in_person_price')
      .eq('id', professionalId)
      .single()
    
    const price = type === 'online' 
      ? (professional?.online_price || professional?.consultation_price || 35000)
      : (professional?.in_person_price || professional?.consultation_price || 40000)
    
    appointments.push({
      professional_id: professionalId,
      patient_id: patientId,
      appointment_date: appointmentDate.toISOString().split('T')[0],
      appointment_time: appointmentTime,
      duration_minutes: 60,
      type: type,
      status: status,
      price: price,
      payment_status: status === 'confirmed' ? 'paid' : 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
  }

  // Insertar citas
  const { data: insertedAppointments, error } = await supabase
    .from('appointments')
    .insert(appointments)
    .select()

  if (error) {
    console.error('❌ Error creando citas:', error)
    return []
  }

  console.log(`✅ ${insertedAppointments?.length || 0} citas creadas`)
  return insertedAppointments || []
}

async function seedReviews(appointments: any[], professionalIds: string[]) {
  console.log('🌱 Sembrando reviews...')
  
  if (!appointments || appointments.length === 0) {
    console.warn('⚠️ No hay citas completadas para crear reviews')
    return
  }

  // Solo reviews de citas completadas
  const completedAppointments = appointments.filter(apt => apt.status === 'completed')
  
  if (completedAppointments.length === 0) {
    console.warn('⚠️ No hay citas completadas para crear reviews')
    return
  }

  const reviewComments = [
    'Excelente profesional, muy atento y empático. Recomendado.',
    'Muy buena experiencia, la consulta fue muy completa y resolutiva.',
    'Profesional de confianza, explica todo claramente y tiene un trato excelente.',
    'Buen servicio, aunque la espera fue un poco larga.',
    'Recomendado, muy profesional y cercano.',
    'Excelente atención, muy satisfecho con el servicio.',
    'Muy buen profesional, me ayudó mucho con mi problema.',
    'Atención de calidad, definitivamente volveré.',
    'Buen servicio, pero podría mejorar en algunos aspectos.',
    'Muy recomendado, trato profesional y efectivo.',
    'Excelente experiencia, muy contento con el servicio recibido.',
    'Profesional competente, resolvió mis dudas completamente.',
    'Muy buena atención, recomiendo completamente.',
    'Buen servicio, profesional y amable.',
    'Excelente profesional, muy satisfecho con la consulta.',
  ]

  const reviews = completedAppointments
    .slice(0, Math.min(completedAppointments.length, 10)) // Máximo 10 reviews
    .map(apt => {
      const rating = Math.floor(Math.random() * 3) + 3 // 3-5 estrellas (mayoría positivas)
      const comment = Math.random() > 0.3 
        ? reviewComments[Math.floor(Math.random() * reviewComments.length)]
        : null // 30% sin comentario

      return {
        appointment_id: apt.id,
        professional_id: apt.professional_id,
        patient_id: apt.patient_id,
        rating: rating,
        comment: comment,
        created_at: new Date(apt.appointment_date + 'T' + apt.appointment_time).toISOString(),
      }
    })

  const { error } = await supabase
    .from('reviews')
    .insert(reviews)

  if (error) {
    console.error('❌ Error creando reviews:', error)
    return
  }

  console.log(`✅ ${reviews.length} reviews creadas`)
}

async function seedDocuments(professionalIds: string[]) {
  console.log('🌱 Sembrando documentos públicos...')
  
  const documentTypes = ['PDF', 'DOC', 'PDF']
  const documentNames = [
    'Certificado de Colegiatura',
    'Diploma de Especialización',
    'Certificado de Cursos',
    'Registro Profesional',
    'Carta de Recomendación',
  ]

  const documents = []

  for (const professionalId of professionalIds) {
    // 1-3 documentos por profesional
    const numDocs = Math.floor(Math.random() * 3) + 1
    
    for (let i = 0; i < numDocs; i++) {
      documents.push({
        professional_id: professionalId,
        name: documentNames[Math.floor(Math.random() * documentNames.length)],
        file_type: documentTypes[Math.floor(Math.random() * documentTypes.length)],
        file_url: `https://example.com/documents/${professionalId}/doc-${i + 1}.pdf`,
        category: 'certification',
        is_public: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
    }
  }

  if (documents.length > 0) {
    const { error } = await supabase
      .from('documents')
      .insert(documents)

    if (error) {
      console.error('❌ Error creando documentos:', error)
      return
    }

    console.log(`✅ ${documents.length} documentos públicos creados`)
  }
}

async function main() {
  try {
    console.log('🚀 Iniciando seeding de datos realistas...\n')

    // 1. Sembrar profesionales
    const professionalIds = await seedProfessionals()
    console.log(`\n✅ ${professionalIds.length} profesionales sembrados\n`)

    // 2. Sembrar pacientes de prueba
    const patientIds = await seedPatients()
    console.log(`\n✅ ${patientIds.length} pacientes sembrados\n`)

    // 3. Sembrar citas
    const appointments = await seedAppointments(professionalIds, patientIds)
    console.log(`\n✅ Citas sembradas\n`)

    // 4. Sembrar reviews
    await seedReviews(appointments, professionalIds)
    console.log(`\n✅ Reviews sembradas\n`)

    // 5. Sembrar documentos
    await seedDocuments(professionalIds)
    console.log(`\n✅ Documentos sembrados\n`)

    console.log('🎉 Seeding completado exitosamente!')
    console.log(`\n📊 Resumen:`)
    console.log(`  - ${professionalIds.length} profesionales`)
    console.log(`  - ${patientIds.length} pacientes`)
    console.log(`  - ${appointments?.length || 0} citas`)
    console.log(`  - Documentos públicos creados`)
    console.log(`  - Reviews variadas creadas`)
    
  } catch (error) {
    console.error('❌ Error durante el seeding:', error)
    throw error
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  main()
    .then(() => {
      console.log('\n✅ Script completado')
      process.exit(0)
    })
    .catch((error) => {
      console.error('\n❌ Error:', error)
      process.exit(1)
    })
}

export { main as seedRealisticData }
