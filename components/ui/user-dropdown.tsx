"use client"

import React from "react"
import { useAuth } from "@/hooks/use-auth"
import { useProfile } from "@/hooks/use-profile"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
  User,
  Settings,
  LogOut,
  Calendar,
  MessageSquare,
  HelpCircle,
  Globe,
  Moon,
  Sun,
  Heart,
  CreditCard,
  Shield,
} from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { useTranslations } from "@/lib/i18n"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"

interface ProfileData {
  id: string
  role: "patient" | "professional" | "admin"
  first_name: string | null
  last_name: string | null
  avatar_url: string | null
  email_verified: boolean
}

interface UserDropdownProps {
  profile?: ProfileData
  role?: "patient" | "professional" | "admin"
  user?: {
    name: string
    username?: string
    email?: string
    avatar?: string
    initials: string
    status?: string
  }
}

export const UserDropdown = ({
  profile: profileProp,
  role = "patient",
  user,
}: UserDropdownProps) => {
  const { language, setLanguage } = useLanguage()
  const t = useTranslations(language)
  const { user: authUser, signOut } = useAuth()
  const router = useRouter()
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)
  const [helpOpen, setHelpOpen] = React.useState(false)

  const { profile: fetchedProfile, isLoading: profileLoading } = useProfile()
  const profile = profileProp ?? fetchedProfile

  React.useEffect(() => setMounted(true), [])
  const isDark = mounted && resolvedTheme === "dark"

  const displayUser = {
    name: profile?.first_name
      ? `${profile.first_name} ${profile.last_name || ""}`.trim()
      : user?.name || authUser?.user_metadata?.first_name
      ? `${authUser?.user_metadata?.first_name} ${authUser?.user_metadata?.last_name || ""}`.trim()
        : role === "admin"
          ? (language === "es" ? "Administrador" : "Administrator")
          : (language === "es" ? "Profesional" : "Professional"),
    email: user?.email ?? authUser?.email ?? "",
    initials: profile?.first_name?.[0]?.toUpperCase() ?? user?.initials ?? authUser?.user_metadata?.first_name?.[0]?.toUpperCase() ?? (role === "patient" ? "U" : "P"),
    avatar: profile !== undefined ? profile?.avatar_url : (user?.avatar || authUser?.user_metadata?.avatar_url),
  }

  const go = (path: string) => {
    router.push(path)
  }

  const handleAction = (action: string) => {
    switch (action) {
      case "profile":
        go(role === "admin" ? "/dashboard/admin/settings" : role === "patient" ? "/dashboard/profile" : "/dashboard/professional")
        break
      case "appointments":
        go(role === "patient" ? "/dashboard/patient/citas" : "/dashboard/appointments")
        break
      case "calendar":
        go("/dashboard/professional")
        break
      case "messages":
        go(role === "patient" ? "/dashboard/chat" : "/dashboard/professional")
        break
      case "favorites":
        go("/dashboard/favorites")
        break
      case "payments":
        go("/dashboard/payments")
        break
      case "settings":
        go(role === "admin" ? "/dashboard/admin/settings" : role === "patient" ? "/dashboard/settings" : "/dashboard/professional/profile")
        break
      case "language":
        setLanguage(language === "es" ? "en" : "es")
        break
      case "theme":
        setTheme(isDark ? "light" : "dark")
        break
      case "help":
        setHelpOpen(true)
        break
      case "logout":
        signOut()
        break
      default:
        break
    }
  }

  const supportEmail = "soporte@nurea.app"

  const patientLinks = [
    { icon: User, label: language === "es" ? "Mi Perfil" : "My Profile", action: "profile" },
    { icon: Calendar, label: t.dashboard.appointments, action: "appointments" },
    { icon: MessageSquare, label: t.dashboard.messages, action: "messages" },
    { icon: Heart, label: t.dashboard.favorites, action: "favorites" },
    { icon: CreditCard, label: t.dashboard.payments, action: "payments" },
  ]

  const professionalLinks = [
    { icon: User, label: language === "es" ? "Mi Perfil" : "My Profile", action: "profile" },
    { icon: Calendar, label: language === "es" ? "Calendario" : "Calendar", action: "calendar" },
    { icon: MessageSquare, label: language === "es" ? "Mensajes" : "Messages", action: "messages" },
  ]

  const adminLinks = [
    { icon: Shield, label: language === "es" ? "Panel Admin" : "Admin Panel", action: "profile" },
    { icon: MessageSquare, label: language === "es" ? "Mensajes" : "Messages", action: "messages" },
  ]

  const mainLinks = role === "admin" ? adminLinks : (role === "patient" ? patientLinks : professionalLinks)

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button type="button" className="rounded-full focus:outline-none focus:ring-2 focus:ring-primary/30">
            <Avatar className="size-9 border border-border">
              <AvatarImage src={displayUser.avatar} alt={displayUser.name} />
              <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
                {displayUser.initials}
              </AvatarFallback>
            </Avatar>
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          className="w-56 rounded-xl border bg-background p-1 shadow-lg"
          sideOffset={8}
        >
          <div className="px-3 py-2.5">
            <p className="font-medium text-sm truncate">{displayUser.name}</p>
            <p className="text-muted-foreground text-xs truncate">{displayUser.email}</p>
          </div>
          <DropdownMenuSeparator />

          {mainLinks.map((item) => (
            <DropdownMenuItem
              key={item.action}
              onClick={() => handleAction(item.action)}
              className="gap-2 rounded-lg cursor-pointer"
            >
              <item.icon className="size-4 text-muted-foreground" />
              <span>{item.label}</span>
            </DropdownMenuItem>
          ))}

          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={() => handleAction("settings")} className="gap-2 rounded-lg cursor-pointer">
            <Settings className="size-4 text-muted-foreground" />
            <span>{language === "es" ? "Configuración" : "Settings"}</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleAction("language")} className="gap-2 rounded-lg cursor-pointer">
            <Globe className="size-4 text-muted-foreground" />
            <span>{language === "es" ? "English" : "Español"}</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleAction("theme")} className="gap-2 rounded-lg cursor-pointer">
            {isDark ? <Sun className="size-4 text-muted-foreground" /> : <Moon className="size-4 text-muted-foreground" />}
            <span>{language === "es" ? (isDark ? "Modo claro" : "Modo oscuro") : isDark ? "Light mode" : "Dark mode"}</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleAction("help")} className="gap-2 rounded-lg cursor-pointer">
            <HelpCircle className="size-4 text-muted-foreground" />
            <span>{language === "es" ? "Ayuda" : "Help"}</span>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={() => handleAction("logout")}
            className="gap-2 rounded-lg cursor-pointer text-foreground"
          >
            <LogOut className="size-4 text-muted-foreground" />
            <span>{language === "es" ? "Cerrar sesión" : "Log out"}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={helpOpen} onOpenChange={setHelpOpen}>
        <DialogContent className="rounded-xl sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-lg">{language === "es" ? "Ayuda" : "Help"}</DialogTitle>
            <DialogDescription>
              {language === "es"
                ? "Escríbenos y te responderemos lo antes posible."
                : "Contact us and we'll get back to you as soon as possible."}
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <a
              href={`mailto:${supportEmail}`}
              className="text-primary font-medium hover:underline"
            >
              {supportEmail}
            </a>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" size="sm" onClick={() => setHelpOpen(false)} className="rounded-lg">
              {language === "es" ? "Cerrar" : "Close"}
            </Button>
            <Button size="sm" className="rounded-lg" asChild>
              <a href={`mailto:${supportEmail}`}>
                {language === "es" ? "Enviar correo" : "Send email"}
              </a>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default UserDropdown
