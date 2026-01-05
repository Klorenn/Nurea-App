import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * GET /api/professional/settings
 * Obtiene la configuración del profesional actual
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
          message: 'Por favor, inicia sesión para ver tu configuración.'
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

    // Obtener configuración del profesional
    // Usaremos la tabla professionals para almacenar preferencias
    const { data: professional, error: professionalError } = await supabase
      .from('professionals')
      .select('settings, notification_preferences')
      .eq('id', user.id)
      .single()

    if (professionalError && professionalError.code !== 'PGRST116') {
      console.error('Error fetching professional settings:', professionalError)
      return NextResponse.json(
        { 
          error: 'fetch_failed',
          message: 'No pudimos obtener tu configuración. Por favor, intenta nuevamente.'
        },
        { status: 500 }
      )
    }

    // Valores por defecto
    const defaultSettings = {
      notifications: {
        appointments: true,
        messages: true,
        payments: true,
      },
      appearance: {
        darkMode: false,
      },
      privacy: {
        profileVisible: true,
      },
      language: 'es',
    }

    // Combinar configuración existente con defaults
    const settings = {
      ...defaultSettings,
      ...(professional?.settings || {}),
      notifications: {
        ...defaultSettings.notifications,
        ...(professional?.notification_preferences || {}),
      },
    }

    return NextResponse.json({
      success: true,
      settings
    })
  } catch (error) {
    console.error('Get professional settings error:', error)
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
 * PUT /api/professional/settings
 * Actualiza la configuración del profesional
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
          message: 'Por favor, inicia sesión para actualizar tu configuración.'
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
          message: 'Solo los profesionales pueden actualizar su configuración.'
        },
        { status: 403 }
      )
    }

    const body = await request.json()
    const {
      notifications,
      appearance,
      privacy,
      language,
    } = body

    // Preparar actualización
    const updateData: any = {
      updated_at: new Date().toISOString(),
    }

    // Actualizar preferencias de notificaciones
    if (notifications) {
      updateData.notification_preferences = notifications
    }

    // Actualizar configuración general
    if (appearance || privacy || language) {
      const { data: currentProfessional } = await supabase
        .from('professionals')
        .select('settings')
        .eq('id', user.id)
        .single()

      const currentSettings = currentProfessional?.settings || {}
      updateData.settings = {
        ...currentSettings,
        ...(appearance && { appearance }),
        ...(privacy && { privacy }),
        ...(language && { language }),
      }
    }

    // Actualizar profesional
    const { data: updatedProfessional, error: professionalError } = await supabase
      .from('professionals')
      .update(updateData)
      .eq('id', user.id)
      .select()
      .single()

    if (professionalError) {
      console.error('Error updating professional settings:', professionalError)
      return NextResponse.json(
        { 
          error: 'update_failed',
          message: 'No pudimos actualizar tu configuración. Por favor, intenta nuevamente.'
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Configuración actualizada exitosamente.',
      settings: {
        notifications: updatedProfessional.notification_preferences || {},
        ...(updatedProfessional.settings || {}),
      }
    })
  } catch (error) {
    console.error('Update professional settings error:', error)
    return NextResponse.json(
      { 
        error: 'server_error',
        message: 'Algo salió mal. Por favor, intenta nuevamente en unos momentos.'
      },
      { status: 500 }
    )
  }
}

