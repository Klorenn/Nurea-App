import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * GET /api/waitlist/count
 * Obtiene el conteo total de usuarios en la lista de espera
 */
export async function GET() {
  try {
    const supabase = await createClient()

    // Usar la función de Supabase para obtener el conteo
    const { data, error } = await supabase.rpc('get_waitlist_count')

    if (error) {
      // Si la función no existe, hacer un count manual
      const { count, error: countError } = await supabase
        .from('waitlist')
        .select('*', { count: 'exact', head: true })

      if (countError) {
        console.error('Error obteniendo conteo de waitlist:', countError)
        // Si la tabla no existe, retornar 0
        return NextResponse.json({ count: 0 })
      }

      return NextResponse.json({ count: count || 0 })
    }

    return NextResponse.json({ count: data || 0 })
  } catch (error) {
    console.error('Error en waitlist count API:', error)
    return NextResponse.json({ count: 0 })
  }
}

