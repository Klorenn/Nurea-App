"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { 
  Bell, 
  Shield, 
  Globe, 
  CreditCard, 
  Trash2, 
  Mail, 
  Smartphone,
  Lock,
  Eye,
  EyeOff
} from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { useTranslations } from "@/lib/i18n"
import { Separator } from "@/components/ui/separator"

export default function SettingsPage() {
  const { language } = useLanguage()
  const t = useTranslations(language)

  return (
    <DashboardLayout role="patient">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t.dashboard.settings}
          </h1>
          <p className="text-muted-foreground mt-1">
            {language === "es" 
              ? "Gestiona tus preferencias y configuración"
              : "Manage your preferences and settings"}
          </p>
        </div>

        {/* Notifications */}
        <Card className="border-border/40">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <Bell className="h-5 w-5" />
              </div>
              <div>
                <CardTitle>
                  {language === "es" ? "Notificaciones" : "Notifications"}
                </CardTitle>
                <CardDescription>
                  {language === "es" 
                    ? "Controla cómo y cuándo recibes notificaciones"
                    : "Control how and when you receive notifications"}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">
                  {language === "es" ? "Notificaciones por Email" : "Email Notifications"}
                </Label>
                <p className="text-sm text-muted-foreground">
                  {language === "es" 
                    ? "Recibe recordatorios y actualizaciones por correo"
                    : "Receive reminders and updates via email"}
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">
                  {language === "es" ? "Notificaciones Push" : "Push Notifications"}
                </Label>
                <p className="text-sm text-muted-foreground">
                  {language === "es" 
                    ? "Recibe notificaciones en tu dispositivo"
                    : "Receive notifications on your device"}
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">
                  {language === "es" ? "Recordatorios de Citas" : "Appointment Reminders"}
                </Label>
                <p className="text-sm text-muted-foreground">
                  {language === "es" 
                    ? "Te avisamos antes de tus citas programadas"
                    : "We'll remind you before your scheduled appointments"}
                </p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        {/* Privacy & Security */}
        <Card className="border-border/40">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <CardTitle>
                  {language === "es" ? "Privacidad y Seguridad" : "Privacy & Security"}
                </CardTitle>
                <CardDescription>
                  {language === "es" 
                    ? "Gestiona tu privacidad y seguridad de cuenta"
                    : "Manage your privacy and account security"}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" className="w-full justify-start rounded-xl h-auto py-4">
              <div className="flex items-center gap-3 flex-1">
                <Lock className="h-5 w-5 text-muted-foreground" />
                <div className="text-left flex-1">
                  <p className="font-semibold">
                    {language === "es" ? "Cambiar Contraseña" : "Change Password"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {language === "es" 
                      ? "Actualiza tu contraseña regularmente para mantener tu cuenta segura"
                      : "Update your password regularly to keep your account secure"}
                  </p>
                </div>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </div>
            </Button>
            <Button variant="outline" className="w-full justify-start rounded-xl h-auto py-4">
              <div className="flex items-center gap-3 flex-1">
                <Eye className="h-5 w-5 text-muted-foreground" />
                <div className="text-left flex-1">
                  <p className="font-semibold">
                    {language === "es" ? "Visibilidad del Perfil" : "Profile Visibility"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {language === "es" 
                      ? "Controla quién puede ver tu información"
                      : "Control who can see your information"}
                  </p>
                </div>
              </div>
            </Button>
          </CardContent>
        </Card>

        {/* Language & Region */}
        <Card className="border-border/40">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center text-green-600 dark:text-green-400">
                <Globe className="h-5 w-5" />
              </div>
              <div>
                <CardTitle>
                  {language === "es" ? "Idioma y Región" : "Language & Region"}
                </CardTitle>
                <CardDescription>
                  {language === "es" 
                    ? "Personaliza tu experiencia en NUREA"
                    : "Personalize your NUREA experience"}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base">
                  {language === "es" ? "Idioma" : "Language"}
                </Label>
                <p className="text-sm text-muted-foreground">
                  {language === "es" ? "Español" : "Spanish"} / {language === "es" ? "Inglés" : "English"}
                </p>
              </div>
              <Button variant="outline" className="rounded-xl">
                {language === "es" ? "Cambiar" : "Change"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Payment Methods */}
        <Card className="border-border/40">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <CreditCard className="h-5 w-5" />
              </div>
              <div>
                <CardTitle>
                  {language === "es" ? "Métodos de Pago" : "Payment Methods"}
                </CardTitle>
                <CardDescription>
                  {language === "es" 
                    ? "Gestiona tus tarjetas y métodos de pago"
                    : "Manage your cards and payment methods"}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full rounded-xl">
              {language === "es" ? "Agregar Método de Pago" : "Add Payment Method"}
            </Button>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-destructive/20 bg-destructive/5">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center text-destructive">
                <Trash2 className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-destructive">
                  {language === "es" ? "Zona de Peligro" : "Danger Zone"}
                </CardTitle>
                <CardDescription>
                  {language === "es" 
                    ? "Acciones irreversibles en tu cuenta"
                    : "Irreversible actions on your account"}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="destructive" className="rounded-xl">
              <Trash2 className="mr-2 h-4 w-4" />
              {language === "es" ? "Eliminar Cuenta" : "Delete Account"}
            </Button>
            <p className="text-sm text-muted-foreground">
              {language === "es" 
                ? "Esta acción no se puede deshacer. Se eliminará toda tu información permanentemente."
                : "This action cannot be undone. All your information will be permanently deleted."}
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

