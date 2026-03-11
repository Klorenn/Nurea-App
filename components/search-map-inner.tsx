"use client"

import { useEffect, useRef } from "react"
import L from "leaflet"
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import { Button } from "@/components/ui/button"
import { Calendar } from "lucide-react"
import { cn } from "@/lib/utils"

/** Fix Leaflet default icon in Next.js (evita "window is not defined" y rutas rotas de iconos). */
function useLeafletIconFix() {
  useEffect(() => {
    if (typeof window === "undefined") return
    const L = require("leaflet")
    const DefaultIcon = L.Icon.Default.prototype as Record<string, unknown>
    if ("_getIconUrl" in DefaultIcon) delete DefaultIcon._getIconUrl
    L.Icon.Default.mergeOptions({
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    })
  }, [])
}

export interface ProfessionalWithCoords {
  id: string
  name: string
  specialty: string
  specialtyEn?: string
  image: string
  rating: number
  price: string | number
  location?: string
  lat: number
  lng: number
  consultationTypes?: string[]
  stellarWallet?: string | null
}

interface MapUpdaterProps {
  professionals: ProfessionalWithCoords[]
}

function MapUpdater({ professionals }: MapUpdaterProps) {
  const map = useMap()
  const prevLenRef = useRef(0)

  useEffect(() => {
    if (!professionals.length) return
    const points = professionals.map((p) => [p.lat, p.lng] as [number, number])
    if (points.length === 1) {
      map.flyTo([points[0][0], points[0][1]], 14, { duration: 0.8 })
      return
    }
    const bounds = L.latLngBounds(points)
    map.flyToBounds(bounds, { padding: [40, 40], duration: 0.8, maxZoom: 12 })
    prevLenRef.current = professionals.length
  }, [map, professionals])

  return null
}

function createMarkerIcon(rating: number, price: string | number) {
  const priceStr = typeof price === "number" ? String(price) : price
  const priceDisplay = priceStr.replace(/\s/g, "").slice(0, 12) // ej. "45.000" o "35000"
  return L.divIcon({
    className: "nurea-marker-wrapper",
    html: `
      <div class="nurea-marker-badge">
        <span class="nurea-marker-rating">⭐ ${rating.toFixed(1)}</span>
        <span class="nurea-marker-price">$${priceDisplay}</span>
      </div>
    `,
    iconSize: [80, 44],
    iconAnchor: [40, 44],
  })
}

interface SearchMapInnerProps {
  professionals: ProfessionalWithCoords[]
  onAgendar: (prof: ProfessionalWithCoords) => void
  isSpanish?: boolean
  className?: string
}

function SearchMapInner({
  professionals,
  onAgendar,
  isSpanish = true,
  className,
}: SearchMapInnerProps) {
  useLeafletIconFix()

  const center: [number, number] =
    professionals.length > 0
      ? [professionals[0].lat, professionals[0].lng]
      : [-33.4489, -70.6693]

  return (
    <div className={cn("h-full w-full rounded-xl overflow-hidden bg-muted/30", className)}>
      <MapContainer
        center={center}
        zoom={6}
        className="h-full w-full z-0"
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapUpdater professionals={professionals} />
        {professionals.map((prof) => (
          <Marker
            key={prof.id}
            position={[prof.lat, prof.lng]}
            icon={createMarkerIcon(prof.rating, prof.price)}
          >
            <Popup className="nurea-popup" minWidth={260} maxWidth={320}>
              <div className="flex gap-3 p-1">
                <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-muted">
                  <img
                    src={prof.image || "/placeholder.svg"}
                    alt={prof.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-foreground truncate">{prof.name}</p>
                  <p className="text-sm text-muted-foreground truncate">
                    {isSpanish ? prof.specialty : (prof.specialtyEn || prof.specialty)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    ⭐ {prof.rating.toFixed(1)} · {prof.location || ""}
                  </p>
                  <Button
                    size="sm"
                    className="mt-2 w-full rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
                    onClick={() => onAgendar(prof)}
                  >
                    <Calendar className="h-3.5 w-3.5 mr-2" />
                    {isSpanish ? "Agendar" : "Book"}
                  </Button>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}

export { SearchMapInner }
