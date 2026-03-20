import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    
    // 1. Verify Authentication
    const { data: { user: professionalUser }, error: userError } = await supabase.auth.getUser()
    if (userError || !professionalUser) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
    }

    // 2. Verify Role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', professionalUser.id)
      .single()

    if (profile?.role !== 'professional') {
      return NextResponse.json({ error: 'forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { patientId, date, time, type, duration, notes } = body

    if (!patientId || !date || !time || !type || !duration) {
      return NextResponse.json(
        { error: 'missing_fields', message: 'Todos los campos son obligatorios.' },
        { status: 400 }
      )
    }

    // 3. Create Appointment
    const { data: appointment, error: appointmentError } = await supabase
      .from('appointments')
      .insert({
        patient_id: patientId,
        professional_id: professionalUser.id,
        appointment_date: date,
        appointment_time: time,
        duration_minutes: parseInt(duration),
        type,
        status: 'confirmed', // Appointments created by pro are auto-confirmed
        payment_status: 'paid', // Assuming professional handles payment or it's a private arrangement
        is_online: type === 'online',
        meeting_link: null // Se asigna en el trigger post-insert usando el appointment.id
      })
      .select()
      .single()

    if (appointmentError) {
      console.error('Error creating local appointment:', appointmentError)
      return NextResponse.json(
        { error: 'create_failed', message: 'No se pudo crear la cita.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      appointment,
      message: 'Cita agendada exitosamente.'
    })
  } catch (error) {
    console.error('Create appointment error:', error)
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }
}
