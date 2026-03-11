import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * Crea o actualiza el perfil (y fila en professionals si aplica) para el usuario ya autenticado.
 * Se usa después de signUp() en el cliente para no duplicar lógica del signup API.
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { firstName, lastName, role, dateOfBirth, specialty, registrationNumber } = body

    if (!firstName || !lastName || !role) {
      return NextResponse.json(
        { error: 'Missing required fields', message: 'Faltan nombre, apellido o tipo de cuenta.' },
        { status: 400 }
      )
    }

    if (!['patient', 'professional'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role', message: 'El rol debe ser patient o professional.' },
        { status: 400 }
      )
    }

    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .maybeSingle()

    const profilePayload: Record<string, unknown> = {
      id: user.id,
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      role,
      email_verified: false,
    }
    if (dateOfBirth && typeof dateOfBirth === 'string') {
      profilePayload.date_of_birth = dateOfBirth
    }

    if (!existingProfile) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert(profilePayload)

      if (profileError) {
        console.error('Profile creation error:', profileError)
        return NextResponse.json(
          { error: 'Failed to create profile', message: 'No se pudo crear el perfil.' },
          { status: 500 }
        )
      }
    } else if (dateOfBirth && typeof dateOfBirth === 'string') {
      await supabase
        .from('profiles')
        .update({ date_of_birth: dateOfBirth })
        .eq('id', user.id)
    }

    if (role === 'professional') {
      const { data: existingProfessional } = await supabase
        .from('professionals')
        .select('id')
        .eq('id', user.id)
        .maybeSingle()

      const profSpecialty = (specialty && typeof specialty === 'string') ? specialty.trim() : ''
      const profRegistrationNumber = (registrationNumber && typeof registrationNumber === 'string') ? registrationNumber.trim() : ''

      if (!existingProfessional) {
        const { error: profError } = await supabase.from('professionals').insert({
          id: user.id,
          specialty: profSpecialty,
          bio: '',
          consultation_type: 'both',
          consultation_price: 0,
          online_price: 0,
          in_person_price: 0,
          availability: {},
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          ...(profRegistrationNumber && { registration_number: profRegistrationNumber }),
        })
        if (profError) {
          console.error('Professional creation error:', profError)
        }
      } else if (profSpecialty || profRegistrationNumber) {
        const updatePayload: Record<string, string> = {}
        if (profSpecialty) updatePayload.specialty = profSpecialty
        if (profRegistrationNumber) updatePayload.registration_number = profRegistrationNumber
        if (Object.keys(updatePayload).length) {
          await supabase.from('professionals').update(updatePayload).eq('id', user.id)
        }
      }
    }

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('create-profile error:', e)
    return NextResponse.json(
      { error: 'Internal server error', message: 'Error al crear el perfil.' },
      { status: 500 }
    )
  }
}
