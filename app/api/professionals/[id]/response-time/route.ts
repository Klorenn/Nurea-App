import { createClient } from '@/lib/supabase/server'
import { NextResponse, type NextRequest } from 'next/server'
import { calculateResponseTime } from '@/lib/utils/calculate-response-time'

/**
 * GET /api/professionals/[id]/response-time
 * Calcula el tiempo de respuesta promedio de un profesional
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: professionalId } = await context.params
    const { searchParams } = new URL(request.url)
    const patientId = searchParams.get('patientId') || undefined

    if (!professionalId) {
      return NextResponse.json(
        {
          error: 'missing_professional_id',
          message: 'ID de profesional requerido',
        },
        { status: 400 }
      )
    }

    const responseTimeData = await calculateResponseTime(professionalId, patientId)

    return NextResponse.json({
      success: true,
      ...responseTimeData,
    })
  } catch (error) {
    console.error('Error en GET /api/professionals/[id]/response-time:', error)
    return NextResponse.json(
      {
        error: 'server_error',
        message: 'Error al calcular tiempo de respuesta',
      },
      { status: 500 }
    )
  }
}
