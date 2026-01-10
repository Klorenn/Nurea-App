/**
 * Calculate Response Time Utility
 * 
 * Calcula el tiempo de respuesta promedio de un profesional
 * basado en los mensajes entre paciente y profesional
 */

import { createClient } from '@/lib/supabase/server'

interface ResponseTimeData {
  averageHours: number
  averageMinutes: number
  formatted: string
  sampleSize: number
}

/**
 * Calcula el tiempo de respuesta promedio de un profesional
 * Analiza los mensajes donde el paciente envía primero y el profesional responde
 */
export async function calculateResponseTime(
  professionalId: string,
  patientId?: string
): Promise<ResponseTimeData> {
  try {
    const supabase = await createClient()

    // Obtener conversaciones donde el paciente envía primero
    let query = supabase
      .from('messages')
      .select('id, sender_id, receiver_id, created_at')
      .eq('receiver_id', professionalId)
      .order('created_at', { ascending: true })

    if (patientId) {
      query = query.eq('sender_id', patientId)
    }

    const { data: patientMessages, error: patientError } = await query

    if (patientError || !patientMessages || patientMessages.length === 0) {
      return {
        averageHours: 2,
        averageMinutes: 0,
        formatted: '2-4 horas',
        sampleSize: 0,
      }
    }

    // Para cada mensaje del paciente, buscar la respuesta del profesional
    const responseTimes: number[] = []

    for (let i = 0; i < patientMessages.length; i++) {
      const patientMsg = patientMessages[i]
      const patientMsgTime = new Date(patientMsg.created_at).getTime()

      // Buscar siguiente mensaje del profesional en la misma conversación
      const { data: professionalResponse } = await supabase
        .from('messages')
        .select('created_at')
        .eq('sender_id', professionalId)
        .eq('receiver_id', patientMsg.sender_id)
        .gt('created_at', patientMsg.created_at)
        .order('created_at', { ascending: true })
        .limit(1)
        .single()

      if (professionalResponse) {
        const responseTime = new Date(professionalResponse.created_at).getTime()
        const diffMs = responseTime - patientMsgTime
        const diffHours = diffMs / (1000 * 60 * 60)

        // Solo considerar respuestas dentro de 7 días (evitar outliers)
        if (diffHours > 0 && diffHours < 168) {
          responseTimes.push(diffHours)
        }
      }
    }

    if (responseTimes.length === 0) {
      return {
        averageHours: 2,
        averageMinutes: 0,
        formatted: '2-4 horas',
        sampleSize: 0,
      }
    }

    // Calcular promedio
    const averageHours = responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length
    const averageMinutes = Math.round((averageHours % 1) * 60)

    // Formatear
    let formatted: string
    if (averageHours < 1) {
      formatted = `${Math.round(averageHours * 60)} minutos`
    } else if (averageHours < 24) {
      const hours = Math.floor(averageHours)
      if (averageMinutes > 0) {
        formatted = `${hours}h ${averageMinutes}m`
      } else {
        formatted = `${hours} ${hours === 1 ? 'hora' : 'horas'}`
      }
    } else {
      const days = Math.floor(averageHours / 24)
      formatted = `${days} ${days === 1 ? 'día' : 'días'}`
    }

    return {
      averageHours,
      averageMinutes,
      formatted,
      sampleSize: responseTimes.length,
    }
  } catch (error) {
    console.error('Error calculando tiempo de respuesta:', error)
    return {
      averageHours: 2,
      averageMinutes: 0,
      formatted: '2-4 horas',
      sampleSize: 0,
    }
  }
}
