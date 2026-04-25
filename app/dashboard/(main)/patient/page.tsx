"use client"
import { useUser } from "@/hooks/use-user"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { useProfile } from "@/hooks/use-profile"
import { useLanguage } from "@/contexts/language-context"

/* ------------------------------------------------------------------
 *  Iconos inline
 * ------------------------------------------------------------------ */
const icoCalendar = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <path d="M16 2v4M8 2v4M3 10h18" />
  </svg>
)
const icoHeart = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
)
const icoChat = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
)
const icoCheckCircle = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <path d="M22 4L12 14.01l-3-3" />
  </svg>
)
const icoPlus = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 5v14M5 12h14" />
  </svg>
)
const icoArrow = (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M5 12h14M13 5l7 7-7 7" />
  </svg>
)

/* ------------------------------------------------------------------
 *  Design tokens (inline — no tocamos los tokens globales del tema)
 * ------------------------------------------------------------------ */
const C = {
  bg: "oklch(0.985 0.008 150)",
  bgWarm: "oklch(0.97 0.015 85)",
  ink: "oklch(0.22 0.025 170)",
  inkSoft: "oklch(0.42 0.02 170)",
  inkMute: "oklch(0.58 0.015 170)",
  line: "oklch(0.88 0.015 150)",
  lineSoft: "oklch(0.93 0.012 150)",
  sage50: "oklch(0.97 0.015 170)",
  sage100: "oklch(0.95 0.025 170)",
  sage200: "oklch(0.88 0.045 170)",
  sage300: "oklch(0.78 0.06 170)",
  sage500: "oklch(0.58 0.07 170)",
  sage700: "oklch(0.38 0.05 170)",
  sage900: "oklch(0.22 0.03 170)",
  terracotta: "oklch(0.68 0.11 45)",
  terracottaDeep: "oklch(0.52 0.13 40)",
  terracottaSoft: "oklch(0.92 0.04 55)",
  amberSoft: "oklch(0.96 0.035 85)",
  amber: "oklch(0.55 0.1 70)",
  blueSoft: "oklch(0.94 0.03 230)",
  blue: "oklch(0.4 0.1 230)",
  blueMid: "oklch(0.65 0.09 230)",
}

/* ------------------------------------------------------------------
 *  Tipos
 * ------------------------------------------------------------------ */
interface Appointment {
  id: string
  appointment_date: string
  appointment_time: string
  type: string | null
  status: string | null
  duration_minutes?: number | null
  professional?: {
    id?: string
    first_name?: string | null
    last_name?: string | null
    specialty?: string | null
  } | null
}

interface Suggestion {
  id: string
  first_name: string | null
  last_name: string | null
  specialty: string | null
  years_experience?: number | null
  base_price?: number | null
  city?: string | null
  consultation_type?: string | null
}

interface MessagePreview {
  id: string
  preview: string
  created_at: string
  unread: boolean
  other_name: string
}

/* ------------------------------------------------------------------
 *  Helpers
 * ------------------------------------------------------------------ */
function greet(isES: boolean): string {
  const h = new Date().getHours()
  if (isES) {
    if (h < 12) return "Buenos días"
    if (h < 19) return "Buenas tardes"
    return "Buenas noches"
  }
  if (h < 12) return "Good morning"
  if (h < 19) return "Good afternoon"
  return "Good evening"
}

function hourPart(time: string): { h: string; m: string } {
  const [h = "00", m = "00"] = time.split(":")
  return { h, m }
}

function shortDayLabel(dateStr: string, isES: boolean): string {
  try {
    const d = new Date(dateStr + "T00:00:00")
    const today = new Date()
    const t = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const dDay = new Date(d.getFullYear(), d.getMonth(), d.getDate())
    const diff = Math.round((dDay.getTime() - t.getTime()) / 86400000)
    if (diff === 0) return isES ? "hoy" : "today"
    if (diff === 1) return isES ? "mañana" : "tmrw"
    return d.toLocaleDateString(isES ? "es-CL" : "en-US", { weekday: "short" }).replace(".", "")
  } catch {
    return ""
  }
}

function avatarGradient(seed: string): string {
  const n = (seed.charCodeAt(0) || 0) % 5
  const palette = [
    "linear-gradient(135deg, oklch(0.78 0.06 170), oklch(0.62 0.08 160))",
    "linear-gradient(135deg, oklch(0.8 0.08 60), oklch(0.68 0.1 45))",
    "linear-gradient(135deg, oklch(0.75 0.05 230), oklch(0.62 0.07 220))",
    "linear-gradient(135deg, oklch(0.82 0.05 340), oklch(0.7 0.07 330))",
    "linear-gradient(135deg, oklch(0.78 0.08 20), oklch(0.65 0.1 10))",
  ]
  return palette[n]
}

/* ------------------------------------------------------------------
 *  Styles helpers
 * ------------------------------------------------------------------ */
const cardStyle: React.CSSProperties = {
  background: "white",
  border: `1px solid ${C.lineSoft}`,
  borderRadius: 18,
  padding: 22,
}

const chipBase: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  padding: "4px 10px",
  borderRadius: 999,
  fontSize: 11,
  fontWeight: 500,
}

function chipStyle(tone: "sage" | "amber" | "blue" | "terracotta" | "mute"): React.CSSProperties {
  if (tone === "sage") return { ...chipBase, background: C.sage100, color: C.sage700 }
  if (tone === "amber") return { ...chipBase, background: C.amberSoft, color: C.amber }
  if (tone === "blue") return { ...chipBase, background: C.blueSoft, color: C.blue }
  if (tone === "terracotta") return { ...chipBase, background: C.terracottaSoft, color: C.terracotta }
  return { ...chipBase, background: C.bgWarm, color: C.inkSoft }
}

const dotStyle: React.CSSProperties = { width: 6, height: 6, borderRadius: "50%", background: "currentColor" }

/* ------------------------------------------------------------------
 *  Patient dashboard
 * ------------------------------------------------------------------ */
export default function PatientDashboardPage() {
  const { user } = useUser()
  const { profile } = useProfile()
  const { language } = useLanguage()
  const isES = language === "es"
  const supabase = useMemo(() => createClient(), [])

  const [loading, setLoading] = useState(true)
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [stats, setStats] = useState({ upcoming: 0, completed: 0, professionals: 0, unread: 0 })
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [messages, setMessages] = useState<MessagePreview[]>([])

  useEffect(() => {
    if (!user?.id) return
    let cancelled = false

    const run = async () => {
      try {
        const today = new Date().toISOString().split("T")[0]

        // — Próximas citas
        const { data: nextApts } = await supabase
          .from("appointments")
          .select(
            `id, appointment_date, appointment_time, type, status, duration_minutes,
             professional:profiles!appointments_professional_id_fkey(id, first_name, last_name, specialty)`
          )
          .eq("patient_id", user.id)
          .gte("appointment_date", today)
          .in("status", ["confirmed", "pending"])
          .order("appointment_date", { ascending: true })
          .order("appointment_time", { ascending: true })
          .limit(5)

        // — Sesiones completadas (total histórico)
        const { count: completedCount } = await supabase
          .from("appointments")
          .select("*", { count: "exact", head: true })
          .eq("patient_id", user.id)
          .eq("status", "completed")

        // — Profesionales únicos (red personal)
        const { data: patientPros } = await supabase
          .from("appointments")
          .select("professional_id")
          .eq("patient_id", user.id)

        // — Mensajes sin leer (si la tabla existe)
        let unreadCount = 0
        let msgList: MessagePreview[] = []
        try {
          const { count } = await supabase
            .from("messages")
            .select("*", { count: "exact", head: true })
            .eq("recipient_id", user.id)
            .eq("read", false)
          unreadCount = count || 0

          const { data: recentMsgs } = await supabase
            .from("messages")
            .select(
              `id, body, created_at, read,
               sender:profiles!messages_sender_id_fkey(first_name, last_name)`
            )
            .eq("recipient_id", user.id)
            .order("created_at", { ascending: false })
            .limit(4)

          msgList =
            recentMsgs?.map((m: any) => ({
              id: m.id,
              preview: (m.body || "").slice(0, 60),
              created_at: m.created_at,
              unread: !m.read,
              other_name: `${m.sender?.first_name ?? ""} ${m.sender?.last_name ?? ""}`.trim() || "Nurea",
            })) || []
        } catch {
          // Tabla inexistente — ignoramos
        }

        // — Sugerencias (profesionales verificados)
        const { data: proPool } = await supabase
          .from("professionals")
          .select(
            `id, specialty, years_experience, base_price, city, consultation_type,
             profile:profiles!professionals_id_fkey(first_name, last_name)`
          )
          .eq("verified", true)
          .limit(6)

        const suggs: Suggestion[] = (proPool || []).map((p: any) => ({
          id: p.id,
          first_name: p.profile?.first_name ?? null,
          last_name: p.profile?.last_name ?? null,
          specialty: p.specialty ?? null,
          years_experience: p.years_experience ?? null,
          base_price: p.base_price ?? null,
          city: p.city ?? null,
          consultation_type: p.consultation_type ?? null,
        }))

        if (cancelled) return

        setAppointments((nextApts as unknown as Appointment[]) || [])
        setStats({
          upcoming: (nextApts || []).length,
          completed: completedCount || 0,
          professionals: new Set(patientPros?.map((p) => p.professional_id)).size,
          unread: unreadCount,
        })
        setMessages(msgList)
        setSuggestions(suggs.slice(0, 3))
      } catch (err) {
        console.error("[patient dashboard] error", err)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    run()
    return () => {
      cancelled = true
    }
  }, [supabase, user?.id])

  /* — Derivados — */
  const firstName = profile?.first_name || ""
  const nextAppt = appointments[0]
  const todaySummary =
    nextAppt && nextAppt.appointment_date === new Date().toISOString().split("T")[0]
      ? isES
        ? `Tienes una sesión hoy a las ${nextAppt.appointment_time.slice(0, 5)}${
            nextAppt.professional?.last_name ? ` con ${nextAppt.professional.last_name}` : ""
          }.`
        : `You have a session today at ${nextAppt.appointment_time.slice(0, 5)}${
            nextAppt.professional?.last_name ? ` with ${nextAppt.professional.last_name}` : ""
          }.`
      : isES
      ? "Un día tranquilo para cuidarte."
      : "A quiet day to care for yourself."

  /* ------------------------------------------------------------------
   *  Render
   * ------------------------------------------------------------------ */
  return (
    <div
      style={{
        background: C.bgWarm,
        color: C.ink,
        fontFamily: "var(--font-inter), ui-sans-serif, system-ui",
        minHeight: "100%",
        padding: "8px 4px 40px",
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 8px" }}>
        {/* Topbar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 20,
            marginBottom: 28,
            flexWrap: "wrap",
          }}
        >
          <div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 6,
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: C.sage500,
                  display: "inline-block",
                }}
              />
              <span
                style={{
                  fontSize: 11,
                  textTransform: "uppercase",
                  letterSpacing: "0.12em",
                  color: C.sage700,
                  fontWeight: 600,
                }}
              >
                {isES ? "Tu espacio" : "Your space"}
              </span>
            </div>
            <h1
              style={{
                fontFamily: "var(--font-fraunces), serif",
                fontSize: "clamp(26px, 3vw, 32px)",
                letterSpacing: "-0.02em",
                fontWeight: 400,
                margin: 0,
                color: C.ink,
              }}
            >
              {greet(isES)}
              {firstName ? (
                <>
                  ,{" "}
                  <em style={{ fontStyle: "italic", color: C.sage500, fontWeight: 300 }}>
                    {firstName}
                  </em>
                </>
              ) : null}
              .
            </h1>
            <p style={{ color: C.inkSoft, fontSize: 14, marginTop: 4 }}>{todaySummary}</p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Link
              href="/dashboard/appointments"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 18px",
                fontSize: 13,
                fontWeight: 500,
                color: C.ink,
                background: "white",
                border: `1px solid ${C.line}`,
                borderRadius: 999,
                textDecoration: "none",
                transition: "all 0.2s",
              }}
            >
              {icoCalendar}
              {isES ? "Mi agenda" : "My calendar"}
            </Link>
            <Link
              href="/dashboard/patient/buscar"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 18px",
                fontSize: 13,
                fontWeight: 500,
                color: "white",
                background: C.ink,
                borderRadius: 999,
                textDecoration: "none",
                transition: "all 0.2s",
              }}
            >
              {icoPlus}
              {isES ? "Reservar cita" : "Book appointment"}
            </Link>
          </div>
        </div>

        {/* Stats — 4 cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 16,
            marginBottom: 16,
          }}
        >
          <StatCard
            icon={icoCalendar}
            iconBg={C.sage100}
            iconColor={C.sage700}
            label={isES ? "Próximas citas" : "Upcoming"}
            value={stats.upcoming}
            delta={
              nextAppt
                ? isES
                  ? `Siguiente · ${nextAppt.appointment_time.slice(0, 5)}`
                  : `Next · ${nextAppt.appointment_time.slice(0, 5)}`
                : isES
                ? "Sin próximas"
                : "None yet"
            }
            deltaTone="up"
          />
          <StatCard
            icon={icoHeart}
            iconBg={C.terracottaSoft}
            iconColor={C.terracotta}
            label={isES ? "Profesionales" : "Professionals"}
            value={stats.professionals}
            delta={isES ? "En tu red" : "In your network"}
            deltaTone="neutral"
          />
          <StatCard
            icon={icoChat}
            iconBg={C.blueSoft}
            iconColor={C.blueMid}
            label={isES ? "Mensajes" : "Messages"}
            value={messages.length}
            delta={
              stats.unread
                ? `${stats.unread} ${isES ? "sin leer" : "unread"}`
                : isES
                ? "Al día"
                : "All read"
            }
            deltaTone="up"
          />
          <StatCard
            icon={icoCheckCircle}
            iconBg={C.amberSoft}
            iconColor={C.amber}
            label={isES ? "Sesiones completadas" : "Completed"}
            value={stats.completed}
            delta={isES ? "Total" : "Total"}
            deltaTone="neutral"
          />
        </div>

        {/* Agenda + Wellness */}
        <div
          className="nurea-grid-hh"
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1.6fr) minmax(0, 1fr)",
            gap: 16,
            marginBottom: 16,
          }}
        >
          <section style={cardStyle}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <h2
                style={{
                  fontFamily: "var(--font-fraunces), serif",
                  fontSize: 18,
                  letterSpacing: "-0.01em",
                  margin: 0,
                  fontWeight: 400,
                }}
              >
                {isES ? "Agenda de hoy" : "Today's agenda"}
              </h2>
              <Link
                href="/dashboard/appointments"
                style={{
                  fontSize: 12,
                  color: C.sage700,
                  fontWeight: 500,
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                {isES ? "Ver todo" : "View all"} →
              </Link>
            </div>

            {loading ? (
              <LoadingRow />
            ) : appointments.length === 0 ? (
              <EmptyState
                title={isES ? "Sin citas próximas" : "No upcoming appointments"}
                message={
                  isES
                    ? "Cuando reserves tu próxima cita aparecerá aquí."
                    : "Your next appointment will show up here."
                }
                ctaLabel={isES ? "Explorar profesionales" : "Explore professionals"}
                ctaHref="/dashboard/patient/buscar"
              />
            ) : (
              appointments.slice(0, 4).map((apt) => <AppointmentRow key={apt.id} apt={apt} isES={isES} />)
            )}
          </section>

          <section style={cardStyle}>
            <div style={{ marginBottom: 16 }}>
              <h2
                style={{
                  fontFamily: "var(--font-fraunces), serif",
                  fontSize: 18,
                  letterSpacing: "-0.01em",
                  margin: 0,
                  fontWeight: 400,
                }}
              >
                {isES ? "Tu progreso" : "Your progress"}
              </h2>
              <p style={{ fontSize: 12, color: C.inkMute, marginTop: 4 }}>
                {isES ? "Basado en tu historial real de citas" : "Based on your real appointment history"}
              </p>
            </div>

            {/* Sesiones completadas — dato real */}
            <ProgressStat
              label={isES ? "Sesiones completadas" : "Completed sessions"}
              value={stats.completed}
              hint={
                stats.completed === 0
                  ? isES
                    ? "Aún no hay sesiones"
                    : "No sessions yet"
                  : isES
                  ? `${stats.completed} ${stats.completed === 1 ? "sesión" : "sesiones"}`
                  : `${stats.completed} ${stats.completed === 1 ? "session" : "sessions"}`
              }
            />
            <ProgressStat
              label={isES ? "Profesionales de tu red" : "Professionals in your network"}
              value={stats.professionals}
              hint={
                stats.professionals === 0
                  ? isES
                    ? "Sin profesionales aún"
                    : "None yet"
                  : `${stats.professionals}`
              }
            />
            <ProgressStat
              label={isES ? "Próximas citas" : "Upcoming appointments"}
              value={stats.upcoming}
              hint={
                stats.upcoming === 0
                  ? isES
                    ? "Agenda libre"
                    : "Calendar open"
                  : `${stats.upcoming}`
              }
              warm
            />

            <div
              style={{
                marginTop: 8,
                padding: 14,
                background: C.sage50,
                borderRadius: 12,
                fontSize: 12.5,
                color: C.sage700,
                lineHeight: 1.55,
              }}
            >
              <strong>{isES ? "Próximo paso" : "Next step"}</strong>
              <br />
              {nextAppt
                ? isES
                  ? `Tienes una sesión el ${nextAppt.appointment_date} a las ${nextAppt.appointment_time.slice(0, 5)}. Prepara lo que quieras comentar.`
                  : `You have a session on ${nextAppt.appointment_date} at ${nextAppt.appointment_time.slice(0, 5)}. Prepare what you want to discuss.`
                : isES
                ? "Cuando tengas una cita reservada, aparecerán aquí los próximos pasos."
                : "When you have an appointment booked, next steps will appear here."}
            </div>
          </section>
        </div>

        {/* Suggested pros + recent messages */}
        <div
          className="nurea-grid-hh"
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1.6fr) minmax(0, 1fr)",
            gap: 16,
          }}
        >
          <section style={cardStyle}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <h2
                style={{
                  fontFamily: "var(--font-fraunces), serif",
                  fontSize: 18,
                  letterSpacing: "-0.01em",
                  margin: 0,
                  fontWeight: 400,
                }}
              >
                {isES ? "Profesionales sugeridos para ti" : "Suggested professionals"}
              </h2>
              <Link
                href="/dashboard/patient/buscar"
                style={{
                  fontSize: 12,
                  color: C.sage700,
                  fontWeight: 500,
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                {isES ? "Explorar red" : "Explore"} →
              </Link>
            </div>

            {loading ? (
              <LoadingRow />
            ) : suggestions.length === 0 ? (
              <EmptyState
                title={isES ? "Pronto aparecerán recomendaciones" : "Recommendations coming soon"}
                message={
                  isES
                    ? "Explora la red y guarda tus favoritos para recibir sugerencias personalizadas."
                    : "Browse the network and save favorites to get personalized suggestions."
                }
                ctaLabel={isES ? "Buscar profesionales" : "Find professionals"}
                ctaHref="/dashboard/patient/buscar"
              />
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {suggestions.map((p) => (
                  <SuggestionRow key={p.id} p={p} isES={isES} />
                ))}
              </div>
            )}
          </section>

          <section style={cardStyle}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <h2
                style={{
                  fontFamily: "var(--font-fraunces), serif",
                  fontSize: 18,
                  letterSpacing: "-0.01em",
                  margin: 0,
                  fontWeight: 400,
                }}
              >
                {isES ? "Mensajes recientes" : "Recent messages"}
              </h2>
              <Link
                href="/dashboard/chat"
                style={{
                  fontSize: 12,
                  color: C.sage700,
                  fontWeight: 500,
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                {isES ? "Abrir chat" : "Open chat"} →
              </Link>
            </div>

            {loading ? (
              <LoadingRow />
            ) : messages.length === 0 ? (
              <EmptyState
                small
                title={isES ? "Bandeja vacía" : "Inbox empty"}
                message={
                  isES
                    ? "Cuando tengas mensajes nuevos de un profesional, aparecerán aquí."
                    : "New messages from a professional will appear here."
                }
              />
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {messages.slice(0, 4).map((m) => (
                  <MessageRow key={m.id} m={m} isES={isES} />
                ))}
              </div>
            )}
          </section>
        </div>
      </div>

      {/* Responsive stack */}
      <style jsx global>{`
        @media (max-width: 900px) {
          .nurea-grid-hh {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  )
}

/* ------------------------------------------------------------------
 *  StatCard
 * ------------------------------------------------------------------ */
function StatCard({
  icon,
  iconBg,
  iconColor,
  label,
  value,
  delta,
  deltaTone,
}: {
  icon: React.ReactNode
  iconBg: string
  iconColor: string
  label: string
  value: number | string
  delta: string
  deltaTone: "up" | "neutral" | "down"
}) {
  const deltaBg =
    deltaTone === "up" ? C.sage100 : deltaTone === "down" ? "oklch(0.95 0.03 15)" : C.bgWarm
  const deltaFg =
    deltaTone === "up" ? C.sage700 : deltaTone === "down" ? "oklch(0.45 0.12 15)" : C.inkSoft

  return (
    <div style={{ ...cardStyle, padding: 20, overflow: "hidden", position: "relative" }}>
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 14,
          background: iconBg,
          color: iconColor,
        }}
      >
        {icon}
      </div>
      <div
        style={{
          fontSize: 12,
          color: C.inkMute,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          marginBottom: 6,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: "var(--font-fraunces), serif",
          fontSize: 36,
          fontWeight: 400,
          letterSpacing: "-0.025em",
          lineHeight: 1,
          color: C.ink,
        }}
      >
        {value}
      </div>
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 4,
          fontSize: 12,
          marginTop: 8,
          padding: "3px 8px",
          borderRadius: 999,
          background: deltaBg,
          color: deltaFg,
        }}
      >
        {delta}
      </span>
    </div>
  )
}

/* ------------------------------------------------------------------
 *  AppointmentRow
 * ------------------------------------------------------------------ */
function AppointmentRow({ apt, isES }: { apt: Appointment; isES: boolean }) {
  const { h, m } = hourPart(apt.appointment_time || "00:00")
  const proName =
    `${apt.professional?.first_name ?? ""} ${apt.professional?.last_name ?? ""}`.trim() ||
    (isES ? "Profesional" : "Professional")
  const isOnline =
    (apt.type || "").toLowerCase().includes("online") ||
    (apt.type || "").toLowerCase().includes("video")
  const chip = isOnline ? chipStyle("sage") : chipStyle("blue")
  const isToday = apt.appointment_date === new Date().toISOString().split("T")[0]

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "64px 1fr auto",
        gap: 14,
        alignItems: "center",
        padding: 14,
        borderRadius: 14,
        background: C.bgWarm,
        marginBottom: 8,
        transition: "all 0.2s",
        border: "1px solid transparent",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <div
          style={{
            fontFamily: "var(--font-fraunces), serif",
            fontSize: 22,
            lineHeight: 1,
            fontWeight: 400,
          }}
        >
          {h}
          <span style={{ fontSize: 14, color: C.inkMute }}>:{m}</span>
        </div>
        <div
          style={{
            fontSize: 10,
            color: C.inkMute,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            marginTop: 2,
          }}
        >
          {shortDayLabel(apt.appointment_date, isES)}
        </div>
      </div>

      <div>
        <div style={{ fontSize: 13.5, fontWeight: 600, marginBottom: 3, color: C.ink }}>
          {isES ? "Sesión con " : "Session with "}
          {proName}
        </div>
        <div
          style={{
            fontSize: 12,
            color: C.inkSoft,
            display: "flex",
            alignItems: "center",
            gap: 8,
            flexWrap: "wrap",
          }}
        >
          <span style={chip}>
            <span style={dotStyle} />
            {isOnline ? (isES ? "Videoconsulta" : "Video call") : isES ? "Presencial" : "In-person"}
          </span>
          <span>
            {apt.professional?.specialty || (isES ? "Consulta" : "Consultation")} ·{" "}
            {apt.duration_minutes ?? 45} min
          </span>
        </div>
      </div>

      {isToday && isOnline ? (
        <Link
          href={`/consulta/${apt.id}`}
          style={{
            padding: "6px 12px",
            fontSize: 12,
            fontWeight: 500,
            borderRadius: 999,
            background: C.terracotta,
            color: "white",
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          {isES ? "Unirse" : "Join"}
        </Link>
      ) : (
        <Link
          href={`/dashboard/appointments?id=${apt.id}`}
          style={{
            padding: "6px 12px",
            fontSize: 12,
            fontWeight: 500,
            borderRadius: 999,
            background: "white",
            border: `1px solid ${C.line}`,
            color: C.ink,
            textDecoration: "none",
          }}
        >
          {isES ? "Detalles" : "Details"}
        </Link>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------
 *  SuggestionRow
 * ------------------------------------------------------------------ */
function SuggestionRow({ p, isES }: { p: Suggestion; isES: boolean }) {
  const name = `${p.first_name ?? ""} ${p.last_name ?? ""}`.trim() || "Nurea"
  const meta = [
    p.specialty || "",
    p.years_experience ? `${p.years_experience} ${isES ? "años" : "yrs"}` : "",
    p.city || p.consultation_type || (isES ? "Online" : "Online"),
  ]
    .filter(Boolean)
    .join(" · ")

  return (
    <Link
      href={`/professionals/${p.id}`}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: 12,
        borderRadius: 12,
        transition: "background 0.15s",
        textDecoration: "none",
        color: C.ink,
      }}
    >
      <div
        style={{
          width: 38,
          height: 38,
          borderRadius: "50%",
          flexShrink: 0,
          background: avatarGradient(name || "N"),
        }}
      />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13.5, fontWeight: 600, marginBottom: 2 }}>{name}</div>
        <div
          style={{
            fontSize: 12,
            color: C.inkMute,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {meta}
        </div>
      </div>
      <div style={{ textAlign: "right", fontSize: 12, color: C.inkSoft }}>
        <span style={chipStyle("sage")}>
          <span style={dotStyle} />
          {isES ? "Disponible" : "Available"}
        </span>
        {p.base_price ? (
          <div
            style={{
              fontFamily: "var(--font-jetbrains-mono), monospace",
              fontSize: 11,
              color: C.inkMute,
              marginTop: 4,
            }}
          >
            {isES ? "Desde" : "From"} ${p.base_price.toLocaleString(isES ? "es-CL" : "en-US")}
          </div>
        ) : null}
      </div>
    </Link>
  )
}

/* ------------------------------------------------------------------
 *  MessageRow
 * ------------------------------------------------------------------ */
function MessageRow({ m, isES }: { m: MessagePreview; isES: boolean }) {
  const when = new Date(m.created_at)
  const now = new Date()
  const today = when.toDateString() === now.toDateString()
  const label = today
    ? when.toLocaleTimeString(isES ? "es-CL" : "en-US", { hour: "2-digit", minute: "2-digit" })
    : when.toLocaleDateString(isES ? "es-CL" : "en-US", { weekday: "short" })

  return (
    <Link
      href="/dashboard/chat"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: 12,
        borderRadius: 12,
        textDecoration: "none",
        color: C.ink,
      }}
    >
      <div
        style={{
          width: 38,
          height: 38,
          borderRadius: "50%",
          flexShrink: 0,
          background: avatarGradient(m.other_name),
        }}
      />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 13.5,
            fontWeight: 600,
            marginBottom: 2,
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          {m.other_name}
          {m.unread && <span style={chipStyle("sage")}>{isES ? "nuevo" : "new"}</span>}
        </div>
        <div
          style={{
            fontSize: 12,
            color: C.inkMute,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {m.preview || (isES ? "Mensaje" : "Message")}…
        </div>
      </div>
      <div
        style={{
          fontFamily: "var(--font-jetbrains-mono), monospace",
          fontSize: 11,
          color: C.inkMute,
        }}
      >
        {label}
      </div>
    </Link>
  )
}

/* ------------------------------------------------------------------
 *  ProgressStat — muestra un contador real (no porcentajes falsos)
 * ------------------------------------------------------------------ */
function ProgressStat({
  label,
  value,
  hint,
  warm,
}: {
  label: string
  value: number
  hint: string
  warm?: boolean
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "10px 0",
        borderBottom: `1px solid ${C.lineSoft}`,
      }}
    >
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 500, color: C.ink, marginBottom: 2 }}>
          {label}
        </div>
        <div style={{ fontSize: 11, color: C.inkMute }}>{hint}</div>
      </div>
      <div
        style={{
          fontFamily: "var(--font-fraunces), serif",
          fontSize: 24,
          letterSpacing: "-0.02em",
          color: warm ? C.terracotta : C.sage700,
          lineHeight: 1,
        }}
      >
        {value}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------
 *  Utility rows
 * ------------------------------------------------------------------ */
function LoadingRow() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: C.inkMute,
        fontSize: 13,
        padding: "22px 0",
      }}
    >
      Cargando…
    </div>
  )
}

function EmptyState({
  title,
  message,
  ctaLabel,
  ctaHref,
  small,
}: {
  title: string
  message: string
  ctaLabel?: string
  ctaHref?: string
  small?: boolean
}) {
  return (
    <div
      style={{
        padding: small ? "18px 6px" : "32px 10px",
        textAlign: "center",
        color: C.inkSoft,
      }}
    >
      <div
        style={{
          fontFamily: "var(--font-fraunces), serif",
          fontSize: small ? 15 : 17,
          color: C.ink,
          marginBottom: 6,
        }}
      >
        {title}
      </div>
      <div style={{ fontSize: 13, color: C.inkMute, marginBottom: ctaLabel ? 14 : 0 }}>{message}</div>
      {ctaLabel && ctaHref && (
        <Link
          href={ctaHref}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            fontSize: 12,
            fontWeight: 500,
            padding: "8px 14px",
            borderRadius: 999,
            background: C.sage900,
            color: "white",
            textDecoration: "none",
          }}
        >
          {ctaLabel} {icoArrow}
        </Link>
      )}
    </div>
  )
}
