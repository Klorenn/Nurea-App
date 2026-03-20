"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Star, Heart, MapPin, Video, Phone, Search, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { useLanguage } from "@/contexts/language-context"
import { useTranslations } from "@/lib/i18n"
import { useAuth } from "@/hooks/use-auth"
import Link from "next/link"


export default function FavoritesPage() {
  const { language } = useLanguage()
  const t = useTranslations(language)
  const { user } = useAuth()
  const [favorites, setFavorites] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadFavorites = async () => {
      if (!user) {
        setLoading(false)
        return
      }

      setLoading(true)
      setError(null)
      try {
        const response = await fetch("/api/favorites")
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.message || "Error al cargar favoritos")
        }

        setFavorites(data.favorites || [])
      } catch (err) {
        console.error("Error loading favorites:", err)
        setError(err instanceof Error ? err.message : "Error al cargar favoritos")
      } finally {
        setLoading(false)
      }
    }

    loadFavorites()
  }, [user])

  const handleRemoveFavorite = async (professionalId: string) => {
    try {
      const response = await fetch(`/api/favorites?professionalId=${professionalId}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Error al eliminar favorito")
      }

      // Remove from local state
      setFavorites((prev) => prev.filter((fav) => fav.professionalId !== professionalId))
    } catch (err) {
      console.error("Error removing favorite:", err)
      toast.error(err instanceof Error ? err.message : "Error al eliminar favorito")
    }
  }

  return (
    <DashboardLayout role="patient">
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {t.dashboard.favorites}
            </h1>
            <p className="text-muted-foreground mt-1">
              {language === "es" 
                ? "Tus profesionales de confianza guardados"
                : "Your saved trusted professionals"}
            </p>
          </div>
          <Button className="rounded-xl font-bold" asChild>
            <Link href="/search">
              <Search className="mr-2 h-4 w-4" /> {language === "es" ? "Buscar Profesionales" : "Search Professionals"}
            </Link>
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12" role="status" aria-live="polite">
            <Loader2 className="h-8 w-8 animate-spin text-primary" aria-hidden="true" />
            <span className="sr-only">Cargando favoritos...</span>
          </div>
        ) : error ? (
          <Card className="border-border/40">
            <CardContent className="p-12 text-center">
              <p className="text-destructive font-medium mb-2">{error}</p>
              <Button className="rounded-xl mt-4" onClick={() => window.location.reload()}>
                {language === "es" ? "Reintentar" : "Retry"}
              </Button>
            </CardContent>
          </Card>
        ) : favorites.length > 0 ? (
          <div className="space-y-4">
            <div className="grid gap-6 md:grid-cols-2">
            {favorites.map((favorite) => (
              <Card key={favorite.id} className="border-border/40 hover:shadow-lg transition-all group">
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    <Avatar className="h-20 w-20 rounded-2xl border-2 border-border/40">
                      <AvatarImage src={favorite.image} />
                      <AvatarFallback>
                        {favorite.name.split(" ").map((n: string) => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-3">
                      <div>
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-bold text-lg group-hover:text-primary transition-colors">
                              {favorite.name}
                            </h3>
                            <p className="text-sm text-muted-foreground">{favorite.specialty}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-full h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                            onClick={() => handleRemoveFavorite(favorite.professionalId)}
                            aria-label={language === "es" ? `Eliminar ${favorite.name} de favoritos` : `Remove ${favorite.name} from favorites`}
                          >
                            <Heart className="h-4 w-4 fill-current" aria-hidden="true" />
                          </Button>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-primary text-primary" />
                            <span className="font-bold text-sm">{favorite.rating}</span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            ({favorite.reviews} {language === "es" ? "reseñas" : "reviews"})
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          <span>{favorite.location}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-muted-foreground">
                            {language === "es" ? "Desde:" : "From:"}
                          </span>
                          <span className="font-bold text-primary">
                            ${favorite.price.toLocaleString()} {language === "es" ? "CLP" : "CLP"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          {favorite.consultationTypes.map((type: string) => (
                            <Badge 
                              key={type}
                              variant="outline" 
                              className="text-xs"
                            >
                              {type === "Online" ? (
                                <Video className="h-3 w-3 mr-1" />
                              ) : (
                                <Phone className="h-3 w-3 mr-1" />
                              )}
                              {type}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button className="rounded-xl flex-1" asChild>
                          <Link href={`/professionals/${favorite.professionalId}`}>
                            {language === "es" ? "Ver Perfil" : "View Profile"}
                          </Link>
                        </Button>
                        <Button variant="outline" className="rounded-xl" asChild>
                          <Link href={`/search?professional=${favorite.professionalId}`}>
                            {t.dashboard.bookNew}
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            </div>
          </div>
        ) : (
          <Card className="border-border/40">
            <CardContent className="p-12 text-center">
              <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" aria-hidden="true" />
              <p className="text-muted-foreground font-medium mb-2">
                {t.dashboard.noFavorites}
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                {language === "es" 
                  ? "Guarda tus profesionales favoritos para acceder rápidamente a ellos"
                  : "Save your favorite professionals for quick access"}
              </p>
              <Button className="rounded-xl" asChild>
                <Link href="/search">
                  <Search className="mr-2 h-4 w-4" /> {language === "es" ? "Buscar Profesionales" : "Search Professionals"}
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}

