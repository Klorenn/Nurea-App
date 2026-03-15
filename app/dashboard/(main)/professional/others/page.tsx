"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  List, 
  Map as MapIcon, 
  Search, 
  MapPin, 
  Phone, 
  ExternalLink,
  ChevronRight
} from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface Location {
  id: string
  name: string
  type: string
  address: string
  phone: string
  distance: string
  lat: number
  lng: number
}

const mockLocations: Location[] = [
  {
    id: "1",
    name: "Clínica Santa María",
    type: "Hospital General",
    address: "Av. Santa María 0500, Providencia",
    phone: "+56 2 2913 0000",
    distance: "1.2 km",
    lat: -33.432,
    lng: -70.628
  },
  {
    id: "2",
    name: "Centro Médico San Jorge",
    type: "Especialidades",
    address: "Pedro de Valdivia 455, Providencia",
    phone: "+56 2 2453 1200",
    distance: "2.5 km",
    lat: -33.425,
    lng: -70.615
  },
  {
    id: "3",
    name: "Laboratorio Integral Nurea",
    type: "Laboratorio Clínico",
    address: "Apoquindo 3400, Las Condes",
    phone: "+56 2 2889 4500",
    distance: "5.1 km",
    lat: -33.415,
    lng: -70.595
  }
]

export default function OthersPage() {
  const [view, setView] = useState<"list" | "map">("list")
  const [search, setSearch] = useState("")

  const filteredLocations = mockLocations.filter(loc => 
    loc.name.toLowerCase().includes(search.toLowerCase()) ||
    loc.type.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Otros Recursos</h1>
          <p className="text-muted-foreground mt-1">
            Encuentre centros de salud, laboratorios y convenios cercanos.
          </p>
        </div>
        
        <div className="flex bg-accent/30 p-1 rounded-xl">
          <Button 
            variant={view === "list" ? "default" : "ghost"}
            size="sm"
            onClick={() => setView("list")}
            className="rounded-lg px-4"
          >
            <List className="h-4 w-4 mr-2" />
            Lista
          </Button>
          <Button 
            variant={view === "map" ? "default" : "ghost"}
            size="sm"
            onClick={() => setView("map")}
            className="rounded-lg px-4"
          >
            <MapIcon className="h-4 w-4 mr-2" />
            Mapa
          </Button>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Buscar centros, laboratorios o farmacias..." 
          className="pl-10 h-12 bg-card border-none shadow-sm rounded-xl"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {view === "list" ? (
        <div className="grid gap-4">
          {filteredLocations.map((loc) => (
            <Card key={loc.id} className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer group">
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row">
                  <div className="w-full md:w-48 h-32 bg-accent/20 flex items-center justify-center shrink-0">
                    <MapPin className="h-8 w-8 text-primary/40" />
                  </div>
                  <div className="p-6 flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <Badge variant="secondary" className="mb-2">{loc.type}</Badge>
                        <h3 className="text-xl font-bold group-hover:text-primary transition-colors">{loc.name}</h3>
                        <p className="text-sm text-muted-foreground mt-1 flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          {loc.address}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-primary">{loc.distance}</p>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">Cerca de ti</p>
                      </div>
                    </div>
                    
                    <div className="mt-6 flex flex-wrap gap-3">
                      <Button variant="outline" size="sm" className="rounded-lg h-9">
                        <Phone className="h-4 w-4 mr-2" />
                        {loc.phone}
                      </Button>
                      <Button variant="outline" size="sm" className="rounded-lg h-9">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Ver sitio web
                      </Button>
                      <Button size="sm" className="rounded-lg h-9 ml-auto">
                        Ver Detalles
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="h-[600px] w-full overflow-hidden relative bg-accent/10">
          <div className="absolute inset-0 flex items-center justify-center flex-col p-12 text-center">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
              <MapIcon className="h-10 w-10 text-primary" />
            </div>
            <h3 className="text-2xl font-bold">Vista de Mapa</h3>
            <p className="text-muted-foreground max-w-md mt-2">
              Aquí se integrará un mapa interactivo (como Google Maps o Mapbox) con los {filteredLocations.length} centros encontrados en tu zona.
            </p>
            
            <div className="mt-12 w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-6">
              {filteredLocations.slice(0, 3).map(loc => (
                <div key={loc.id} className="bg-background/80 backdrop-blur p-4 rounded-2xl border shadow-sm text-left">
                  <p className="text-[10px] font-bold text-primary uppercase mb-1">{loc.type}</p>
                  <p className="font-bold truncate">{loc.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{loc.address}</p>
                </div>
              ))}
            </div>
          </div>
          
          {/* Faux map interface elements */}
          <div className="absolute right-6 top-6 flex flex-col gap-2">
            <Button size="icon" variant="secondary" className="rounded-xl shadow-md">+</Button>
            <Button size="icon" variant="secondary" className="rounded-xl shadow-md">-</Button>
          </div>
        </Card>
      )}
    </div>
  )
}
