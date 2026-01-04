import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * GET /api/professional/clinical-notes
 * Obtiene las notas clínicas del profesional autenticado
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
          message: 'Por favor, inicia sesión para ver tus notas clínicas.'
        },
        { status: 401 }
      )
    }

    // Verificar que el usuario sea profesional
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'professional') {
      return NextResponse.json(
        { 
          error: 'forbidden',
          message: 'Solo los profesionales pueden acceder a esta información.'
        },
        { status: 403 }
      )
    }

    // Obtener parámetros de consulta
    const { searchParams } = new URL(request.url)
    const patientId = searchParams.get('patientId')
    const appointmentId = searchParams.get('appointmentId')

    // Construir query
    let query = supabase
      .from('clinical_notes')
      .select(`
        *,
        patient:profiles!clinical_notes_patient_id_fkey(
          id,
          first_name,
          last_name
        ),
        appointment:appointments(
          id,
          appointment_date,
          appointment_time
        )
      `)
      .eq('professional_id', user.id)
      .order('date', { ascending: false })
      .order('created_at', { ascending: false })

    // Aplicar filtros
    if (patientId) {
      query = query.eq('patient_id', patientId)
    }

    if (appointmentId) {
      query = query.eq('appointment_id', appointmentId)
    }

    const { data: notes, error: notesError } = await query

    if (notesError) {
      console.error('Error fetching clinical notes:', notesError)
      return NextResponse.json(
        { 
          error: 'fetch_failed',
          message: 'No pudimos obtener tus notas clínicas. Por favor, intenta nuevamente.'
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      notes: notes || [],
      count: notes?.length || 0
    })
  } catch (error) {
    console.error('Get clinical notes error:', error)
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
 * POST /api/professional/clinical-notes
 * Crea una nueva nota clínica
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    
    // Verificar autenticación
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json(
        { 
          error: 'unauthorized',
          message: 'Por favor, inicia sesión para crear notas clínicas.'
        },
        { status: 401 }
      )
    }

    // Verificar que el usuario sea profesional
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'professional') {
      return NextResponse.json(
        { 
          error: 'forbidden',
          message: 'Solo los profesionales pueden crear notas clínicas.'
        },
        { status: 403 }
      )
    }

    const { patientId, appointmentId, notes, date } = await request.json()

    if (!patientId || !notes) {
      return NextResponse.json(
        { 
          error: 'missing_fields',
          message: 'Por favor, completa todos los campos requeridos.'
        },
        { status: 400 }
      )
    }

    // Verificar que el paciente tenga al menos una cita con este profesional
    const { data: appointmentCheck } = await supabase
      .from('appointments')
      .select('id')
      .eq('professional_id', user.id)
      .eq('patient_id', patientId)
      .limit(1)
      .single()

    if (!appointmentCheck) {
      return NextResponse.json(
        { 
          error: 'invalid_patient',
          message: 'Solo puedes crear notas para pacientes que tienen citas contigo.'
        },
        { status: 403 }
      )
    }

    // Crear la nota
    const { data: note, error: noteError } = await supabase
      .from('clinical_notes')
      .insert({
        professional_id: user.id,
        patient_id: patientId,
        appointment_id: appointmentId || null,
        notes: notes,
        date: date || new Date().toISOString().split('T')[0],
      })
      .select()
      .single()

    if (noteError) {
      console.error('Error creating clinical note:', noteError)
      return NextResponse.json(
        { 
          error: 'create_failed',
          message: 'No pudimos crear la nota clínica. Por favor, intenta nuevamente.'
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      note: note
    })
  } catch (error) {
    console.error('Create clinical note error:', error)
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
 * PUT /api/professional/clinical-notes
 * Actualiza una nota clínica existente
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
          message: 'Por favor, inicia sesión para actualizar notas clínicas.'
        },
        { status: 401 }
      )
    }

    // Verificar que el usuario sea profesional
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'professional') {
      return NextResponse.json(
        { 
          error: 'forbidden',
          message: 'Solo los profesionales pueden actualizar notas clínicas.'
        },
        { status: 403 }
      )
    }

    const { id, notes, date } = await request.json()

    if (!id || !notes) {
      return NextResponse.json(
        { 
          error: 'missing_fields',
          message: 'Por favor, completa todos los campos requeridos.'
        },
        { status: 400 }
      )
    }

    // Verificar que la nota pertenezca al profesional
    const { data: existingNote } = await supabase
      .from('clinical_notes')
      .select('professional_id')
      .eq('id', id)
      .single()

    if (!existingNote || existingNote.professional_id !== user.id) {
      return NextResponse.json(
        { 
          error: 'not_found',
          message: 'No se encontró la nota o no tienes permiso para editarla.'
        },
        { status: 404 }
      )
    }

    // Actualizar la nota
    const { data: note, error: noteError } = await supabase
      .from('clinical_notes')
      .update({
        notes: notes,
        date: date || existingNote.date,
      })
      .eq('id', id)
      .eq('professional_id', user.id)
      .select()
      .single()

    if (noteError) {
      console.error('Error updating clinical note:', noteError)
      return NextResponse.json(
        { 
          error: 'update_failed',
          message: 'No pudimos actualizar la nota clínica. Por favor, intenta nuevamente.'
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      note: note
    })
  } catch (error) {
    console.error('Update clinical note error:', error)
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
 * DELETE /api/professional/clinical-notes
 * Elimina una nota clínica
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
          message: 'Por favor, inicia sesión para eliminar notas clínicas.'
        },
        { status: 401 }
      )
    }

    // Verificar que el usuario sea profesional
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'professional') {
      return NextResponse.json(
        { 
          error: 'forbidden',
          message: 'Solo los profesionales pueden eliminar notas clínicas.'
        },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { 
          error: 'missing_id',
          message: 'Se requiere el ID de la nota.'
        },
        { status: 400 }
      )
    }

    // Verificar que la nota pertenezca al profesional
    const { data: existingNote } = await supabase
      .from('clinical_notes')
      .select('professional_id')
      .eq('id', id)
      .single()

    if (!existingNote || existingNote.professional_id !== user.id) {
      return NextResponse.json(
        { 
          error: 'not_found',
          message: 'No se encontró la nota o no tienes permiso para eliminarla.'
        },
        { status: 404 }
      )
    }

    // Eliminar la nota
    const { error: deleteError } = await supabase
      .from('clinical_notes')
      .delete()
      .eq('id', id)
      .eq('professional_id', user.id)

    if (deleteError) {
      console.error('Error deleting clinical note:', deleteError)
      return NextResponse.json(
        { 
          error: 'delete_failed',
          message: 'No pudimos eliminar la nota clínica. Por favor, intenta nuevamente.'
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true
    })
  } catch (error) {
    console.error('Delete clinical note error:', error)
    return NextResponse.json(
      { 
        error: 'server_error',
        message: 'Algo salió mal. Por favor, intenta nuevamente en unos momentos.'
      },
      { status: 500 }
    )
  }
}

