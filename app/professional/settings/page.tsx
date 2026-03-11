"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { RouteGuard } from "@/components/auth/route-guard"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { 
  Bell, 
  Shield, 
  Globe,
  Moon,
  Sun,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Wallet,
  RefreshCw
} from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { useTheme } from "next-themes"
import { connectWallet, StellarWalletError } from "@/lib/services/stellarService"

export default function ProfessionalSettingsPage() {
  const { language } = useLanguage()
  const { theme, setTheme } = useTheme()
  const isSpanish = language === "es"
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  
  // Notification settings
  const [appointmentNotifications, setAppointmentNotifications] = useState(true)
  const [messageNotifications, setMessageNotifications] = useState(true)
  const [paymentNotifications, setPaymentNotifications] = useState(true)
  
  // Privacy settings
  const [profileVisible, setProfileVisible] = useState(true)

  // Stellar wallet (método de cobro)
  const [stellarWallet, setStellarWallet] = useState<string | null>(null)
  const [walletLoading, setWalletLoading] = useState(false)
  const [walletError, setWalletError] = useState<string | null>(null)
  const [walletSuccess, setWalletSuccess] = useState<string | null>(null)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/professional/settings")
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || (isSpanish ? "Error al cargar configuración" : "Error loading settings"))
      }

      const settings = data.settings
      
      // Set notification preferences
      if (settings.notifications) {
        setAppointmentNotifications(settings.notifications.appointments ?? true)
        setMessageNotifications(settings.notifications.messages ?? true)
        setPaymentNotifications(settings.notifications.payments ?? true)
      }
      
      // Set privacy settings
      if (settings.privacy) {
        setProfileVisible(settings.privacy.profileVisible ?? true)
      }

      // Wallet Stellar para cobros
      setStellarWallet(data.stellarWallet ?? null)
    } catch (err) {
      console.error("Error loading settings:", err)
      setError(err instanceof Error ? err.message : (isSpanish ? "Error al cargar configuración" : "Error loading settings"))
    } finally {
      setLoading(false)
    }
  }

  const saveSettings = async () => {
    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch("/api/professional/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          notifications: {
            appointments: appointmentNotifications,
            messages: messageNotifications,
            payments: paymentNotifications,
          },
          privacy: {
            profileVisible,
          },
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || (isSpanish ? "Error al guardar configuración" : "Error saving settings"))
      }

      setSuccess(isSpanish ? "Configuración actualizada exitosamente" : "Settings updated successfully")
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      console.error("Error saving settings:", err)
      setError(err instanceof Error ? err.message : (isSpanish ? "Error al guardar configuración" : "Error saving settings"))
    } finally {
      setSaving(false)
    }
  }

  const handleNotificationChange = async (type: 'appointments' | 'messages' | 'payments', value: boolean) => {
    if (type === 'appointments') {
      setAppointmentNotifications(value)
    } else if (type === 'messages') {
      setMessageNotifications(value)
    } else if (type === 'payments') {
      setPaymentNotifications(value)
    }
    
    // Auto-save notification preferences
    setTimeout(() => {
      saveSettings()
    }, 500)
  }

  const handlePrivacyChange = async (value: boolean) => {
    setProfileVisible(value)
    // Auto-save privacy preferences
    setTimeout(() => {
      saveSettings()
    }, 500)
  }

  /** Conectar Freighter y guardar la clave pública en Supabase (professionals.stellar_wallet). */
  const handleConnectWallet = async () => {
    setWalletLoading(true)
    setWalletError(null)
    setWalletSuccess(null)
    try {
      const publicKey = await connectWallet()
      const res = await fetch("/api/professional/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stellar_wallet: publicKey }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || "Error al guardar la wallet.")
      setStellarWallet(publicKey)
      setWalletSuccess(isSpanish ? "Wallet guardada correctamente" : "Wallet saved successfully")
      setTimeout(() => setWalletSuccess(null), 4000)
    } catch (err) {
      if (err instanceof StellarWalletError) {
        setWalletError(err.message)
      } else {
        setWalletError(err instanceof Error ? err.message : (isSpanish ? "Error al conectar la wallet" : "Error connecting wallet"))
      }
    } finally {
      setWalletLoading(false)
    }
  }

  /** Mostrar clave pública truncada (ej. GABC...WXYZ). */
  const truncateWallet = (key: string) => {
    if (key.length <= 12) return key
    return `${key.slice(0, 4)}...${key.slice(-4)}`
  }

  if (loading) {
    return (
      <RouteGuard requiredRole="professional">
        <DashboardLayout role="professional">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </DashboardLayout>
      </RouteGuard>
    )
  }

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

          {/* Success/Error Messages */}
          {success && (
            <div className="bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 rounded-xl p-4 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5" />
              <p>{success}</p>
            </div>
          )}
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive rounded-xl p-4 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              <p>{error}</p>
            </div>
          )}

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
                <Switch 
                  checked={appointmentNotifications}
                  onCheckedChange={(checked) => handleNotificationChange('appointments', checked)}
                  disabled={saving}
                />
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
                <Switch 
                  checked={messageNotifications}
                  onCheckedChange={(checked) => handleNotificationChange('messages', checked)}
                  disabled={saving}
                />
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
                <Switch 
                  checked={paymentNotifications}
                  onCheckedChange={(checked) => handleNotificationChange('payments', checked)}
                  disabled={saving}
                />
              </div>
            </CardContent>
          </Card>

          {/* Método de Cobro (Stellar) */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5" />
                {isSpanish ? "Método de Cobro (Stellar)" : "Payment Method (Stellar)"}
              </CardTitle>
              <CardDescription>
                {isSpanish
                  ? "Conecta tu wallet de Stellar para recibir los pagos de las consultas a través del depósito en garantía (escrow) de Nurea."
                  : "Connect your Stellar wallet to receive payments from consultations via Nurea's escrow."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {walletSuccess && (
                <div className="bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 rounded-lg p-3 flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <p>{walletSuccess}</p>
                </div>
              )}
              {walletError && (
                <div className="bg-destructive/10 border border-destructive/20 text-destructive rounded-lg p-3 flex items-center gap-2 text-sm">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <p>{walletError}</p>
                </div>
              )}
              {stellarWallet ? (
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="flex-1 rounded-lg bg-muted/50 px-4 py-3 font-mono text-sm break-all">
                    {truncateWallet(stellarWallet)}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleConnectWallet}
                    disabled={walletLoading}
                    className="shrink-0"
                  >
                    {walletLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        {isSpanish ? "Cambiar Wallet" : "Change Wallet"}
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <Button
                  type="button"
                  onClick={handleConnectWallet}
                  disabled={walletLoading}
                  className="w-full sm:w-auto"
                >
                  {walletLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    isSpanish ? "Conectar Wallet para Recibir Pagos" : "Connect Wallet to Receive Payments"
                  )}
                </Button>
              )}
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
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{isSpanish ? "Visibilidad del Perfil" : "Profile Visibility"}</Label>
                  <p className="text-sm text-muted-foreground">
                    {isSpanish 
                      ? "Tu perfil profesional es visible para pacientes que buscan atención"
                      : "Your professional profile is visible to patients seeking care"}
                  </p>
                </div>
                <Switch 
                  checked={profileVisible}
                  onCheckedChange={handlePrivacyChange}
                  disabled={saving}
                />
              </div>
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

