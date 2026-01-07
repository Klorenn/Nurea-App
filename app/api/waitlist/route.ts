import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * POST /api/waitlist
 * Guarda un email en la lista de espera
 */
export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Email inválido' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Verificar si la tabla waitlist existe, si no, crearla
    // Por ahora, insertamos en una tabla simple
    const { data, error } = await supabase
      .from('waitlist')
      .insert({
        email: email.toLowerCase().trim(),
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      // Si la tabla no existe
      if (error.code === '42P01') {
        console.error('Tabla waitlist no existe. Aplica la migración SQL primero.')
        return NextResponse.json(
          { 
            success: false,
            error: 'La tabla waitlist no existe. Por favor, aplica la migración SQL en Supabase primero.',
            message: 'Error de configuración del servidor'
          },
          { status: 500 }
        )
      }

      // Si es un error de duplicado, retornar éxito
      if (error.code === '23505') {
        // Obtener el conteo actual
        const { count } = await supabase
          .from('waitlist')
          .select('*', { count: 'exact', head: true })
        
        return NextResponse.json({
          success: true,
          message: 'Ya estás en la lista de espera',
          count: count || 0
        })
      }

      console.error('Error guardando email en waitlist:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      })
      
      // Si es un error de RLS, dar un mensaje más específico
      if (error.message?.includes('row-level security') || error.code === '42501') {
        return NextResponse.json(
          { 
            success: false,
            error: error.message || 'Error de permisos',
            message: 'Error de configuración de seguridad. Por favor, ejecuta el script QUICK_FIX_WAITLIST_RLS.sql en Supabase.',
            code: error.code
          },
          { status: 500 }
        )
      }
      
      return NextResponse.json(
        { 
          success: false,
          error: error.message || 'Error al guardar el email',
          message: 'No se pudo agregar tu email. Por favor, intenta nuevamente.',
          code: error.code
        },
        { status: 500 }
      )
    }

    // Obtener el nuevo conteo después de insertar
    const { count } = await supabase
      .from('waitlist')
      .select('*', { count: 'exact', head: true })

    return NextResponse.json({
      success: true,
      message: 'Email agregado a la lista de espera',
      data,
      count: count || 0
    })
  } catch (error) {
    console.error('Error en waitlist API:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

