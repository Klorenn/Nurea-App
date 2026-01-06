import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const { email, password, firstName, lastName, role } = await request.json()

  if (!email || !password || !firstName || !lastName || !role) {
    return NextResponse.json(
      { 
        error: 'Missing required fields',
        message: 'Por favor, completa todos los campos requeridos, incluyendo el tipo de cuenta.'
      },
      { status: 400 }
    )
  }

  // Validar que el rol sea válido
  if (!['patient', 'professional'].includes(role)) {
    return NextResponse.json(
      { 
        error: 'Invalid role',
        message: 'El rol debe ser "patient" o "professional".'
      },
      { status: 400 }
    )
  }

  // Check if Supabase is configured
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.json(
      { error: 'Supabase not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local' },
      { status: 500 }
    )
  }

  const supabase = await createClient()

  // Sign up the user
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        first_name: firstName,
        last_name: lastName,
        role: role, // 'patient' or 'professional'
      },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/verify-email`,
    },
  })

  if (error) {
    const { getHumanErrorMessage } = await import('@/lib/auth/utils')
    const humanMessage = getHumanErrorMessage(error.message, 'es')
    return NextResponse.json(
      { 
        error: error.message,
        message: humanMessage
      },
      { status: 400 }
    )
  }

  if (!data.user) {
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
  }

  // Create profile manually (backup in case trigger fails)
  // Wait a bit for the trigger to potentially run first
  await new Promise(resolve => setTimeout(resolve, 500))

  // Check if profile already exists (from trigger)
  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', data.user.id)
    .maybeSingle()

  // If profile doesn't exist, create it manually
  if (!existingProfile) {
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: data.user.id,
        first_name: firstName,
        last_name: lastName,
        role: role,
        email_verified: false,
      })

    if (profileError) {
      console.error('Profile creation error:', profileError)
      // Don't fail the signup if profile creation fails, but log it
      // The trigger might still create it later
    }
  }

  // If user is a professional, create entry in professionals table
  if (role === 'professional') {
    // Wait a bit more to ensure profile is created
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Check if professional record already exists using maybeSingle()
    const { data: existingProfessional, error: checkError } = await supabase
      .from('professionals')
      .select('id')
      .eq('id', data.user.id)
      .maybeSingle()

    // If check failed or record doesn't exist, try to create it
    if (checkError || !existingProfessional) {
      try {
        const { error: professionalError } = await supabase
          .from('professionals')
          .insert({
            id: data.user.id,
            specialty: '',
            bio: '',
            consultation_type: 'both',
            consultation_price: 0,
            online_price: 0,
            in_person_price: 0,
            availability: {},
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })

        if (professionalError) {
          console.error('Professional record creation error:', professionalError)
          // Log detailed error for debugging
          if (professionalError.code) {
            console.error('Error code:', professionalError.code)
            console.error('Error details:', professionalError.details)
            console.error('Error hint:', professionalError.hint)
          }
          // Don't fail the signup - the onboarding API will create it if needed
        } else {
          console.log('Professional record created successfully for user:', data.user.id)
        }
      } catch (insertError) {
        console.error('Exception during professional record creation:', insertError)
        // Don't fail the signup - continue anyway
      }
    }
  }

  return NextResponse.json({ 
    user: data.user,
    message: 'Please check your email to verify your account'
  })
}

