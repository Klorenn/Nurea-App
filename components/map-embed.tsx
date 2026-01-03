"use client"

import { Card, CardContent } from "@/components/ui/card"
import { MapPin } from "lucide-react"

interface MapEmbedProps {
  address: string
  lat?: number
  lng?: number
  className?: string
}

export function MapEmbed({ address, lat, lng, className }: MapEmbedProps) {
  // For production, you would use a proper map library like Google Maps, Mapbox, or Leaflet
  // This is a placeholder that shows the address and a styled map-like container
  const mapUrl = lat && lng 
    ? `https://www.google.com/maps/embed/v1/place?key=YOUR_API_KEY&q=${lat},${lng}`
    : `https://www.google.com/maps/embed/v1/place?key=YOUR_API_KEY&q=${encodeURIComponent(address)}`

  return (
    <Card className={className}>
      <CardContent className="p-0">
        <div className="relative w-full h-64 bg-accent/20 rounded-2xl overflow-hidden border border-border/40">
          {/* Placeholder map - Replace with actual map component */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center space-y-2">
              <MapPin className="h-12 w-12 text-primary mx-auto" />
              <p className="text-sm font-bold text-muted-foreground">{address}</p>
              <p className="text-xs text-muted-foreground">Map integration ready</p>
            </div>
          </div>
          
          {/* Actual map iframe - Uncomment when you have API key */}
          {/* <iframe
            width="100%"
            height="100%"
            style={{ border: 0 }}
            loading="lazy"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
            src={mapUrl}
          /> */}
        </div>
      </CardContent>
    </Card>
  )
}

