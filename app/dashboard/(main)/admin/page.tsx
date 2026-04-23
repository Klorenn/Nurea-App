"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { useLanguage } from "@/contexts/language-context"
import { RouteGuard } from "@/components/auth/route-guard"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import { format, subDays, startOfMonth, parseISO } from "date-fns"
import { es, enUS } from "date-fns/locale"

const PRO_PRICE = 29990

/* ------------------------------------------------------------------
 *  Iconos inline
 * ------------------------------------------------------------------ */
const icoShield = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="M9 12l2 2 4-4" />
  </svg>
)
const icoTrending = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
  </svg>
)
const icoBanknote = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <rect x="2" y="6" width="20" height="12" rx="2" />
    <circle cx="12" cy="12" r="2" />
    <path d="M6 10v4M18 10v4" />
  </svg>
)
const icoMessage = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
)
const icoCheck = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="20 6 9 17 4 12" />
  </svg>
)
const icoRefresh = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M23 4v6h-6" />
    <path d="M1 20v-6h6" />
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10" />
    <path d="M20.49 15a9 9 0 0 1-14.85 3.36L1 14" />
  </svg>
)
const icoPower = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M18.36 6.64a9 9 0 1 1-12.73 0" />
    <line x1="12" y1="2" x2="12" y2="12" />
  </svg>
)
const icoUsers = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
)
const icoArrowRight = (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M5 12h14M13 5l7 7-7 7" />
  </svg>
)
const icoHeart = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
)
const icoStar = (fill: boolean) => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill={fill ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.6">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
)
const icoCard = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <line x1="2" y1="10" x2="22" y2="10" />
  </svg>
)
const icoLink = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </svg>
)
const icoCopy = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <rect x="9" y="9" width="13" height="13" rx="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
)
const icoExternal = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" y1="14" x2="21" y2="3" />
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

interface ChartPoint {
  name: string
  citas: number
}
interface SubPayment {
  id: string
  amount: number
  currency: string
  status: string
  payer_email: string | null
  created_at: string
  profile_id: string | null
  profiles?: {
    first_name: string | null
    last_name: string | null
    avatar_url: string | null
  } | null
}

/* ------------------------------------------------------------------
 *  Styles helpers
 * ------------------------------------------------------------------ */
const cardStyle: React.CSSProperties = {
  background: "white",
  border: `1px solid ${C.lineSoft}`,
  borderRadius: 18,
  overflow: "hidden",
}
const cardPad: React.CSSProperties = { ...cardStyle, padding: 22 }

const chipBase: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 5,
  padding: "3px 9px",
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

function avatarGradient(seed: string): string {
  const n = (seed?.charCodeAt(0) || 0) % 5
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
 *  Admin page
 * ------------------------------------------------------------------ */
export default function AdminPage() {
  const { language } = useLanguage()
  const isES = language === "es"
  const supabase = useMemo(() => createClient(), [])

  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [maintenanceMode, setMaintenanceMode] = useState(false)
  const [tab, setTab] = useState<"overview" | "subscriptions" | "finances">("overview")

  const [stats, setStats] = useState({
    mrr: 0,
    activeSubscriptions: 0,
    trialingSubscriptions: 0,
    openTickets: 0,
    pendingDoctors: 0,
    pendingSubscriptions: 0,
    activeAppointments: 0,
    totalProfessionals: 0,
    totalPatients: 0,
    newSubsThisMonth: 0,
    newSubsLastMonth: 0,
    revenueThisMonth: 0,
  })

  const [pendingCredentials, setPendingCredentials] = useState<any[]>([])
  const [pendingSubscriptionsTable, setPendingSubscriptionsTable] = useState<any[]>([])
  const [recentReviews, setRecentReviews] = useState<any[]>([])
  const [chartData, setChartData] = useState<ChartPoint[]>([])
  const [recentPayments, setRecentPayments] = useState<SubPayment[]>([])

  const [paymentLinkDialog, setPaymentLinkDialog] = useState<{
    open: boolean
    loading: boolean
    url: string | null
    email: string | null
    amount: number | null
    isYearly: boolean
  }>({ open: false, loading: false, url: null, email: null, amount: null, isYearly: false })

  const loadData = useCallback(
    async (silent = false) => {
      if (!silent) setLoading(true)
      else setRefreshing(true)

      try {
        const now = new Date()
        const thisMonthStart = startOfMonth(now).toISOString()
        const lastMonthStart = startOfMonth(
          new Date(now.getFullYear(), now.getMonth() - 1, 1)
        ).toISOString()
        const thirtyDaysAgo = subDays(now, 30).toISOString()

        const [
          credCountRes,
          credListRes,
          reviewsRes,
          appointmentsRes,
          ticketsRes,
          pendingSubsRes,
          activeSubsRes,
          trialingSubsRes,
          profsRes,
          patientsRes,
          newSubsThisMonthRes,
          newSubsLastMonthRes,
          recentPaymentsRes,
          revenueThisMonthRes,
        ] = await Promise.all([
          supabase
            .from("professional_credentials")
            .select("*", { count: "exact", head: true })
            .eq("status", "pending"),
          supabase
            .from("professional_credentials")
            .select(
              "id, type, created_at, profiles:professional_id(first_name, last_name, avatar_url)"
            )
            .eq("status", "pending")
            .order("created_at", { ascending: true })
            .limit(10),
          supabase
            .from("reviews")
            .select("*, profiles:patient_id(first_name, avatar_url)")
            .order("created_at", { ascending: false })
            .limit(3),
          supabase
            .from("appointments")
            .select("appointment_date, created_at, status")
            .gte("created_at", thirtyDaysAgo),
          supabase.from("support_tickets").select("*", { count: "exact", head: true }).eq(
            "status",
            "open"
          ),
          supabase
            .from("profiles")
            .select(
              "id, first_name, last_name, email, avatar_url, created_at, selected_plan_id"
            )
            .eq("subscription_status", "pending_approval"),
          supabase
            .from("profiles")
            .select("id", { count: "exact", head: true })
            .eq("subscription_status", "active"),
          supabase
            .from("profiles")
            .select("id", { count: "exact", head: true })
            .eq("subscription_status", "trialing"),
          supabase
            .from("profiles")
            .select("id", { count: "exact", head: true })
            .eq("role", "professional"),
          supabase
            .from("profiles")
            .select("id", { count: "exact", head: true })
            .eq("role", "patient"),
          supabase
            .from("profiles")
            .select("id", { count: "exact", head: true })
            .eq("subscription_status", "active")
            .gte("updated_at", thisMonthStart),
          supabase
            .from("profiles")
            .select("id", { count: "exact", head: true })
            .eq("subscription_status", "active")
            .gte("updated_at", lastMonthStart)
            .lt("updated_at", thisMonthStart),
          supabase
            .from("nurea_subscription_payments")
            .select("id, amount, currency, status, payer_email, created_at, profile_id")
            .eq("status", "approved")
            .order("created_at", { ascending: false })
            .limit(10),
          supabase
            .from("nurea_subscription_payments")
            .select("amount")
            .eq("status", "approved")
            .gte("created_at", thisMonthStart),
        ])

        const appointments = appointmentsRes.data || []
        const dayMap = new Map<string, number>()
        for (let i = 29; i >= 0; i--) {
          const d = format(subDays(now, i), "dd/MM")
          dayMap.set(d, 0)
        }
        appointments.forEach((a) => {
          const raw = a.appointment_date || a.created_at
          if (!raw) return
          try {
            const d = format(parseISO(raw.slice(0, 10)), "dd/MM")
            if (dayMap.has(d)) dayMap.set(d, (dayMap.get(d) ?? 0) + 1)
          } catch {
            /* noop */
          }
        })
        const chart: ChartPoint[] = Array.from(dayMap.entries()).map(([name, citas]) => ({
          name,
          citas,
        }))
        setChartData(chart)

        const activeSubs = activeSubsRes.count ?? 0
        const mrr = activeSubs * PRO_PRICE
        const revenueThisMonth = (revenueThisMonthRes.data || []).reduce(
          (s, p) => s + Number(p.amount),
          0
        )

        const paymentsList: SubPayment[] = (recentPaymentsRes.data || []) as SubPayment[]
        const profileIds = paymentsList.map((p) => p.profile_id).filter(Boolean) as string[]
        const profileMap: Record<string, any> = {}
        if (profileIds.length > 0) {
          const { data: profData } = await supabase
            .from("profiles")
            .select("id, first_name, last_name, avatar_url")
            .in("id", profileIds)
          ;(profData || []).forEach((p) => {
            profileMap[p.id] = p
          })
        }
        const enrichedPayments = paymentsList.map((p) => ({
          ...p,
          profiles: p.profile_id ? profileMap[p.profile_id] ?? null : null,
        }))

        setStats({
          mrr,
          activeSubscriptions: activeSubs,
          trialingSubscriptions: trialingSubsRes.count ?? 0,
          openTickets: ticketsRes.count ?? 0,
          pendingDoctors: (credCountRes.count ?? 0) + (pendingSubsRes.data?.length ?? 0),
          pendingSubscriptions: pendingSubsRes.data?.length ?? 0,
          activeAppointments: appointments.filter(
            (a) => a.status === "confirmed" || a.status === "pending"
          ).length,
          totalProfessionals: profsRes.count ?? 0,
          totalPatients: patientsRes.count ?? 0,
          newSubsThisMonth: newSubsThisMonthRes.count ?? 0,
          newSubsLastMonth: newSubsLastMonthRes.count ?? 0,
          revenueThisMonth,
        })

        setPendingCredentials(credListRes.data || [])
        setPendingSubscriptionsTable(pendingSubsRes.data || [])
        setRecentReviews(reviewsRes.data || [])
        setRecentPayments(enrichedPayments)
      } catch (err) {
        console.error("Admin dashboard error:", err)
        toast.error(
          isES
            ? "Error al sincronizar datos del centro de mando"
            : "Error syncing control center data"
        )
      } finally {
        setLoading(false)
        setRefreshing(false)
      }
    },
    [supabase, isES]
  )

  useEffect(() => {
    loadData()
    const interval = setInterval(() => loadData(true), 60_000)
    return () => clearInterval(interval)
  }, [loadData])

  const toggleMaintenance = () => {
    setMaintenanceMode((m) => !m)
    toast.warning(
      maintenanceMode
        ? isES
          ? "Modo mantenimiento desactivado"
          : "Maintenance mode off"
        : isES
        ? "NUREA en modo mantenimiento"
        : "NUREA in maintenance"
    )
  }

  const approveSubscription = async (profileId: string, months: number) => {
    try {
      const trialEnd = new Date()
      trialEnd.setMonth(trialEnd.getMonth() + months)
      const { error } = await supabase
        .from("profiles")
        .update({
          subscription_status: months > 0 ? "trialing" : "active",
          trial_end_date: trialEnd.toISOString(),
        })
        .eq("id", profileId)
      if (error) throw error
      toast.success(isES ? "Suscripción aprobada" : "Subscription approved")
      setPendingSubscriptionsTable((prev) => prev.filter((p) => p.id !== profileId))
      setStats((prev) => ({
        ...prev,
        pendingSubscriptions: prev.pendingSubscriptions - 1,
      }))
    } catch {
      toast.error(
        isES ? "Error al aprobar suscripción" : "Error approving subscription"
      )
    }
  }

  const generatePaymentLink = async (profileId: string, isYearly = false) => {
    setPaymentLinkDialog({
      open: true,
      loading: true,
      url: null,
      email: null,
      amount: null,
      isYearly,
    })
    try {
      const res = await fetch("/api/admin/subscriptions/payment-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileId, isYearly }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Error generando link")
      setPaymentLinkDialog({
        open: true,
        loading: false,
        url: data.url,
        email: data.professionalEmail,
        amount: data.amount,
        isYearly,
      })
      setPendingSubscriptionsTable((prev) => prev.filter((p) => p.id !== profileId))
      setStats((prev) => ({
        ...prev,
        pendingSubscriptions: Math.max(0, prev.pendingSubscriptions - 1),
      }))
    } catch (err: any) {
      setPaymentLinkDialog({
        open: false,
        loading: false,
        url: null,
        email: null,
        amount: null,
        isYearly: false,
      })
      toast.error(err.message ?? (isES ? "Error al generar el link de pago" : "Error"))
    }
  }

  const copyPaymentLink = () => {
    if (!paymentLinkDialog.url) return
    navigator.clipboard.writeText(paymentLinkDialog.url)
    toast.success(isES ? "Link copiado al portapapeles" : "Link copied to clipboard")
  }

  const hoursAgo = (iso: string) => {
    const h = Math.floor((Date.now() - new Date(iso).getTime()) / 3600_000)
    return h < 1 ? "< 1h" : `${h}h`
  }

  const subTrend = stats.newSubsThisMonth - stats.newSubsLastMonth
  const subTrendLabel =
    subTrend === 0
      ? isES
        ? "igual"
        : "same"
      : subTrend > 0
      ? `+${subTrend} ${isES ? "vs mes ant." : "vs prev"}`
      : `${subTrend} ${isES ? "vs mes ant." : "vs prev"}`

  const maxChart = Math.max(1, ...chartData.map((p) => p.citas))

  if (loading) {
    return (
      <div
        style={{
          background: C.bgWarm,
          minHeight: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 40,
        }}
      >
        <div style={{ color: C.inkMute, fontSize: 14 }}>
          {isES ? "Cargando panel de administración…" : "Loading admin panel…"}
        </div>
      </div>
    )
  }

  return (
    <RouteGuard requiredRole="admin">
      <div
        style={{
          background: C.bgWarm,
          color: C.ink,
          fontFamily: "var(--font-inter), ui-sans-serif, system-ui",
          minHeight: "100%",
          padding: "8px 4px 40px",
        }}
      >
        <div style={{ maxWidth: 1240, margin: "0 auto", padding: "0 8px" }}>
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
                    background: maintenanceMode ? C.terracotta : C.sage500,
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
                  {maintenanceMode
                    ? isES
                      ? "Mantenimiento"
                      : "Maintenance"
                    : isES
                    ? "Sistema online"
                    : "System online"}
                </span>
                <span style={chipStyle("mute")}>NUREA Control Center</span>
              </div>
              <h1
                style={{
                  fontFamily: "var(--font-fraunces), serif",
                  fontSize: "clamp(26px, 3vw, 32px)",
                  letterSpacing: "-0.02em",
                  fontWeight: 400,
                  margin: 0,
                  color: C.ink,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <span
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 10,
                    background: C.sage900,
                    color: "white",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {icoShield}
                </span>
                <span>
                  Admin{" "}
                  <em style={{ fontStyle: "italic", color: C.sage500, fontWeight: 300 }}>
                    panel
                  </em>
                </span>
              </h1>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <button
                onClick={() => loadData(true)}
                disabled={refreshing}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "10px 14px",
                  fontSize: 13,
                  fontWeight: 500,
                  color: C.ink,
                  background: "white",
                  border: `1px solid ${C.line}`,
                  borderRadius: 999,
                  cursor: refreshing ? "default" : "pointer",
                  opacity: refreshing ? 0.6 : 1,
                }}
              >
                <span
                  style={{
                    animation: refreshing ? "nureaSpin 1s linear infinite" : "none",
                    display: "inline-flex",
                  }}
                >
                  {icoRefresh}
                </span>
                {isES ? "Refrescar" : "Refresh"}
              </button>
              <button
                onClick={toggleMaintenance}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "10px 18px",
                  fontSize: 13,
                  fontWeight: 500,
                  color: "white",
                  background: maintenanceMode ? C.sage900 : C.terracottaDeep,
                  borderRadius: 999,
                  border: "none",
                  cursor: "pointer",
                }}
              >
                {icoPower}
                {maintenanceMode
                  ? isES
                    ? "Reactivar"
                    : "Reactivate"
                  : isES
                  ? "Kill switch"
                  : "Kill switch"}
              </button>
            </div>
          </div>

          {/* KPI Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
              gap: 16,
              marginBottom: 22,
            }}
          >
            <KPI
              label="MRR"
              value={`$${stats.mrr.toLocaleString(isES ? "es-CL" : "en-US")}`}
              detail={`${stats.activeSubscriptions} ${isES ? "suscripciones activas" : "active subs"}`}
              icon={icoTrending}
              iconBg={C.sage100}
              iconColor={C.sage700}
              trend={subTrendLabel}
              positive={subTrend >= 0}
            />
            <KPI
              label={isES ? "Ingresos mes" : "Monthly revenue"}
              value={`$${stats.revenueThisMonth.toLocaleString(
                isES ? "es-CL" : "en-US"
              )}`}
              detail={isES ? "Pagos aprobados" : "Approved payments"}
              icon={icoBanknote}
              iconBg={C.terracottaSoft}
              iconColor={C.terracotta}
              trend={
                stats.revenueThisMonth > 0
                  ? isES
                    ? "Recibido"
                    : "Received"
                  : isES
                  ? "Sin pagos"
                  : "None"
              }
              positive={stats.revenueThisMonth > 0}
            />
            <KPI
              label={isES ? "Tickets abiertos" : "Open tickets"}
              value={stats.openTickets}
              detail={isES ? "Soporte al paciente" : "Patient support"}
              icon={icoMessage}
              iconBg={C.blueSoft}
              iconColor={C.blueMid}
              trend={
                stats.openTickets === 0
                  ? isES
                    ? "Resuelto"
                    : "Clear"
                  : `${stats.openTickets} ${isES ? "pendientes" : "pending"}`
              }
              positive={stats.openTickets === 0}
            />
            <KPI
              label={isES ? "Doctores pendientes" : "Doctors pending"}
              value={stats.pendingDoctors}
              detail={isES ? "Verificación KYP" : "KYP verification"}
              icon={icoShield}
              iconBg={C.amberSoft}
              iconColor={C.amber}
              trend={
                stats.pendingDoctors === 0
                  ? isES
                    ? "Al día"
                    : "All clear"
                  : `${stats.pendingDoctors} ${isES ? "por revisar" : "to review"}`
              }
              positive={stats.pendingDoctors === 0}
            />
          </div>

          {/* Tabs */}
          <div
            style={{
              display: "inline-flex",
              gap: 4,
              padding: 4,
              background: "white",
              border: `1px solid ${C.lineSoft}`,
              borderRadius: 999,
              marginBottom: 20,
            }}
          >
            {(
              [
                { id: "overview", label: isES ? "Vista general" : "Overview" },
                {
                  id: "subscriptions",
                  label: isES ? "Suscripciones" : "Subscriptions",
                  badge: stats.pendingSubscriptions,
                },
                {
                  id: "finances",
                  label: isES ? "Finanzas" : "Finances",
                  badge: recentPayments.length,
                },
              ] as { id: "overview" | "subscriptions" | "finances"; label: string; badge?: number }[]
            ).map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                style={{
                  padding: "8px 16px",
                  fontSize: 13,
                  fontWeight: 500,
                  border: "none",
                  borderRadius: 999,
                  cursor: "pointer",
                  background: tab === t.id ? C.sage900 : "transparent",
                  color: tab === t.id ? "white" : C.inkSoft,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                {t.label}
                {t.badge && t.badge > 0 ? (
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 600,
                      padding: "2px 6px",
                      borderRadius: 999,
                      background: tab === t.id ? "rgba(255,255,255,0.2)" : C.sage100,
                      color: tab === t.id ? "white" : C.sage700,
                    }}
                  >
                    {t.badge}
                  </span>
                ) : null}
              </button>
            ))}
          </div>

          {/* ── OVERVIEW ── */}
          {tab === "overview" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div
                className="nurea-grid-admin"
                style={{
                  display: "grid",
                  gridTemplateColumns: "minmax(0, 2fr) minmax(0, 1fr)",
                  gap: 16,
                }}
              >
                {/* Chart */}
                <section style={cardPad}>
                  <div style={{ marginBottom: 14 }}>
                    <h2
                      style={{
                        fontFamily: "var(--font-fraunces), serif",
                        fontSize: 18,
                        letterSpacing: "-0.01em",
                        margin: 0,
                        fontWeight: 400,
                      }}
                    >
                      {isES ? "Actividad de citas" : "Appointment activity"}
                    </h2>
                    <p
                      style={{ fontSize: 12, color: C.inkMute, margin: "4px 0 0" }}
                    >
                      {isES
                        ? "Citas creadas (últimos 30 días)"
                        : "Appointments created (last 30 days)"}
                    </p>
                  </div>

                  {chartData.every((d) => d.citas === 0) ? (
                    <div
                      style={{
                        padding: 50,
                        textAlign: "center",
                        color: C.inkMute,
                        fontSize: 13,
                      }}
                    >
                      {isES
                        ? "Sin citas en los últimos 30 días"
                        : "No appointments in the last 30 days"}
                    </div>
                  ) : (
                    <BigSparkline data={chartData} max={maxChart} />
                  )}
                </section>

                {/* Happiness wall */}
                <section
                  style={{
                    ...cardStyle,
                    padding: 22,
                    background: `linear-gradient(165deg, ${C.sage900} 0%, oklch(0.18 0.025 170) 100%)`,
                    color: "white",
                    border: "none",
                  }}
                >
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}
                  >
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 10,
                        background: "rgba(255,255,255,0.1)",
                        color: C.terracotta,
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {icoHeart}
                    </div>
                    <div>
                      <div
                        style={{
                          fontFamily: "var(--font-fraunces), serif",
                          fontSize: 16,
                          fontWeight: 400,
                          letterSpacing: "-0.01em",
                        }}
                      >
                        {isES ? "Muro de felicidad" : "Happiness wall"}
                      </div>
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>
                        {isES ? "Últimas reseñas" : "Recent reviews"}
                      </div>
                    </div>
                  </div>

                  {recentReviews.length === 0 ? (
                    <div
                      style={{
                        padding: "28px 0",
                        textAlign: "center",
                        color: "rgba(255,255,255,0.4)",
                        fontSize: 12,
                      }}
                    >
                      {isES ? "Sin reseñas aún" : "No reviews yet"}
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {recentReviews.map((rev, i) => (
                        <div
                          key={i}
                          style={{
                            background: "rgba(255,255,255,0.04)",
                            border: "1px solid rgba(255,255,255,0.06)",
                            borderRadius: 12,
                            padding: 12,
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              marginBottom: 6,
                            }}
                          >
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <div
                                style={{
                                  width: 24,
                                  height: 24,
                                  borderRadius: "50%",
                                  background: avatarGradient(rev.profiles?.first_name || "N"),
                                }}
                              />
                              <span style={{ fontSize: 12, fontWeight: 600 }}>
                                {rev.profiles?.first_name || "—"}
                              </span>
                            </div>
                            <div
                              style={{
                                display: "flex",
                                gap: 2,
                                color: C.terracotta,
                              }}
                            >
                              {[0, 1, 2, 3, 4].map((j) => (
                                <span
                                  key={j}
                                  style={{ opacity: j < (rev.rating || 5) ? 1 : 0.2 }}
                                >
                                  {icoStar(j < (rev.rating || 5))}
                                </span>
                              ))}
                            </div>
                          </div>
                          {rev.comment && (
                            <p
                              style={{
                                fontSize: 11.5,
                                color: "rgba(255,255,255,0.7)",
                                lineHeight: 1.5,
                                margin: 0,
                                fontStyle: "italic",
                              }}
                            >
                              "{rev.comment}"
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  <Link
                    href="/dashboard/admin/support"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                      marginTop: 14,
                      color: C.terracotta,
                      fontSize: 12,
                      fontWeight: 500,
                      textDecoration: "none",
                    }}
                  >
                    {isES ? "Ver todas" : "View all"} →
                  </Link>
                </section>
              </div>

              {/* Urgent actions */}
              <section style={cardStyle}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "18px 22px",
                    borderBottom: `1px solid ${C.lineSoft}`,
                  }}
                >
                  <div>
                    <h2
                      style={{
                        fontFamily: "var(--font-fraunces), serif",
                        fontSize: 18,
                        margin: 0,
                        fontWeight: 400,
                      }}
                    >
                      {isES
                        ? "Acciones de respuesta inmediata"
                        : "Immediate-response actions"}
                    </h2>
                    <p style={{ fontSize: 12, color: C.inkMute, margin: "4px 0 0" }}>
                      {isES
                        ? "Casos que requieren tu aprobación"
                        : "Cases awaiting your approval"}
                    </p>
                  </div>
                  {stats.pendingDoctors + stats.openTickets > 0 ? (
                    <span style={chipStyle("terracotta")}>
                      {stats.pendingDoctors + stats.openTickets}{" "}
                      {isES ? "casos" : "cases"}
                    </span>
                  ) : (
                    <span style={chipStyle("sage")}>
                      {icoCheck}
                      {isES ? "Todo al día" : "All clear"}
                    </span>
                  )}
                </div>

                {pendingCredentials.length === 0 ? (
                  <div
                    style={{
                      padding: "40px 22px",
                      textAlign: "center",
                      color: C.inkMute,
                      fontSize: 13,
                    }}
                  >
                    {isES
                      ? "No hay credenciales pendientes"
                      : "No pending credentials"}
                  </div>
                ) : (
                  <div style={{ overflowX: "auto" }}>
                    <table
                      style={{
                        width: "100%",
                        borderCollapse: "collapse",
                        fontSize: 13,
                      }}
                    >
                      <thead>
                        <tr
                          style={{
                            background: C.bgWarm,
                            color: C.inkMute,
                            textAlign: "left",
                            fontSize: 11,
                            textTransform: "uppercase",
                            letterSpacing: "0.08em",
                          }}
                        >
                          <th style={thStyle}>{isES ? "Tipo" : "Type"}</th>
                          <th style={thStyle}>{isES ? "Profesional" : "Professional"}</th>
                          <th style={thStyle}>{isES ? "Esperando" : "Waiting"}</th>
                          <th style={thStyle}>{isES ? "Estado" : "Status"}</th>
                          <th style={{ ...thStyle, textAlign: "right" }} />
                        </tr>
                      </thead>
                      <tbody>
                        {pendingCredentials.map((cred) => (
                          <tr
                            key={cred.id}
                            style={{ borderTop: `1px solid ${C.lineSoft}` }}
                          >
                            <td style={tdStyle}>
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 10,
                                }}
                              >
                                <div
                                  style={{
                                    width: 34,
                                    height: 34,
                                    borderRadius: 10,
                                    background: C.amberSoft,
                                    color: C.amber,
                                    display: "inline-flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                  }}
                                >
                                  {icoShield}
                                </div>
                                <div>
                                  <div style={{ fontWeight: 600 }}>
                                    {isES ? "Validación KYP" : "KYP validation"}
                                  </div>
                                  <div style={{ fontSize: 11, color: C.inkMute }}>
                                    {cred.type}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td style={tdStyle}>
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 8,
                                }}
                              >
                                <div
                                  style={{
                                    width: 26,
                                    height: 26,
                                    borderRadius: "50%",
                                    background: avatarGradient(
                                      cred.profiles?.last_name || "D"
                                    ),
                                  }}
                                />
                                <span style={{ fontWeight: 500 }}>
                                  Dr. {cred.profiles?.last_name || "—"}
                                </span>
                              </div>
                            </td>
                            <td style={tdStyle}>
                              <span style={chipStyle("mute")}>
                                {hoursAgo(cred.created_at)}
                              </span>
                            </td>
                            <td style={tdStyle}>
                              <span style={chipStyle("amber")}>
                                {isES ? "Por auditar" : "To audit"}
                              </span>
                            </td>
                            <td style={{ ...tdStyle, textAlign: "right" }}>
                              <Link
                                href="/dashboard/admin/verifications"
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: 6,
                                  fontSize: 11,
                                  fontWeight: 500,
                                  padding: "6px 12px",
                                  borderRadius: 999,
                                  background: C.sage900,
                                  color: "white",
                                  textDecoration: "none",
                                }}
                              >
                                {isES ? "Auditar" : "Audit"} {icoArrowRight}
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>

              {/* Platform stats */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                  gap: 12,
                }}
              >
                <MiniStat
                  label={isES ? "Profesionales" : "Professionals"}
                  value={stats.totalProfessionals}
                  icon={icoUsers}
                  iconBg={C.terracottaSoft}
                  iconColor={C.terracotta}
                />
                <MiniStat
                  label={isES ? "Pacientes" : "Patients"}
                  value={stats.totalPatients}
                  icon={icoUsers}
                  iconBg={C.blueSoft}
                  iconColor={C.blueMid}
                />
                <MiniStat
                  label={isES ? "Citas activas" : "Active apts"}
                  value={stats.activeAppointments}
                  icon={icoCheck}
                  iconBg={C.sage100}
                  iconColor={C.sage700}
                />
                <MiniStat
                  label={isES ? "En trial" : "In trial"}
                  value={stats.trialingSubscriptions}
                  icon={icoTrending}
                  iconBg={C.amberSoft}
                  iconColor={C.amber}
                />
              </div>
            </div>
          )}

          {/* ── SUBSCRIPTIONS ── */}
          {tab === "subscriptions" && (
            <section style={cardStyle}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "18px 22px",
                  borderBottom: `1px solid ${C.lineSoft}`,
                  flexWrap: "wrap",
                  gap: 10,
                }}
              >
                <div>
                  <h2
                    style={{
                      fontFamily: "var(--font-fraunces), serif",
                      fontSize: 18,
                      margin: 0,
                      fontWeight: 400,
                    }}
                  >
                    {isES ? "Gestión de planes y beneficios" : "Plans & benefits"}
                  </h2>
                  <p style={{ fontSize: 12, color: C.inkMute, margin: "4px 0 0" }}>
                    {isES
                      ? `${stats.activeSubscriptions} activas · ${stats.trialingSubscriptions} en trial`
                      : `${stats.activeSubscriptions} active · ${stats.trialingSubscriptions} in trial`}
                  </p>
                </div>
                {pendingSubscriptionsTable.length > 0 && (
                  <span style={chipStyle("sage")}>
                    {pendingSubscriptionsTable.length}{" "}
                    {isES ? "pendientes" : "pending"}
                  </span>
                )}
              </div>

              {pendingSubscriptionsTable.length === 0 ? (
                <div
                  style={{
                    padding: "50px 22px",
                    textAlign: "center",
                    color: C.inkMute,
                  }}
                >
                  <div
                    style={{
                      fontFamily: "var(--font-fraunces), serif",
                      fontSize: 16,
                      color: C.ink,
                      marginBottom: 4,
                    }}
                  >
                    {isES
                      ? "No hay solicitudes pendientes"
                      : "No pending requests"}
                  </div>
                  <div style={{ fontSize: 13 }}>
                    {isES
                      ? "Todas las suscripciones están al día."
                      : "All subscriptions are up to date."}
                  </div>
                </div>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                      fontSize: 13,
                    }}
                  >
                    <thead>
                      <tr
                        style={{
                          background: C.bgWarm,
                          color: C.inkMute,
                          textAlign: "left",
                          fontSize: 11,
                          textTransform: "uppercase",
                          letterSpacing: "0.08em",
                        }}
                      >
                        <th style={thStyle}>{isES ? "Profesional" : "Professional"}</th>
                        <th style={thStyle}>{isES ? "Plan" : "Plan"}</th>
                        <th style={thStyle}>{isES ? "Solicitud" : "Requested"}</th>
                        <th style={thStyle}>{isES ? "Acciones" : "Actions"}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingSubscriptionsTable.map((profile) => (
                        <tr key={profile.id} style={{ borderTop: `1px solid ${C.lineSoft}` }}>
                          <td style={tdStyle}>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 10,
                              }}
                            >
                              <div
                                style={{
                                  width: 34,
                                  height: 34,
                                  borderRadius: "50%",
                                  background: avatarGradient(profile.first_name || "N"),
                                }}
                              />
                              <div>
                                <div style={{ fontWeight: 600 }}>
                                  {profile.first_name} {profile.last_name}
                                </div>
                                <div style={{ fontSize: 11, color: C.inkMute }}>
                                  {profile.email}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td style={tdStyle}>
                            <span style={chipStyle("amber")}>
                              {profile.selected_plan_id === "graduate"
                                ? isES
                                  ? "Recién graduado"
                                  : "Graduate"
                                : isES
                                ? "Profesional"
                                : "Pro"}
                            </span>
                          </td>
                          <td style={tdStyle}>
                            <div style={{ fontSize: 12, fontWeight: 500 }}>
                              {new Date(profile.created_at).toLocaleDateString(
                                isES ? "es-CL" : "en-US"
                              )}
                            </div>
                            <div style={{ fontSize: 11, color: C.inkMute }}>
                              {isES ? "hace" : ""} {hoursAgo(profile.created_at)}
                            </div>
                          </td>
                          <td style={tdStyle}>
                            <div
                              style={{ display: "flex", gap: 6, flexWrap: "wrap" }}
                            >
                              <button
                                onClick={() => generatePaymentLink(profile.id, false)}
                                style={actionBtn(C.terracotta, "white")}
                              >
                                {icoCard}
                                {isES ? "Link mensual" : "Monthly link"}
                              </button>
                              <button
                                onClick={() => generatePaymentLink(profile.id, true)}
                                style={actionBtn(C.terracottaDeep, "white")}
                              >
                                {icoCard}
                                {isES ? "Link anual" : "Yearly link"}
                              </button>
                              <button
                                onClick={() => approveSubscription(profile.id, 1)}
                                style={actionBtn("white", C.ink, C.line)}
                              >
                                {isES ? "1 mes gratis" : "1 mo free"}
                              </button>
                              <button
                                onClick={() => approveSubscription(profile.id, 3)}
                                style={actionBtn("white", C.ink, C.line)}
                              >
                                {isES ? "3 meses gratis" : "3 mo free"}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          )}

          {/* ── FINANCES ── */}
          {tab === "finances" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                  gap: 12,
                }}
              >
                <FinanceCard
                  label="MRR"
                  value={`$${stats.mrr.toLocaleString(isES ? "es-CL" : "en-US")}`}
                  detail={`${stats.activeSubscriptions} × $29.990 CLP`}
                  bg={C.sage50}
                  fg={C.sage700}
                />
                <FinanceCard
                  label={isES ? "Ingresos este mes" : "This month"}
                  value={`$${stats.revenueThisMonth.toLocaleString(
                    isES ? "es-CL" : "en-US"
                  )}`}
                  detail={isES ? "Confirmados MercadoPago" : "Confirmed MercadoPago"}
                  bg={C.terracottaSoft}
                  fg={C.terracottaDeep}
                />
                <FinanceCard
                  label={isES ? "ARR estimado" : "Est. ARR"}
                  value={`$${(stats.mrr * 12).toLocaleString(
                    isES ? "es-CL" : "en-US"
                  )}`}
                  detail={isES ? "MRR × 12 meses" : "MRR × 12 months"}
                  bg="white"
                  fg={C.ink}
                />
              </div>

              <section style={cardStyle}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "18px 22px",
                    borderBottom: `1px solid ${C.lineSoft}`,
                  }}
                >
                  <div>
                    <h2
                      style={{
                        fontFamily: "var(--font-fraunces), serif",
                        fontSize: 18,
                        margin: 0,
                        fontWeight: 400,
                      }}
                    >
                      {isES ? "Últimos pagos recibidos" : "Recent payments"}
                    </h2>
                    <p style={{ fontSize: 12, color: C.inkMute, margin: "4px 0 0" }}>
                      {isES
                        ? "Confirmados por MercadoPago"
                        : "Confirmed via MercadoPago"}
                    </p>
                  </div>
                  {recentPayments.length > 0 && (
                    <span style={chipStyle("sage")}>
                      {recentPayments.length} {isES ? "pagos" : "payments"}
                    </span>
                  )}
                </div>

                {recentPayments.length === 0 ? (
                  <div
                    style={{
                      padding: "50px 22px",
                      textAlign: "center",
                      color: C.inkMute,
                    }}
                  >
                    <div
                      style={{
                        fontFamily: "var(--font-fraunces), serif",
                        fontSize: 16,
                        color: C.ink,
                        marginBottom: 4,
                      }}
                    >
                      {isES ? "Sin pagos registrados aún" : "No payments recorded"}
                    </div>
                    <div style={{ fontSize: 13, maxWidth: 360, margin: "0 auto" }}>
                      {isES
                        ? "Los pagos aparecen aquí automáticamente cuando MercadoPago confirma una suscripción Pro."
                        : "Payments appear here automatically when MercadoPago confirms a Pro subscription."}
                    </div>
                  </div>
                ) : (
                  <div style={{ overflowX: "auto" }}>
                    <table
                      style={{
                        width: "100%",
                        borderCollapse: "collapse",
                        fontSize: 13,
                      }}
                    >
                      <thead>
                        <tr
                          style={{
                            background: C.bgWarm,
                            color: C.inkMute,
                            textAlign: "left",
                            fontSize: 11,
                            textTransform: "uppercase",
                            letterSpacing: "0.08em",
                          }}
                        >
                          <th style={thStyle}>{isES ? "Doctor" : "Doctor"}</th>
                          <th style={thStyle}>{isES ? "Fecha" : "Date"}</th>
                          <th style={thStyle}>{isES ? "Estado" : "Status"}</th>
                          <th style={{ ...thStyle, textAlign: "right" }}>
                            {isES ? "Monto" : "Amount"}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentPayments.map((p) => (
                          <tr key={p.id} style={{ borderTop: `1px solid ${C.lineSoft}` }}>
                            <td style={tdStyle}>
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 10,
                                }}
                              >
                                <div
                                  style={{
                                    width: 30,
                                    height: 30,
                                    borderRadius: "50%",
                                    background: avatarGradient(
                                      p.profiles?.first_name || p.payer_email || "N"
                                    ),
                                  }}
                                />
                                <div>
                                  <div style={{ fontWeight: 600 }}>
                                    {p.profiles
                                      ? `${p.profiles.first_name ?? ""} ${
                                          p.profiles.last_name ?? ""
                                        }`.trim()
                                      : "—"}
                                  </div>
                                  <div style={{ fontSize: 11, color: C.inkMute }}>
                                    {p.payer_email ?? "—"}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td style={tdStyle}>
                              <div style={{ fontSize: 12, fontWeight: 500 }}>
                                {format(new Date(p.created_at), "dd MMM yyyy", {
                                  locale: isES ? es : enUS,
                                })}
                              </div>
                              <div style={{ fontSize: 11, color: C.inkMute }}>
                                {hoursAgo(p.created_at)} {isES ? "atrás" : "ago"}
                              </div>
                            </td>
                            <td style={tdStyle}>
                              <span style={chipStyle("sage")}>
                                {icoCheck}
                                {isES ? "Aprobado" : "Approved"}
                              </span>
                            </td>
                            <td style={{ ...tdStyle, textAlign: "right" }}>
                              <div
                                style={{
                                  fontFamily:
                                    "var(--font-fraunces), serif",
                                  fontSize: 18,
                                  color: C.sage700,
                                  fontWeight: 400,
                                  letterSpacing: "-0.01em",
                                }}
                              >
                                +${Number(p.amount).toLocaleString(isES ? "es-CL" : "en-US")}
                              </div>
                              <div
                                style={{
                                  fontFamily:
                                    "var(--font-jetbrains-mono), monospace",
                                  fontSize: 10,
                                  color: C.inkMute,
                                }}
                              >
                                {p.currency}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            </div>
          )}
        </div>

        {/* Responsive + spin */}
        <style jsx global>{`
          @media (max-width: 900px) {
            .nurea-grid-admin {
              grid-template-columns: 1fr !important;
            }
          }
          @keyframes nureaSpin {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </div>

      {/* Payment Link Dialog */}
      <Dialog
        open={paymentLinkDialog.open}
        onOpenChange={(open) => {
          if (!paymentLinkDialog.loading) setPaymentLinkDialog((s) => ({ ...s, open }))
        }}
      >
        <DialogContent className="max-w-lg rounded-2xl">
          <DialogHeader>
            <DialogTitle
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                fontFamily: "var(--font-fraunces), serif",
                fontSize: 18,
                fontWeight: 400,
              }}
            >
              <span
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 10,
                  background: C.terracottaSoft,
                  color: C.terracottaDeep,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {icoLink}
              </span>
              {isES ? "Link de pago MercadoPago" : "MercadoPago payment link"}
            </DialogTitle>
            <DialogDescription style={{ color: C.inkSoft }}>
              {isES
                ? "Comparte este link con el profesional. La cuenta se activará al confirmarse el pago."
                : "Share this link with the professional. The account activates once the payment confirms."}
            </DialogDescription>
          </DialogHeader>

          {paymentLinkDialog.loading ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 12,
                padding: "36px 10px",
                color: C.inkSoft,
              }}
            >
              <div
                style={{
                  width: 34,
                  height: 34,
                  border: `3px solid ${C.sage200}`,
                  borderTopColor: C.sage700,
                  borderRadius: "50%",
                  animation: "nureaSpin 1s linear infinite",
                }}
              />
              <p style={{ fontSize: 13, margin: 0 }}>
                {isES ? "Generando link en MercadoPago…" : "Generating link…"}
              </p>
            </div>
          ) : paymentLinkDialog.url ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 10,
                }}
              >
                <div
                  style={{
                    padding: 14,
                    background: C.bgWarm,
                    borderRadius: 14,
                    border: `1px solid ${C.lineSoft}`,
                  }}
                >
                  <div
                    style={{
                      fontSize: 10,
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                      color: C.inkMute,
                      marginBottom: 4,
                      fontWeight: 600,
                    }}
                  >
                    {isES ? "Destinatario" : "Recipient"}
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 500,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {paymentLinkDialog.email ?? "—"}
                  </div>
                </div>
                <div
                  style={{
                    padding: 14,
                    background: C.terracottaSoft,
                    borderRadius: 14,
                  }}
                >
                  <div
                    style={{
                      fontSize: 10,
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                      color: C.terracottaDeep,
                      marginBottom: 4,
                      fontWeight: 600,
                    }}
                  >
                    {isES ? "Monto" : "Amount"}
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--font-fraunces), serif",
                      fontSize: 22,
                      letterSpacing: "-0.01em",
                      color: C.terracottaDeep,
                    }}
                  >
                    ${paymentLinkDialog.amount?.toLocaleString(isES ? "es-CL" : "en-US")}
                  </div>
                  <div style={{ fontSize: 10, color: C.terracotta }}>
                    {paymentLinkDialog.isYearly
                      ? isES
                        ? "Anual"
                        : "Yearly"
                      : isES
                      ? "Mensual"
                      : "Monthly"}
                  </div>
                </div>
              </div>

              <div>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 500,
                    color: C.inkMute,
                    marginBottom: 6,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                  }}
                >
                  {isES ? "Link de pago" : "Payment link"}
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <input
                    readOnly
                    value={paymentLinkDialog.url}
                    style={{
                      flex: 1,
                      padding: "10px 12px",
                      fontSize: 12,
                      fontFamily: "var(--font-jetbrains-mono), monospace",
                      background: C.bgWarm,
                      border: `1px solid ${C.line}`,
                      borderRadius: 12,
                      color: C.ink,
                    }}
                  />
                  <button
                    onClick={copyPaymentLink}
                    style={{
                      width: 40,
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "white",
                      border: `1px solid ${C.line}`,
                      borderRadius: 12,
                      cursor: "pointer",
                      color: C.ink,
                    }}
                  >
                    {icoCopy}
                  </button>
                </div>
              </div>

              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={copyPaymentLink}
                  style={{
                    flex: 1,
                    padding: "10px 14px",
                    fontSize: 13,
                    fontWeight: 500,
                    color: "white",
                    background: C.sage900,
                    border: "none",
                    borderRadius: 999,
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                  }}
                >
                  {icoCopy}
                  {isES ? "Copiar link" : "Copy link"}
                </button>
                <a
                  href={paymentLinkDialog.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    padding: "10px 14px",
                    fontSize: 13,
                    fontWeight: 500,
                    color: C.ink,
                    background: "white",
                    border: `1px solid ${C.line}`,
                    borderRadius: 999,
                    textDecoration: "none",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  {icoExternal}
                  {isES ? "Abrir" : "Open"}
                </a>
              </div>

              <p
                style={{
                  fontSize: 11,
                  color: C.inkMute,
                  textAlign: "center",
                  margin: 0,
                  lineHeight: 1.5,
                }}
              >
                {isES
                  ? "El link es único para este profesional. La suscripción se activará automáticamente al confirmarse el pago."
                  : "The link is unique to this professional. Subscription activates automatically on payment confirmation."}
              </p>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </RouteGuard>
  )
}

/* ------------------------------------------------------------------
 *  Small reusable pieces
 * ------------------------------------------------------------------ */
const thStyle: React.CSSProperties = {
  padding: "12px 16px",
  fontWeight: 600,
  fontSize: 10.5,
}
const tdStyle: React.CSSProperties = {
  padding: "14px 16px",
  verticalAlign: "middle",
  color: C.ink,
}

function actionBtn(bg: string, fg: string, border?: string): React.CSSProperties {
  return {
    display: "inline-flex",
    alignItems: "center",
    gap: 5,
    padding: "6px 10px",
    fontSize: 11,
    fontWeight: 500,
    background: bg,
    color: fg,
    border: border ? `1px solid ${border}` : "none",
    borderRadius: 999,
    cursor: "pointer",
  }
}

function KPI({
  label,
  value,
  detail,
  icon,
  iconBg,
  iconColor,
  trend,
  positive,
}: {
  label: string
  value: number | string
  detail: string
  icon: React.ReactNode
  iconBg: string
  iconColor: string
  trend: string
  positive: boolean
}) {
  return (
    <div style={{ ...cardPad, padding: 20 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 14,
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: iconBg,
            color: iconColor,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {icon}
        </div>
        <span style={chipStyle(positive ? "sage" : "danger")}>{trend}</span>
      </div>
      <div
        style={{
          fontSize: 11,
          color: C.inkMute,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          marginBottom: 6,
          fontWeight: 600,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: "var(--font-fraunces), serif",
          fontSize: 30,
          fontWeight: 400,
          letterSpacing: "-0.025em",
          lineHeight: 1,
          color: C.ink,
        }}
      >
        {value}
      </div>
      <div style={{ fontSize: 12, color: C.inkMute, marginTop: 6 }}>{detail}</div>
    </div>
  )
}

function MiniStat({
  label,
  value,
  icon,
  iconBg,
  iconColor,
}: {
  label: string
  value: number | string
  icon: React.ReactNode
  iconBg: string
  iconColor: string
}) {
  return (
    <div
      style={{
        ...cardStyle,
        padding: 14,
        display: "flex",
        alignItems: "center",
        gap: 12,
      }}
    >
      <div
        style={{
          width: 34,
          height: 34,
          borderRadius: 10,
          background: iconBg,
          color: iconColor,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <div style={{ minWidth: 0 }}>
        <div
          style={{
            fontSize: 10.5,
            color: C.inkMute,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            fontWeight: 600,
          }}
        >
          {label}
        </div>
        <div
          style={{
            fontFamily: "var(--font-fraunces), serif",
            fontSize: 20,
            fontWeight: 400,
            letterSpacing: "-0.015em",
            color: C.ink,
            marginTop: 2,
          }}
        >
          {value}
        </div>
      </div>
    </div>
  )
}

function FinanceCard({
  label,
  value,
  detail,
  bg,
  fg,
}: {
  label: string
  value: string
  detail: string
  bg: string
  fg: string
}) {
  return (
    <div
      style={{
        background: bg,
        border: `1px solid ${C.lineSoft}`,
        borderRadius: 18,
        padding: 20,
      }}
    >
      <div
        style={{
          fontSize: 11,
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          color: fg,
          marginBottom: 8,
          opacity: 0.85,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: "var(--font-fraunces), serif",
          fontSize: 28,
          fontWeight: 400,
          letterSpacing: "-0.02em",
          color: fg,
          lineHeight: 1,
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontSize: 12,
          color: fg,
          marginTop: 6,
          opacity: 0.7,
        }}
      >
        {detail}
      </div>
    </div>
  )
}

function BigSparkline({ data, max }: { data: ChartPoint[]; max: number }) {
  const w = 640
  const h = 220
  const padL = 28
  const padR = 8
  const padT = 12
  const padB = 22
  const innerW = w - padL - padR
  const innerH = h - padT - padB
  const stepX = data.length > 1 ? innerW / (data.length - 1) : 0

  const pts = data.map((p, i) => {
    const x = padL + i * stepX
    const y = padT + innerH - (p.citas / Math.max(1, max)) * innerH
    return { x, y, citas: p.citas }
  })
  const path =
    pts.length === 0
      ? ""
      : pts.map((p, i) => (i === 0 ? `M ${p.x},${p.y}` : `L ${p.x},${p.y}`)).join(" ")
  const area =
    pts.length === 0
      ? ""
      : `${path} L ${pts[pts.length - 1].x},${padT + innerH} L ${pts[0].x},${padT + innerH} Z`

  const yTicks = [0, 0.25, 0.5, 0.75, 1]

  return (
    <div style={{ width: "100%", overflow: "hidden" }}>
      <svg
        viewBox={`0 0 ${w} ${h}`}
        width="100%"
        preserveAspectRatio="none"
        style={{ display: "block", height: 220 }}
      >
        <defs>
          <linearGradient id="adminSparkFill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={C.sage500} stopOpacity={0.3} />
            <stop offset="100%" stopColor={C.sage500} stopOpacity={0} />
          </linearGradient>
        </defs>
        {yTicks.map((t, i) => {
          const y = padT + innerH - t * innerH
          return (
            <g key={i}>
              <line
                x1={padL}
                x2={w - padR}
                y1={y}
                y2={y}
                stroke={C.lineSoft}
                strokeWidth={1}
                strokeDasharray="3 3"
              />
              <text
                x={padL - 6}
                y={y + 3}
                textAnchor="end"
                fontSize="9"
                fontFamily="var(--font-jetbrains-mono), monospace"
                fill={C.inkMute}
              >
                {Math.round(max * t)}
              </text>
            </g>
          )
        })}
        {pts.length > 0 && (
          <>
            <path d={area} fill="url(#adminSparkFill)" />
            <path
              d={path}
              fill="none"
              stroke={C.sage700}
              strokeWidth={2}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          </>
        )}
        {/* Only show every ~5th label */}
        {data.map((p, i) =>
          i % 5 === 0 ? (
            <text
              key={i}
              x={padL + i * stepX}
              y={h - 4}
              textAnchor="middle"
              fontSize="9"
              fontFamily="var(--font-jetbrains-mono), monospace"
              fill={C.inkMute}
            >
              {p.name}
            </text>
          ) : null
        )}
      </svg>
    </div>
  )
}
