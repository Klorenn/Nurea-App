import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * POST /api/appointments/complete
 * Mark an appointment as completed.
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { appointmentId } = await request.json()

    if (!appointmentId) {
      return NextResponse.json(
        { error: 'id_required', message: 'Appointment ID is required' },
        { status: 400 }
      )
    }

    // 1. Check authentication and authorization
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'unauthorized', message: 'You must be logged in' },
        { status: 401 }
      )
    }

    // 2. Verify appointment belongs to this professional and is in 'confirmed' status
    const { data: appointment, error: fetchError } = await supabase
      .from('appointments')
      .select('id, professional_id, status')
      .eq('id', appointmentId)
      .single()

    if (fetchError || !appointment) {
      return NextResponse.json(
        { error: 'not_found', message: 'Appointment not found' },
        { status: 404 }
      )
    }

    if (appointment.professional_id !== user.id) {
      // Check if user is admin (permission override)
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()
      
      if (profile?.role !== 'admin') {
        return NextResponse.json(
          { error: 'forbidden', message: 'You do not have permission to complete this appointment' },
          { status: 403 }
        )
      }
    }

    if (appointment.status !== 'confirmed') {
      return NextResponse.json(
        { error: 'invalid_status', message: `Cannot complete appointment in '${appointment.status}' status` },
        { status: 400 }
      )
    }

    // 3. Call the RPC to atomically update status and release funds (Security & Robustness)
    
    const { error: rpcError } = await supabase.rpc('complete_appointment_and_release_funds', {
      p_appointment_id: appointmentId
    })

    if (rpcError) {
      console.error('❌ RPC Error completing appointment:', rpcError)
      return NextResponse.json(
        { error: 'execution_failed', message: 'Failed to complete appointment and release funds' },
        { status: 500 }
      )
    }

    console.log(`✅ Appointment ${appointmentId} completed successfully.`)

    return NextResponse.json({
      success: true,
      message: 'Appointment completed and funds released successfully'
    })

  } catch (error) {
    console.error('Unexpected error in appointment completion:', error)
    return NextResponse.json(
      { error: 'server_error', message: 'An internal error occurred' },
      { status: 500 }
    )
  }
}
