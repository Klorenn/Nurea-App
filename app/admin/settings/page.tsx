"use client"

import { AdminLayout } from "@/components/admin/admin-layout"
import { RouteGuard } from "@/components/auth/route-guard"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Settings, Globe, Shield, Mail } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"

export default function AdminSettingsPage() {
  const { language } = useLanguage()
  const isSpanish = language === "es"

  return (
    <RouteGuard requiredRole="admin">
      <AdminLayout>
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
      </AdminLayout>
    </RouteGuard>
  )
}

