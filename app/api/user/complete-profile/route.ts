import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { firstName, lastName, dateOfBirth, avatarUrl, phone } = await request.json()

    // Validar campos requeridos
    if (!firstName || !lastName || !dateOfBirth) {
      return NextResponse.json(
        { 
          error: 'Missing required fields',
          message: 'Por favor, completa todos los campos requeridos (nombres, apellidos, fecha de nacimiento).'
        },
        { status: 400 }
      )
    }

    // Validate age
    const birthDate = new Date(dateOfBirth)
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }

    if (age < 18) {
      return NextResponse.json(
        { 
          error: 'User must be at least 18 years old',
          message: 'Debes ser mayor de 18 años para usar NUREA.'
        },
        { status: 400 }
      )
    }

    // Si hay avatarUrl, subirlo a Supabase Storage si es necesario
    let finalAvatarUrl = avatarUrl
    if (avatarUrl && avatarUrl.startsWith('blob:')) {
      // Si es un blob URL, necesitamos subirlo primero
      // Por ahora, asumimos que el avatar ya fue subido por el cliente
      // y solo guardamos la URL
    }

    // Update or create profile
    const profileUpdate: any = {
      id: user.id,
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      date_of_birth: dateOfBirth,
      updated_at: new Date().toISOString(),
    }

    if (avatarUrl) {
      profileUpdate.avatar_url = avatarUrl
    }

    if (phone) {
      profileUpdate.phone = phone.trim()
    }

    const { error: profileError } = await supabase
      .from('profiles')
      .upsert(profileUpdate, {
        onConflict: 'id'
      })

    if (profileError) {
      console.error('Profile update error:', profileError)
      return NextResponse.json(
        { error: 'Failed to update profile' },
        { status: 500 }
      )
    }

    // Get user role to determine redirect path
    const { data: profileData } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const userRole = profileData?.role || 'patient'
    let redirectPath = '/dashboard'
    
    if (userRole === 'professional') {
      redirectPath = '/professional/onboarding'
    } else if (userRole === 'admin') {
      redirectPath = '/admin'
    }
    return NextResponse.json({ 
      success: true,
      redirectPath,
      userRole
    })
  } catch (error) {
    console.error('Complete profile error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

