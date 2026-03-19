import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
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

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError && profileError.code !== 'PGRST116') {
      console.error('Profile fetch error:', profileError)
      return NextResponse.json(
        { error: 'Failed to fetch profile' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      profile: profile || null,
      user: {
        id: user.id,
        email: user.email,
        email_confirmed_at: user.email_confirmed_at,
      }
    })
  } catch (error) {
    console.error('Get profile error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
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

    const body = await request.json()
    const { first_name, last_name, phone, date_of_birth, address, health_insurance, gender } = body

    // Build update object with only defined values
    const updateData: any = {
      id: user.id,
      updated_at: new Date().toISOString(),
    }

    if (first_name !== undefined && first_name !== null) updateData.first_name = first_name
    if (last_name !== undefined && last_name !== null) updateData.last_name = last_name
    if (phone !== undefined && phone !== null) updateData.phone = phone
    if (date_of_birth !== undefined && date_of_birth !== null) updateData.date_of_birth = date_of_birth
    if (address !== undefined && address !== null) updateData.address = address
    if (health_insurance !== undefined && health_insurance !== null) updateData.health_insurance = health_insurance
    if (gender !== undefined && gender !== null) {
      if (gender === "M" || gender === "F") updateData.gender = gender
      else updateData.gender = null
    }

    // Update or insert profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .upsert(updateData, {
        onConflict: 'id'
      })
      .select()
      .single()

    if (profileError) {
      console.error('Profile update error:', profileError)
      
      // Mensajes más específicos según el tipo de error
      let errorMessage = 'Error al actualizar el perfil'
      if (profileError.code === '23505') {
        errorMessage = 'Ya existe un perfil con estos datos'
      } else if (profileError.code === '23503') {
        errorMessage = 'Error de referencia en la base de datos'
      } else if (profileError.message) {
        errorMessage = profileError.message
      }
      
      return NextResponse.json(
        { 
          error: 'Failed to update profile', 
          message: errorMessage,
          details: profileError.code || 'unknown_error'
        },
        { status: 500 }
      )
    }

    // Also update user metadata (only if names are provided)
    if (first_name !== undefined || last_name !== undefined) {
      const metadataUpdate: any = {}
      if (first_name !== undefined && first_name !== null) metadataUpdate.first_name = first_name
      if (last_name !== undefined && last_name !== null) metadataUpdate.last_name = last_name

      if (Object.keys(metadataUpdate).length > 0) {
        const { error: metadataError } = await supabase.auth.updateUser({
          data: metadataUpdate
        })

        if (metadataError) {
          console.error('Metadata update error:', metadataError)
          // Don't fail the request if metadata update fails, but log it
        }
      }
    }

    return NextResponse.json({ 
      success: true,
      profile 
    })
  } catch (error) {
    console.error('Update profile error:', error)
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Error interno del servidor. Por favor, intenta nuevamente.'
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: errorMessage
      },
      { status: 500 }
    )
  }
}

