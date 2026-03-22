"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Shield } from "lucide-react"
import { AvatarUploader } from "@/components/ui/avatar-uploader"

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
    is_verified?: boolean
    updated_at?: string | null
  }
  specialties: { id: string; name_es: string }[]
  avatarUrl: string | null
  onUpload: (file: File) => Promise<{ success: boolean }>
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

function StatSkeleton() {
  return <div className="h-6 w-14 bg-slate-100 rounded animate-pulse mt-1" />
}

export function HeroCard({
  profile,
  professional,
  specialties,
  avatarUrl,
  onUpload,
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
          { data: professional },
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
            .from("professionals")
            .select("consultation_type, consultation_types")
            .eq("id", profile.id)
            .maybeSingle(),
        ])

        const avgRating =
          reviews && reviews.length > 0
            ? reviews.reduce((sum, r) => sum + (r.rating ?? 0), 0) / reviews.length
            : null

        const unanswered = (reviews ?? []).filter((r) => r.replied_at === null).length

        // consultation_types is a JSONB array on the professionals table
        const ctArray = Array.isArray(professional?.consultation_types)
          ? (professional.consultation_types as { price?: number }[])
          : []
        const prices = ctArray.map((ct) => ct.price).filter((p): p is number => typeof p === "number")
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
          modality: professional?.consultation_type
            ? (modalityMap[professional.consultation_type] ?? professional.consultation_type)
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
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      {/* Top section */}
      <div className="flex items-center gap-5 px-[22px] py-5">
        {/* Avatar */}
        <div className="relative shrink-0">
          <AvatarUploader onUpload={onUpload}>
            <button
              type="button"
              className="relative w-[72px] h-[72px] rounded-full overflow-hidden focus:outline-none focus:ring-2 focus:ring-teal-400"
              style={{ border: "3px solid white", boxShadow: "0 0 0 2px #e2e8f0" }}
              title="Cambiar foto"
            >
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatarUrl} alt="Foto de perfil" className="w-full h-full object-cover" />
              ) : (
                <span
                  className="w-full h-full flex items-center justify-center text-white font-extrabold"
                  style={{
                    background: "linear-gradient(135deg, #0d9488 0%, #0ea5e9 100%)",
                    fontSize: 24,
                  }}
                >
                  {initials}
                </span>
              )}
            </button>
          </AvatarUploader>
          {/* Pencil overlay */}
          <AvatarUploader onUpload={onUpload}>
            <button
              type="button"
              className="absolute flex items-center justify-center bg-white rounded-full cursor-pointer"
              style={{
                bottom: 1,
                right: 1,
                width: 22,
                height: 22,
                border: "1.5px solid #e2e8f0",
                boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
              }}
              title="Cambiar foto"
            >
              <svg
                width="10"
                height="10"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#64748b"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
              </svg>
            </button>
          </AvatarUploader>
        </div>

        {/* Name + chip + verified */}
        <div className="flex-1 min-w-0">
          <h2
            className="font-extrabold text-slate-900"
            style={{ fontSize: 18, letterSpacing: "-0.02em" }}
          >
            {profile.first_name} {profile.last_name}
          </h2>
          <div className="flex items-center flex-wrap gap-2 mt-1.5">
            {chip && (
              <span
                className="inline-block font-bold text-teal-700 rounded-full"
                style={{
                  background: "#f0fdfa",
                  border: "1px solid #99f6e4",
                  color: "#0d9488",
                  fontSize: 11,
                  fontWeight: 700,
                  padding: "3px 10px",
                  borderRadius: 99,
                }}
              >
                {chip}
              </span>
            )}
            {professional.is_verified && (
              <span className="inline-flex items-center gap-1 text-teal-700" style={{ fontSize: 11, fontWeight: 700 }}>
                <Shield style={{ width: 12, height: 12 }} />
                Verificado
              </span>
            )}
          </div>
        </div>

        {/* Cambiar foto button */}
        <AvatarUploader onUpload={onUpload}>
          <button
            type="button"
            className="shrink-0 hidden sm:flex items-center gap-1.5 font-semibold text-slate-600 bg-white rounded-lg cursor-pointer hover:bg-slate-50 transition-colors"
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: "#475569",
              border: "1.5px solid #e2e8f0",
              padding: "7px 14px",
              borderRadius: 8,
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
            </svg>
            Cambiar foto
          </button>
        </AvatarUploader>
      </div>

      {/* Stats bar */}
      <div
        className="grid grid-cols-2 sm:grid-cols-4"
        style={{ borderTop: "1px solid #f1f5f9" }}
      >
        {/* Pacientes */}
        <div
          className="relative"
          style={{ padding: "14px 20px", borderRight: "1px solid #f1f5f9" }}
        >
          {/* Live dot — absolute top-right */}
          <span
            className="absolute rounded-full animate-pulse"
            style={{
              top: 10,
              right: 12,
              width: 7,
              height: 7,
              background: "#22c55e",
            }}
          />
          {loadingStats ? (
            <StatSkeleton />
          ) : (
            <span
              className="block font-extrabold text-slate-900"
              style={{ fontSize: 20, letterSpacing: "-0.03em", lineHeight: 1 }}
            >
              {stats?.patients ?? "—"}
            </span>
          )}
          <span
            className="block"
            style={{ fontSize: 11, color: "#94a3b8", fontWeight: 500, marginTop: 4 }}
          >
            Pacientes
          </span>
          <span
            className="block"
            style={{ fontSize: 10, fontWeight: 700, color: "#22c55e", marginTop: 3 }}
          >
            {stats?.patientsThisMonth != null
              ? `+${stats.patientsThisMonth} este mes`
              : "este mes"}
          </span>
        </div>

        {/* Valoración */}
        <button
          type="button"
          onClick={onRatingClick}
          className="relative text-left transition-colors hover:bg-slate-50"
          style={{ padding: "14px 20px", borderRight: "1px solid #f1f5f9" }}
        >
          <span
            className="absolute rounded-full animate-pulse"
            style={{
              top: 10,
              right: 12,
              width: 7,
              height: 7,
              background: "#22c55e",
            }}
          />
          {loadingStats ? (
            <StatSkeleton />
          ) : (
            <span
              className="block font-extrabold text-slate-900"
              style={{ fontSize: 20, letterSpacing: "-0.03em", lineHeight: 1 }}
            >
              {stats?.rating != null ? stats.rating.toFixed(1) : "—"}
            </span>
          )}
          <span
            className="block"
            style={{ fontSize: 11, color: "#94a3b8", fontWeight: 500, marginTop: 4 }}
          >
            Valoración ★
          </span>
          <span
            className="block"
            style={{ fontSize: 10, fontWeight: 700, color: "#0d9488", marginTop: 3 }}
          >
            {stats && stats.unansweredCount > 0 ? "Ver comentarios →" : "Ver valoraciones →"}
          </span>
        </button>

        {/* Modalidad */}
        <button
          type="button"
          onClick={() => onTabSwitch("clinical")}
          className="relative text-left transition-colors hover:bg-slate-50"
          style={{ padding: "14px 20px", borderRight: "1px solid #f1f5f9" }}
        >
          <span
            className="absolute rounded-full animate-pulse"
            style={{
              top: 10,
              right: 12,
              width: 7,
              height: 7,
              background: "#22c55e",
            }}
          />
          {loadingStats ? (
            <StatSkeleton />
          ) : (
            <span
              className="block font-extrabold text-slate-900"
              style={{ fontSize: 20, letterSpacing: "-0.03em", lineHeight: 1 }}
            >
              {stats?.modality ?? "—"}
            </span>
          )}
          <span
            className="block"
            style={{ fontSize: 11, color: "#94a3b8", fontWeight: 500, marginTop: 4 }}
          >
            Modalidad
          </span>
          <span
            className="block"
            style={{ fontSize: 10, fontWeight: 700, color: "#0d9488", marginTop: 3 }}
          >
            Cambiar en Clínica →
          </span>
        </button>

        {/* Por sesión */}
        <button
          type="button"
          onClick={() => onTabSwitch("pricing")}
          className="relative text-left transition-colors hover:bg-slate-50"
          style={{ padding: "14px 20px" }}
        >
          <span
            className="absolute rounded-full animate-pulse"
            style={{
              top: 10,
              right: 12,
              width: 7,
              height: 7,
              background: "#22c55e",
            }}
          />
          {loadingStats ? (
            <StatSkeleton />
          ) : (
            <span
              className="block font-extrabold text-slate-900"
              style={{ fontSize: 20, letterSpacing: "-0.03em", lineHeight: 1 }}
            >
              {stats?.minPrice != null
                ? `$${stats.minPrice.toLocaleString("es-CL")}`
                : "—"}
            </span>
          )}
          <span
            className="block"
            style={{ fontSize: 11, color: "#94a3b8", fontWeight: 500, marginTop: 4 }}
          >
            Por sesión
          </span>
          <span
            className="block"
            style={{ fontSize: 10, fontWeight: 700, color: "#0d9488", marginTop: 3 }}
          >
            Cambiar en Precios →
          </span>
        </button>
      </div>
    </div>
  )
}
