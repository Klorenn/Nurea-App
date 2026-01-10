/**
 * Action Feedback Component
 * 
 * Muestra feedback visual tras acciones (guardar, cancelar, subir)
 * Usa toast notifications para feedback no intrusivo
 */

import { toast } from "sonner"
import { CheckCircle2, XCircle, AlertCircle, Loader2 } from "lucide-react"

export type FeedbackType = 'success' | 'error' | 'warning' | 'loading'

interface ActionFeedbackOptions {
  type: FeedbackType
  title: string
  description?: string
  duration?: number
}

export function showActionFeedback({
  type,
  title,
  description,
  duration = 3000
}: ActionFeedbackOptions) {
  switch (type) {
    case 'success':
      toast.success(title, {
        description,
        duration,
        icon: <CheckCircle2 className="h-4 w-4" />,
      })
      break
    case 'error':
      toast.error(title, {
        description,
        duration,
        icon: <XCircle className="h-4 w-4" />,
      })
      break
    case 'warning':
      toast.warning(title, {
        description,
        duration,
        icon: <AlertCircle className="h-4 w-4" />,
      })
      break
    case 'loading':
      toast.loading(title, {
        description,
        duration,
        icon: <Loader2 className="h-4 w-4 animate-spin" />,
      })
      break
  }
}

// Helpers específicos para acciones comunes
export const actionFeedback = {
  saved: (item?: string) => showActionFeedback({
    type: 'success',
    title: item ? `${item} guardado exitosamente` : 'Guardado exitosamente',
    description: 'Los cambios se han aplicado correctamente'
  }),
  
  cancelled: (item?: string) => showActionFeedback({
    type: 'warning',
    title: item ? `${item} cancelado` : 'Cancelado',
    description: 'La operación ha sido cancelada'
  }),
  
  uploaded: (file?: string) => showActionFeedback({
    type: 'success',
    title: file ? `Archivo ${file} subido exitosamente` : 'Archivo subido exitosamente',
    description: 'El archivo está disponible'
  }),
  
  deleted: (item?: string) => showActionFeedback({
    type: 'success',
    title: item ? `${item} eliminado exitosamente` : 'Eliminado exitosamente',
    description: 'El elemento ha sido removido'
  }),
  
  error: (message: string, description?: string) => showActionFeedback({
    type: 'error',
    title: message,
    description,
    duration: 5000
  }),
  
  loading: (message: string) => showActionFeedback({
    type: 'loading',
    title: message,
    duration: 2000
  })
}
