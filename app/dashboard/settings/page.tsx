"use client"


import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { useLanguage } from "@/contexts/language-context"

const C = {
  bg: "oklch(0.985 0.008 150)",
  bgWarm: "oklch(0.97 0.015 85)",
  panel: "#fff",
  ink: "oklch(0.22 0.025 170)",
  inkSoft: "oklch(0.42 0.02 170)",
  inkMute: "oklch(0.58 0.015 170)",
  line: "oklch(0.88 0.015 150)",
  lineSoft: "oklch(0.93 0.012 150)",
  sage100: "oklch(0.95 0.025 170)",
  sage300: "oklch(0.78 0.06 170)",
  sage500: "oklch(0.58 0.07 170)",
  sage700: "oklch(0.38 0.05 170)",
  terracotta: "oklch(0.68 0.11 45)",
  danger: "oklch(0.55 0.19 25)",
  dangerSoft: "oklch(0.96 0.025 25)",
}

type Tab = "perfil" | "cuenta" | "notificaciones" | "idioma" | "privacidad"

interface ProfileData {
  id: string
  first_name: string | null
  last_name: string | null
  email: string | null
  phone: string | null
  city: string | null
  region: string | null
  language: "es" | "en"
  notification_preferences: Record<string, boolean> | null
  privacy_preferences: Record<string, boolean> | null
}

const defaultNotif = {
  email_notifications: true,
  push_notifications: true,
  appointment_reminders: true,
  marketing_emails: false,
  forum_replies: true,
  new_messages: true,
}

const defaultPrivacy = {
  show_online_status: true,
  profile_public: true,
  allow_direct_messages: true,
}

export default function PatientSettingsPage() {
  const supabase = useMemo(() => createClient(), [])
  const { language, setLanguage } = useLanguage()
  const isES = language === "es"
  const router = useRouter()

  const [tab, setTab] = useState<Tab>("perfil")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profile, setProfile] = useState<ProfileData | null>(null)

  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [phone, setPhone] = useState("")
  const [city, setCity] = useState("")
  const [region, setRegion] = useState("")

  const [newPwd, setNewPwd] = useState("")
  const [confirmPwd, setConfirmPwd] = useState("")

  const [notif, setNotif] = useState<Record<string, boolean>>(defaultNotif)
  const [privacy, setPrivacy] = useState<Record<string, boolean>>(defaultPrivacy)

  const [deleteConfirm, setDeleteConfirm] = useState("")

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        router.replace("/login")
        return
      }
      const { data } = await supabase
        .from("profiles")
        .select(
          "id, first_name, last_name, email, phone, city, region, language, notification_preferences, privacy_preferences"
        )
        .eq("id", user.id)
        .single()
      if (data) {
        const p = data as ProfileData
        setProfile(p)
        setFirstName(p.first_name ?? "")
        setLastName(p.last_name ?? "")
        setPhone(p.phone ?? "")
        setCity(p.city ?? "")
        setRegion(p.region ?? "")
        setNotif({ ...defaultNotif, ...(p.notification_preferences || {}) })
        setPrivacy({ ...defaultPrivacy, ...(p.privacy_preferences || {}) })
      }
      setLoading(false)
    }
    load()
  }, [supabase, router])

  async function saveProfile() {
    if (!profile) return
    setSaving(true)
    const { error } = await supabase
      .from("profiles")
      .update({
        first_name: firstName.trim() || null,
        last_name: lastName.trim() || null,
        phone: phone.trim() || null,
        city: city.trim() || null,
        region: region.trim() || null,
      })
      .eq("id", profile.id)
    setSaving(false)
    alert(error ? error.message : isES ? "Perfil actualizado" : "Profile updated")
  }

  async function changePassword() {
    if (!newPwd || newPwd.length < 8) {
      alert(isES ? "La contraseña debe tener al menos 8 caracteres." : "Password must be at least 8 characters.")
      return
    }
    if (newPwd !== confirmPwd) {
      alert(isES ? "Las contraseñas no coinciden." : "Passwords don't match.")
      return
    }
    setSaving(true)
    const { error } = await supabase.auth.updateUser({ password: newPwd })
    setSaving(false)
    if (error) return alert(error.message)
    setNewPwd("")
    setConfirmPwd("")
    alert(isES ? "Contraseña actualizada" : "Password updated")
  }

  async function saveNotif() {
    if (!profile) return
    setSaving(true)
    const { error } = await supabase
      .from("profiles")
      .update({ notification_preferences: notif })
      .eq("id", profile.id)
    setSaving(false)
    alert(error ? error.message : isES ? "Preferencias guardadas" : "Preferences saved")
  }

  async function savePrivacy() {
    if (!profile) return
    setSaving(true)
    const { error } = await supabase
      .from("profiles")
      .update({ privacy_preferences: privacy })
      .eq("id", profile.id)
    setSaving(false)
    alert(error ? error.message : isES ? "Preferencias guardadas" : "Preferences saved")
  }

  async function saveLanguage(lang: "es" | "en") {
    if (!profile) return
    setLanguage(lang)
    await supabase.from("profiles").update({ language: lang }).eq("id", profile.id)
  }

  async function signOut() {
    await supabase.auth.signOut()
    router.replace("/login")
  }

  async function deleteAccount() {
    if (deleteConfirm !== "BORRAR") {
      alert(isES ? 'Escribe "BORRAR" para confirmar.' : 'Type "BORRAR" to confirm.')
      return
    }
    if (!confirm(isES ? "¿Seguro? Esta acción es irreversible." : "Are you sure? This is irreversible.")) return
    setSaving(true)
    try {
      const res = await fetch("/api/account/delete", { method: "DELETE" })
      if (!res.ok) throw new Error(await res.text())
      await supabase.auth.signOut()
      router.replace("/")
    } catch {
      alert(isES ? "No se pudo eliminar la cuenta" : "Could not delete account")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div style={{ background: C.bg, minHeight: "100vh", display: "grid", placeItems: "center" }}>
        <p style={{ color: C.inkMute, fontFamily: "var(--font-jetbrains-mono)", fontSize: 13 }}>
          {isES ? "Cargando…" : "Loading…"}
        </p>
      </div>
    )
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: "perfil", label: isES ? "Perfil" : "Profile" },
    { id: "cuenta", label: isES ? "Cuenta" : "Account" },
    { id: "notificaciones", label: isES ? "Notificaciones" : "Notifications" },
    { id: "idioma", label: isES ? "Idioma" : "Language" },
    { id: "privacidad", label: isES ? "Privacidad" : "Privacy" },
  ]

  return (
    <div style={{ background: C.bg, minHeight: "100vh", color: C.ink, padding: "32px 24px 64px" }}>
      <div style={{ maxWidth: 980, margin: "0 auto" }}>
        <div style={{ marginBottom: 24 }}>
          <div
            style={{
              fontFamily: "var(--font-jetbrains-mono)",
              fontSize: 12,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: C.sage700,
              marginBottom: 8,
            }}
          >
            {isES ? "Configuración" : "Settings"}
          </div>
          <h1
            style={{
              fontFamily: "var(--font-fraunces)",
              fontWeight: 400,
              fontSize: "clamp(32px, 4vw, 42px)",
              lineHeight: 1.1,
              margin: 0,
              color: C.ink,
            }}
          >
            {isES ? "Tu cuenta en Nurea" : "Your Nurea account"}
          </h1>
        </div>

        <div
          style={{
            display: "flex",
            gap: 4,
            marginBottom: 24,
            borderBottom: `1px solid ${C.line}`,
            overflowX: "auto",
          }}
        >
          {tabs.map((t) => {
            const active = tab === t.id
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                style={{
                  padding: "12px 18px",
                  background: "transparent",
                  border: "none",
                  borderBottom: `2px solid ${active ? C.sage700 : "transparent"}`,
                  color: active ? C.ink : C.inkMute,
                  fontWeight: active ? 600 : 500,
                  fontSize: 14,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                {t.label}
              </button>
            )
          })}
        </div>

        {tab === "perfil" && (
          <Section
            title={isES ? "Información personal" : "Personal info"}
            description={
              isES ? "Estos datos se usan en reservas y comunicación." : "Used for bookings and communication."
            }
          >
            <div style={grid2}>
              <Field label={isES ? "Nombre" : "First name"} value={firstName} onChange={setFirstName} />
              <Field label={isES ? "Apellido" : "Last name"} value={lastName} onChange={setLastName} />
              <Field label={isES ? "Teléfono" : "Phone"} value={phone} onChange={setPhone} placeholder="+56 9 …" />
              <Field label="Email" value={profile?.email ?? ""} readOnly />
              <Field label={isES ? "Ciudad" : "City"} value={city} onChange={setCity} />
              <Field label={isES ? "Región" : "Region"} value={region} onChange={setRegion} />
            </div>
            <div style={{ marginTop: 20, display: "flex", justifyContent: "flex-end" }}>
              <button onClick={saveProfile} disabled={saving} style={btnPrimary}>
                {saving ? (isES ? "Guardando…" : "Saving…") : isES ? "Guardar cambios" : "Save changes"}
              </button>
            </div>
          </Section>
        )}

        {tab === "cuenta" && (
          <>
            <Section title={isES ? "Cambiar contraseña" : "Change password"}>
              <div style={grid2}>
                <Field
                  label={isES ? "Nueva contraseña" : "New password"}
                  value={newPwd}
                  onChange={setNewPwd}
                  type="password"
                />
                <Field
                  label={isES ? "Confirmar contraseña" : "Confirm password"}
                  value={confirmPwd}
                  onChange={setConfirmPwd}
                  type="password"
                />
              </div>
              <div style={{ marginTop: 16, display: "flex", justifyContent: "flex-end" }}>
                <button onClick={changePassword} disabled={saving} style={btnPrimary}>
                  {isES ? "Actualizar contraseña" : "Update password"}
                </button>
              </div>
            </Section>

            <Section title={isES ? "Sesión" : "Session"}>
              <p style={{ color: C.inkSoft, margin: "0 0 16px" }}>
                {isES
                  ? "Cierra sesión en este dispositivo. Tus datos se mantienen intactos."
                  : "Sign out on this device. Your data stays intact."}
              </p>
              <button onClick={signOut} style={btnSecondary}>
                {isES ? "Cerrar sesión" : "Sign out"}
              </button>
            </Section>

            <DangerZone
              title={isES ? "Zona de peligro" : "Danger zone"}
              description={
                isES
                  ? "Eliminar tu cuenta borra permanentemente todos tus datos, reservas y mensajes."
                  : "Deleting your account permanently removes all your data, bookings, and messages."
              }
            >
              <Field
                label={isES ? 'Escribe "BORRAR" para confirmar' : 'Type "BORRAR" to confirm'}
                value={deleteConfirm}
                onChange={setDeleteConfirm}
              />
              <div style={{ marginTop: 14 }}>
                <button onClick={deleteAccount} disabled={saving} style={btnDanger}>
                  {isES ? "Eliminar mi cuenta" : "Delete my account"}
                </button>
              </div>
            </DangerZone>
          </>
        )}

        {tab === "notificaciones" && (
          <Section
            title={isES ? "Notificaciones" : "Notifications"}
            description={isES ? "Decide qué avisos quieres recibir." : "Choose what alerts you want to receive."}
          >
            <ToggleRow
              label={isES ? "Emails generales" : "General emails"}
              hint={isES ? "Mensajes y actualizaciones importantes." : "Messages and important updates."}
              checked={notif.email_notifications}
              onChange={(v) => setNotif((n) => ({ ...n, email_notifications: v }))}
            />
            <ToggleRow
              label={isES ? "Notificaciones push" : "Push notifications"}
              hint={isES ? "Alertas en el navegador o móvil." : "Alerts in browser or mobile."}
              checked={notif.push_notifications}
              onChange={(v) => setNotif((n) => ({ ...n, push_notifications: v }))}
            />
            <ToggleRow
              label={isES ? "Recordatorios de cita" : "Appointment reminders"}
              hint={isES ? "24h y 2h antes de tu hora." : "24h and 2h before your booking."}
              checked={notif.appointment_reminders}
              onChange={(v) => setNotif((n) => ({ ...n, appointment_reminders: v }))}
            />
            <ToggleRow
              label={isES ? "Nuevos mensajes" : "New messages"}
              checked={notif.new_messages}
              onChange={(v) => setNotif((n) => ({ ...n, new_messages: v }))}
            />
            <ToggleRow
              label={isES ? "Respuestas en foro" : "Forum replies"}
              checked={notif.forum_replies}
              onChange={(v) => setNotif((n) => ({ ...n, forum_replies: v }))}
            />
            <ToggleRow
              label={isES ? "Emails de marketing" : "Marketing emails"}
              hint={isES ? "Novedades, blog y lanzamientos." : "Product news, blog and launches."}
              checked={notif.marketing_emails}
              onChange={(v) => setNotif((n) => ({ ...n, marketing_emails: v }))}
            />
            <div style={{ marginTop: 20, display: "flex", justifyContent: "flex-end" }}>
              <button onClick={saveNotif} disabled={saving} style={btnPrimary}>
                {isES ? "Guardar preferencias" : "Save preferences"}
              </button>
            </div>
          </Section>
        )}

        {tab === "idioma" && (
          <Section
            title={isES ? "Idioma" : "Language"}
            description={isES ? "Afecta toda la interfaz de Nurea." : "Affects the entire Nurea interface."}
          >
            <div style={{ display: "grid", gap: 12, gridTemplateColumns: "1fr 1fr" }}>
              {(["es", "en"] as const).map((lang) => {
                const active = language === lang
                const label = lang === "es" ? "Español (Chile)" : "English"
                return (
                  <button
                    key={lang}
                    onClick={() => saveLanguage(lang)}
                    style={{
                      padding: "18px 20px",
                      borderRadius: 14,
                      border: `1px solid ${active ? C.sage700 : C.line}`,
                      background: active ? C.sage100 : "#fff",
                      textAlign: "left",
                      cursor: "pointer",
                      color: C.ink,
                    }}
                  >
                    <div style={{ fontWeight: 600, marginBottom: 4 }}>{label}</div>
                    <div style={{ fontSize: 12, color: C.inkMute }}>
                      {lang === "es" ? "es-CL · America/Santiago" : "en-US"}
                    </div>
                  </button>
                )
              })}
            </div>
          </Section>
        )}

        {tab === "privacidad" && (
          <Section
            title={isES ? "Privacidad" : "Privacy"}
            description={isES ? "Controla quién puede verte y contactarte." : "Control who can see and contact you."}
          >
            <ToggleRow
              label={isES ? "Mostrar estado en línea" : "Show online status"}
              checked={privacy.show_online_status}
              onChange={(v) => setPrivacy((p) => ({ ...p, show_online_status: v }))}
            />
            <ToggleRow
              label={isES ? "Perfil público" : "Public profile"}
              hint={isES ? "Visible en búsquedas y el foro." : "Visible in search and forum."}
              checked={privacy.profile_public}
              onChange={(v) => setPrivacy((p) => ({ ...p, profile_public: v }))}
            />
            <ToggleRow
              label={isES ? "Permitir mensajes directos" : "Allow direct messages"}
              checked={privacy.allow_direct_messages}
              onChange={(v) => setPrivacy((p) => ({ ...p, allow_direct_messages: v }))}
            />
            <div style={{ marginTop: 20, display: "flex", justifyContent: "flex-end" }}>
              <button onClick={savePrivacy} disabled={saving} style={btnPrimary}>
                {isES ? "Guardar" : "Save"}
              </button>
            </div>
          </Section>
        )}
      </div>
    </div>
  )
}

const grid2: React.CSSProperties = {
  display: "grid",
  gap: 14,
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
}

const btnPrimary: React.CSSProperties = {
  padding: "10px 18px",
  borderRadius: 10,
  border: "none",
  background: C.sage700,
  color: "#fff",
  fontSize: 14,
  fontWeight: 600,
  cursor: "pointer",
}

const btnSecondary: React.CSSProperties = {
  padding: "10px 18px",
  borderRadius: 10,
  border: `1px solid ${C.line}`,
  background: "#fff",
  color: C.ink,
  fontSize: 14,
  fontWeight: 500,
  cursor: "pointer",
}

const btnDanger: React.CSSProperties = {
  padding: "10px 18px",
  borderRadius: 10,
  border: `1px solid ${C.danger}`,
  background: C.danger,
  color: "#fff",
  fontSize: 14,
  fontWeight: 600,
  cursor: "pointer",
}

function Section({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <section
      style={{
        background: C.panel,
        border: `1px solid ${C.line}`,
        borderRadius: 20,
        padding: 28,
        marginBottom: 22,
      }}
    >
      <h2
        style={{
          fontFamily: "var(--font-fraunces)",
          fontWeight: 500,
          fontSize: 22,
          lineHeight: 1.2,
          margin: 0,
          color: C.ink,
        }}
      >
        {title}
      </h2>
      {description && (
        <p style={{ color: C.inkSoft, fontSize: 14, margin: "8px 0 20px" }}>{description}</p>
      )}
      {!description && <div style={{ height: 16 }} />}
      {children}
    </section>
  )
}

function DangerZone({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <section
      style={{
        background: C.dangerSoft,
        border: `1px solid ${C.danger}`,
        borderRadius: 20,
        padding: 28,
      }}
    >
      <h2
        style={{
          fontFamily: "var(--font-fraunces)",
          fontWeight: 500,
          fontSize: 22,
          margin: 0,
          color: C.danger,
        }}
      >
        {title}
      </h2>
      <p style={{ color: C.inkSoft, fontSize: 14, margin: "8px 0 20px" }}>{description}</p>
      {children}
    </section>
  )
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  readOnly,
}: {
  label: string
  value: string
  onChange?: (v: string) => void
  placeholder?: string
  type?: string
  readOnly?: boolean
}) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <span
        style={{
          fontFamily: "var(--font-jetbrains-mono)",
          fontSize: 11,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: C.inkMute,
        }}
      >
        {label}
      </span>
      <input
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        type={type}
        readOnly={readOnly}
        style={{
          padding: "10px 12px",
          borderRadius: 10,
          border: `1px solid ${C.line}`,
          background: readOnly ? C.lineSoft : "#fff",
          color: C.ink,
          fontSize: 14,
          outline: "none",
        }}
      />
    </label>
  )
}

function ToggleRow({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string
  hint?: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <label
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 16,
        padding: "14px 0",
        borderBottom: `1px solid ${C.lineSoft}`,
        cursor: "pointer",
      }}
    >
      <div>
        <div style={{ fontWeight: 500, color: C.ink, fontSize: 15 }}>{label}</div>
        {hint && <div style={{ color: C.inkMute, fontSize: 13, marginTop: 2 }}>{hint}</div>}
      </div>
      <div
        onClick={() => onChange(!checked)}
        style={{
          width: 44,
          height: 26,
          borderRadius: 999,
          background: checked ? C.sage700 : C.line,
          position: "relative",
          transition: "background 0.2s",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 3,
            left: checked ? 21 : 3,
            width: 20,
            height: 20,
            borderRadius: "50%",
            background: "#fff",
            transition: "left 0.2s",
            boxShadow: "0 1px 3px oklch(0.22 0.025 170 / 0.25)",
          }}
        />
      </div>
    </label>
  )
}
