import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: Request) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Check if profile already exists
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single()

    if (existingProfile) {
      return NextResponse.json({ success: true, message: 'Profile already exists' })
    }

    const body = await request.json()
    const { firstName, lastName, role, dateOfBirth } = body

    // Create profile
    const { error: profileError } = await supabase.from('profiles').insert({
      id: userId,
      first_name: firstName || '',
      last_name: lastName || '',
      role: role === 'professional' ? 'professional' : 'patient',
      date_of_birth: dateOfBirth || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    if (profileError) {
      console.error('Profile creation error:', profileError)
      return NextResponse.json(
        { error: 'Failed to create profile' },
        { status: 500 }
      )
    }

    // If professional, create professional profile entry
    if (role === 'professional') {
      const { error: profError } = await supabase.from('professionals').insert({
        id: userId,
        specialty: '',
        bio: '',
        consultation_type: 'online',
        consultation_price: 0,
        online_price: 0,
        in_person_price: 0,
        availability: {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })

      if (profError) {
        console.error('Professional profile creation error:', profError)
        // Don't fail - the main profile was created
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Create profile error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
