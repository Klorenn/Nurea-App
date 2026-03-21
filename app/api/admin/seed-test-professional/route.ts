import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * POST /api/admin/seed-test-professional
 * Crea o actualiza el profesional de prueba "Nurea-Doctor" en la base de datos
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    // Verificar autenticación y rol admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 })

    const { data: callerProfile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (callerProfile?.role !== 'admin') {
      return NextResponse.json({ error: 'forbidden', message: 'Solo los administradores pueden ejecutar el seed.' }, { status: 403 })
    }

    // ID fijo para el profesional de prueba
    const TEST_PROFESSIONAL_ID = 'nurea-doctor-test'
    
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
      // Actualizar si existe
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
    } else {
      // Crear si no existe
      const { data, error } = await supabase
        .from('professionals')
        .insert(testProfessionalData)
        .select()
        .single()

      if (error) throw error
      result = data
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
      await supabase
        .from('profiles')
        .update({
          ...profileData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', TEST_PROFESSIONAL_ID)
    } else {
      await supabase
        .from('profiles')
        .insert(profileData)
    }

    return NextResponse.json({
      success: true,
      message: existing ? 'Profesional de prueba actualizado' : 'Profesional de prueba creado',
      professional: result
    })
  } catch (error) {
    console.error('Error seeding test professional:', error)
    return NextResponse.json(
      { 
        error: 'seed_failed',
        message: error instanceof Error ? error.message : 'Error al crear profesional de prueba'
      },
      { status: 500 }
    )
  }
}

