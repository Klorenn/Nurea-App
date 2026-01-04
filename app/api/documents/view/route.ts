import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const documentId = searchParams.get('id')

    if (!documentId) {
      return NextResponse.json(
        { 
          error: 'missing_id',
          message: 'Por favor, proporciona el ID del documento.'
        },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    
    // Verificar autenticación
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json(
        { 
          error: 'unauthorized',
          message: 'Por favor, inicia sesión para ver documentos.'
        },
        { status: 401 }
      )
    }

    // Obtener el documento y verificar permisos
    const { data: document, error: documentError } = await supabase
      .from('documents')
      .select(`
        *,
        patient:profiles!documents_patient_id_fkey(id, first_name, last_name),
        professional:profiles!documents_professional_id_fkey(id, first_name, last_name),
        appointment:appointments(id, appointment_date, appointment_time)
      `)
      .eq('id', documentId)
      .single()

    if (documentError || !document) {
      return NextResponse.json(
        { 
          error: 'document_not_found',
          message: 'No se encontró el documento o no tienes permiso para accederlo.'
        },
        { status: 404 }
      )
    }

    // Verificar permisos de acceso
    const hasAccess = 
      document.patient_id === user.id ||
      (document.professional_id === user.id && 
       (document.access_level === 'patient_and_professional' || document.access_level === 'professional_only'))

    if (!hasAccess) {
      return NextResponse.json(
        { 
          error: 'unauthorized',
          message: 'No tienes permiso para ver este documento.'
        },
        { status: 403 }
      )
    }

    // Registrar acceso
    await supabase
      .from('documents')
      .update({
        last_accessed_at: new Date().toISOString(),
        access_count: (document.access_count || 0) + 1,
      })
      .eq('id', documentId)

    // Obtener URL firmada del archivo para visualización
    const filePath = document.file_url.includes('/') 
      ? document.file_url.split('/').slice(-2).join('/')
      : document.file_url

    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from('documents')
      .createSignedUrl(filePath, 3600) // 1 hora de validez

    if (signedUrlError || !signedUrlData) {
      console.error('Error creating signed URL:', signedUrlError)
      return NextResponse.json(
        { 
          error: 'view_failed',
          message: 'No se pudo generar el enlace de visualización. Por favor, intenta nuevamente.'
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      document: {
        id: document.id,
        name: document.name,
        description: document.description,
        file_name: document.file_name,
        file_type: document.file_type,
        file_size: document.file_size,
        category: document.category,
        uploaded_at: document.uploaded_at,
        patient: document.patient,
        professional: document.professional,
        appointment: document.appointment,
      },
      viewUrl: signedUrlData.signedUrl,
    })
  } catch (error) {
    console.error('View document error:', error)
    return NextResponse.json(
      { 
        error: 'server_error',
        message: 'Algo salió mal. Por favor, intenta nuevamente en unos momentos.'
      },
      { status: 500 }
    )
  }
}

