"use client"
import { useUser } from "@/hooks/use-user"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { useProfile } from "@/hooks/use-profile"
import { useLanguage } from "@/contexts/language-context"
import {
  format,
  startOfMonth,
  startOfWeek,
  endOfWeek,
  subWeeks,
  subDays,
  parse,
} from "date-fns"
import { es, enUS } from "date-fns/locale"
import { calculateWeeklyGrowth, getPerformanceTip } from "@/lib/dashboard-utils"

/* ------------------------------------------------------------------
 *  Iconos inline
 * ------------------------------------------------------------------ */
const icoCalendar = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <path d="M16 2v4M8 2v4M3 10h18" />
  </svg>
)
const icoUsers = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
)
const icoDollar = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <line x1="12" y1="1" x2="12" y2="23" />
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>
)
const icoActivity = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
  </svg>
)
const icoTrending = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
  </svg>
)
const icoSparkles = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M12 2l2.4 6.5L21 11l-6.6 2.5L12 20l-2.4-6.5L3 11l6.6-2.5z" />
  </svg>
)
const icoArrow = (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M5 12h14M13 5l7 7-7 7" />
  </svg>
)
const icoPlus = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 5v14M5 12h14" />
  </svg>
)
const icoVideo = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <polygon points="23 7 16 12 23 17 23 7" />
    <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
  </svg>
)
const icoShield = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="M9 12l2 2 4-4" />
  </svg>
)

/* ------------------------------------------------------------------
 *  Design tokens (sage + terracotta)
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
  dangerSoft: "oklch(0.95 0.03 15)",
  danger: "oklch(0.45 0.13 20)",
}

/* ------------------------------------------------------------------
 *  Tipos
 * ------------------------------------------------------------------ */
interface TodayAppointment {
  id: string
  appointment_date: string
  appointment_time: string
  type: string | null
  status: string | null
  duration_minutes?: number | null
  patient?: {
    first_name?: string | null
    last_name?: string | null
    avatar_url?: string | null
  } | null
}

interface ChartPoint {
  label: string
  income: number
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
 *  Styles
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

function chipStyle(
  tone: "sage" | "amber" | "blue" | "terracotta" | "mute" | "danger"
): React.CSSProperties {
  if (tone === "sage") return { ...chipBase, background: C.sage100, color: C.sage700 }
  if (tone === "amber") return { ...chipBase, background: C.amberSoft, color: C.amber }
  if (tone === "blue") return { ...chipBase, background: C.blueSoft, color: C.blue }
  if (tone === "terracotta")
    return { ...chipBase, background: C.terracottaSoft, color: C.terracotta }
  if (tone === "danger") return { ...chipBase, background: C.dangerSoft, color: C.danger }
  return { ...chipBase, background: C.bgWarm, color: C.inkSoft }
}

const dotStyle: React.CSSProperties = {
  width: 6,
  height: 6,
  borderRadius: "50%",
  background: "currentColor",
}

/* ------------------------------------------------------------------
 *  Professional dashboard
 * ------------------------------------------------------------------ */
export default function ProfessionalDashboardPage() {
  const { user } = useUser()
  const { profile } = useProfile()
  const { language } = useLanguage()
  const isES = language === "es"
  const supabase = useMemo(() => createClient(), [])

  const [loading, setLoading] = useState(true)
  const [isVerified, setIsVerified] = useState<boolean | null>(null)
  const [stats, setStats] = useState({
    appointmentsToday: 0,
    appointmentsWeek: 0,
    totalPatients: 0,
    monthlyIncome: 0,
    weeklyIncomeGrowth: 0,
    weeklyAppointmentGrowth: 0,
  })
  const [todayAppointments, setTodayAppointments] = useState<TodayAppointment[]>([])
  const [chartData, setChartData] = useState<ChartPoint[]>([])

  const performanceInsight = useMemo(
    () =>
      getPerformanceTip(stats.weeklyIncomeGrowth, stats.weeklyAppointmentGrowth, isES),
    [stats.weeklyIncomeGrowth, stats.weeklyAppointmentGrowth, isES]
  )

  const loadDashboardData = async () => {
    if (!user?.id) return
    try {
      const today = new Date().toISOString().split("T")[0]
      const firstDayOfMonth = startOfMonth(new Date()).toISOString()
      const now = new Date()
      const currentWeekStart = startOfWeek(now, { weekStartsOn: 1 }).toISOString()
      const lastWeekStart = startOfWeek(subWeeks(now, 1), { weekStartsOn: 1 }).toISOString()
      const lastWeekEnd = endOfWeek(subWeeks(now, 1), { weekStartsOn: 1 }).toISOString()

      const { data: profData } = await supabase
        .from("professionals")
        .select("verified")
        .eq("id", user.id)
        .maybeSingle()
      setIsVerified(profData?.verified ?? false)

      const [
        { count: countToday },
        { count: countWeek },
        { data: patientsData },
        { data: incomeData },
        { data: currentWeekIncome },
        { data: lastWeekIncome },
        { count: currentWeekAppointments },
        { count: lastWeekAppointments },
      ] = await Promise.all([
        supabase
          .from("appointments")
          .select("*", { count: "exact", head: true })
          .eq("professional_id", user.id)
          .eq("appointment_date", today)
          .in("status", ["confirmed", "pending"]),
        supabase
          .from("appointments")
          .select("*", { count: "exact", head: true })
          .eq("professional_id", user.id)
          .gte("appointment_date", currentWeekStart.split("T")[0])
          .in("status", ["confirmed", "pending"]),
        supabase
          .from("appointments")
          .select("patient_id")
          .eq("professional_id", user.id),
        supabase
          .from("financial_transactions")
          .select("professional_net")
          .eq("professional_id", user.id)
          .gte("created_at", firstDayOfMonth)
          .in("status", ["available", "payout_pending", "paid_out"]),
        supabase
          .from("financial_transactions")
          .select("professional_net")
          .eq("professional_id", user.id)
          .gte("created_at", currentWeekStart)
          .in("status", ["available", "payout_pending", "paid_out"]),
        supabase
          .from("financial_transactions")
          .select("professional_net")
          .eq("professional_id", user.id)
          .gte("created_at", lastWeekStart)
          .lte("created_at", lastWeekEnd)
          .in("status", ["available", "payout_pending", "paid_out"]),
        supabase
          .from("appointments")
          .select("*", { count: "exact", head: true })
          .eq("professional_id", user.id)
          .gte("created_at", currentWeekStart),
        supabase
          .from("appointments")
          .select("*", { count: "exact", head: true })
          .eq("professional_id", user.id)
          .gte("created_at", lastWeekStart)
          .lte("created_at", lastWeekEnd),
      ])

      const uniquePatients = new Set(patientsData?.map((p) => p.patient_id)).size
      const monthlyTotal =
        incomeData?.reduce((acc, curr) => acc + Number(curr.professional_net || 0), 0) || 0
      const currentWeekTotal =
        currentWeekIncome?.reduce((acc, curr) => acc + Number(curr.professional_net || 0), 0) || 0
      const lastWeekTotal =
        lastWeekIncome?.reduce((acc, curr) => acc + Number(curr.professional_net || 0), 0) || 0
      const incomeGrowth = calculateWeeklyGrowth(currentWeekTotal, lastWeekTotal)
      const appointmentGrowth = calculateWeeklyGrowth(
        currentWeekAppointments || 0,
        lastWeekAppointments || 0
      )

      setStats({
        appointmentsToday: countToday || 0,
        appointmentsWeek: countWeek || 0,
        totalPatients: uniquePatients,
        monthlyIncome: monthlyTotal,
        weeklyIncomeGrowth: incomeGrowth,
        weeklyAppointmentGrowth: appointmentGrowth,
      })

      const { data: appointments } = await supabase
        .from("appointments")
        .select(
          `id, appointment_date, appointment_time, type, status, duration_minutes,
           patient:profiles!appointments_patient_id_fkey(first_name, last_name, avatar_url)`
        )
        .eq("professional_id", user.id)
        .eq("appointment_date", today)
        .order("appointment_time", { ascending: true })
      setTodayAppointments((appointments as unknown as TodayAppointment[]) || [])

      const last7Days = Array.from({ length: 7 }, (_, i) =>
        format(subDays(new Date(), 6 - i), "yyyy-MM-dd")
      )
      const { data: weeklyIncome } = await supabase
        .from("financial_transactions")
        .select("created_at, professional_net")
        .eq("professional_id", user.id)
        .gte("created_at", subDays(new Date(), 7).toISOString())

      setChartData(
        last7Days.map((date) => ({
          label: format(new Date(date), "EEE", { locale: isES ? es : enUS }),
          income:
            weeklyIncome
              ?.filter((a) => format(new Date(a.created_at), "yyyy-MM-dd") === date)
              .reduce((acc, curr) => acc + Number(curr.professional_net || 0), 0) || 0,
        }))
      )
    } catch (error) {
      console.error("Dashboard error:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDashboardData()
    if (!user?.id) return
    const ch1 = supabase
      .channel("dashboard-appointments")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "appointments",
          filter: `professional_id=eq.${user.id}`,
        },
        loadDashboardData
      )
      .subscribe()
    const ch2 = supabase
      .channel("dashboard-transactions")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "financial_transactions",
          filter: `professional_id=eq.${user.id}`,
        },
        loadDashboardData
      )
      .subscribe()
    return () => {
      supabase.removeChannel(ch1)
      supabase.removeChannel(ch2)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, isES])

  /* — Derivados — */
  const firstName = profile?.first_name || ""
  const dateLabel = format(new Date(), "EEEE d 'de' MMMM", {
    locale: isES ? es : enUS,
  })
  const nextAppt = todayAppointments[0]
  const summary = nextAppt
    ? isES
      ? `Hoy atiendes a ${todayAppointments.length} pacientes · Primera cita ${nextAppt.appointment_time?.slice(
          0,
          5
        )}.`
      : `Today you'll see ${todayAppointments.length} patients · First at ${nextAppt.appointment_time?.slice(
          0,
          5
        )}.`
    : isES
    ? "Un día tranquilo en tu agenda."
    : "A calm day on your calendar."

  /* — Chart helpers — */
  const maxChart = Math.max(1, ...chartData.map((p) => p.income))

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
                {isES ? "En consulta" : "In practice"}
              </span>
              {isVerified && (
                <span style={chipStyle("sage")}>
                  {icoShield}
                  {isES ? "Verificado" : "Verified"}
                </span>
              )}
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
            <p
              style={{
                color: C.inkSoft,
                fontSize: 14,
                marginTop: 4,
                textTransform: "capitalize",
              }}
            >
              {dateLabel} · {summary}
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Link
              href="/dashboard/professional/availability"
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
              {isES ? "Disponibilidad" : "Availability"}
            </Link>
            <Link
              href="/dashboard/professional/patients"
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
              {isES ? "Pacientes" : "Patients"}
            </Link>
          </div>
        </div>

        {/* Verification pending banner */}
        {isVerified === false && (
          <div
            style={{
              background: `linear-gradient(90deg, ${C.amberSoft}, ${C.terracottaSoft})`,
              border: `1px solid ${C.line}`,
              borderRadius: 16,
              padding: "14px 18px",
              marginBottom: 16,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 14,
              flexWrap: "wrap",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "white",
                  color: C.amber,
                  flexShrink: 0,
                }}
              >
                {icoShield}
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.ink, marginBottom: 2 }}>
                  {isES ? "Verificación en curso" : "Verification in progress"}
                </div>
                <div style={{ fontSize: 12, color: C.inkSoft, lineHeight: 1.5 }}>
                  {isES
                    ? "Tu perfil aparecerá como verificado en 48h tras confirmar tu registro profesional."
                    : "Your profile will show as verified within 48h after confirming your registration."}
                </div>
              </div>
            </div>
            <Link
              href="/dashboard/professional/profile"
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
                flexShrink: 0,
              }}
            >
              {isES ? "Completar perfil" : "Complete profile"} {icoArrow}
            </Link>
          </div>
        )}

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
            label={isES ? "Citas hoy" : "Today"}
            value={stats.appointmentsToday}
            delta={
              nextAppt
                ? isES
                  ? `Primera · ${nextAppt.appointment_time?.slice(0, 5)}`
                  : `First · ${nextAppt.appointment_time?.slice(0, 5)}`
                : isES
                ? "Sin citas hoy"
                : "No appointments"
            }
            deltaTone="up"
          />
          <StatCard
            icon={icoActivity}
            iconBg={C.terracottaSoft}
            iconColor={C.terracotta}
            label={isES ? "Semana" : "Week"}
            value={stats.appointmentsWeek}
            delta={
              stats.weeklyAppointmentGrowth !== 0
                ? `${stats.weeklyAppointmentGrowth > 0 ? "+" : ""}${stats.weeklyAppointmentGrowth}% ${
                    isES ? "vs anterior" : "vs prev"
                  }`
                : isES
                ? "Sin cambios"
                : "No change"
            }
            deltaTone={
              stats.weeklyAppointmentGrowth > 0
                ? "up"
                : stats.weeklyAppointmentGrowth < 0
                ? "down"
                : "neutral"
            }
          />
          <StatCard
            icon={icoUsers}
            iconBg={C.blueSoft}
            iconColor={C.blueMid}
            label={isES ? "Pacientes" : "Patients"}
            value={stats.totalPatients}
            delta={isES ? "Únicos" : "Unique"}
            deltaTone="neutral"
          />
          <StatCard
            icon={icoDollar}
            iconBg={C.amberSoft}
            iconColor={C.amber}
            label={isES ? "Ingresos mes" : "Monthly"}
            value={`$${stats.monthlyIncome.toLocaleString(isES ? "es-CL" : "en-US")}`}
            delta={
              stats.weeklyIncomeGrowth !== 0
                ? `${stats.weeklyIncomeGrowth > 0 ? "+" : ""}${stats.weeklyIncomeGrowth}% ${
                    isES ? "semanal" : "weekly"
                  }`
                : isES
                ? "Estable"
                : "Stable"
            }
            deltaTone={
              stats.weeklyIncomeGrowth > 0
                ? "up"
                : stats.weeklyIncomeGrowth < 0
                ? "down"
                : "neutral"
            }
          />
        </div>

        {/* Agenda + Income */}
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
                <span
                  style={{
                    fontFamily: "var(--font-inter), sans-serif",
                    fontSize: 11,
                    color: C.inkMute,
                    marginLeft: 10,
                    fontWeight: 400,
                  }}
                >
                  {todayAppointments.length}{" "}
                  {isES
                    ? todayAppointments.length === 1
                      ? "cita"
                      : "citas"
                    : todayAppointments.length === 1
                    ? "apt"
                    : "apts"}
                </span>
              </h2>
              <Link
                href="/dashboard/professional/appointments"
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
            ) : todayAppointments.length === 0 ? (
              <EmptyState
                title={isES ? "Sin citas hoy" : "No appointments today"}
                message={
                  isES
                    ? "Aprovecha para revisar fichas o abrir nuevos horarios."
                    : "Take a moment to review records or open new slots."
                }
                ctaLabel={isES ? "Abrir disponibilidad" : "Open availability"}
                ctaHref="/dashboard/professional/availability"
              />
            ) : (
              todayAppointments
                .slice(0, 5)
                .map((apt) => <ProAppointmentRow key={apt.id} apt={apt} isES={isES} />)
            )}
          </section>

          <section style={cardStyle}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 14,
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
                {isES ? "Ingresos · 7 días" : "Income · 7d"}
              </h2>
              {stats.weeklyIncomeGrowth !== 0 && (
                <span
                  style={chipStyle(
                    stats.weeklyIncomeGrowth > 0 ? "sage" : "danger"
                  )}
                >
                  {icoTrending}
                  {stats.weeklyIncomeGrowth > 0 ? "+" : ""}
                  {stats.weeklyIncomeGrowth}%
                </span>
              )}
            </div>

            <Sparkline data={chartData} max={maxChart} />

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: 10,
                fontFamily: "var(--font-jetbrains-mono), monospace",
                fontSize: 10,
                color: C.inkMute,
                letterSpacing: "0.05em",
              }}
            >
              {chartData.map((p, i) => (
                <span key={i} style={{ textTransform: "uppercase" }}>
                  {p.label}
                </span>
              ))}
            </div>

            <div
              style={{
                marginTop: 18,
                padding: 14,
                background: C.sage50,
                borderRadius: 12,
                fontSize: 12.5,
                color: C.sage700,
                lineHeight: 1.55,
              }}
            >
              <strong>{isES ? "Esta semana" : "This week"}</strong>
              <div
                style={{
                  fontFamily: "var(--font-fraunces), serif",
                  fontSize: 28,
                  letterSpacing: "-0.02em",
                  color: C.ink,
                  marginTop: 4,
                }}
              >
                $
                {chartData
                  .reduce((acc, p) => acc + p.income, 0)
                  .toLocaleString(isES ? "es-CL" : "en-US")}
              </div>
              <div style={{ fontSize: 11, color: C.inkMute, marginTop: 4 }}>
                {isES ? "Neto después de comisión" : "Net after commission"}
              </div>
            </div>
          </section>
        </div>

        {/* Insight + Quick links */}
        <div
          className="nurea-grid-hh"
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1.6fr) minmax(0, 1fr)",
            gap: 16,
          }}
        >
          <section
            style={{
              ...cardStyle,
              background:
                performanceInsight.type === "positive"
                  ? `linear-gradient(135deg, ${C.sage50}, ${C.bgWarm})`
                  : "white",
              borderColor:
                performanceInsight.type === "positive" ? C.sage200 : C.lineSoft,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 10,
              }}
            >
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 10,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background:
                    performanceInsight.type === "positive" ? C.sage100 : C.bgWarm,
                  color:
                    performanceInsight.type === "positive" ? C.sage700 : C.inkSoft,
                }}
              >
                {icoSparkles}
              </div>
              <div>
                <div
                  style={{
                    fontSize: 10,
                    textTransform: "uppercase",
                    letterSpacing: "0.12em",
                    color: C.inkMute,
                    fontWeight: 600,
                  }}
                >
                  Nura Insights
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-fraunces), serif",
                    fontSize: 17,
                    color: C.ink,
                    fontWeight: 400,
                    letterSpacing: "-0.01em",
                  }}
                >
                  {performanceInsight.title}
                </div>
              </div>
            </div>

            <p
              style={{
                fontSize: 13.5,
                color: C.inkSoft,
                lineHeight: 1.6,
                margin: "12px 0 16px",
              }}
            >
              {performanceInsight.message}
            </p>

            <Link
              href="/dashboard/professional/availability"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                fontSize: 12,
                fontWeight: 500,
                color: C.sage700,
                textDecoration: "none",
              }}
            >
              {isES ? "Optimizar agenda" : "Optimize schedule"} →
            </Link>
          </section>

          <section style={cardStyle}>
            <h2
              style={{
                fontFamily: "var(--font-fraunces), serif",
                fontSize: 18,
                letterSpacing: "-0.01em",
                margin: "0 0 14px",
                fontWeight: 400,
              }}
            >
              {isES ? "Accesos rápidos" : "Quick access"}
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <QuickLink
                href="/dashboard/professional/fichas"
                icon={icoActivity}
                label={isES ? "Fichas clínicas" : "Clinical records"}
                hint={isES ? "Notas y seguimientos" : "Notes & tracking"}
              />
              <QuickLink
                href="/dashboard/professional/availability"
                icon={icoCalendar}
                label={isES ? "Disponibilidad" : "Availability"}
                hint={isES ? "Horarios abiertos" : "Open slots"}
              />
              <QuickLink
                href="/dashboard/professional/profile"
                icon={icoUsers}
                label={isES ? "Mi perfil" : "My profile"}
                hint={isES ? "Bio · Especialidad" : "Bio · Specialty"}
              />
              <QuickLink
                href="/dashboard/payments"
                icon={icoDollar}
                label={isES ? "Pagos y payouts" : "Payments & payouts"}
                hint={isES ? "Historial y retiros" : "History & withdrawals"}
              />
            </div>
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
    deltaTone === "up" ? C.sage100 : deltaTone === "down" ? C.dangerSoft : C.bgWarm
  const deltaFg =
    deltaTone === "up" ? C.sage700 : deltaTone === "down" ? C.danger : C.inkSoft

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
 *  ProAppointmentRow
 * ------------------------------------------------------------------ */
function ProAppointmentRow({
  apt,
  isES,
}: {
  apt: TodayAppointment
  isES: boolean
}) {
  const raw = apt.appointment_time || "00:00:00"
  let h = "00"
  let m = "00"
  try {
    const parsed = parse(raw, "HH:mm:ss", new Date())
    h = format(parsed, "HH")
    m = format(parsed, "mm")
  } catch {
    const parts = hourPart(raw)
    h = parts.h
    m = parts.m
  }
  const patientName =
    `${apt.patient?.first_name ?? ""} ${apt.patient?.last_name ?? ""}`.trim() ||
    (isES ? "Paciente" : "Patient")
  const isOnline =
    (apt.type || "").toLowerCase().includes("online") ||
    (apt.type || "").toLowerCase().includes("video")
  const chip = isOnline ? chipStyle("sage") : chipStyle("blue")
  const confirmed = apt.status === "confirmed"

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
          {isES ? "hoy" : "today"}
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            flexShrink: 0,
            background: avatarGradient(patientName),
          }}
        />
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontSize: 13.5,
              fontWeight: 600,
              marginBottom: 3,
              color: C.ink,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {patientName}
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
              {isOnline
                ? isES
                  ? "Videoconsulta"
                  : "Video call"
                : isES
                ? "Presencial"
                : "In-person"}
            </span>
            <span>
              {apt.duration_minutes ?? 45} min ·{" "}
              {confirmed
                ? isES
                  ? "Confirmada"
                  : "Confirmed"
                : isES
                ? "Pendiente"
                : "Pending"}
            </span>
          </div>
        </div>
      </div>

      {isOnline ? (
        <Link
          href={`/dashboard/professional/consultation/${apt.id}`}
          style={{
            padding: "7px 14px",
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
          {icoVideo}
          {isES ? "Iniciar" : "Start"}
        </Link>
      ) : (
        <Link
          href={`/dashboard/professional/appointments?id=${apt.id}`}
          style={{
            padding: "7px 14px",
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
 *  Sparkline (SVG area chart)
 * ------------------------------------------------------------------ */
function Sparkline({ data, max }: { data: ChartPoint[]; max: number }) {
  const w = 280
  const h = 90
  const pad = 4
  const stepX = data.length > 1 ? (w - pad * 2) / (data.length - 1) : 0
  const pts = data.map((p, i) => {
    const x = pad + i * stepX
    const y = h - pad - (p.income / Math.max(1, max)) * (h - pad * 2)
    return { x, y, income: p.income }
  })
  const path =
    pts.length === 0
      ? ""
      : pts
          .map((p, i) => (i === 0 ? `M ${p.x},${p.y}` : `L ${p.x},${p.y}`))
          .join(" ")
  const area =
    pts.length === 0
      ? ""
      : `${path} L ${pts[pts.length - 1].x},${h - pad} L ${pts[0].x},${h - pad} Z`

  return (
    <div style={{ width: "100%", overflow: "hidden" }}>
      <svg
        viewBox={`0 0 ${w} ${h}`}
        width="100%"
        preserveAspectRatio="none"
        style={{ display: "block", height: 90 }}
      >
        <defs>
          <linearGradient id="proSparkFill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={C.sage500} stopOpacity={0.35} />
            <stop offset="100%" stopColor={C.sage500} stopOpacity={0} />
          </linearGradient>
        </defs>
        {/* grid lines */}
        {[0.25, 0.5, 0.75].map((r, i) => (
          <line
            key={i}
            x1={pad}
            x2={w - pad}
            y1={pad + (h - pad * 2) * r}
            y2={pad + (h - pad * 2) * r}
            stroke={C.lineSoft}
            strokeWidth={1}
            strokeDasharray="3 3"
          />
        ))}
        {pts.length > 0 && (
          <>
            <path d={area} fill="url(#proSparkFill)" />
            <path
              d={path}
              fill="none"
              stroke={C.sage500}
              strokeWidth={2}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            {pts.map((p, i) => (
              <circle
                key={i}
                cx={p.x}
                cy={p.y}
                r={2.5}
                fill={C.sage700}
                stroke="white"
                strokeWidth={1.5}
              />
            ))}
          </>
        )}
      </svg>
    </div>
  )
}

/* ------------------------------------------------------------------
 *  QuickLink
 * ------------------------------------------------------------------ */
function QuickLink({
  href,
  icon,
  label,
  hint,
}: {
  href: string
  icon: React.ReactNode
  label: string
  hint: string
}) {
  return (
    <Link
      href={href}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "10px 12px",
        borderRadius: 12,
        textDecoration: "none",
        color: C.ink,
        transition: "background 0.15s",
      }}
    >
      <div
        style={{
          width: 34,
          height: 34,
          borderRadius: 10,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          background: C.sage100,
          color: C.sage700,
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13.5, fontWeight: 600, marginBottom: 2 }}>{label}</div>
        <div
          style={{
            fontSize: 11.5,
            color: C.inkMute,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {hint}
        </div>
      </div>
      <span style={{ color: C.inkMute, fontSize: 14 }}>→</span>
    </Link>
  )
}

/* ------------------------------------------------------------------
 *  LoadingRow + EmptyState
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
      <div style={{ fontSize: 13, color: C.inkMute, marginBottom: ctaLabel ? 14 : 0 }}>
        {message}
      </div>
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
