"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { RouteGuard } from "@/components/auth/route-guard"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { 
  Settings, 
  Bell, 
  Shield, 
  Globe,
  Moon,
  Sun
} from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { useTheme } from "next-themes"

export default function ProfessionalSettingsPage() {
  const { language } = useLanguage()
  const { theme, setTheme } = useTheme()
  const isSpanish = language === "es"

  return (
    <RouteGuard requiredRole="professional">
      <DashboardLayout role="professional">
        <div className="space-y-8">
          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">
              {isSpanish ? "Configuración" : "Settings"}
            </h1>
            <p className="text-muted-foreground">
              {isSpanish 
                ? "Gestiona tus preferencias y configuración"
                : "Manage your preferences and settings"}
            </p>
          </div>

          {/* Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                {isSpanish ? "Notificaciones" : "Notifications"}
              </CardTitle>
              <CardDescription>
                {isSpanish 
                  ? "Controla cómo y cuándo recibes notificaciones"
                  : "Control how and when you receive notifications"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{isSpanish ? "Notificaciones de Citas" : "Appointment Notifications"}</Label>
                  <p className="text-sm text-muted-foreground">
                    {isSpanish 
                      ? "Recibe notificaciones sobre nuevas citas y cambios"
                      : "Receive notifications about new appointments and changes"}
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{isSpanish ? "Notificaciones de Mensajes" : "Message Notifications"}</Label>
                  <p className="text-sm text-muted-foreground">
                    {isSpanish 
                      ? "Recibe notificaciones cuando recibes mensajes"
                      : "Receive notifications when you receive messages"}
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{isSpanish ? "Notificaciones de Pagos" : "Payment Notifications"}</Label>
                  <p className="text-sm text-muted-foreground">
                    {isSpanish 
                      ? "Recibe notificaciones sobre pagos recibidos"
                      : "Receive notifications about received payments"}
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>

          {/* Appearance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {theme === "dark" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                {isSpanish ? "Apariencia" : "Appearance"}
              </CardTitle>
              <CardDescription>
                {isSpanish 
                  ? "Personaliza la apariencia de tu panel"
                  : "Customize your dashboard appearance"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{isSpanish ? "Modo Oscuro" : "Dark Mode"}</Label>
                  <p className="text-sm text-muted-foreground">
                    {isSpanish 
                      ? "Activa o desactiva el modo oscuro"
                      : "Enable or disable dark mode"}
                  </p>
                </div>
                <Switch 
                  checked={theme === "dark"} 
                  onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
                />
              </div>
            </CardContent>
          </Card>

          {/* Privacy & Security */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                {isSpanish ? "Privacidad y Seguridad" : "Privacy & Security"}
              </CardTitle>
              <CardDescription>
                {isSpanish 
                  ? "Gestiona tu privacidad y seguridad"
                  : "Manage your privacy and security"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>{isSpanish ? "Visibilidad del Perfil" : "Profile Visibility"}</Label>
                <p className="text-sm text-muted-foreground">
                  {isSpanish 
                    ? "Tu perfil profesional es visible para pacientes que buscan atención"
                    : "Your professional profile is visible to patients seeking care"}
                </p>
              </div>
              <Button variant="outline" className="w-full sm:w-auto">
                {isSpanish ? "Gestionar Privacidad" : "Manage Privacy"}
              </Button>
            </CardContent>
          </Card>

          {/* Language */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                {isSpanish ? "Idioma" : "Language"}
              </CardTitle>
              <CardDescription>
                {isSpanish 
                  ? "Selecciona tu idioma preferido"
                  : "Select your preferred language"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Button 
                  variant={language === "es" ? "default" : "outline"}
                  onClick={() => {
                    localStorage.setItem("language", "es")
                    window.location.reload()
                  }}
                >
                  Español
                </Button>
                <Button 
                  variant={language === "en" ? "default" : "outline"}
                  onClick={() => {
                    localStorage.setItem("language", "en")
                    window.location.reload()
                  }}
                >
                  English
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </RouteGuard>
  )
}

