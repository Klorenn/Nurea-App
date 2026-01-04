"use client"

import { Calendar, MessageSquare, Star, User, Settings, LayoutDashboard, CreditCard } from "lucide-react"
import { Toolbar, ToolbarItem } from "@/components/ui/toolbar"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/contexts/language-context"
import { useTranslations } from "@/lib/i18n"
import { useRouter } from "next/navigation"

export function ProfessionalToolbar() {
  const { language } = useLanguage()
  const t = useTranslations(language)
  const router = useRouter()

  const items: ToolbarItem[] = [
    {
      id: 1,
      label: language === "es" ? "Dashboard" : "Dashboard",
      icon: <LayoutDashboard className="h-4 w-4" />,
      href: "/professional/dashboard",
      content: (
        <div className="space-y-2">
          <h3 className="font-semibold text-foreground">
            {language === "es" ? "Panel Principal" : "Main Dashboard"}
          </h3>
          <p className="text-sm text-muted-foreground">
            {language === "es"
              ? "Vista general de tu práctica profesional"
              : "Overview of your professional practice"}
          </p>
          <Button 
            onClick={() => router.push("/professional/dashboard")}
            className="w-full mt-2"
            size="sm"
          >
            {language === "es" ? "Ir al Panel" : "Go to Dashboard"}
          </Button>
        </div>
      ),
    },
    {
      id: 2,
      label: language === "es" ? "Calendario" : "Calendar",
      icon: <Calendar className="h-4 w-4" />,
      href: "/professional/calendar",
      content: (
        <div className="space-y-2">
          <h3 className="font-semibold text-foreground">
            {language === "es" ? "Calendario" : "Calendar"}
          </h3>
          <p className="text-sm text-muted-foreground">
            {language === "es"
              ? "Gestiona tus citas y disponibilidad"
              : "Manage your appointments and availability"}
          </p>
          <Button 
            onClick={() => router.push("/professional/calendar")}
            className="w-full mt-2"
            size="sm"
          >
            {language === "es" ? "Ver Calendario" : "View Calendar"}
          </Button>
        </div>
      ),
    },
    {
      id: 3,
      label: language === "es" ? "Mensajes" : "Messages",
      icon: <MessageSquare className="h-4 w-4" />,
      href: "/professional/chat",
      content: (
        <div className="space-y-2">
          <h3 className="font-semibold text-foreground">
            {language === "es" ? "Mensajes" : "Messages"}
          </h3>
          <p className="text-sm text-muted-foreground">
            {language === "es"
              ? "Comunícate con tus pacientes"
              : "Communicate with your patients"}
          </p>
          <Button 
            onClick={() => router.push("/professional/chat")}
            className="w-full mt-2"
            size="sm"
          >
            {language === "es" ? "Abrir Mensajes" : "Open Messages"}
          </Button>
        </div>
      ),
    },
    {
      id: 4,
      label: language === "es" ? "Reseñas" : "Reviews",
      icon: <Star className="h-4 w-4" />,
      href: "/professional/reviews",
      content: (
        <div className="space-y-2">
          <h3 className="font-semibold text-foreground">
            {language === "es" ? "Reseñas" : "Reviews"}
          </h3>
          <p className="text-sm text-muted-foreground">
            {language === "es"
              ? "Gestiona las reseñas de tus pacientes"
              : "Manage your patient reviews"}
          </p>
          <Button 
            onClick={() => router.push("/professional/reviews")}
            className="w-full mt-2"
            size="sm"
          >
            {language === "es" ? "Ver Reseñas" : "View Reviews"}
          </Button>
        </div>
      ),
    },
    {
      id: 5,
      label: language === "es" ? "Perfil Público" : "Public Profile",
      icon: <User className="h-4 w-4" />,
      href: "/professional/profile",
      content: (
        <div className="space-y-2">
          <h3 className="font-semibold text-foreground">
            {language === "es" ? "Perfil Público" : "Public Profile"}
          </h3>
          <p className="text-sm text-muted-foreground">
            {language === "es"
              ? "Edita tu perfil profesional"
              : "Edit your professional profile"}
          </p>
          <Button 
            onClick={() => router.push("/professional/profile")}
            className="w-full mt-2"
            size="sm"
          >
            {language === "es" ? "Editar Perfil" : "Edit Profile"}
          </Button>
        </div>
      ),
    },
    {
      id: 6,
      label: language === "es" ? "Configuración" : "Settings",
      icon: <Settings className="h-4 w-4" />,
      href: "/professional/settings",
      content: (
        <div className="space-y-2">
          <h3 className="font-semibold text-foreground">
            {language === "es" ? "Configuración" : "Settings"}
          </h3>
          <p className="text-sm text-muted-foreground">
            {language === "es"
              ? "Ajusta tu configuración y preferencias"
              : "Adjust your settings and preferences"}
          </p>
          <Button 
            onClick={() => router.push("/professional/settings")}
            className="w-full mt-2"
            size="sm"
          >
            {language === "es" ? "Abrir Configuración" : "Open Settings"}
          </Button>
        </div>
      ),
    },
  ]

  return <Toolbar items={items} role="professional" variant="sidebar" />
}

