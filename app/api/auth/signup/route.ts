import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const { email, password, firstName, lastName, role } = await request.json()

  if (!email || !password || !firstName || !lastName || !role) {
    return NextResponse.json(
      {
        error: "Missing required fields",
        message: "Por favor, completa todos los campos requeridos, incluyendo el tipo de cuenta.",
      },
      { status: 400 }
    )
  }

  // Validar que el rol sea válido
  if (!["patient", "professional"].includes(role)) {
    return NextResponse.json(
      {
        error: "Invalid role",
        message: 'El rol debe ser "patient" o "professional".',
      },
      { status: 400 }
    )
  }

  // Check if Supabase is configured
  const anonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !anonKey) {
    return NextResponse.json(
      {
        error:
          "Supabase not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY (or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY) in .env.local",
      },
      { status: 500 }
    )
  }

  // Use cookies() for server client
  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    anonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
          })
        },
      },
    }
  )

  // Sign up the user
  const isDev =
    process.env.NODE_ENV === "development" || process.env.VERCEL === undefined
  const siteUrl = isDev
    ? "http://localhost:3000"
    : process.env.NEXT_PUBLIC_SITE_URL ||
      process.env.NEXT_PUBLIC_APP_URL ||
      "https://nurea.app"

  console.log("[signup] siteUrl:", siteUrl)

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        first_name: firstName,
        last_name: lastName,
        role: role,
      },
      emailRedirectTo: `${siteUrl}/auth/callback`,
    },
  })

  console.log("[signup] result:", { error, userId: data.user?.id })

  if (error) {
    return NextResponse.json(
      {
        error: error.message,
        message: error.message || 'Error al crear la cuenta'
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

  // Create welcome notification
  try {
    const { error: notifError } = await supabase.from('notifications').insert({
      user_id: data.user.id,
      type: 'welcome',
      title: role === 'professional' 
        ? '¡Bienvenido a NUREA!' 
        : '¡Bienvenido a NUREA!',
      message: role === 'professional'
        ? `¡Hola ${firstName}! Gracias por unirte a NUREA. Completa tu perfil profesional para que los pacientes puedan encontrarte.`
        : `¡Hola ${firstName}! Gracias por ser parte de NUREA. Ahora puedes buscar profesionales de salud y agendar tus citas.`,
      link: role === 'professional' ? '/professional/onboarding' : '/explore',
    })
    
    if (notifError) {
      console.error('Welcome notification error:', notifError)
    }
  } catch (notifErr) {
    console.error('Error creating welcome notification:', notifErr)
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

  const dashboardPath = role === 'professional' ? '/professional/dashboard' : '/dashboard'
  const dashboardLink = `${siteUrl}${dashboardPath}`

  if (process.env.RESEND_API_KEY) {
    try {
      const { sendWelcome } = await import('@/lib/email-service')
      await sendWelcome({
        to: data.user.email!,
        userName: firstName,
        role: role as 'patient' | 'professional',
        dashboardLink,
      })
    } catch (welcomeErr) {
      console.error('[signup] Welcome email error:', welcomeErr)
    }
  }

  return NextResponse.json({ 
    user: data.user,
    message: 'Please check your email to verify your account'
  })
}

