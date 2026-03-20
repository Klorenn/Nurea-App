import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

type VerificationStatus = 'pending' | 'under_review' | 'verified' | 'rejected'

/**
 * Verifica que el request proviene de un admin autenticado.
 * Retorna { user } si es válido, o una NextResponse de error.
 */
async function requireAdmin() {
  const supabase = await createClient()
  const adminClient = createAdminClient()

  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    return {
      error: NextResponse.json(
        { error: 'unauthorized', message: 'Por favor, inicia sesión.' },
        { status: 401 }
      )
    }
  }

  const jwtRole =
    (user.app_metadata as any)?.role ||
    (user.user_metadata as any)?.role ||
    null

  // Para evitar falsos negativos por RLS/columnas faltantes, leemos el rol con service role.
  const { data: profile, error: profileError } = await adminClient
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  if (profileError) {
    console.error('Admin requireAdmin: error reading profile role:', profileError)
    if (jwtRole === 'admin') {
      return { user }
    }
    return {
      error: NextResponse.json(
        { error: 'profile_role_lookup_failed', message: 'No pudimos validar el rol del admin.' },
        { status: 500 }
      )
    }
  }

  if (!profile || profile.role !== 'admin') {
    // Fallback: algunos entornos pueden tener problemas con `profiles.role`.
    if (jwtRole === 'admin') return { user }

    return {
      error: NextResponse.json(
        { error: 'forbidden', message: 'Solo los administradores pueden acceder a esta información.' },
        { status: 403 }
      )
    }
  }

  return { user }
}

/** Hydrates email + name fields from auth.users into the professionals array in-place. */
async function hydrateAuthEmails(adminClient: ReturnType<typeof createAdminClient>, professionals: any[]) {
  if (!professionals.length) return
  const { data: { users: authUsers }, error } = await adminClient.auth.admin.listUsers({ perPage: 1000 })
  if (error || !authUsers) {
    console.error('Admin professionals: auth.admin.listUsers email hydration failed:', error)
    return
  }
  const authUsersById = new Map<string, any>(authUsers.map((u: any) => [u.id, u]))
  for (const p of professionals) {
    const authUser = authUsersById.get(p.id)
    const email = authUser?.email
    const meta = authUser?.user_metadata || {}
    const metaFirst = meta.first_name || null
    const metaLast = meta.last_name || null
    const fullName = meta.full_name || meta.fullName || null
    const parts = typeof fullName === 'string' && fullName.trim() ? fullName.trim().split(/\s+/) : []
    const derivedFirst = metaFirst || parts[0] || null
    const derivedLast = metaLast || parts.slice(1).join(' ') || null

    if (!p.profile) {
      p.profile = { id: p.id, first_name: null, last_name: null, email: null, created_at: null }
    }
    p.profile.email = email ?? p.profile.email ?? null
    p.profile.first_name = p.profile.first_name || derivedFirst
    p.profile.last_name = p.profile.last_name || derivedLast
  }
}

/**
 * GET /api/admin/professionals
 * Lista todos los profesionales con sus datos de verificación (solo admin).
 */
export async function GET(request: Request) {
  try {
    const authResult = await requireAdmin()
    if (authResult.error) return authResult.error

    // Usamos el cliente admin (service role) para saltear RLS y ver todos los profesionales
    const adminClient = createAdminClient()

    const { searchParams } = new URL(request.url)
    const verifiedFilter = searchParams.get('verified')
    const statusFilter = searchParams.get('status') as VerificationStatus | null

    let query = adminClient
      .from('professionals')
      .select(`
        id,
        specialty,
        bio,
        verified,
        verification_status,
        verification_date,
        verification_notes,
        verified_by,
        registration_number,
        registration_institution,
        license_expiry_date,
        license_country,
        verification_document_url,
        verification_document_name,
        rejection_reason,
        verified_at,
        experience_years,
        created_at,
        profile:profiles!professionals_id_fkey(
          id,
          first_name,
          last_name,
          created_at,
          role,
          subscription_status,
          trial_end_date,
          selected_plan_id
        )
      `)
      .order('created_at', { ascending: false })

    // Filtrar por verification_status si viene en los params
    if (statusFilter) {
      query = query.eq('verification_status', statusFilter)
    } else if (verifiedFilter === 'true') {
      // Compatibilidad con el dashboard de stats que usa ?verified=false
      query = query.eq('verified', true)
    } else if (verifiedFilter === 'false') {
      // Pendientes = todos los que NO están verificados
      query = query.neq('verification_status', 'verified')
    }

    const { data: professionals, error: professionalsError } = await query

    // Fallback: si falla el select (columnas inexistentes / relación inexistente),
    // hacemos un retry más robusto.
    if (professionalsError || !professionals) {
      console.error('Error fetching professionals (primary):', professionalsError)

      // 1) Traer todo desde professionals con select('*') para evitar errores por columnas faltantes.
      const { data: professionalsAll, error: professionalsAllError } = await adminClient
        .from('professionals')
        .select('*')
        .order('created_at', { ascending: false })

      if (professionalsAllError) {
        console.error('Error fetching professionals (fallback):', professionalsAllError)
        return NextResponse.json(
          { error: 'fetch_failed', message: 'No pudimos obtener los profesionales. Por favor, intenta nuevamente.' },
          { status: 500 }
        )
      }

      // 2) Aplicar filtros en memoria (por si falla alguna columna en el query).
      let filtered = professionalsAll as any[]
      if (statusFilter) {
        filtered = filtered.filter((p) => p.verification_status === statusFilter)
      } else if (verifiedFilter === 'true') {
        filtered = filtered.filter((p) => p.verified === true)
      } else if (verifiedFilter === 'false') {
        filtered = filtered.filter((p) => p.verification_status !== 'verified')
      }

      // 3) Traer perfiles y unir por id para que el frontend tenga `profile: {...}`
      const ids = filtered.map((p) => p.id).filter(Boolean)
      const { data: profiles, error: profilesError } = ids.length
        ? await adminClient
            .from('profiles')
            // `blocked` puede no existir en todos los entornos; no es necesario para mostrar nombre/email.
            .select('id, first_name, last_name, created_at, role, subscription_status, trial_end_date, selected_plan_id')
            .in('id', ids)
        : { data: [], error: null as any }

      if (profilesError) {
        console.error('Error fetching profiles for admin professionals:', profilesError)
      }

      const profilesById = new Map<string, any>((profiles || []).map((p: any) => [p.id, p]))
      let merged = filtered.map((p: any) => ({
        ...p,
        profile: profilesById.get(p.id) || null,
      }))

      // Hard-safety: nunca mostrar pacientes como profesionales en el admin.
      merged = merged.filter((p: any) => p?.profile?.role === 'professional')

      // Email real desde auth.admin.listUsers (auth.users no está expuesto por PostgREST).
      await hydrateAuthEmails(adminClient, merged)

      return NextResponse.json({
        success: true,
        professionals: merged,
        count: merged.length,
      })
    }

    // Seguridad: forzamos el merge de `profiles` (first_name/last_name/email)
    // para que el admin siempre vea nombres y correos, incluso si el join primario
    // devuelve `profile: null` o campos vacíos.
    const prosAny = (professionals || []) as any[]
    const idsToHydrate = prosAny.map((p) => p?.id).filter(Boolean)
    if (idsToHydrate.length) {
      const { data: profilesHydrated, error: profilesHydratedError } = await adminClient
        .from("profiles")
        // `blocked` puede no existir en todos los entornos; no es necesario para mostrar nombre/email.
        .select("id, first_name, last_name, created_at, role, subscription_status, trial_end_date, selected_plan_id")
        .in("id", idsToHydrate)

      if (!profilesHydratedError && profilesHydrated) {
        const profilesById = new Map<string, any>((profilesHydrated as any[]).map((p: any) => [p.id, p]))
        const merged = prosAny.map((p) => ({
          ...p,
          profile: profilesById.get(p.id) || p.profile || null,
        }))

        // Email real desde auth.admin.listUsers (auth.users no está expuesto por PostgREST).
        await hydrateAuthEmails(adminClient, merged)

        // Hard-safety: nunca mostrar pacientes como profesionales en el admin.
        const mergedFiltered = merged.filter((p: any) => p?.profile?.role === 'professional')

        return NextResponse.json({
          success: true,
          professionals: mergedFiltered,
          count: mergedFiltered.length,
        })
      } else {
        console.error("Admin professionals: profiles hydration failed:", profilesHydratedError)
      }
    }

    return NextResponse.json({
      success: true,
      professionals: professionals || [],
      count: (professionals as any[])?.length || 0,
    })
  } catch (error) {
    console.error('Get professionals error:', error)
    return NextResponse.json(
      { error: 'server_error', message: 'Algo salió mal. Por favor, intenta nuevamente en unos momentos.' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/admin/professionals
 * Actualiza el estado de verificación de un profesional (solo admin).
 * 
 * Body: {
 *   professionalId: string
 *   verificationStatus: 'pending' | 'under_review' | 'verified' | 'rejected'
 *   notes?: string          // Notas internas del admin
 *   rejectionReason?: string // Motivo de rechazo (solo si status = 'rejected')
 * }
 */
export async function PUT(request: Request) {
  try {
    const authResult = await requireAdmin()
    if (authResult.error) return authResult.error

    const body = await request.json()
    const { professionalId, verificationStatus, notes, rejectionReason } = body as {
      professionalId: string
      verificationStatus: VerificationStatus
      notes?: string
      rejectionReason?: string
    }

    if (!professionalId || !verificationStatus) {
      return NextResponse.json(
        { error: 'missing_fields', message: 'Por favor, proporciona el ID del profesional y el estado de verificación.' },
        { status: 400 }
      )
    }

    const validStatuses: VerificationStatus[] = ['pending', 'under_review', 'verified', 'rejected']
    if (!validStatuses.includes(verificationStatus)) {
      return NextResponse.json(
        { error: 'invalid_status', message: `Estado inválido. Usa: ${validStatuses.join(', ')}` },
        { status: 400 }
      )
    }

    // Usar el RPC de BD (más robusto ante diferencias de columnas/estructura).
    // Firma: update_verification_status(p_professional_id, p_new_status, p_notes)
    const supabase = await createClient()

    const p_notes =
      verificationStatus === 'rejected'
        ? rejectionReason ?? notes ?? null
        : notes ?? null

    const { data: ok, error: rpcError } = await supabase.rpc('update_verification_status', {
      // Orden pensado para calzar con el overload que espera supabase-js.
      p_new_status: verificationStatus,
      p_notes,
      p_professional_id: professionalId,
    })

    if (rpcError) {
      const rpcMessage = String(rpcError?.message || rpcError)
      console.error('RPC update_verification_status error:', rpcError)

      // Fallback: si el RPC aún no existe en schema cache (o no está creado con la firma esperada),
      // hacemos el update directo con el service role para destrabar el flujo del admin.
      const rpcMessageLower = rpcMessage.toLowerCase()
      if (rpcMessageLower.includes('could not find the function') && rpcMessageLower.includes('update_verification_status')) {
        const adminClient = createAdminClient()
        const adminId = authResult.user.id

        // Fallback "compat": en algunos entornos faltan columnas nuevas
        // (verification_status/verification_date/verification_notes). En esos casos,
        // actualizamos el modelo legacy basado en `verified` y `rejection_reason`.
        const shouldVerify = verificationStatus === 'verified'

        // Primer intento: verified + (opcional) rejection_reason si aplica.
        const updatePayload: Record<string, any> = {
          verified: shouldVerify,
        }

        if (verificationStatus === 'verified') {
          updatePayload.verified_by = adminId
        }

        if (verificationStatus === 'rejected') {
          updatePayload.rejection_reason = p_notes
        } else {
          // Para evitar que quede marcada como rechazada desde un intento anterior.
          updatePayload.rejection_reason = null
        }

        let { error: updateError } = await adminClient
          .from('professionals')
          .update(updatePayload)
          .eq('id', professionalId)

        // Segundo intento: si faltan columnas como `rejection_reason`, caemos a solo `verified`.
        if (updateError) {
          const fallbackPayloadOnlyVerified: Record<string, any> = {
            verified: shouldVerify,
          }
          if (verificationStatus === 'verified') {
            fallbackPayloadOnlyVerified.verified_by = adminId
          }

          const { error: updateError2 } = await adminClient
            .from('professionals')
            .update(fallbackPayloadOnlyVerified)
            .eq('id', professionalId)

          if (updateError2) {
            return NextResponse.json(
              {
                error: 'update_failed',
                message: `No se pudo actualizar la verificación (fallback UPDATE legacy): ${updateError2.message || 'error'}`,
                details: updateError2,
              },
              { status: 500 }
            )
          }
        }

        return NextResponse.json({
          success: true,
          professional: { id: professionalId, verification_status: verificationStatus },
          message: getStatusMessage(verificationStatus),
        })
      }

      return NextResponse.json(
        {
          error: 'update_failed',
          message: `No se pudo actualizar la verificación: ${rpcError.message || 'error en RPC'}`,
          details: rpcError,
        },
        { status: 500 }
      )
    }

    if (!ok) {
      return NextResponse.json(
        {
          error: 'update_failed',
          message: 'No se pudo actualizar la verificación (RPC no actualizó el registro).',
        },
        { status: 500 }
      )
    }

    // Devolver el profesional actualizado para que el frontend sepa que cambió.
    const { data: updatedProfessional, error: fetchError } = await supabase
      .from('professionals')
      .select('id, verification_status, verified, verified_at, verified_by, verification_date, verification_notes, rejection_reason')
      .eq('id', professionalId)
      .maybeSingle()

    if (fetchError) {
      // No bloqueamos si no se pueden traer todos los campos; solo devolvemos ok.
      console.error('Fetch updated professional error:', fetchError)
    }

    return NextResponse.json({
      success: true,
      professional: updatedProfessional || { id: professionalId, verification_status: verificationStatus },
      message: getStatusMessage(verificationStatus),
    })
  } catch (error) {
    console.error('Update professional error:', error)
    return NextResponse.json(
      { error: 'server_error', message: 'Algo salió mal. Por favor, intenta nuevamente en unos momentos.' },
      { status: 500 }
    )
  }
}

function getStatusMessage(status: VerificationStatus): string {
  switch (status) {
    case 'pending': return 'Estado restablecido a pendiente'
    case 'under_review': return 'Profesional marcado como "En Revisión" con la Superintendencia de Salud'
    case 'verified': return 'Profesional verificado exitosamente'
    case 'rejected': return 'Verificación rechazada'
  }
}
