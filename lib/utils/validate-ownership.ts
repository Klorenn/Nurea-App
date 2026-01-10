/**
 * Utilidades de validación de ownership
 * 
 * Verifica que un recurso pertenezca al usuario autenticado
 * Previene acceso cruzado a recursos
 */

import { SupabaseClient } from '@supabase/supabase-js'

/**
 * Valida que una cita pertenezca al usuario (como paciente o profesional)
 */
export async function validateAppointmentOwnership(
  supabase: SupabaseClient,
  appointmentId: string,
  userId: string
): Promise<{ valid: boolean; appointment: any | null; error?: string }> {
  const { sanitizeId } = await import('@/lib/utils/sanitize')
  const sanitizedAppointmentId = sanitizeId(appointmentId)
  
  if (!sanitizedAppointmentId || sanitizedAppointmentId !== appointmentId) {
    return { valid: false, appointment: null, error: 'Invalid appointment ID' }
  }

  const { data: appointment, error } = await supabase
    .from('appointments')
    .select('id, patient_id, professional_id, status')
    .eq('id', sanitizedAppointmentId)
    .single()

  if (error || !appointment) {
    return { valid: false, appointment: null, error: 'Appointment not found' }
  }

  const isPatient = appointment.patient_id === userId
  const isProfessional = appointment.professional_id === userId

  if (!isPatient && !isProfessional) {
    return { valid: false, appointment, error: 'Unauthorized: You do not have access to this appointment' }
  }

  return { valid: true, appointment }
}

/**
 * Valida que un documento pertenezca al usuario o que tenga acceso
 */
export async function validateDocumentOwnership(
  supabase: SupabaseClient,
  documentId: string,
  userId: string
): Promise<{ valid: boolean; document: any | null; error?: string }> {
  const { sanitizeId } = await import('@/lib/utils/sanitize')
  const sanitizedDocumentId = sanitizeId(documentId)
  
  if (!sanitizedDocumentId || sanitizedDocumentId !== documentId) {
    return { valid: false, document: null, error: 'Invalid document ID' }
  }

  const { data: document, error } = await supabase
    .from('documents')
    .select('id, patient_id, professional_id, is_public, access_level')
    .eq('id', sanitizedDocumentId)
    .single()

  if (error || !document) {
    return { valid: false, document: null, error: 'Document not found' }
  }

  // Si es público y está marcado como público, permitir acceso
  if (document.is_public) {
    return { valid: true, document }
  }

  // Verificar ownership
  const isPatient = document.patient_id === userId
  const isProfessional = document.professional_id === userId

  if (!isPatient && !isProfessional) {
    return { valid: false, document, error: 'Unauthorized: You do not have access to this document' }
  }

  return { valid: true, document }
}

/**
 * Valida que un mensaje pertenezca a la conversación del usuario
 */
export async function validateMessageOwnership(
  supabase: SupabaseClient,
  messageId: string,
  userId: string
): Promise<{ valid: boolean; message: any | null; error?: string }> {
  const { sanitizeId } = await import('@/lib/utils/sanitize')
  const sanitizedMessageId = sanitizeId(messageId)
  
  if (!sanitizedMessageId || sanitizedMessageId !== messageId) {
    return { valid: false, message: null, error: 'Invalid message ID' }
  }

  const { data: message, error } = await supabase
    .from('messages')
    .select('id, sender_id, receiver_id')
    .eq('id', sanitizedMessageId)
    .single()

  if (error || !message) {
    return { valid: false, message: null, error: 'Message not found' }
  }

  const isSender = message.sender_id === userId
  const isReceiver = message.receiver_id === userId

  if (!isSender && !isReceiver) {
    return { valid: false, message, error: 'Unauthorized: You do not have access to this message' }
  }

  return { valid: true, message }
}

/**
 * Valida que una review pertenezca al usuario
 */
export async function validateReviewOwnership(
  supabase: SupabaseClient,
  reviewId: string,
  userId: string
): Promise<{ valid: boolean; review: any | null; error?: string }> {
  const { sanitizeId } = await import('@/lib/utils/sanitize')
  const sanitizedReviewId = sanitizeId(reviewId)
  
  if (!sanitizedReviewId || sanitizedReviewId !== reviewId) {
    return { valid: false, review: null, error: 'Invalid review ID' }
  }

  const { data: review, error } = await supabase
    .from('reviews')
    .select('id, patient_id, professional_id')
    .eq('id', sanitizedReviewId)
    .single()

  if (error || !review) {
    return { valid: false, review: null, error: 'Review not found' }
  }

  // Solo el paciente que escribió la review puede acceder a ella
  if (review.patient_id !== userId) {
    return { valid: false, review, error: 'Unauthorized: You do not have access to this review' }
  }

  return { valid: true, review }
}
