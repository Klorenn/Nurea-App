import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    
    // Verificar autenticación
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json(
        { 
          error: 'unauthorized',
          message: 'Por favor, inicia sesión para subir documentos.'
        },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const appointmentId = formData.get('appointmentId') as string | null
    const professionalId = formData.get('professionalId') as string | null
    const name = formData.get('name') as string
    const description = formData.get('description') as string | null
    const category = formData.get('category') as string || 'other'

    if (!file) {
      return NextResponse.json(
        { 
          error: 'no_file',
          message: 'No se proporcionó ningún archivo.'
        },
        { status: 400 }
      )
    }

    if (!name || name.trim() === '') {
      return NextResponse.json(
        { 
          error: 'no_name',
          message: 'Por favor, proporciona un nombre para el documento.'
        },
        { status: 400 }
      )
    }

    // Validar tamaño (máximo 25MB para documentos médicos)
    if (file.size > 25 * 1024 * 1024) {
      return NextResponse.json(
        { 
          error: 'file_too_large',
          message: 'El archivo es demasiado grande. Máximo 25MB para documentos médicos.'
        },
        { status: 400 }
      )
    }

    // Validar tipo de archivo (solo tipos médicos seguros)
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/tiff',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
    ]
    
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { 
          error: 'invalid_file_type',
          message: 'Tipo de archivo no permitido. Solo se permiten PDF, imágenes médicas, Word y texto.'
        },
        { status: 400 }
      )
    }

    // Verificar que el usuario es paciente o profesional
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || (profile.role !== 'patient' && profile.role !== 'professional')) {
      return NextResponse.json(
        { 
          error: 'invalid_role',
          message: 'Solo pacientes y profesionales pueden subir documentos.'
        },
        { status: 403 }
      )
    }

    // Si hay appointmentId, verificar que el usuario tiene acceso
    if (appointmentId) {
      const { data: appointment } = await supabase
        .from('appointments')
        .select('patient_id, professional_id')
        .eq('id', appointmentId)
        .single()

      if (!appointment) {
        return NextResponse.json(
          { 
            error: 'appointment_not_found',
            message: 'La cita especificada no existe.'
          },
          { status: 404 }
        )
      }

      // Verificar que el usuario es el paciente o el profesional de la cita
      if (appointment.patient_id !== user.id && appointment.professional_id !== user.id) {
        return NextResponse.json(
          { 
            error: 'unauthorized',
            message: 'No tienes permiso para subir documentos para esta cita.'
          },
          { status: 403 }
        )
      }
    }

    // Subir archivo a Supabase Storage (bucket privado)
    const fileExt = file.name.split('.').pop()
    const timestamp = Date.now()
    const fileName = `${user.id}/${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
    const filePath = `documents/${fileName}`

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('documents')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type,
      })

    if (uploadError) {
      console.error('Error uploading file:', uploadError)
      return NextResponse.json(
        { 
          error: 'upload_failed',
          message: 'No se pudo subir el archivo. Por favor, intenta nuevamente.'
        },
        { status: 500 }
      )
    }

    // Obtener URL firmada (signed URL) para acceso privado
    const { data: signedUrlData } = await supabase.storage
      .from('documents')
      .createSignedUrl(filePath, 31536000) // 1 año de validez

    // Determinar patient_id y professional_id
    let finalPatientId = user.id
    let finalProfessionalId = professionalId || null

    if (profile.role === 'professional') {
      // Si es profesional, necesita patient_id
      if (appointmentId) {
        const { data: appointment } = await supabase
          .from('appointments')
          .select('patient_id')
          .eq('id', appointmentId)
          .single()
        
        if (appointment) {
          finalPatientId = appointment.patient_id
          finalProfessionalId = user.id
        }
      } else {
        return NextResponse.json(
          { 
            error: 'missing_patient',
            message: 'Los profesionales deben asociar el documento a una cita.'
          },
          { status: 400 }
        )
      }
    }

    // Crear registro en la base de datos
    const { data: document, error: documentError } = await supabase
      .from('documents')
      .insert({
        patient_id: finalPatientId,
        professional_id: finalProfessionalId,
        appointment_id: appointmentId || null,
        name: name.trim(),
        description: description?.trim() || null,
        file_name: file.name,
        file_url: signedUrlData?.signedUrl || filePath, // Usar signed URL si está disponible
        file_type: file.type,
        file_size: file.size,
        category: category,
        encrypted: true,
        access_level: profile.role === 'patient' ? 'patient_and_professional' : 'patient_and_professional',
        uploaded_by: user.id,
      })
      .select()
      .single()

    if (documentError) {
      console.error('Error creating document record:', documentError)
      // Intentar eliminar el archivo subido si falla la creación del registro
      await supabase.storage.from('documents').remove([filePath])
      
      return NextResponse.json(
        { 
          error: 'creation_failed',
          message: 'No se pudo crear el registro del documento. Por favor, intenta nuevamente.'
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      document: {
        id: document.id,
        name: document.name,
        file_name: document.file_name,
        file_type: document.file_type,
        file_size: document.file_size,
        category: document.category,
        uploaded_at: document.uploaded_at,
      },
      message: 'Documento subido exitosamente. Está protegido y solo accesible para ti y tu profesional.'
    })
  } catch (error) {
    console.error('Upload document error:', error)
    return NextResponse.json(
      { 
        error: 'server_error',
        message: 'Algo salió mal. Por favor, intenta nuevamente en unos momentos.'
      },
      { status: 500 }
    )
  }
}

