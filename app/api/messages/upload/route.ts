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
          message: 'Por favor, inicia sesión para subir archivos.'
        },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { 
          error: 'no_file',
          message: 'No se proporcionó ningún archivo.'
        },
        { status: 400 }
      )
    }

    // Validar tamaño (máximo 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { 
          error: 'file_too_large',
          message: 'El archivo es demasiado grande. Máximo 10MB.'
        },
        { status: 400 }
      )
    }

    // Validar tipo de archivo
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/png',
      'text/plain',
    ]
    
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { 
          error: 'invalid_file_type',
          message: 'Tipo de archivo no permitido. Solo se permiten PDF, Word, imágenes y texto.'
        },
        { status: 400 }
      )
    }

    // Sanitizar nombre de archivo antes de subir
    const { sanitizeText } = await import('@/lib/utils/sanitize')
    const sanitizedFileName = sanitizeText(file.name.replace(/[^a-zA-Z0-9.\-_ ]/g, '_')).substring(0, 255)

    // Subir archivo a Supabase Storage
    const fileExt = file.name.split('.').pop()?.toLowerCase() || 'bin'
    const fileName = `${user.id}/${Date.now()}-${sanitizedFileName}`
    const filePath = `messages/${fileName}`

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('messages')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
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

    // Obtener URL pública
    const { data: { publicUrl } } = supabase.storage
      .from('messages')
      .getPublicUrl(filePath)

    return NextResponse.json({
      success: true,
      url: publicUrl,
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
    })
  } catch (error) {
    console.error('Upload file error:', error)
    return NextResponse.json(
      { 
        error: 'server_error',
        message: 'Algo salió mal. Por favor, intenta nuevamente en unos momentos.'
      },
      { status: 500 }
    )
  }
}

