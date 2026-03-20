"use client"

import { MapPin } from "lucide-react"

export default function OthersPage() {
  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Otros Recursos</h1>
        <p className="text-muted-foreground mt-1">
          Encuentre centros de salud, laboratorios y convenios cercanos.
        </p>
      </div>
      <div className="flex flex-col items-center justify-center py-16 text-center gap-4">
        <MapPin className="h-12 w-12 text-muted-foreground opacity-40" aria-hidden="true" />
        <p className="text-muted-foreground font-medium">Esta funcionalidad estará disponible próximamente.</p>
      </div>
    </div>
  )
}
