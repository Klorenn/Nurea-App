import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * POST /api/professional/upload-avatar
 * Sube y actualiza el avatar del profesional
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    // Verificar autenticación
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json(
        {
          error: 'unauthorized',
          message: 'Por favor, inicia sesión para subir tu avatar.',
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
          message: 'Solo los profesionales pueden subir avatares.',
        },
        { status: 403 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        {
          error: 'no_file',
          message: 'No se proporcionó ningún archivo.',
        },
        { status: 400 }
      )
    }

    // Validar tamaño (máximo 2MB)
    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json(
        {
          error: 'file_too_large',
          message: 'El archivo es demasiado grande. Máximo 2MB.',
        },
        { status: 400 }
      )
    }

    // Validar tipo de archivo
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          error: 'invalid_file_type',
          message: 'Tipo de archivo no permitido. Solo se permiten JPG, PNG, GIF o WebP.',
        },
        { status: 400 }
      )
    }

    // Generar nombre único para el archivo
    const fileExt = file.name.split('.').pop()
    const fileName = `${user.id}/${Date.now()}.${fileExt}`
    const filePath = `avatars/${fileName}`

    // Subir archivo a Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (uploadError) {
      console.error('Error uploading avatar:', uploadError)
      return NextResponse.json(
        {
          error: 'upload_failed',
          message: 'No se pudo subir el archivo. Por favor, intenta nuevamente.',
        },
        { status: 500 }
      )
    }

    // Obtener URL pública
    const {
      data: { publicUrl },
    } = supabase.storage.from('avatars').getPublicUrl(filePath)

    // Actualizar avatar_url en profiles
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ avatar_url: publicUrl })
      .eq('id', user.id)

    if (updateError) {
      console.error('Error updating avatar URL:', updateError)
      // Intentar eliminar el archivo subido si falla el update
      await supabase.storage.from('avatars').remove([filePath]).catch(console.error)

      return NextResponse.json(
        {
          error: 'update_failed',
          message: 'Se subió el archivo pero no pudimos actualizar tu perfil. Por favor, intenta nuevamente.',
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      avatarUrl: publicUrl,
      message: 'Avatar actualizado exitosamente.',
    })
  } catch (error) {
    console.error('Error en POST /api/professional/upload-avatar:', error)
    return NextResponse.json(
      {
        error: 'server_error',
        message: 'Algo salió mal. Por favor, intenta nuevamente en unos momentos.',
      },
      { status: 500 }
    )
  }
}
