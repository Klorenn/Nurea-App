import { toast as sonnerToast } from "sonner"

interface ToastOptions {
  title?: string
  description?: string
  variant?: "default" | "destructive"
  duration?: number
}

export function useToast() {
  const toast = ({ title, description, variant, duration = 4000 }: ToastOptions) => {
    const message = title || description || ""
    const opts = {
      description: title ? description : undefined,
      duration,
    }

    if (variant === "destructive") {
      sonnerToast.error(message, opts)
    } else {
      sonnerToast.success(message, opts)
    }
  }

  return { toast }
}

export { sonnerToast as toast }
