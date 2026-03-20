"use client"

import { RouteGuard } from "@/components/auth/route-guard"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Settings, Globe, Shield, Mail, AlertTriangle, Loader2 } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"

export default function AdminSettingsPage() {
  const { language } = useLanguage()
  const isSpanish = language === "es"
  const [paymentsEnabled, setPaymentsEnabled] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    const { data } = await supabase
      .from('system_settings')
      .select('value')
      .eq('key', 'payments_enabled')
      .single()
    
    if (data) {
      setPaymentsEnabled(data.value === true)
    }
  }

  const togglePayments = async (enabled: boolean) => {
    setLoading(true)
    const { error } = await supabase
      .from('system_settings')
      .update({ value: enabled })
      .eq('key', 'payments_enabled')
    
    if (error) {
      toast.error(isSpanish ? "Error al actualizar" : "Update failed")
    } else {
      setPaymentsEnabled(enabled)
      toast.success(enabled 
        ? (isSpanish ? "Pagos activados" : "Payments enabled")
        : (isSpanish ? "Pagos desactivados (Kill Switch ACTIVO)" : "Payments disabled (Kill Switch ACTIVE)")
      )
    }
    setLoading(false)
  }

  return (
    <RouteGuard requiredRole="admin">
      
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <Settings className="h-8 w-8 text-primary" />
              {isSpanish ? "Configuración Global" : "Global Settings"}
            </h1>
            <p className="text-muted-foreground mt-2">
              {isSpanish 
                ? "Configuración general de la plataforma"
                : "General platform settings"}
            </p>
          </div>

          {/* Crisis Management (Kill Switch) */}
          <Card className="border-red-200 dark:border-red-900 shadow-lg shadow-red-500/10">
            <CardHeader className="bg-red-50 dark:bg-red-900/10">
              <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-400">
                <AlertTriangle className="h-5 w-5" />
                {isSpanish ? "Gestión de Crisis (Kill Switch)" : "Crisis Management (Kill Switch)"}
              </CardTitle>
              <CardDescription className="text-red-600/80">
                {isSpanish 
                  ? "Usa esto solo en emergencias técnicas para detener todo el flujo de pagos."
                  : "Use this only in technical emergencies to stop all payment flows."}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 rounded-xl border border-red-100 dark:border-red-900/30 shadow-sm">
                <div className="space-y-1">
                  <Label className="text-base font-bold">
                    {isSpanish ? "Procesamiento de Pagos Global" : "Global Payment Processing"}
                  </Label>
                  <p className="text-sm text-muted-foreground mr-4">
                    {isSpanish 
                      ? "Cuando esté desactivado, los usuarios no podrán agendar citas pagadas."
                      : "When disabled, users will not be able to book paid appointments."}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {loading && <Loader2 className="h-4 w-4 animate-spin text-red-500" />}
                  <Switch 
                    checked={paymentsEnabled === true}
                    onCheckedChange={togglePayments}
                    disabled={paymentsEnabled === null || loading}
                    className="data-[state=checked]:bg-green-600 data-[state=unchecked]:bg-red-600"
                  />
                  <Badge className={cn(
                    "font-black uppercase tracking-tighter",
                    paymentsEnabled ? "bg-green-100 text-green-700 hover:bg-green-100" : "bg-red-100 text-red-700 hover:bg-red-100"
                  )}>
                    {paymentsEnabled ? (isSpanish ? "Activo" : "Active") : (isSpanish ? "BLOQUEADO" : "BLOCKED")}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Platform Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                {isSpanish ? "Configuración de la Plataforma" : "Platform Settings"}
              </CardTitle>
              <CardDescription>
                {isSpanish 
                  ? "Ajustes generales de NUREA"
                  : "General NUREA settings"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>{isSpanish ? "Nombre de la Plataforma" : "Platform Name"}</Label>
                <Input value="NUREA" disabled />
              </div>
              <div className="space-y-2">
                <Label>{isSpanish ? "Email de Soporte" : "Support Email"}</Label>
                <Input value="soporte@nurea.app" disabled />
              </div>
              <div className="space-y-2">
                <Label>{isSpanish ? "Idioma por Defecto" : "Default Language"}</Label>
                <Input value={isSpanish ? "Español" : "Spanish"} disabled />
              </div>
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                {isSpanish ? "Seguridad" : "Security"}
              </CardTitle>
              <CardDescription>
                {isSpanish 
                  ? "Configuración de seguridad de la plataforma"
                  : "Platform security settings"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>{isSpanish ? "Verificación de Email" : "Email Verification"}</Label>
                <p className="text-sm text-muted-foreground">
                  {isSpanish 
                    ? "Los usuarios deben verificar su email para usar la plataforma"
                    : "Users must verify their email to use the platform"}
                </p>
                <Badge variant="outline" className="bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20">
                  {isSpanish ? "Habilitado" : "Enabled"}
                </Badge>
              </div>
              <div className="space-y-2">
                <Label>{isSpanish ? "Autenticación de Dos Factores" : "Two-Factor Authentication"}</Label>
                <p className="text-sm text-muted-foreground">
                  {isSpanish 
                    ? "Próximamente disponible"
                    : "Coming soon"}
                </p>
                <Badge variant="outline">
                  {isSpanish ? "No Disponible" : "Not Available"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Email Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                {isSpanish ? "Configuración de Email" : "Email Settings"}
              </CardTitle>
              <CardDescription>
                {isSpanish 
                  ? "Configuración del sistema de emails"
                  : "Email system settings"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>{isSpanish ? "Servidor SMTP" : "SMTP Server"}</Label>
                <Input value="Configurado" disabled />
                <p className="text-xs text-muted-foreground">
                  {isSpanish 
                    ? "Configurado en variables de entorno"
                    : "Configured in environment variables"}
                </p>
              </div>
              <div className="space-y-2">
                <Label>{isSpanish ? "Emails Automáticos" : "Automatic Emails"}</Label>
                <p className="text-sm text-muted-foreground">
                  {isSpanish 
                    ? "Notificaciones automáticas habilitadas"
                    : "Automatic notifications enabled"}
                </p>
                <Badge variant="outline" className="bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20">
                  {isSpanish ? "Activo" : "Active"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Info Notice */}
          <Card className="border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-950/10">
            <CardContent className="p-6">
              <p className="text-sm text-orange-800 dark:text-orange-200">
                {isSpanish 
                  ? "Nota: La mayoría de estas configuraciones requieren cambios en el código o variables de entorno. Contacta al equipo de desarrollo para modificaciones."
                  : "Note: Most of these settings require code or environment variable changes. Contact the development team for modifications."}
              </p>
            </CardContent>
          </Card>
        </div>
      
    </RouteGuard>
  )
}

