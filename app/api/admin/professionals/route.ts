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
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    return {
      error: NextResponse.json(
        { error: 'unauthorized', message: 'Por favor, inicia sesión.' },
        { status: 401 }
      )
    }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') {
    return {
      error: NextResponse.json(
        { error: 'forbidden', message: 'Solo los administradores pueden acceder a esta información.' },
        { status: 403 }
      )
    }
  }

  return { user }
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
        professional_license_number,
        license_issuing_institution,
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
          email,
          blocked,
          created_at
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

    if (professionalsError) {
      console.error('Error fetching professionals:', professionalsError)
      return NextResponse.json(
        { error: 'fetch_failed', message: 'No pudimos obtener los profesionales. Por favor, intenta nuevamente.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      professionals: professionals || [],
      count: professionals?.length || 0
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

    const isVerified = verificationStatus === 'verified'
    const now = new Date().toISOString()

    const updateData: Record<string, any> = {
      verification_status: verificationStatus,
      // Sincronizar el campo legacy 'verified' (boolean)
      verified: isVerified,
      verified_at: isVerified ? now : null,
      verified_by: isVerified ? authResult.user!.id : null,
      verification_date: ['verified', 'rejected'].includes(verificationStatus) ? now : null,
    }

    if (notes !== undefined) {
      updateData.verification_notes = notes
    }

    if (verificationStatus === 'rejected' && rejectionReason) {
      updateData.rejection_reason = rejectionReason
      updateData.verification_notes = rejectionReason
    } else if (verificationStatus !== 'rejected') {
      updateData.rejection_reason = null
    }

    // Usamos el cliente admin (service role) para saltear RLS
    const adminClient = createAdminClient()

    const { data: updatedProfessional, error: updateError } = await adminClient
      .from('professionals')
      .update(updateData)
      .eq('id', professionalId)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating professional verification:', updateError)
      return NextResponse.json(
        { error: 'update_failed', message: 'No se pudo actualizar la verificación. Por favor, intenta nuevamente.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      professional: updatedProfessional,
      message: getStatusMessage(verificationStatus)
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
