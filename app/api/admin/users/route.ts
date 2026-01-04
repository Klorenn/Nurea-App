import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * GET /api/admin/users
 * Obtiene todos los usuarios (solo admin)
 */
export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    
    // Verificar autenticación
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json(
        { 
          error: 'unauthorized',
          message: 'Por favor, inicia sesión.'
        },
        { status: 401 }
      )
    }

    // Verificar que el usuario es admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json(
        { 
          error: 'forbidden',
          message: 'Solo los administradores pueden acceder a esta información.'
        },
        { status: 403 }
      )
    }

    // Obtener parámetros de consulta
    const { searchParams } = new URL(request.url)
    const role = searchParams.get('role')
    const blocked = searchParams.get('blocked')

    // Construir query
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
        email_verified,
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

    const { data: users, error: usersError } = await query

    if (usersError) {
      console.error('Error fetching users:', usersError)
      return NextResponse.json(
        { 
          error: 'fetch_failed',
          message: 'No pudimos obtener los usuarios. Por favor, intenta nuevamente.'
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      users: users || [],
      count: users?.length || 0
    })
  } catch (error) {
    console.error('Get users error:', error)
    return NextResponse.json(
      { 
        error: 'server_error',
        message: 'Algo salió mal. Por favor, intenta nuevamente en unos momentos.'
      },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/admin/users
 * Actualiza un usuario (cambiar rol, suspender)
 */
export async function PUT(request: Request) {
  try {
    const supabase = await createClient()
    
    // Verificar autenticación
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json(
        { 
          error: 'unauthorized',
          message: 'Por favor, inicia sesión.'
        },
        { status: 401 }
      )
    }

    // Verificar que el usuario es admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json(
        { 
          error: 'forbidden',
          message: 'Solo los administradores pueden actualizar usuarios.'
        },
        { status: 403 }
      )
    }

    const { userId, role, blocked } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { 
          error: 'missing_fields',
          message: 'Por favor, proporciona el ID del usuario.'
        },
        { status: 400 }
      )
    }

    // Construir objeto de actualización
    const updateData: any = {}

    if (role && ['patient', 'professional', 'admin'].includes(role)) {
      updateData.role = role
    }

    if (typeof blocked === 'boolean') {
      updateData.blocked = blocked
      updateData.blocked_at = blocked ? new Date().toISOString() : null
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { 
          error: 'no_changes',
          message: 'No se proporcionaron cambios para aplicar.'
        },
        { status: 400 }
      )
    }

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
        { 
          error: 'update_failed',
          message: 'No se pudo actualizar el usuario. Por favor, intenta nuevamente.'
        },
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
      { 
        error: 'server_error',
        message: 'Algo salió mal. Por favor, intenta nuevamente en unos momentos.'
      },
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
    
    // Verificar autenticación
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json(
        { 
          error: 'unauthorized',
          message: 'Por favor, inicia sesión.'
        },
        { status: 401 }
      )
    }

    // Verificar que el usuario es admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json(
        { 
          error: 'forbidden',
          message: 'Solo los administradores pueden eliminar usuarios.'
        },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { 
          error: 'missing_fields',
          message: 'Por favor, proporciona el ID del usuario.'
        },
        { status: 400 }
      )
    }

    // No permitir eliminar a sí mismo
    if (userId === user.id) {
      return NextResponse.json(
        { 
          error: 'cannot_delete_self',
          message: 'No puedes eliminar tu propia cuenta.'
        },
        { status: 400 }
      )
    }

    // Eliminar el usuario (cascada eliminará el perfil y datos relacionados)
    const { error: deleteError } = await supabase.auth.admin.deleteUser(userId)

    if (deleteError) {
      console.error('Error deleting user:', deleteError)
      return NextResponse.json(
        { 
          error: 'delete_failed',
          message: 'No se pudo eliminar el usuario. Por favor, intenta nuevamente.'
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Usuario eliminado exitosamente.'
    })
  } catch (error) {
    console.error('Delete user error:', error)
    return NextResponse.json(
      { 
        error: 'server_error',
        message: 'Algo salió mal. Por favor, intenta nuevamente en unos momentos.'
      },
      { status: 500 }
    )
  }
}

