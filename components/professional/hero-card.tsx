"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Shield } from "lucide-react"
import { cn } from "@/lib/utils"

interface HeroCardProps {
  profile: {
    id: string
    first_name: string
    last_name: string
    professional_title?: string | null
    is_verified?: boolean
    avatar_url?: string | null
    updated_at?: string | null
  }
  professional: {
    specialty?: string | null
    specialty_id?: string | null
  }
  specialties: { id: string; name_es: string }[]
  avatarUrl: string | null
  onPhotoClick: () => void
  onRatingClick: () => void
  onTabSwitch: (tab: string) => void
}

interface Stats {
  patients: number | null
  patientsThisMonth: number | null
  rating: number | null
  unansweredCount: number
  modality: string | null
  minPrice: number | null
}

function LiveDot() {
  return (
    <span className="inline-block w-2 h-2 rounded-full bg-green-500 animate-pulse mr-1.5 shrink-0" />
  )
}

function StatSkeleton() {
  return <div className="h-7 w-16 bg-slate-100 rounded animate-pulse" />
}

export function HeroCard({
  profile,
  professional,
  specialties,
  avatarUrl,
  onPhotoClick,
  onRatingClick,
  onTabSwitch,
}: HeroCardProps) {
  const supabase = createClient()
  const [stats, setStats] = useState<Stats | null>(null)
  const [loadingStats, setLoadingStats] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      if (!profile?.id) return
      try {
        const now = new Date()
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

        const [
          { count: totalPatients },
          { count: monthPatients },
          { data: reviews },
          { data: bookingSettings },
          { data: consultationTypes },
        ] = await Promise.all([
          supabase
            .from("appointments")
            .select("id", { count: "exact", head: true })
            .eq("professional_id", profile.id)
            .not("patient_id", "is", null),
          supabase
            .from("appointments")
            .select("id", { count: "exact", head: true })
            .eq("professional_id", profile.id)
            .not("patient_id", "is", null)
            .gte("created_at", monthStart),
          supabase
            .from("reviews")
            .select("rating, replied_at")
            .eq("doctor_id", profile.id),
          supabase
            .from("booking_settings")
            .select("modality")
            .eq("professional_id", profile.id)
            .maybeSingle(),
          supabase
            .from("consultation_types")
            .select("price")
            .eq("professional_id", profile.id),
        ])

        const avgRating =
          reviews && reviews.length > 0
            ? reviews.reduce((sum, r) => sum + (r.rating ?? 0), 0) / reviews.length
            : null

        const unanswered = (reviews ?? []).filter((r) => r.replied_at === null).length

        const prices = (consultationTypes ?? [])
          .map((ct) => ct.price)
          .filter((p) => typeof p === "number")
        const minPrice = prices.length > 0 ? Math.min(...prices) : null

        const modalityMap: Record<string, string> = {
          online: "Online",
          "in-person": "Presencial",
          both: "Ambos",
        }

        setStats({
          patients: totalPatients ?? null,
          patientsThisMonth: monthPatients ?? null,
          rating: avgRating !== null ? Math.round(avgRating * 10) / 10 : null,
          unansweredCount: unanswered,
          modality: bookingSettings?.modality
            ? (modalityMap[bookingSettings.modality] ?? bookingSettings.modality)
            : null,
          minPrice,
        })
      } catch (e) {
        console.error("HeroCard stats error:", e)
      } finally {
        setLoadingStats(false)
      }
    }
    fetchStats()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.id])

  const specialtyName =
    professional?.specialty_id
      ? specialties.find((s) => s.id === professional.specialty_id)?.name_es
      : professional?.specialty ?? null

  const chipParts = [profile.professional_title, specialtyName].filter(Boolean)
  const chip = chipParts.join(" · ")

  const initials =
    `${profile.first_name?.[0] ?? ""}${profile.last_name?.[0] ?? ""}`.toUpperCase() || "?"

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
      {/* Top section: avatar + name + button */}
      <div className="flex items-start gap-4 p-5">
        {/* Avatar with pencil overlay */}
        <div className="relative shrink-0">
          <button
            type="button"
            onClick={onPhotoClick}
            className="relative w-[72px] h-[72px] rounded-full overflow-hidden border-2 border-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-400"
            title="Cambiar foto"
          >
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarUrl} alt="Foto de perfil" className="w-full h-full object-cover" />
            ) : (
              <span className="w-full h-full flex items-center justify-center bg-teal-50 text-teal-700 text-xl font-bold">
                {initials}
              </span>
            )}
            {/* Pencil overlay */}
            <span className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-sm">
              <svg
                width="10"
                height="10"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#64748b"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </span>
          </button>
        </div>

        {/* Name + chip + verified */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="font-bold text-slate-900" style={{ fontSize: 18 }}>
              {profile.first_name} {profile.last_name}
            </h2>
            {profile.is_verified && (
              <span className="flex items-center gap-1 text-xs font-semibold text-teal-700 bg-teal-50 border border-teal-100 rounded-full px-2 py-0.5">
                <Shield className="h-3 w-3" />
                Verificado
              </span>
            )}
          </div>
          {chip && (
            <span className="mt-1 inline-block text-xs font-semibold text-teal-700 bg-teal-50 border border-teal-100 rounded-full px-3 py-0.5">
              {chip}
            </span>
          )}
        </div>

        {/* Cambiar foto button */}
        <button
          type="button"
          onClick={onPhotoClick}
          className="shrink-0 text-xs font-semibold text-teal-600 border border-teal-200 rounded-lg px-3 py-1.5 hover:bg-teal-50 transition-colors hidden sm:block"
        >
          Cambiar foto
        </button>
      </div>

      {/* Stats bar */}
      <div className="border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4">
        {/* Pacientes */}
        <div className="flex flex-col gap-1 px-5 py-4 border-r border-slate-100">
          <div className="flex items-center">
            <LiveDot />
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Pacientes</span>
          </div>
          {loadingStats ? (
            <StatSkeleton />
          ) : (
            <span className="font-bold text-slate-900" style={{ fontSize: 20 }}>
              {stats?.patients ?? "—"}
            </span>
          )}
          <span className="text-xs text-slate-400">
            {stats?.patientsThisMonth != null
              ? `+${stats.patientsThisMonth} este mes`
              : "este mes"}
          </span>
        </div>

        {/* Valoración */}
        <button
          type="button"
          onClick={onRatingClick}
          className="flex flex-col gap-1 px-5 py-4 border-r border-slate-100 text-left hover:bg-slate-50 transition-colors"
        >
          <div className="flex items-center">
            <LiveDot />
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Valoración ★</span>
          </div>
          {loadingStats ? (
            <StatSkeleton />
          ) : (
            <span className="font-bold text-slate-900" style={{ fontSize: 20 }}>
              {stats?.rating != null ? stats.rating.toFixed(1) : "—"}
            </span>
          )}
          <span className="text-xs text-teal-600 font-medium">
            {stats && stats.unansweredCount > 0 ? "Ver comentarios →" : "Ver valoraciones →"}
          </span>
        </button>

        {/* Modalidad */}
        <button
          type="button"
          onClick={() => onTabSwitch("clinical")}
          className="flex flex-col gap-1 px-5 py-4 border-r border-slate-100 text-left hover:bg-slate-50 transition-colors"
        >
          <div className="flex items-center">
            <LiveDot />
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Modalidad</span>
          </div>
          {loadingStats ? (
            <StatSkeleton />
          ) : (
            <span className="font-bold text-slate-900" style={{ fontSize: 20 }}>
              {stats?.modality ?? "—"}
            </span>
          )}
          <span className="text-xs text-slate-400">Cambiar en Clínica →</span>
        </button>

        {/* Por sesión */}
        <button
          type="button"
          onClick={() => onTabSwitch("pricing")}
          className="flex flex-col gap-1 px-5 py-4 text-left hover:bg-slate-50 transition-colors"
        >
          <div className="flex items-center">
            <LiveDot />
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Por sesión</span>
          </div>
          {loadingStats ? (
            <StatSkeleton />
          ) : (
            <span className="font-bold text-slate-900" style={{ fontSize: 20 }}>
              {stats?.minPrice != null
                ? `$${stats.minPrice.toLocaleString("es-CL")}`
                : "—"}
            </span>
          )}
          <span className="text-xs text-slate-400">Cambiar en Precios →</span>
        </button>
      </div>
    </div>
  )
}
