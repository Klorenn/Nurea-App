import Link from "next/link"
import { AlertCircle } from "lucide-react"

export default function AuthCodeErrorPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
      <div className="w-full max-w-md p-6 sm:p-8 bg-white dark:bg-slate-900 rounded-2xl shadow-md border border-slate-200/80 dark:border-slate-700/80">
        <div className="space-y-6 text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-red-100 dark:bg-red-500/20 flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Enlace inválido o expirado
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              El enlace de verificación ya no es válido. Esto puede ocurrir si ya lo usaste o si ha expirado.
            </p>
          </div>
          <div className="space-y-3">
            <Link
              href="/login"
              className="block w-full py-3 px-4 rounded-xl font-semibold text-white bg-teal-600 hover:bg-teal-700 transition-colors text-center"
            >
              Ir a iniciar sesión
            </Link>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Si necesitas un nuevo enlace de verificación, inicia sesión y solicita uno nuevo.
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
