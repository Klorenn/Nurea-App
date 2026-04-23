"use client"

import { Suspense, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { loadingFullViewportClassName } from "@/lib/loading-layout"

function SearchRedirect() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const params = new URLSearchParams()
    const q = searchParams.get('q')
    if (q) params.set('q', q)
    const specialty = searchParams.get('specialty')
    if (specialty) params.set('specialty', specialty)
    const location = searchParams.get('location')
    if (location) params.set('location', location)
    const category = searchParams.get('category')
    if (category) params.set('category', category)
    const destination = params.toString() ? `/explore?${params.toString()}` : '/explore'
    router.replace(destination)
  }, [router, searchParams])

  return (
    <div className={loadingFullViewportClassName("bg-slate-50 dark:bg-slate-950")}>
      <div className="flex flex-col items-center gap-6 max-w-sm text-center px-4">
        <div className="relative">
          <div className="h-16 w-16 rounded-full border-4 border-teal-500/20 border-t-teal-500 animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-8 w-8 rounded-full bg-teal-500/10 animate-pulse" />
          </div>
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
            Buscando especialistas...
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Te estamos redirigiendo a nuestra herramienta de búsqueda actualizada.
          </p>
        </div>
      </div>
    </div>
  )
}

const LoadingFallback = () => (
  <div className={loadingFullViewportClassName("bg-slate-50 dark:bg-slate-950")}>
    <div className="h-16 w-16 rounded-full border-4 border-teal-500/20 border-t-teal-500 animate-spin" />
  </div>
)

export default function SearchPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <SearchRedirect />
    </Suspense>
  )
}
