import dotenv from "dotenv"
dotenv.config({ path: ".env.local" })

console.log(
  "Claves SUPABASE detectadas (seed-test-professional):",
  Object.keys(process.env).filter((k) => k.toUpperCase().includes("SUPABASE"))
)

/**
 * Script para seedear el profesional de prueba "Nurea-Doctor" en la base de datos
 * 
 * Ejecutar con: npx tsx scripts/seed-test-professional.ts
 * O desde el navegador: POST /api/admin/seed-test-professional
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY deben estar configurados')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

const TEST_PROFESSIONAL_ID = 'nurea-doctor-test'

async function seedTestProfessional() {
  try {
    console.log('🌱 Iniciando seeding del profesional de prueba...')

    // Datos del profesional de prueba
    const testProfessionalData = {
      id: TEST_PROFESSIONAL_ID,
      specialty: 'Médico General',
      bio: 'Profesional de prueba de NUREA para testing y demostración. Este perfil permite probar todas las funcionalidades de la plataforma.',
      bio_extended: 'Este es un perfil de prueba creado automáticamente por el sistema. Utilízalo para explorar las funcionalidades de NUREA.',
      consultation_type: 'both',
      consultation_price: 35000,
      online_price: 35000,
      in_person_price: 40000,
      video_platform: 'google-meet',
      clinic_address: 'Santiago, Chile',
      location: 'Santiago, Chile',
      years_experience: 5,
      verified: true,
      availability: {
        monday: { 
          online: { available: true, hours: '09:00 - 18:00' },
          'in-person': { available: true, hours: '09:00 - 18:00' }
        },
        tuesday: { 
          online: { available: true, hours: '09:00 - 18:00' },
          'in-person': { available: true, hours: '09:00 - 18:00' }
        },
        wednesday: { 
          online: { available: true, hours: '09:00 - 18:00' },
          'in-person': { available: true, hours: '09:00 - 18:00' }
        },
        thursday: { 
          online: { available: true, hours: '09:00 - 18:00' },
          'in-person': { available: true, hours: '09:00 - 18:00' }
        },
        friday: { 
          online: { available: true, hours: '09:00 - 14:00' },
          'in-person': { available: true, hours: '09:00 - 14:00' }
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
      services: ['Consulta General', 'Atención Preventiva', 'Seguimiento'],
      languages: ['Español', 'Inglés'],
      bank_account: '123456789',
      bank_name: 'Banco de Prueba',
      registration_number: 'TEST-001',
      registration_institution: 'Colegio Médico de Prueba',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    // Verificar si ya existe
    const { data: existing } = await supabase
      .from('professionals')
      .select('id')
      .eq('id', TEST_PROFESSIONAL_ID)
      .maybeSingle()

    let result
    if (existing) {
      console.log('📝 Actualizando profesional de prueba existente...')
      const { data, error } = await supabase
        .from('professionals')
        .update({
          ...testProfessionalData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', TEST_PROFESSIONAL_ID)
        .select()
        .single()

      if (error) throw error
      result = data
      console.log('✅ Profesional de prueba actualizado')
    } else {
      console.log('➕ Creando nuevo profesional de prueba...')
      const { data, error } = await supabase
        .from('professionals')
        .insert(testProfessionalData)
        .select()
        .single()

      if (error) throw error
      result = data
      console.log('✅ Profesional de prueba creado')
    }

    // Crear o actualizar perfil asociado
    const profileData = {
      id: TEST_PROFESSIONAL_ID,
      first_name: 'Nurea',
      last_name: 'Doctor',
      role: 'professional',
      avatar_url: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop&auto=format',
      email: 'nurea-doctor@nurea.app',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', TEST_PROFESSIONAL_ID)
      .maybeSingle()

    if (existingProfile) {
      console.log('📝 Actualizando perfil asociado...')
      await supabase
        .from('profiles')
        .update({
          ...profileData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', TEST_PROFESSIONAL_ID)
      console.log('✅ Perfil actualizado')
    } else {
      console.log('➕ Creando perfil asociado...')
      await supabase
        .from('profiles')
        .insert(profileData)
      console.log('✅ Perfil creado')
    }

    console.log('🎉 Seeding completado exitosamente!')
    console.log(`📋 ID del profesional: ${TEST_PROFESSIONAL_ID}`)
    console.log(`👤 Nombre: Dr. Nurea Doctor`)
    
    return result
  } catch (error) {
    console.error('❌ Error durante el seeding:', error)
    throw error
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  seedTestProfessional()
    .then(() => {
      console.log('✅ Script completado')
      process.exit(0)
    })
    .catch((error) => {
      console.error('❌ Error:', error)
      process.exit(1)
    })
}

export { seedTestProfessional }

