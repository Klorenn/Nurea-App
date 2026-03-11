"use client"

import dynamic from "next/dynamic"
import "@/components/map-styles.css"
import type { ProfessionalWithCoords } from "./search-map-inner"

const SearchMapInner = dynamic(
  () => import("./search-map-inner").then((m) => ({ default: m.SearchMapInner })),
  {
  ssr: false,
  loading: () => (
    <div className="h-full w-full rounded-xl bg-muted/30 flex items-center justify-center text-muted-foreground">
      Cargando mapa…
    </div>
  ),
  }
)

export interface MapProps {
  professionals: ProfessionalWithCoords[]
  onAgendar: (prof: ProfessionalWithCoords) => void
  isSpanish?: boolean
  className?: string
}

export function Map(props: MapProps) {
  return <SearchMapInner {...props} />
}

export type { ProfessionalWithCoords }
