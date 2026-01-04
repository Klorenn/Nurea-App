import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const { email, password, firstName, lastName, role } = await request.json()

  if (!email || !password || !firstName || !lastName || !role) {
    return NextResponse.json(
      { error: 'Missing required fields' },
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
    .single()

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

  return NextResponse.json({ 
    user: data.user,
    message: 'Please check your email to verify your account'
  })
}

