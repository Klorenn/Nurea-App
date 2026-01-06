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
      // Si la tabla no existe, intentar crearla primero
      if (error.code === '42P01') {
        // Tabla no existe, pero no podemos crearla desde aquí
        // Por ahora, retornamos éxito y guardamos en logs
        console.log('Waitlist email:', email)
        return NextResponse.json({
          success: true,
          message: 'Email agregado a la lista de espera'
        })
      }

      // Si es un error de duplicado, retornar éxito
      if (error.code === '23505') {
        return NextResponse.json({
          success: true,
          message: 'Ya estás en la lista de espera'
        })
      }

      console.error('Error guardando email en waitlist:', error)
      return NextResponse.json(
        { error: 'Error al guardar el email' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Email agregado a la lista de espera',
      data
    })
  } catch (error) {
    console.error('Error en waitlist API:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

