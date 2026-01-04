"use client"

import { Calendar, Heart, MessageSquare, Search, CreditCard, LayoutDashboard } from "lucide-react"
import { Toolbar, ToolbarItem } from "@/components/ui/toolbar"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/contexts/language-context"
import { useTranslations } from "@/lib/i18n"
import { useRouter } from "next/navigation"

export function PatientToolbar() {
  const { language } = useLanguage()
  const t = useTranslations(language)
  const router = useRouter()

  const items: ToolbarItem[] = [
    {
      id: 1,
      label: t.dashboard.overview,
      icon: <LayoutDashboard className="h-4 w-4" />,
      href: "/dashboard",
      content: (
        <div className="space-y-2">
          <h3 className="font-semibold text-foreground">{t.dashboard.overview}</h3>
          <p className="text-sm text-muted-foreground">
            {language === "es" 
              ? "Ve tu resumen de salud y próximas citas"
              : "View your health summary and upcoming appointments"}
          </p>
          <Button 
            onClick={() => router.push("/dashboard")}
            className="w-full mt-2"
            size="sm"
          >
            {language === "es" ? "Ir al Dashboard" : "Go to Dashboard"}
          </Button>
        </div>
      ),
    },
    {
      id: 2,
      label: t.dashboard.appointments,
      icon: <Calendar className="h-4 w-4" />,
      href: "/dashboard/appointments",
      content: (
        <div className="space-y-2">
          <h3 className="font-semibold text-foreground">{t.dashboard.appointments}</h3>
          <p className="text-sm text-muted-foreground">
            {language === "es"
              ? "Gestiona tus citas programadas"
              : "Manage your scheduled appointments"}
          </p>
          <Button 
            onClick={() => router.push("/dashboard/appointments")}
            className="w-full mt-2"
            size="sm"
          >
            {language === "es" ? "Ver Citas" : "View Appointments"}
          </Button>
        </div>
      ),
    },
    {
      id: 3,
      label: t.dashboard.favorites,
      icon: <Heart className="h-4 w-4" />,
      href: "/dashboard/favorites",
      content: (
        <div className="space-y-2">
          <h3 className="font-semibold text-foreground">{t.dashboard.favoriteSpecialists}</h3>
          <p className="text-sm text-muted-foreground">
            {language === "es"
              ? "Tus profesionales favoritos guardados"
              : "Your saved favorite professionals"}
          </p>
          <Button 
            onClick={() => router.push("/dashboard/favorites")}
            className="w-full mt-2"
            size="sm"
          >
            {language === "es" ? "Ver Favoritos" : "View Favorites"}
          </Button>
        </div>
      ),
    },
    {
      id: 4,
      label: t.dashboard.messages,
      icon: <MessageSquare className="h-4 w-4" />,
      href: "/dashboard/messages",
      content: (
        <div className="space-y-2">
          <h3 className="font-semibold text-foreground">{t.dashboard.messages}</h3>
          <p className="text-sm text-muted-foreground">
            {language === "es"
              ? "Mensajes con tus profesionales"
              : "Messages with your professionals"}
          </p>
          <Button 
            onClick={() => router.push("/dashboard/messages")}
            className="w-full mt-2"
            size="sm"
          >
            {language === "es" ? "Abrir Mensajes" : "Open Messages"}
          </Button>
        </div>
      ),
    },
    {
      id: 5,
      label: language === "es" ? "Buscar" : "Search",
      icon: <Search className="h-4 w-4" />,
      href: "/search",
      content: (
        <div className="space-y-2">
          <h3 className="font-semibold text-foreground">
            {language === "es" ? "Buscar Profesionales" : "Search Professionals"}
          </h3>
          <p className="text-sm text-muted-foreground">
            {language === "es"
              ? "Encuentra profesionales de la salud"
              : "Find healthcare professionals"}
          </p>
          <Button 
            onClick={() => router.push("/search")}
            className="w-full mt-2"
            size="sm"
          >
            {language === "es" ? "Buscar Ahora" : "Search Now"}
          </Button>
        </div>
      ),
    },
    {
      id: 6,
      label: t.dashboard.payments,
      icon: <CreditCard className="h-4 w-4" />,
      href: "/dashboard/payments",
      content: (
        <div className="space-y-2">
          <h3 className="font-semibold text-foreground">{t.dashboard.payments}</h3>
          <p className="text-sm text-muted-foreground">
            {language === "es"
              ? "Historial de pagos y facturas"
              : "Payment history and invoices"}
          </p>
          <Button 
            onClick={() => router.push("/dashboard/payments")}
            className="w-full mt-2"
            size="sm"
          >
            {language === "es" ? "Ver Pagos" : "View Payments"}
          </Button>
        </div>
      ),
    },
  ]

  return <Toolbar items={items} role="patient" variant="sidebar" />
}

