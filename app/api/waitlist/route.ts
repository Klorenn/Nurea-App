import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * POST /api/waitlist
 * Registra a alguien en la lista de espera de Nurea.
 * Body:
 *   - email        (required)
 *   - first_name   (optional)
 *   - last_name    (optional)
 *   - user_role    (optional) one of: patient | professional | curious
 *   - source       (optional) metadata about where the signup came from
 */
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}))
    const email: string | undefined = body?.email
    const first_name: string | undefined = body?.first_name
    const last_name: string | undefined = body?.last_name
    const user_role: string | undefined = body?.user_role
    const source: string | undefined = body?.source

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json(
        { success: false, error: 'Email inválido' },
        { status: 400 }
      )
    }

    if (user_role && !['patient', 'professional', 'curious'].includes(user_role)) {
      return NextResponse.json(
        { success: false, error: 'Rol inválido' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data, error } = await supabase
      .from('waitlist')
      .insert({
        email: email.toLowerCase().trim(),
        first_name: first_name?.trim() || null,
        last_name: last_name?.trim() || null,
        user_role: user_role || null,
        source: source || 'landing',
      })
      .select()
      .single()

    if (error) {
      // Tabla no existe
      if (error.code === '42P01') {
        return NextResponse.json(
          {
            success: false,
            error: 'La tabla waitlist no existe',
            message: 'Aplica los scripts en supabase/schema/ para crear la tabla.',
          },
          { status: 500 }
        )
      }

      // Email duplicado
      if (error.code === '23505') {
        const { count } = await supabase
          .from('waitlist')
          .select('*', { count: 'exact', head: true })
        return NextResponse.json({
          success: true,
          already_registered: true,
          message: 'Ya estás en la lista de espera',
          count: count || 0,
        })
      }

      // RLS
      if (error.message?.includes('row-level security') || error.code === '42501') {
        return NextResponse.json(
          {
            success: false,
            error: error.message,
            message:
              'Error de permisos. Asegúrate de haber aplicado las políticas RLS en supabase/schema/06_onboarding_and_blog.sql',
          },
          { status: 500 }
        )
      }

      return NextResponse.json(
        {
          success: false,
          error: error.message,
          message: 'No se pudo registrar. Intenta nuevamente.',
        },
        { status: 500 }
      )
    }

    const { count } = await supabase
      .from('waitlist')
      .select('*', { count: 'exact', head: true })

    return NextResponse.json({
      success: true,
      already_registered: false,
      message: 'Registro exitoso. Te avisaremos al lanzamiento.',
      data,
      count: count || 0,
    })
  } catch (error) {
    console.error('Error en waitlist API:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
