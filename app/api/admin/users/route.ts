import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

async function verifyAdmin(supabase: any) {
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    return { error: 'unauthorized', status: 401 }
  }

  // Use admin client to bypass RLS when reading the role — prevents privilege escalation
  // if a user manipulates their own profile via RLS-bypassing exploits.
  const adminClient = createAdminClient()
  const { data: profile } = await adminClient
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

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
  // ── 1. Auth ──────────────────────────────────────────────────────────────
  let supabase: any
  try {
    supabase = await createClient()
  } catch (e: any) {
    console.error('[admin/users] createClient threw:', e)
    return NextResponse.json({ error: 'client_init_failed', message: e?.message }, { status: 500 })
  }

  const auth = await verifyAdmin(supabase)
  if ('error' in auth) {
    return NextResponse.json(
      { error: auth.error, message: auth.error === 'unauthorized' ? 'Por favor, inicia sesión.' : 'Solo administradores.' },
      { status: auth.status }
    )
  }

  // ── 2. Admin client ───────────────────────────────────────────────────────
  let adminSupabase: ReturnType<typeof createAdminClient>
  try {
    adminSupabase = createAdminClient()
  } catch (e: any) {
    console.error('[admin/users] createAdminClient threw:', e)
    return NextResponse.json({ error: 'admin_client_failed', message: e?.message }, { status: 500 })
  }

  // ── 3. Query profiles (minimal columns first, premium fields optional) ────
  const { searchParams } = new URL(request.url)
  const role = searchParams.get('role')
  const blocked = searchParams.get('blocked')
  const accountStatus = searchParams.get('account_status')

  // Base columns — only columns confirmed to exist in profiles
  const baseSelect = `id, first_name, last_name, email, role, account_status, email_verified, avatar_url, phone, date_of_birth, created_at, updated_at, subscription_status`

  let profilesQuery = adminSupabase
    .from('profiles')
    .select(baseSelect)
    .order('created_at', { ascending: false })

  if (role && role !== 'all') profilesQuery = profilesQuery.eq('role', role)
  if (accountStatus) profilesQuery = profilesQuery.eq('account_status', accountStatus)

  const { data: profiles, error: profilesError } = await profilesQuery

  if (profilesError) {
    console.error('[admin/users] profiles query error:', profilesError)
    return NextResponse.json(
      { error: 'profiles_query_failed', message: profilesError.message, detail: profilesError },
      { status: 500 }
    )
  }

  // ── 4. Optional: enrich professionals ────────────────────────────────────
  const professionalIds = (profiles || [])
    .filter((p: any) => p.role === 'professional')
    .map((p: any) => p.id)

  let professionalsMap: Record<string, any> = {}
  if (professionalIds.length > 0) {
    const { data: professionals } = await adminSupabase
      .from('professionals')
      .select('id, specialty, license_number, verified, location')
      .in('id', professionalIds)
    ;(professionals || []).forEach((p: any) => { professionalsMap[p.id] = p })
  }

  // ── 5. Combine & return ───────────────────────────────────────────────────
  const users = (profiles || []).map((profile: any) => ({
    ...profile,
    ...(professionalsMap[profile.id] || {}),
    account_status: profile.account_status || 'active',
    subscription_status: profile.subscription_status ?? null,
  }))

  return NextResponse.json({ success: true, users, count: users.length })
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
    const { userId, role, blocked, account_status, warning_message, subscription_status, trial_end_date, selected_plan_id } = body

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

    // Premium (suscripción): admin puede activar/poner trial con fecha.
    if (subscription_status) {
      const allowedSubscriptionStatuses = [
        'inactive',
        'active',
        'past_due',
        'canceled',
        'trialing',
        'unpaid',
        'pending_approval',
      ]

      if (!allowedSubscriptionStatuses.includes(subscription_status)) {
        return NextResponse.json(
          { error: 'invalid_subscription_status', message: `Estado de suscripción inválido: ${subscription_status}` },
          { status: 400 }
        )
      }

      updateData.subscription_status = subscription_status
    }

    if (typeof trial_end_date !== 'undefined') {
      // Permite null para activar 'active' sin fecha de término.
      updateData.trial_end_date = trial_end_date ? new Date(trial_end_date).toISOString() : null
    }

    if (typeof selected_plan_id !== 'undefined') {
      updateData.selected_plan_id = selected_plan_id || null
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

    // Use admin client (service role) for all cascading deletes — the RLS client
    // cannot delete other users' data or call auth.admin.deleteUser.
    const adminClient = createAdminClient()

    await adminClient.from('professionals').delete().eq('id', userId)
    await adminClient.from('appointments').delete().or(`patient_id.eq.${userId},professional_id.eq.${userId}`)
    await adminClient.from('documents').delete().eq('user_id', userId)
    await adminClient.from('profiles').delete().eq('id', userId)

    const { error: authDeleteError } = await adminClient.auth.admin.deleteUser(userId)
    if (authDeleteError) {
      console.warn('Could not delete from auth.users:', authDeleteError)
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
