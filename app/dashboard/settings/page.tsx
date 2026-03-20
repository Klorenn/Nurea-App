"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Bell,
  Shield,
  Globe,
  CreditCard,
  Trash2,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { Separator } from "@/components/ui/separator"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

export default function SettingsPage() {
  const { language, setLanguage } = useLanguage()
  const isSpanish = language === "es"
  const supabase = createClient()

  // — Notification preferences —
  const [notifLoading, setNotifLoading] = useState(true)
  const [emailNotif, setEmailNotif] = useState(true)
  const [pushNotif, setPushNotif] = useState(true)
  const [appointmentReminders, setAppointmentReminders] = useState(true)
  const [savingNotif, setSavingNotif] = useState(false)

  // — Password change —
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showNewPwd, setShowNewPwd] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)

  // — Delete account —
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState("")
  const [deletingAccount, setDeletingAccount] = useState(false)

  // Load notification preferences on mount
  useEffect(() => {
    const loadPrefs = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data } = await supabase
          .from("profiles")
          .select("notification_preferences")
          .eq("id", user.id)
          .single()

        const prefs = data?.notification_preferences as Record<string, boolean> | null
        if (prefs) {
          setEmailNotif(prefs.email_notifications ?? true)
          setPushNotif(prefs.push_notifications ?? true)
          setAppointmentReminders(prefs.appointment_reminders ?? true)
        }
      } catch {
        // Column may not exist yet — keep defaults
      } finally {
        setNotifLoading(false)
      }
    }
    loadPrefs()
  }, [supabase])

  const saveNotifications = async (patch: Partial<{ email: boolean; push: boolean; reminders: boolean }>) => {
    setSavingNotif(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("No session")

      const next = {
        email_notifications: patch.email ?? emailNotif,
        push_notifications: patch.push ?? pushNotif,
        appointment_reminders: patch.reminders ?? appointmentReminders,
      }

      const { error } = await supabase
        .from("profiles")
        .update({ notification_preferences: next })
        .eq("id", user.id)

      if (error) throw error
      toast.success(isSpanish ? "Preferencias guardadas" : "Preferences saved")
    } catch {
      toast.error(isSpanish ? "No se pudo guardar" : "Could not save")
    } finally {
      setSavingNotif(false)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      toast.error(isSpanish ? "Las contraseñas no coinciden" : "Passwords do not match")
      return
    }
    if (newPassword.length < 8) {
      toast.error(isSpanish ? "La contraseña debe tener al menos 8 caracteres" : "Password must be at least 8 characters")
      return
    }
    setSavingPassword(true)
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword })
      if (error) throw error
      toast.success(isSpanish ? "Contraseña actualizada exitosamente" : "Password updated successfully")
      setShowPasswordForm(false)
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (err: any) {
      toast.error(err.message || (isSpanish ? "Error al cambiar contraseña" : "Error changing password"))
    } finally {
      setSavingPassword(false)
    }
  }

  const handleDeleteAccount = async () => {
    setDeletingAccount(true)
    try {
      const res = await fetch("/api/user/delete-account", { method: "DELETE" })
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.message || "Error")
      }
      toast.success(isSpanish ? "Cuenta eliminada" : "Account deleted")
      await supabase.auth.signOut()
      window.location.href = "/"
    } catch (err: any) {
      toast.error(
        err.message ||
        (isSpanish
          ? "No se pudo eliminar la cuenta. Contacta a soporte."
          : "Could not delete account. Contact support.")
      )
    } finally {
      setDeletingAccount(false)
      setShowDeleteDialog(false)
    }
  }

  return (
    <DashboardLayout role="patient">
      <div className="space-y-8 pb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {isSpanish ? "Configuración" : "Settings"}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isSpanish
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
                <CardTitle>{isSpanish ? "Notificaciones" : "Notifications"}</CardTitle>
                <CardDescription>
                  {isSpanish
                    ? "Controla cómo y cuándo recibes notificaciones"
                    : "Control how and when you receive notifications"}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {notifLoading ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                {isSpanish ? "Cargando..." : "Loading..."}
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">
                      {isSpanish ? "Notificaciones por Email" : "Email Notifications"}
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {isSpanish
                        ? "Recibe recordatorios y actualizaciones por correo"
                        : "Receive reminders and updates via email"}
                    </p>
                  </div>
                  <Switch
                    checked={emailNotif}
                    disabled={savingNotif}
                    onCheckedChange={(v) => {
                      setEmailNotif(v)
                      saveNotifications({ email: v })
                    }}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">
                      {isSpanish ? "Notificaciones Push" : "Push Notifications"}
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {isSpanish
                        ? "Recibe notificaciones en tu dispositivo"
                        : "Receive notifications on your device"}
                    </p>
                  </div>
                  <Switch
                    checked={pushNotif}
                    disabled={savingNotif}
                    onCheckedChange={(v) => {
                      setPushNotif(v)
                      saveNotifications({ push: v })
                    }}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">
                      {isSpanish ? "Recordatorios de Citas" : "Appointment Reminders"}
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {isSpanish
                        ? "Te avisamos antes de tus citas programadas"
                        : "We'll remind you before your scheduled appointments"}
                    </p>
                  </div>
                  <Switch
                    checked={appointmentReminders}
                    disabled={savingNotif}
                    onCheckedChange={(v) => {
                      setAppointmentReminders(v)
                      saveNotifications({ reminders: v })
                    }}
                  />
                </div>
              </>
            )}
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
                <CardTitle>{isSpanish ? "Privacidad y Seguridad" : "Privacy & Security"}</CardTitle>
                <CardDescription>
                  {isSpanish
                    ? "Gestiona tu privacidad y seguridad de cuenta"
                    : "Manage your privacy and account security"}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Password change */}
            <Button
              variant="outline"
              className="w-full justify-start rounded-xl h-auto py-4"
              onClick={() => setShowPasswordForm(!showPasswordForm)}
            >
              <div className="flex items-center gap-3 flex-1">
                <Lock className="h-5 w-5 text-muted-foreground" />
                <div className="text-left flex-1">
                  <p className="font-semibold">
                    {isSpanish ? "Cambiar Contraseña" : "Change Password"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {isSpanish
                      ? "Actualiza tu contraseña regularmente para mantener tu cuenta segura"
                      : "Update your password regularly to keep your account secure"}
                  </p>
                </div>
                {showPasswordForm
                  ? <EyeOff className="h-4 w-4 text-muted-foreground shrink-0" />
                  : <Eye className="h-4 w-4 text-muted-foreground shrink-0" />
                }
              </div>
            </Button>

            {showPasswordForm && (
              <form onSubmit={handlePasswordChange} className="rounded-xl border border-border/60 bg-muted/20 p-5 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="new-pwd">
                    {isSpanish ? "Nueva contraseña" : "New password"}
                  </Label>
                  <div className="relative">
                    <Input
                      id="new-pwd"
                      type={showNewPwd ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder={isSpanish ? "Mínimo 8 caracteres" : "At least 8 characters"}
                      className="rounded-xl pr-10"
                      disabled={savingPassword}
                      required
                      minLength={8}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      onClick={() => setShowNewPwd(!showNewPwd)}
                    >
                      {showNewPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-pwd">
                    {isSpanish ? "Confirmar contraseña" : "Confirm password"}
                  </Label>
                  <Input
                    id="confirm-pwd"
                    type={showNewPwd ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder={isSpanish ? "Repite la contraseña" : "Repeat password"}
                    className="rounded-xl"
                    disabled={savingPassword}
                    required
                  />
                  {confirmPassword && newPassword !== confirmPassword && (
                    <p className="text-xs text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {isSpanish ? "Las contraseñas no coinciden" : "Passwords do not match"}
                    </p>
                  )}
                </div>
                <div className="flex gap-3 pt-1">
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-xl"
                    onClick={() => { setShowPasswordForm(false); setNewPassword(""); setConfirmPassword("") }}
                    disabled={savingPassword}
                  >
                    {isSpanish ? "Cancelar" : "Cancel"}
                  </Button>
                  <Button
                    type="submit"
                    className="rounded-xl bg-teal-600 hover:bg-teal-700"
                    disabled={savingPassword || newPassword !== confirmPassword || newPassword.length < 8}
                  >
                    {savingPassword ? (
                      <><Loader2 className="h-4 w-4 mr-2 animate-spin" />{isSpanish ? "Guardando..." : "Saving..."}</>
                    ) : (
                      <><CheckCircle2 className="h-4 w-4 mr-2" />{isSpanish ? "Guardar contraseña" : "Save password"}</>
                    )}
                  </Button>
                </div>
              </form>
            )}
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
                <CardTitle>{isSpanish ? "Idioma y Región" : "Language & Region"}</CardTitle>
                <CardDescription>
                  {isSpanish ? "Personaliza tu experiencia en NUREA" : "Personalize your NUREA experience"}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base">{isSpanish ? "Idioma" : "Language"}</Label>
                <p className="text-sm text-muted-foreground">
                  {isSpanish ? "Actualmente: Español" : "Currently: English"}
                </p>
              </div>
              <Button
                variant="outline"
                className="rounded-xl"
                onClick={() => setLanguage(language === "es" ? "en" : "es")}
              >
                {isSpanish ? "Switch to English" : "Cambiar a Español"}
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
                <CardTitle>{isSpanish ? "Métodos de Pago" : "Payment Methods"}</CardTitle>
                <CardDescription>
                  {isSpanish
                    ? "Los pagos se gestionan a través de MercadoPago al agendar una cita"
                    : "Payments are managed through MercadoPago when booking an appointment"}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground rounded-xl bg-muted/40 px-4 py-3 border border-border/40">
              {isSpanish
                ? "Los métodos de pago se configuran automáticamente al completar el pago de tu cita mediante MercadoPago. No se almacenan datos de tarjetas en NUREA."
                : "Payment methods are configured automatically when completing your appointment payment via MercadoPago. No card data is stored in NUREA."}
            </p>
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
                  {isSpanish ? "Zona de Peligro" : "Danger Zone"}
                </CardTitle>
                <CardDescription>
                  {isSpanish ? "Acciones irreversibles en tu cuenta" : "Irreversible actions on your account"}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              variant="destructive"
              className="rounded-xl"
              onClick={() => setShowDeleteDialog(true)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {isSpanish ? "Eliminar Cuenta" : "Delete Account"}
            </Button>
            <p className="text-sm text-muted-foreground">
              {isSpanish
                ? "Esta acción no se puede deshacer. Se eliminará toda tu información permanentemente."
                : "This action cannot be undone. All your information will be permanently deleted."}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Delete account confirmation */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive">
              {isSpanish ? "¿Eliminar tu cuenta?" : "Delete your account?"}
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3">
                <p>
                  {isSpanish
                    ? "Esta acción es permanente e irreversible. Se eliminarán todos tus datos, citas, historial médico y acceso a la plataforma."
                    : "This action is permanent and irreversible. All your data, appointments, medical history, and platform access will be deleted."}
                </p>
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">
                    {isSpanish
                      ? 'Escribe "ELIMINAR" para confirmar'
                      : 'Type "DELETE" to confirm'}
                  </Label>
                  <Input
                    value={deleteConfirmText}
                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                    placeholder={isSpanish ? "ELIMINAR" : "DELETE"}
                    className="rounded-xl"
                  />
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deletingAccount}>
              {isSpanish ? "Cancelar" : "Cancel"}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => { e.preventDefault(); handleDeleteAccount() }}
              disabled={
                deletingAccount ||
                deleteConfirmText !== (isSpanish ? "ELIMINAR" : "DELETE")
              }
              className="bg-destructive hover:bg-destructive/90 text-white"
            >
              {deletingAccount ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" />{isSpanish ? "Eliminando..." : "Deleting..."}</>
              ) : (
                isSpanish ? "Sí, eliminar mi cuenta" : "Yes, delete my account"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  )
}
