import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      avatarUrl,
      phone,
      gender,
      dateOfBirth,
      nationalId,
      healthInsurance,
      allergies,
      chronicDiseases,
      currentMedications,
      patientGoal,
    } = body

    // Verify role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'patient') {
      return NextResponse.json(
        { error: 'Forbidden', message: 'Solo los pacientes pueden usar este endpoint.' },
        { status: 403 }
      )
    }

    // Validate date of birth
    if (!dateOfBirth) {
      return NextResponse.json(
        { error: 'Validation', message: 'La fecha de nacimiento es requerida.' },
        { status: 400 }
      )
    }

    const dob = new Date(`${dateOfBirth}T00:00:00`)
    if (isNaN(dob.getTime())) {
      return NextResponse.json(
        { error: 'Validation', message: 'Fecha de nacimiento inválida.' },
        { status: 400 }
      )
    }

    const today = new Date()
    let age = today.getFullYear() - dob.getFullYear()
    const m = today.getMonth() - dob.getMonth()
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--
    if (age < 5) {
      return NextResponse.json(
        { error: 'Validation', message: 'Debes tener más de 5 años.' },
        { status: 400 }
      )
    }

    // Validate RUT format if provided
    if (nationalId && !/^\d{7,8}-[\dkK]$/.test(String(nationalId).trim())) {
      return NextResponse.json(
        { error: 'Validation', message: 'Formato de RUT inválido. Ej: 12345678-9' },
        { status: 400 }
      )
    }

    const updatePayload: Record<string, unknown> = {
      onboarding_completed: true,
      is_onboarded: true,
      updated_at: new Date().toISOString(),
    }

    if (avatarUrl) updatePayload.avatar_url = avatarUrl
    if (phone) updatePayload.phone = String(phone).trim()
    if (gender && ['M', 'F', 'other'].includes(gender)) updatePayload.gender = gender
    if (dateOfBirth) updatePayload.date_of_birth = dateOfBirth
    if (nationalId) updatePayload.national_id = String(nationalId).trim()
    if (healthInsurance) updatePayload.health_insurance = healthInsurance
    if (allergies != null) updatePayload.allergies = allergies || null
    if (chronicDiseases != null) updatePayload.chronic_diseases = chronicDiseases || null
    if (currentMedications != null) updatePayload.current_medications = currentMedications || null
    if (patientGoal) updatePayload.patient_goal = patientGoal

    const { error: updateError } = await supabase
      .from('profiles')
      .update(updatePayload)
      .eq('id', user.id)

    if (updateError) {
      console.error('[onboarding/patient] update error:', updateError)
      return NextResponse.json(
        { error: 'DB error', message: 'Error al guardar los datos. Intenta nuevamente.' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[onboarding/patient] unexpected error:', err)
    return NextResponse.json(
      { error: 'Internal server error', message: 'Error inesperado.' },
      { status: 500 }
    )
  }
}
