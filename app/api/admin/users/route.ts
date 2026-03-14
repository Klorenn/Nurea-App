import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

async function verifyAdmin(supabase: any) {
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  
  if (userError || !user) {
    return { error: 'unauthorized', status: 401 }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') {
    return { error: 'forbidden', status: 403 }
  }

  return { user, profile }
}

/**
 * GET /api/admin/users
 * Obtiene todos los usuarios con datos extendidos (solo admin)
 */
export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    
    const auth = await verifyAdmin(supabase)
    if ('error' in auth) {
      return NextResponse.json(
        { error: auth.error, message: auth.error === 'unauthorized' ? 'Por favor, inicia sesión.' : 'Solo administradores.' },
        { status: auth.status }
      )
    }

    const { searchParams } = new URL(request.url)
    const role = searchParams.get('role')
    const blocked = searchParams.get('blocked')
    const accountStatus = searchParams.get('account_status')

    // Obtener usuarios con datos extendidos
    let query = supabase
      .from('profiles')
      .select(`
        id,
        first_name,
        last_name,
        email,
        role,
        blocked,
        blocked_at,
        account_status,
        warning_message,
        warned_at,
        email_verified,
        avatar_url,
        phone,
        date_of_birth,
        created_at,
        updated_at
      `)
      .order('created_at', { ascending: false })

    // Aplicar filtros
    if (role && role !== 'all') {
      query = query.eq('role', role)
    }

    if (blocked === 'true') {
      query = query.eq('blocked', true)
    } else if (blocked === 'false') {
      query = query.eq('blocked', false)
    }

    if (accountStatus) {
      query = query.eq('account_status', accountStatus)
    }

    const { data: profiles, error: profilesError } = await query

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError)
      return NextResponse.json(
        { error: 'fetch_failed', message: 'No pudimos obtener los usuarios.' },
        { status: 500 }
      )
    }

    // Obtener datos de profesionales para los que tienen rol 'professional'
    const professionalIds = (profiles || [])
      .filter((p: any) => p.role === 'professional')
      .map((p: any) => p.id)

    let professionalsMap: Record<string, any> = {}

    if (professionalIds.length > 0) {
      const { data: professionals } = await supabase
        .from('professionals')
        .select('id, specialty, license_number, verified, location')
        .in('id', professionalIds)

      if (professionals) {
        professionals.forEach((p: any) => {
          professionalsMap[p.id] = p
        })
      }
    }

    // Combinar datos
    const users = (profiles || []).map((profile: any) => ({
      ...profile,
      ...(professionalsMap[profile.id] || {}),
      account_status: profile.account_status || 'active'
    }))

    return NextResponse.json({
      success: true,
      users,
      count: users.length
    })
  } catch (error) {
    console.error('Get users error:', error)
    return NextResponse.json(
      { error: 'server_error', message: 'Algo salió mal.' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/admin/users
 * Actualiza un usuario (cambiar rol, suspender, advertir)
 */
export async function PUT(request: Request) {
  try {
    const supabase = await createClient()
    
    const auth = await verifyAdmin(supabase)
    if ('error' in auth) {
      return NextResponse.json(
        { error: auth.error, message: auth.error === 'unauthorized' ? 'Por favor, inicia sesión.' : 'Solo administradores.' },
        { status: auth.status }
      )
    }

    const body = await request.json()
    const { userId, role, blocked, account_status, warning_message } = body

    if (!userId) {
      return NextResponse.json(
        { error: 'missing_fields', message: 'Por favor, proporciona el ID del usuario.' },
        { status: 400 }
      )
    }

    // Construir objeto de actualización
    const updateData: Record<string, any> = {}

    if (role && ['patient', 'professional', 'admin'].includes(role)) {
      updateData.role = role
    }

    if (typeof blocked === 'boolean') {
      updateData.blocked = blocked
      updateData.blocked_at = blocked ? new Date().toISOString() : null
    }

    if (account_status && ['active', 'warning', 'suspended', 'pending'].includes(account_status)) {
      updateData.account_status = account_status
      
      if (account_status === 'warning' && warning_message) {
        updateData.warning_message = warning_message
        updateData.warned_at = new Date().toISOString()
        updateData.warned_by = auth.user.id
      }
      
      if (account_status === 'active') {
        updateData.warning_message = null
        updateData.warned_at = null
        updateData.warned_by = null
        updateData.blocked = false
        updateData.blocked_at = null
      }

      if (account_status === 'suspended') {
        updateData.blocked = true
        updateData.blocked_at = new Date().toISOString()
      }
    }

    // Si se proporciona warning_message sin account_status, asumir status 'warning'
    if (warning_message && !account_status) {
      updateData.account_status = 'warning'
      updateData.warning_message = warning_message
      updateData.warned_at = new Date().toISOString()
      updateData.warned_by = auth.user.id
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'no_changes', message: 'No se proporcionaron cambios para aplicar.' },
        { status: 400 }
      )
    }

    updateData.updated_at = new Date().toISOString()

    // Actualizar el usuario
    const { data: updatedUser, error: updateError } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', userId)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating user:', updateError)
      return NextResponse.json(
        { error: 'update_failed', message: 'No se pudo actualizar el usuario.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      user: updatedUser
    })
  } catch (error) {
    console.error('Update user error:', error)
    return NextResponse.json(
      { error: 'server_error', message: 'Algo salió mal.' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/admin/users
 * Elimina un usuario (solo admin)
 */
export async function DELETE(request: Request) {
  try {
    const supabase = await createClient()
    
    const auth = await verifyAdmin(supabase)
    if ('error' in auth) {
      return NextResponse.json(
        { error: auth.error, message: auth.error === 'unauthorized' ? 'Por favor, inicia sesión.' : 'Solo administradores.' },
        { status: auth.status }
      )
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'missing_fields', message: 'Por favor, proporciona el ID del usuario.' },
        { status: 400 }
      )
    }

    // No permitir eliminar a sí mismo
    if (userId === auth.user.id) {
      return NextResponse.json(
        { error: 'cannot_delete_self', message: 'No puedes eliminar tu propia cuenta.' },
        { status: 400 }
      )
    }

    // Primero eliminar datos relacionados manualmente si es necesario
    // (dependiendo de la configuración de cascada en la BD)
    
    // Eliminar de professionals si existe
    await supabase.from('professionals').delete().eq('id', userId)
    
    // Eliminar citas
    await supabase.from('appointments').delete().or(`patient_id.eq.${userId},professional_id.eq.${userId}`)
    
    // Eliminar documentos
    await supabase.from('documents').delete().eq('user_id', userId)
    
    // Eliminar el perfil
    await supabase.from('profiles').delete().eq('id', userId)

    // Intentar eliminar el usuario de auth (requiere service_role key)
    try {
      await supabase.auth.admin.deleteUser(userId)
    } catch (authDeleteError) {
      console.warn('Could not delete from auth.users (may need service_role):', authDeleteError)
    }

    return NextResponse.json({
      success: true,
      message: 'Usuario eliminado exitosamente.'
    })
  } catch (error) {
    console.error('Delete user error:', error)
    return NextResponse.json(
      { error: 'server_error', message: 'Algo salió mal.' },
      { status: 500 }
    )
  }
}
