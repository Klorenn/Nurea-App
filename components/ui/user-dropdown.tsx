"use client"

import React from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
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
import { cn } from "@/lib/utils"
import { Icon } from "@iconify/react"
import {
  User,
  Settings,
  Bell,
  Moon,
  Sun,
  LogOut,
  Heart,
  Calendar,
  MessageSquare,
  CreditCard,
  Star,
  HelpCircle,
  Gift,
  TrendingUp,
  Shield,
  Globe,
  Mail,
  Copy,
  CheckCircle2,
  FileText,
} from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { useTranslations } from "@/lib/i18n"
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useTheme } from "next-themes"
import { LogoutButton } from "@/components/ui/logout-button"

interface UserDropdownProps {
  role?: "patient" | "professional"
  user?: {
    name: string
    username?: string
    email?: string
    avatar?: string
    initials: string
    status?: "online" | "offline" | "busy"
  }
  onAction?: (action: string) => void
  onStatusChange?: (status: string) => void
  selectedStatus?: string
}

export const UserDropdown = ({
  role = "patient",
  user,
  onAction,
  onStatusChange,
  selectedStatus = "online",
}: UserDropdownProps) => {
  const { language, setLanguage } = useLanguage()
  const t = useTranslations(language)
  const { user: authUser, signOut } = useAuth()
  const router = useRouter()
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)
  const [helpDialogOpen, setHelpDialogOpen] = React.useState(false)
  const [emailCopied, setEmailCopied] = React.useState(false)
  
  React.useEffect(() => {
    setMounted(true)
  }, [])
  
  const isDark = mounted && resolvedTheme === "dark"

  const supportEmail = "soporte@nurea.app"
  const emergencyEmail = "soporte@nurea.app"

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(supportEmail)
      setEmailCopied(true)
      setTimeout(() => setEmailCopied(false), 2000)
    } catch (error) {
      console.error("Failed to copy email:", error)
    }
  }

  // Default user data
  const defaultUser = {
    name: authUser?.user_metadata?.first_name
      ? `${authUser.user_metadata.first_name} ${authUser.user_metadata.last_name || ""}`
      : role === "patient"
        ? "Andrés Bello"
        : "Dr. Elena Vargas",
    username: authUser?.email?.split("@")[0] || `@${role}`,
    email: authUser?.email || `${role}@nurea.app`,
    avatar: authUser?.user_metadata?.avatar_url || `/placeholder-user.jpg`,
    initials: authUser?.user_metadata?.first_name?.[0] || (role === "patient" ? "AB" : "EV"),
    status: "online" as const,
  }

  const currentUser = user || defaultUser

  const handleAction = (action: string) => {
    if (onAction) {
      onAction(action)
      return
    }

    switch (action) {
      case "profile":
        router.push(role === "patient" ? "/dashboard/profile" : "/professional/profile/edit")
        break
      case "appointments":
        router.push("/dashboard/appointments")
        break
      case "favorites":
        router.push("/dashboard/favorites")
        break
      case "messages":
        router.push(role === "patient" ? "/dashboard/chat" : "/professional/chat")
        break
      case "payments":
        router.push("/dashboard/payments")
        break
      case "calendar":
        router.push("/professional/dashboard")
        break
      case "reviews":
        router.push("/professional/reviews")
        break
      case "earnings":
        router.push("/professional/dashboard")
        break
      case "settings":
        router.push(role === "patient" ? "/dashboard/settings" : "/professional/profile/edit")
        break
      case "appearance":
        // Toggle theme
        setTheme(isDark ? "light" : "dark")
        break
      case "language":
        // Toggle language
        setLanguage(language === "es" ? "en" : "es")
        break
      case "notifications":
        router.push(role === "patient" ? "/dashboard/settings" : "/professional/profile/edit")
        break
      case "subscription":
        router.push("/professional/dashboard")
        break
      case "upgrade":
        router.push("/#pricing")
        break
      case "referrals":
        router.push("/#pricing")
        break
      case "resources":
        router.push("/professional/dashboard")
        break
      case "help":
        setHelpDialogOpen(true)
        break
      case "switch":
        // Handle account switching - not implemented for MVP
        break
      case "logout":
        signOut()
        break
      default:
        break
    }
  }

  const handleStatusChange = (status: string) => {
    if (onStatusChange) {
      onStatusChange(status)
    }
  }

  // Menu items for Patient
  const patientMenuItems = {
    status: [
      { value: "online", icon: "solar:user-bold-duotone", label: language === "es" ? "En línea" : "Online" },
      { value: "offline", icon: "solar:moon-sleep-line-duotone", label: language === "es" ? "Aparecer como desconectado" : "Appear Offline" },
    ],
    profile: [
      { icon: User, label: language === "es" ? "Mi Perfil" : "My Profile", action: "profile", href: "/dashboard" },
      { icon: Calendar, label: t.dashboard.appointments, action: "appointments", href: "/dashboard/appointments" },
      { icon: Heart, label: t.dashboard.favorites, action: "favorites", href: "/dashboard/favorites" },
      { icon: MessageSquare, label: t.dashboard.messages, action: "messages", href: "/dashboard/chat" },
      { icon: CreditCard, label: t.dashboard.payments, action: "payments", href: "/dashboard/payments" },
    ],
    settings: [
      { icon: Settings, label: language === "es" ? "Configuración" : "Settings", action: "settings" },
      { icon: Bell, label: language === "es" ? "Notificaciones" : "Notifications", action: "notifications" },
      { 
        icon: Globe, 
        label: language === "es" ? "Cambiar a Inglés" : "Switch to Spanish", 
        action: "language" 
      },
      { 
        icon: isDark ? Sun : Moon, 
        label: language === "es" ? (isDark ? "Modo Claro" : "Modo Oscuro") : (isDark ? "Light Mode" : "Dark Mode"), 
        action: "appearance" 
      },
    ],
    support: [
      { icon: HelpCircle, label: language === "es" ? "Obtener ayuda" : "Get help", action: "help" },
    ],
    account: [
      { icon: LogOut, label: language === "es" ? "Cerrar sesión" : "Log out", action: "logout" },
    ],
  }

  // Menu items for Professional
  const professionalMenuItems = {
    status: [
      { value: "online", icon: "solar:user-bold-duotone", label: language === "es" ? "Disponible" : "Available" },
      { value: "busy", icon: "solar:clock-circle-bold-duotone", label: language === "es" ? "Ocupado" : "Busy" },
      { value: "offline", icon: "solar:moon-sleep-line-duotone", label: language === "es" ? "No disponible" : "Unavailable" },
    ],
    profile: [
      { icon: User, label: language === "es" ? "Mi Perfil" : "My Profile", action: "profile", href: "/professional/profile/edit" },
      { icon: Calendar, label: language === "es" ? "Calendario" : "Calendar", action: "calendar", href: "/professional/dashboard" },
      { icon: MessageSquare, label: t.professional.messages, action: "messages", href: "/professional/messages" },
      { icon: Star, label: t.professional.reviews, action: "reviews", href: "/professional/reviews" },
      { icon: TrendingUp, label: language === "es" ? "Ingresos" : "Earnings", action: "earnings", href: "/professional/dashboard" },
    ],
    settings: [
      { icon: Settings, label: language === "es" ? "Configuración" : "Settings", action: "settings", href: "/professional/profile/edit" },
      { icon: Bell, label: language === "es" ? "Notificaciones" : "Notifications", action: "notifications" },
      { icon: Shield, label: language === "es" ? "Estado de Suscripción" : "Subscription Status", action: "subscription" },
      { 
        icon: Globe, 
        label: language === "es" ? "Cambiar a Inglés" : "Switch to Spanish", 
        action: "language" 
      },
      { 
        icon: isDark ? Sun : Moon, 
        label: language === "es" ? (isDark ? "Modo Claro" : "Modo Oscuro") : (isDark ? "Light Mode" : "Dark Mode"), 
        action: "appearance" 
      },
    ],
    premium: [
      {
        icon: Star,
        label: language === "es" ? "Actualizar Plan" : "Upgrade Plan",
        action: "upgrade",
        iconClass: "text-teal-500",
        badge: { text: language === "es" ? "Nuevo" : "New", className: "bg-teal-600 text-white text-[11px]" },
      },
      { icon: Gift, label: language === "es" ? "Programa de Referidos" : "Referrals", action: "referrals" },
    ],
    support: [
      { icon: FileText, label: language === "es" ? "Recursos" : "Resources", action: "resources" },
      { icon: HelpCircle, label: language === "es" ? "Centro de Ayuda" : "Help Center", action: "help" },
    ],
    account: [
      { icon: LogOut, label: language === "es" ? "Cerrar sesión" : "Log out", action: "logout" },
    ],
  }

  const menuItems = role === "patient" ? patientMenuItems : professionalMenuItems

  const renderMenuItem = (item: any, index: number) => {
    // Special handling for logout button with animation
    if (item.action === "logout") {
      return (
        <div key={index} className="p-2">
          <LogoutButton
            onClick={() => handleAction(item.action)}
            className="w-full justify-start p-2 rounded-lg hover:bg-teal-50 dark:hover:bg-teal-950/20"
          />
        </div>
      )
    }

    return (
      <DropdownMenuItem
        key={index}
        className={cn(
          item.badge || item.rightIcon ? "justify-between" : "",
          "p-2 rounded-lg cursor-pointer hover:bg-teal-50 dark:hover:bg-teal-950/20",
        )}
        onClick={() => {
          if (item.href) {
            router.push(item.href)
          } else {
            handleAction(item.action)
          }
        }}
      >
        <span className="flex items-center gap-1.5 font-medium">
          {item.icon && typeof item.icon === "function" ? (
            <item.icon className={`size-5 ${item.iconClass || "text-teal-600 dark:text-teal-400"}`} />
          ) : (
            <Icon
              icon={item.icon}
              className={`size-5 ${item.iconClass || "text-teal-600 dark:text-teal-400"}`}
            />
          )}
          {item.label}
        </span>
        {item.badge && (
          <Badge className={cn("bg-teal-600 text-white text-[11px] border-none", item.badge.className)}>
            {item.badge.text}
          </Badge>
        )}
        {item.rightIcon && (
          <Icon icon={item.rightIcon} className="size-4 text-teal-600 dark:text-teal-400" />
        )}
      </DropdownMenuItem>
    )
  }

  const getStatusColor = (status: string) => {
    const colors = {
      online: "text-green-600 bg-green-100 border-green-300 dark:text-green-400 dark:bg-green-900/30 dark:border-green-500/50",
      offline: "text-gray-600 bg-gray-100 border-gray-300 dark:text-gray-400 dark:bg-gray-800 dark:border-gray-600",
      busy: "text-red-600 bg-red-100 border-red-300 dark:text-red-400 dark:bg-red-900/30 dark:border-red-500/50",
    }
    return colors[status.toLowerCase() as keyof typeof colors] || colors.online
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="cursor-pointer">
          <Avatar className="cursor-pointer size-10 border-2 border-teal-200 dark:border-teal-800 hover:border-teal-400 dark:hover:border-teal-500 transition-colors">
            <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
            <AvatarFallback className="bg-teal-100 dark:bg-teal-900 text-teal-700 dark:text-teal-300 font-bold">
              {currentUser.initials}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="no-scrollbar w-[310px] rounded-2xl bg-gray-50 dark:bg-gray-950 p-0 border-teal-200/20 dark:border-teal-800/30"
        align="end"
      >
        <section className="bg-white dark:bg-gray-900/50 backdrop-blur-lg rounded-2xl p-1 shadow-lg border border-teal-200/20 dark:border-teal-800/30">
          <div className="flex items-center p-2">
            <div className="flex-1 flex items-center gap-2">
              <Avatar className="cursor-pointer size-10 border-2 border-teal-200 dark:border-teal-800">
                <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
                <AvatarFallback className="bg-teal-100 dark:bg-teal-900 text-teal-700 dark:text-teal-300 font-bold">
                  {currentUser.initials}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100">{currentUser.name}</h3>
                <p className="text-muted-foreground text-xs">{currentUser.email || currentUser.username}</p>
              </div>
            </div>
            <Badge
              className={cn(
                getStatusColor(currentUser.status || "online"),
                "border-[0.5px] text-[11px] rounded-sm capitalize",
              )}
            >
              {currentUser.status || "online"}
            </Badge>
          </div>

          <DropdownMenuGroup>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="cursor-pointer p-2 rounded-lg hover:bg-teal-50 dark:hover:bg-teal-950/20">
                <span className="flex items-center gap-1.5 font-medium text-teal-600 dark:text-teal-400">
                  <Icon icon="solar:smile-circle-line-duotone" className="size-5" />
                  {language === "es" ? "Actualizar estado" : "Update status"}
                </span>
              </DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent className="bg-white dark:bg-gray-900/50 backdrop-blur-lg border-teal-200/20 dark:border-teal-800/30">
                  <DropdownMenuRadioGroup value={selectedStatus} onValueChange={handleStatusChange}>
                    {menuItems.status.map((status, index) => (
                      <DropdownMenuRadioItem className="gap-2 hover:bg-teal-50 dark:hover:bg-teal-950/20" key={index} value={status.value}>
                        <Icon icon={status.icon} className="size-5 text-teal-600 dark:text-teal-400" />
                        {status.label}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>
          </DropdownMenuGroup>

          <DropdownMenuSeparator className="bg-teal-200/20 dark:bg-teal-800/30" />
          <DropdownMenuGroup>{menuItems.profile.map(renderMenuItem)}</DropdownMenuGroup>

          <DropdownMenuSeparator className="bg-teal-200/20 dark:bg-teal-800/30" />
          <DropdownMenuGroup>{menuItems.settings.map(renderMenuItem)}</DropdownMenuGroup>

          {menuItems.premium && (
            <>
              <DropdownMenuSeparator className="bg-teal-200/20 dark:bg-teal-800/30" />
              <DropdownMenuGroup>{menuItems.premium.map(renderMenuItem)}</DropdownMenuGroup>
            </>
          )}

          <DropdownMenuSeparator className="bg-teal-200/20 dark:bg-teal-800/30" />
          <DropdownMenuGroup>{menuItems.support.map(renderMenuItem)}</DropdownMenuGroup>
        </section>

        <section className="mt-1 p-1 rounded-2xl">
          <DropdownMenuGroup>{menuItems.account.map(renderMenuItem)}</DropdownMenuGroup>
        </section>
      </DropdownMenuContent>

      {/* Help Dialog */}
      <Dialog open={helpDialogOpen} onOpenChange={setHelpDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <HelpCircle className="h-6 w-6 text-primary" />
              {language === "es" ? "Obtener Ayuda" : "Get Help"}
            </DialogTitle>
            <DialogDescription className="text-base pt-2">
              {language === "es" 
                ? "Estamos aquí para ayudarte. Escríbenos y te responderemos lo antes posible."
                : "We're here to help. Write to us and we'll respond as soon as possible."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div className="flex-1 space-y-2">
                  <p className="text-sm font-medium text-foreground">
                    {language === "es" ? "Correo de Soporte" : "Support Email"}
                  </p>
                  <div className="flex items-center gap-2">
                    <a
                      href={`mailto:${supportEmail}`}
                      className="text-primary hover:underline font-semibold text-lg"
                    >
                      {supportEmail}
                    </a>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleCopyEmail}
                      className="h-8 w-8 rounded-lg"
                      title={language === "es" ? "Copiar correo" : "Copy email"}
                    >
                      {emailCopied ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  {emailCopied && (
                    <p className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      {language === "es" ? "Correo copiado" : "Email copied"}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-2 text-sm text-muted-foreground">
              <p>
                {language === "es"
                  ? "• Tiempo de respuesta: 24 horas"
                  : "• Response time: 24 hours"}
              </p>
              <p>
                {language === "es"
                  ? "• Para emergencias médicas, llama al 131 o acude a urgencias"
                  : "• For medical emergencies, call 131 or go to the emergency room"}
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setHelpDialogOpen(false)}
              className="rounded-xl"
            >
              {language === "es" ? "Cerrar" : "Close"}
            </Button>
            <Button
              onClick={() => {
                window.location.href = `mailto:${supportEmail}`
              }}
              className="rounded-xl"
            >
              <Mail className="h-4 w-4 mr-2" />
              {language === "es" ? "Abrir Correo" : "Open Email"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DropdownMenu>
  )
}

export default UserDropdown

