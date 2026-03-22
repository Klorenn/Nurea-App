# Professional Profile Page Redesign v2 — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the duplicated preview+form layout on the professional profile General tab with a hero card (live stats), inline reviews panel, and collapsible accordion sections.

**Architecture:** Three new components (`HeroCard`, `ReviewsPanel`, `AccordionSection`) live in `components/professional/`. A new API route handles review replies. `page.tsx` gets a new state variable for the active tab (controlled Tabs) plus two state variables for raw profile/professional data that are passed to `HeroCard` as props. The existing `generalForm` + `onSaveGeneral` are preserved intact.

**Tech Stack:** Next.js 14 App Router, TypeScript, Tailwind CSS, shadcn/ui, Supabase JS client, react-hook-form, date-fns, lucide-react

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `supabase/migrations/20260322_add_review_reply_to_reviews.sql` | Create | Add `reply_text` + `replied_at` columns to `reviews` table; RLS policy for professional update |
| `components/professional/accordion-section.tsx` | Create | Generic collapsible section with per-field inline editing rows and toggle rows |
| `components/professional/hero-card.tsx` | Create | Top-of-page card: avatar, name, chip, verified badge, 4 live stats |
| `components/professional/reviews-panel.tsx` | Create | Inline reviews list with inline reply textarea + submit |
| `app/api/professional/reviews/reply/route.ts` | Create | POST endpoint: validate + persist reply_text/replied_at |
| `app/dashboard/(main)/professional/profile/page.tsx` | Modify | Header greeting, controlled Tabs, add state, replace General tab content |

---

## Task 1: DB Migration

**Files:**
- Create: `supabase/migrations/20260322_add_review_reply_to_reviews.sql`

- [ ] **Step 1: Write the migration file**

```sql
-- supabase/migrations/20260322_add_review_reply_to_reviews.sql
ALTER TABLE public.reviews
  ADD COLUMN IF NOT EXISTS reply_text TEXT,
  ADD COLUMN IF NOT EXISTS replied_at TIMESTAMPTZ;

-- Allow professionals to update reply_text/replied_at on their own reviews
-- doctor_id is canonical since migration 20260315 renamed professional_id → doctor_id
CREATE POLICY "professionals_can_reply_own_reviews"
  ON public.reviews
  FOR UPDATE
  USING (auth.uid() = doctor_id)
  WITH CHECK (auth.uid() = doctor_id);
```

- [ ] **Step 2: Verify the file exists and has correct content**

```bash
cat supabase/migrations/20260322_add_review_reply_to_reviews.sql
```

- [ ] **Step 3: Apply migration locally**

```bash
npx supabase db push
```

If `supabase db push` fails (no local Supabase), record the migration as pending and proceed. The API route and ReviewsPanel will be coded to match these column names.

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/20260322_add_review_reply_to_reviews.sql
git commit -m "feat: add reply_text and replied_at columns to reviews table"
```

---

## Task 2: AccordionSection component

**Files:**
- Create: `components/professional/accordion-section.tsx`

This is a pure-UI component. No Supabase calls — it just renders children with a collapsible header.

- [ ] **Step 1: Create the component**

```tsx
// components/professional/accordion-section.tsx
"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface AccordionSectionProps {
  title: string
  subtitle: string
  icon: React.ReactNode
  iconVariant: "teal" | "blue" | "violet"
  preview: string
  children: React.ReactNode
  defaultOpen?: boolean
  editButton?: React.ReactNode  // not in spec's Props table but required to implement spec line 329: "Editar button in accordion header (right side, next to chevron)" for Bio accordion
}

const iconBg: Record<AccordionSectionProps["iconVariant"], string> = {
  teal:   "bg-teal-50 text-teal-600",
  blue:   "bg-blue-50 text-blue-600",
  violet: "bg-violet-50 text-violet-600",
}

export function AccordionSection({
  title,
  subtitle,
  icon,
  iconVariant,
  preview,
  children,
  defaultOpen = false,
  editButton,
}: AccordionSectionProps) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div
      className={cn(
        "rounded-xl transition-all duration-200",
        open
          ? "border-[1.5px] border-teal-600 shadow-[0_0_0_3px_rgba(13,148,136,0.08)] bg-white"
          : "border border-slate-200 bg-white hover:bg-slate-50/80"
      )}
    >
      {/* Header */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left"
        style={{ background: open ? "#f0fdfa" : undefined, borderRadius: open ? "10px 10px 0 0" : "10px", borderBottom: open ? "1px solid #e0fdf4" : undefined }}
      >
        {/* Icon */}
        <span className={cn("p-2 rounded-lg shrink-0", iconBg[iconVariant])}>
          {icon}
        </span>

        {/* Title + subtitle */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-slate-800">{title}</p>
          <p className="text-xs text-slate-400">{subtitle}</p>
        </div>

        {/* Preview + extra button + chevron */}
        <div className="flex items-center gap-2 shrink-0">
          {!open && (
            <span className="text-xs text-slate-500 truncate max-w-[140px] hidden sm:block">
              {preview}
            </span>
          )}
          {open && editButton}
          <ChevronDown
            className={cn(
              "h-4 w-4 transition-transform duration-200",
              open ? "rotate-180 text-teal-600" : "text-slate-400"
            )}
          />
        </div>
      </button>

      {/* Content */}
      {open && (
        <div className="px-4 pb-4 pt-3 space-y-1">
          {children}
        </div>
      )}
    </div>
  )
}

// ─── FieldRow ────────────────────────────────────────────────────────────────
interface FieldRowProps {
  label: string
  value: string | React.ReactNode
  emptyText?: string
  onEdit?: () => void        // undefined = non-editable
  editing?: boolean
  editContent?: React.ReactNode  // rendered instead of value when editing=true
}

export function FieldRow({ label, value, emptyText = "Sin completar", onEdit, editing, editContent }: FieldRowProps) {
  const isEmpty = !value || (typeof value === "string" && value.trim() === "")
  return (
    <div
      className={cn(
        "flex items-center gap-3 py-2.5 px-3 rounded-lg",
        editing ? "border-l-[3px] border-teal-600 bg-[#fafffe]" : ""
      )}
    >
      <span
        className="shrink-0 text-slate-400"
        style={{ fontSize: "12.5px", width: 160, minWidth: 120 }}
      >
        {label}
      </span>

      {editing ? (
        <div className="flex-1">{editContent}</div>
      ) : (
        <>
          <span
            className={cn("flex-1 font-semibold", isEmpty ? "text-slate-300 italic" : "text-slate-800")}
            style={{ fontSize: "13.5px" }}
          >
            {isEmpty ? emptyText : value}
          </span>
          {onEdit && (
            <button
              type="button"
              onClick={onEdit}
              className="shrink-0 p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-teal-600 transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </button>
          )}
        </>
      )}
    </div>
  )
}

// ─── ToggleRow ────────────────────────────────────────────────────────────────
import { Switch } from "@/components/ui/switch"

interface ToggleRowProps {
  label: string
  description: string
  checked: boolean
  onCheckedChange: (v: boolean) => void
}

export function ToggleRow({ label, description, checked, onCheckedChange }: ToggleRowProps) {
  return (
    <div className="flex items-center justify-between py-2.5 px-3 rounded-lg">
      <div>
        <p className="text-sm font-medium text-slate-700">{label}</p>
        <p className="text-xs text-slate-400 mt-0.5">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit --project tsconfig.json 2>&1 | grep accordion-section
```

Expected: no errors for this file.

- [ ] **Step 3: Commit**

```bash
git add components/professional/accordion-section.tsx
git commit -m "feat: add AccordionSection, FieldRow, ToggleRow components"
```

---

## Task 3: HeroCard component

**Files:**
- Create: `components/professional/hero-card.tsx`

Fetches 4 live stats from Supabase on mount. Receives profile + professional data as props — does NOT use `useProfile` hook.

- [ ] **Step 1: Create the component**

```tsx
// components/professional/hero-card.tsx
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

        const prices = (consultationTypes ?? []).map((ct) => ct.price).filter((p) => typeof p === "number")
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
          modality: bookingSettings?.modality ? (modalityMap[bookingSettings.modality] ?? bookingSettings.modality) : null,
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
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </span>
          </button>
        </div>

        {/* Name + chip + verified */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-lg font-bold text-slate-900" style={{ fontSize: 18 }}>
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
        {/* Stat: Pacientes */}
        <div className="flex flex-col gap-1 px-5 py-4 border-r border-slate-100">
          <div className="flex items-center">
            <LiveDot />
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Pacientes</span>
          </div>
          {loadingStats ? (
            <StatSkeleton />
          ) : (
            <span className="text-xl font-bold text-slate-900" style={{ fontSize: 20 }}>
              {stats?.patients ?? "—"}
            </span>
          )}
          <span className="text-xs text-slate-400">
            {stats?.patientsThisMonth != null ? `+${stats.patientsThisMonth} este mes` : "este mes"}
          </span>
        </div>

        {/* Stat: Valoración */}
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
            <span className="text-xl font-bold text-slate-900" style={{ fontSize: 20 }}>
              {stats?.rating != null ? stats.rating.toFixed(1) : "—"}
            </span>
          )}
          <span className="text-xs text-teal-600 font-medium">
            {stats && stats.unansweredCount > 0 ? "Ver comentarios →" : "Ver valoraciones →"}
          </span>
        </button>

        {/* Stat: Modalidad */}
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
            <span className="text-xl font-bold text-slate-900" style={{ fontSize: 20 }}>
              {stats?.modality ?? "—"}
            </span>
          )}
          <span className="text-xs text-slate-400">Cambiar en Clínica →</span>
        </button>

        {/* Stat: Por sesión */}
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
            <span className="text-xl font-bold text-slate-900" style={{ fontSize: 20 }}>
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
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit 2>&1 | grep hero-card
```

- [ ] **Step 3: Commit**

```bash
git add components/professional/hero-card.tsx
git commit -m "feat: add HeroCard component with live stats"
```

---

## Task 4: ReviewsPanel component + API route

**Files:**
- Create: `components/professional/reviews-panel.tsx`
- Create: `app/api/professional/reviews/reply/route.ts`

- [ ] **Step 1: Create the API route**

```ts
// app/api/professional/reviews/reply/route.ts
import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(req: Request) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json().catch(() => null)
  const { review_id, reply_text } = body ?? {}

  if (!review_id || typeof review_id !== "string") {
    return NextResponse.json({ error: "review_id required" }, { status: 400 })
  }
  if (!reply_text || typeof reply_text !== "string" || reply_text.trim().length === 0) {
    return NextResponse.json({ error: "reply_text required" }, { status: 400 })
  }
  if (reply_text.trim().length > 500) {
    return NextResponse.json({ error: "reply_text max 500 characters" }, { status: 400 })
  }

  // Verify review belongs to this professional (doctor_id = canonical column)
  const { data: review, error: fetchError } = await supabase
    .from("reviews")
    .select("id, doctor_id")
    .eq("id", review_id)
    .eq("doctor_id", user.id)
    .single()

  if (fetchError || !review) {
    return NextResponse.json({ error: "Review not found" }, { status: 404 })
  }

  const { error } = await supabase
    .from("reviews")
    .update({ reply_text: reply_text.trim(), replied_at: new Date().toISOString() })
    .eq("id", review_id)
    .eq("doctor_id", user.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
```

- [ ] **Step 2: Create the ReviewsPanel component**

```tsx
// components/professional/reviews-panel.tsx
"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import { X } from "lucide-react"
import { toast } from "sonner"

interface Review {
  id: string
  rating: number
  comment: string | null
  created_at: string
  reply_text: string | null
  replied_at: string | null
  patient: { first_name: string; last_name: string } | null
}

interface ReviewsPanelProps {
  professionalId: string
  onClose: () => void
}

const COLORS = ["bg-teal-100 text-teal-700", "bg-blue-100 text-blue-700", "bg-violet-100 text-violet-700", "bg-orange-100 text-orange-700"]

export function ReviewsPanel({ professionalId, onClose }: ReviewsPanelProps) {
  const supabase = createClient()
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyText, setReplyText] = useState("")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    async function fetchReviews() {
      const { data } = await supabase
        .from("reviews")
        .select("id, rating, comment, created_at, reply_text, replied_at, patient:profiles(first_name, last_name)")
        .eq("doctor_id", professionalId)
        .order("created_at", { ascending: false })
      setReviews((data as Review[]) ?? [])
      setLoading(false)
    }
    fetchReviews()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [professionalId])

  const avg = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : null

  const unanswered = reviews.filter((r) => r.replied_at === null).length

  async function handleReply(reviewId: string) {
    if (!replyText.trim()) return
    setSubmitting(true)
    try {
      const res = await fetch("/api/professional/reviews/reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ review_id: reviewId, reply_text: replyText.trim() }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      setReviews((prev) =>
        prev.map((r) =>
          r.id === reviewId
            ? { ...r, reply_text: replyText.trim(), replied_at: new Date().toISOString() }
            : r
        )
      )
      setReplyingTo(null)
      setReplyText("")
      toast.success("Respuesta publicada")
    } catch (e: any) {
      toast.error(e.message ?? "Error al publicar")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="bg-white rounded-xl border-[1.5px] border-teal-600 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-teal-100 bg-teal-50/40">
        <div>
          <h3 className="text-sm font-bold text-slate-800">
            Valoraciones de pacientes{avg ? ` — ${avg} ★` : ""}
          </h3>
          {unanswered > 0 && (
            <p className="text-xs text-teal-600 font-medium mt-0.5">{unanswered} sin responder</p>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-teal-100 text-teal-600 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Reviews list */}
      <div className="divide-y divide-slate-100 max-h-[480px] overflow-y-auto">
        {loading && (
          <div className="px-5 py-8 text-center text-sm text-slate-400">Cargando valoraciones…</div>
        )}
        {!loading && reviews.length === 0 && (
          <div className="px-5 py-8 text-center text-sm text-slate-400">Aún no tienes valoraciones.</div>
        )}
        {reviews.map((review, i) => {
          const name = review.patient
            ? `${review.patient.first_name} ${review.patient.last_name}`
            : "Paciente"
          const initials = name
            .split(" ")
            .map((w) => w[0] ?? "")
            .slice(0, 2)
            .join("")
            .toUpperCase()
          const colorClass = COLORS[i % COLORS.length]
          const isReplying = replyingTo === review.id

          return (
            <div key={review.id} className="px-5 py-4 space-y-2">
              {/* Patient info row */}
              <div className="flex items-start gap-3">
                <span className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${colorClass}`}>
                  {initials}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-800">{name}</span>
                    <span className="text-xs text-slate-400">
                      {formatDistanceToNow(new Date(review.created_at), { addSuffix: true, locale: es })}
                    </span>
                  </div>
                  {/* Stars */}
                  <div className="flex gap-0.5 mt-0.5">
                    {Array.from({ length: 5 }).map((_, si) => (
                      <span key={si} className={si < review.rating ? "text-amber-400" : "text-slate-200"}>★</span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Comment */}
              {review.comment && (
                <p className="text-sm text-slate-600 pl-12">{review.comment}</p>
              )}

              {/* Reply block or reply form */}
              {review.reply_text ? (
                <div className="ml-12 pl-3 border-l-[3px] border-teal-600">
                  <p className="text-xs font-semibold text-teal-700 mb-0.5">Tu respuesta</p>
                  <p className="text-sm text-slate-600">{review.reply_text}</p>
                </div>
              ) : isReplying ? (
                <div className="ml-12 space-y-2">
                  <textarea
                    className="w-full rounded-lg border border-teal-300 focus:border-teal-500 focus:ring-1 focus:ring-teal-400 text-sm p-2.5 resize-none outline-none text-slate-700"
                    rows={3}
                    maxLength={500}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Escribe tu respuesta…"
                    autoFocus
                  />
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => { setReplyingTo(null); setReplyText("") }}
                      className="text-xs text-slate-500 hover:text-slate-700 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      disabled={submitting || !replyText.trim()}
                      onClick={() => handleReply(review.id)}
                      className="text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-50 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      {submitting ? "Publicando…" : "Publicar"}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="ml-12">
                  <button
                    type="button"
                    onClick={() => { setReplyingTo(review.id); setReplyText("") }}
                    className="text-xs font-medium text-teal-600 hover:text-teal-700 hover:underline"
                  >
                    Responder
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
npx tsc --noEmit 2>&1 | grep -E "reviews-panel|reviews/reply"
```

- [ ] **Step 4: Commit**

```bash
git add components/professional/reviews-panel.tsx app/api/professional/reviews/reply/route.ts
git commit -m "feat: add ReviewsPanel component and review reply API route"
```

---

## Task 5: Update profile/page.tsx — General tab redesign

**Files:**
- Modify: `app/dashboard/(main)/professional/profile/page.tsx`

This task has 4 sub-steps. Make one focused change at a time.

### 5a — Add imports + state variables

- [ ] **Step 1: Add new imports at top of file (after existing imports)**

Find the existing import block (around line 60):
```ts
import { TipTapEditor } from "@/components/professional/tiptap-editor"
import { useProfile } from "@/hooks/use-profile"
```

Add after these lines:
```ts
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import { HeroCard } from "@/components/professional/hero-card"
import { ReviewsPanel } from "@/components/professional/reviews-panel"
import { AccordionSection, FieldRow, ToggleRow } from "@/components/professional/accordion-section"
import { GraduationCap as GraduationCapIcon, FlaskConical, MessageSquare } from "lucide-react"
```

- [ ] **Step 2: Add state variables for raw data + reviews panel + controlled tab**

Find (around line 139):
```ts
  const [publicProfilePath, setPublicProfilePath] = useState<string | null>(null)
```

Add after that line:
```ts
  const [pageProfile, setPageProfile] = useState<any | null>(null)
  const [pageProfessional, setPageProfessional] = useState<any | null>(null)
  const [showReviews, setShowReviews] = useState(false)
  const [activeTab, setActiveTab] = useState<string>(
    (searchParams.get("tab") as string) || "general"
  )
```

- [ ] **Step 3: Populate `pageProfile` + `pageProfessional` in `loadProfile`**

Find inside `loadProfile` (around line 215):
```ts
        if (profileData) {
          setProfileName({
            first_name: profileData.first_name || "",
            last_name: profileData.last_name || "",
          })
        }
```

Add after the `setProfileName` call:
```ts
          setPageProfile(profileData)
```

Find (around line 274):
```ts
          setAvatarUrl(professional.avatar_url)
```

Add after that line:
```ts
          setPageProfessional(professional)
```

- [ ] **Step 4: Remove `initialTab` constant and convert Tabs to controlled**

Remove line (around line 761):
```ts
  const initialTab = (searchParams.get("tab") as "general" | "clinical" | "studies" | "gallery" | "security" | "verification" | "pricing") || "general"
```

The `initialTab` constant is no longer needed — `activeTab` state serves the same purpose.

Find (around line 802):
```ts
      <Tabs defaultValue={initialTab} className="w-full">
```

Replace with:
```ts
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
```

- [ ] **Step 5: Update the page header from `{displayName}` to greeting**

Find (around line 767):
```tsx
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          {displayName}
        </h1>
```

Replace with:
```tsx
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Hola, {profileName?.first_name?.split(" ")[0] ?? displayName} 👋
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Tu perfil profesional
            {pageProfile?.updated_at && (
              <> · Última edición {formatDistanceToNow(new Date(pageProfile.updated_at), { addSuffix: true, locale: es })}</>
            )}
          </p>
        </div>
```

### 5b — Replace General tab content

- [ ] **Step 6: Replace the General tab content (lines 825–1223)**

Find the opening of the General TabsContent:
```tsx
        {/* --- TAB: GENERAL --- */}
        <TabsContent value="general" className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-4">
          {/* Información básica: bloque dos columnas (referencia) */}
          <ProfileSectionCard
```

And the closing tag of the entire General tab block (just before `{/* --- TAB: CLINICAL --- */}`):
```tsx
        </TabsContent>

        {/* --- TAB: CLINICAL --- */}
```

Replace everything between `<TabsContent value="general"...>` and `</TabsContent>` (exclusive of those outer tags) with the following. This preserves the `<Form>` wrapping the generalForm but restructures the interior:

```tsx
        {/* --- TAB: GENERAL --- */}
        <TabsContent value="general" className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-4">
          {/* Hero Card */}
          {pageProfile && (
            <HeroCard
              profile={pageProfile}
              professional={pageProfessional ?? {}}
              specialties={specialties}
              avatarUrl={avatarUrl}
              onPhotoClick={() => {
                const btn = document.querySelector("[data-avatar-uploader-trigger]") as HTMLButtonElement
                btn?.click()
              }}
              onRatingClick={() => setShowReviews((v) => !v)}
              onTabSwitch={setActiveTab}
            />
          )}

          {/* Reviews Panel (shown when clicking Valoración) */}
          {showReviews && user && (
            <ReviewsPanel
              professionalId={user.id}
              onClose={() => setShowReviews(false)}
            />
          )}

          {/* Hidden photo uploader (keeps existing ProfilePhotoUpload logic) */}
          <div className="hidden">
            <ProfilePhotoUpload
              currentUrl={avatarUrl || profile?.avatar_url || undefined}
              onUpload={handleProfilePhotoUpload}
            />
          </div>

          <Form {...generalForm}>
            <form onSubmit={generalForm.handleSubmit(onSaveGeneral)} className="space-y-3">

              {/* Accordion: Datos personales */}
              <AccordionSection
                title="Datos personales"
                subtitle="Nombre, género y teléfono"
                icon={<User className="h-4 w-4" />}
                iconVariant="teal"
                preview={`${generalForm.watch("first_name") ?? profileName?.first_name ?? ""} ${generalForm.watch("last_name") ?? profileName?.last_name ?? ""} · ${generalForm.watch("gender") === "M" ? "Hombre" : generalForm.watch("gender") === "F" ? "Mujer" : "Sin especificar"}`}
              >
                <PersonalDataFields
                  generalForm={generalForm}
                  profileName={profileName}
                  onSaveGeneral={onSaveGeneral}
                  saving={saving}
                />
              </AccordionSection>

              {/* Accordion: Trayectoria profesional */}
              <AccordionSection
                title="Trayectoria profesional"
                subtitle="Título, especialidad y experiencia"
                icon={<GraduationCapIcon className="h-4 w-4" />}
                iconVariant="blue"
                preview={[
                  pageProfile?.professional_title,
                  specialties.find(s => s.id === generalForm.watch("specialty_id"))?.name_es,
                  generalForm.watch("years_experience") != null ? `${generalForm.watch("years_experience")} años` : null
                ].filter(Boolean).join(" · ")}
              >
                <ProfessionalTrajectoryFields
                  generalForm={generalForm}
                  specialties={specialties}
                  PROFESSIONAL_TITLES={PROFESSIONAL_TITLES}
                  customTitle={customTitle}
                  setCustomTitle={setCustomTitle}
                  onSaveGeneral={onSaveGeneral}
                  saving={saving}
                />
              </AccordionSection>

              {/* Accordion: Condiciones que tratas (read-only, links to Clínica) */}
              <AccordionSection
                title="Condiciones que tratas"
                subtitle="Enfermedades y trastornos que atiendes"
                icon={<FlaskConical className="h-4 w-4" />}
                iconVariant="violet"
                preview={
                  clinicalForm.watch("conditions_treated")?.slice(0, 3).join(", ") || "Sin condiciones"
                }
              >
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {clinicalForm.watch("conditions_treated")?.length
                      ? clinicalForm.watch("conditions_treated").map((tag: string) => (
                          <span
                            key={tag}
                            className="text-xs font-semibold text-teal-700 bg-teal-50 border border-teal-100 rounded-full px-3 py-0.5"
                          >
                            {tag}
                          </span>
                        ))
                      : (
                          <span className="text-sm text-slate-400 italic">Sin condiciones configuradas.</span>
                        )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab("clinical")}
                    className="text-sm font-medium text-teal-600 hover:underline"
                  >
                    Ir a Clínica para editar →
                  </button>
                </div>
              </AccordionSection>

              {/* Accordion: Biografía profesional */}
              <BioAccordion
                generalForm={generalForm}
                onSaveGeneral={onSaveGeneral}
                saving={saving}
              />

            </form>
          </Form>
        </TabsContent>
```

**Note for implementer:** The `PersonalDataFields`, `ProfessionalTrajectoryFields`, and `BioAccordion` are small helper components defined IN THE SAME FILE (page.tsx) just above the `ProfessionalProfilePage` function, to avoid prop-drilling the entire form. See Step 7 below. In `PersonalDataFields`, `first_name` and `last_name` are shown as read-only (no pencil icon) because they are not in `generalForm` — editing them would require a separate profiles table update not covered in this task.

### 5c — Add inline helper components

- [ ] **Step 7: Add inline helper components before `export default function ProfessionalProfilePage()`**

Find (line 128):
```tsx
export default function ProfessionalProfilePage() {
```

Insert the following block BEFORE that line:

```tsx
// ─── Inline accordion content helpers (defined in same file to access form context easily) ───

function PersonalDataFields({ generalForm, profileName, onSaveGeneral, saving }: any) {
  // NOTE: first_name and last_name live in profiles table, NOT in generalForm.
  // They are shown as read-only (no pencil). Only gender, phone, show_phone are editable via generalForm.
  const [editingField, setEditingField] = useState<string | null>(null)
  const [tempValue, setTempValue] = useState("")

  function startEdit(field: string, current: string) {
    setEditingField(field)
    setTempValue(current)
  }
  function cancelEdit() { setEditingField(null); setTempValue("") }
  async function saveField(field: string) {
    generalForm.setValue(field, tempValue, { shouldDirty: true })
    await generalForm.handleSubmit(onSaveGeneral)()
    setEditingField(null)
  }

  return (
    <div className="space-y-1">
      {/* Nombre and Apellidos: read-only (not in generalForm, editing requires a separate profile update flow) */}
      <FieldRow
        label="Nombre"
        value={profileName?.first_name ?? ""}
      />
      <FieldRow
        label="Apellidos"
        value={profileName?.last_name ?? ""}
      />
      <FieldRow
        label="Género"
        value={generalForm.watch("gender") === "M" ? "Hombre" : generalForm.watch("gender") === "F" ? "Mujer" : generalForm.watch("gender") === "other" ? "Prefiero no especificar" : ""}
        editing={editingField === "gender"}
        editContent={
          <div className="flex items-center gap-2">
            <select
              className="flex-1 rounded-lg border border-teal-300 focus:border-teal-500 h-8 px-2 text-sm outline-none"
              value={tempValue}
              onChange={e => setTempValue(e.target.value)}
            >
              <option value="">Selecciona</option>
              <option value="M">Hombre</option>
              <option value="F">Mujer</option>
              <option value="other">Prefiero no especificar</option>
            </select>
            <button type="button" onClick={cancelEdit} className="text-xs text-slate-500 px-2 py-1 border rounded-lg hover:bg-slate-50">Cancelar</button>
            <button type="button" onClick={() => saveField("gender")} disabled={saving} className="text-xs font-semibold text-white bg-teal-600 px-2 py-1 rounded-lg hover:bg-teal-700 disabled:opacity-50">Guardar</button>
          </div>
        }
        onEdit={() => startEdit("gender", generalForm.getValues("gender") ?? "")}
      />
      <FieldRow
        label="Teléfono"
        value={generalForm.watch("phone") ?? ""}
        editing={editingField === "phone"}
        editContent={
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-500 shrink-0">+56</span>
            <input
              className="flex-1 rounded-lg border border-teal-300 focus:border-teal-500 h-8 px-2.5 text-sm outline-none"
              value={tempValue}
              onChange={e => setTempValue(e.target.value)}
              autoFocus
            />
            <button type="button" onClick={cancelEdit} className="text-xs text-slate-500 px-2 py-1 border rounded-lg hover:bg-slate-50">Cancelar</button>
            <button type="button" onClick={() => saveField("phone")} disabled={saving} className="text-xs font-semibold text-white bg-teal-600 px-2 py-1 rounded-lg hover:bg-teal-700 disabled:opacity-50">Guardar</button>
          </div>
        }
        onEdit={() => startEdit("phone", generalForm.getValues("phone") ?? "")}
      />
      <ToggleRow
        label="Mostrar teléfono en perfil público"
        description="Los pacientes podrán ver y llamarte directamente"
        checked={generalForm.watch("show_phone") ?? true}
        onCheckedChange={(v) => {
          generalForm.setValue("show_phone", v, { shouldDirty: true })
          generalForm.handleSubmit(onSaveGeneral)()
        }}
      />
    </div>
  )
}

function ProfessionalTrajectoryFields({ generalForm, specialties, PROFESSIONAL_TITLES, customTitle, setCustomTitle, onSaveGeneral, saving }: any) {
  const [editingField, setEditingField] = useState<string | null>(null)
  const [tempValue, setTempValue] = useState("")
  const [tempCustomTitle, setTempCustomTitle] = useState(false)

  function startEdit(field: string, current: string) {
    setEditingField(field)
    setTempValue(current)
  }
  function cancelEdit() { setEditingField(null); setTempValue("") }
  async function saveField(field: string, value?: string) {
    generalForm.setValue(field, value ?? tempValue, { shouldDirty: true })
    await generalForm.handleSubmit(onSaveGeneral)()
    setEditingField(null)
  }

  const specialtyName = specialties.find((s: any) => s.id === generalForm.watch("specialty_id"))?.name_es ?? ""

  return (
    <div className="space-y-1">
      {/* Professional title */}
      <FieldRow
        label="Título abreviado"
        value={
          generalForm.watch("professional_title")
            ? <span className="text-xs font-semibold text-teal-700 bg-teal-50 border border-teal-100 rounded-full px-3 py-0.5">{generalForm.watch("professional_title")}</span>
            : ""
        }
        editing={editingField === "professional_title"}
        editContent={
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
              {PROFESSIONAL_TITLES.map((t: any) => {
                const isSelected = t.value === "Otro"
                  ? tempCustomTitle
                  : tempValue === t.value && !tempCustomTitle
                return (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => {
                      if (t.value === "Otro") { setTempCustomTitle(true); setTempValue("") }
                      else { setTempCustomTitle(false); setTempValue(t.value) }
                    }}
                    className={cn(
                      "px-3 py-1 rounded-xl text-sm font-bold border transition-all",
                      isSelected ? "bg-teal-600 text-white border-teal-600" : "bg-slate-50 border-slate-200 text-slate-600 hover:border-teal-400"
                    )}
                  >
                    {t.label} <span className="text-[10px] font-normal ml-1 opacity-60">{t.desc}</span>
                  </button>
                )
              })}
            </div>
            {tempCustomTitle && (
              <input
                className="w-full rounded-lg border border-teal-300 h-8 px-2.5 text-sm outline-none"
                value={tempValue}
                onChange={e => setTempValue(e.target.value)}
                placeholder="Ej: Lic., Kine., etc."
                autoFocus
              />
            )}
            <div className="flex gap-2">
              <button type="button" onClick={cancelEdit} className="text-xs text-slate-500 px-2 py-1 border rounded-lg hover:bg-slate-50">Cancelar</button>
              <button type="button" onClick={() => { setCustomTitle(tempCustomTitle); saveField("professional_title") }} disabled={saving} className="text-xs font-semibold text-white bg-teal-600 px-2 py-1 rounded-lg hover:bg-teal-700 disabled:opacity-50">Guardar</button>
            </div>
          </div>
        }
        onEdit={() => { setTempCustomTitle(customTitle); startEdit("professional_title", generalForm.getValues("professional_title") ?? "") }}
      />
      {/* Specialty */}
      <FieldRow
        label="Especialidad"
        value={specialtyName}
        editing={editingField === "specialty_id"}
        editContent={
          <div className="flex items-center gap-2">
            <select
              className="flex-1 rounded-lg border border-teal-300 focus:border-teal-500 h-8 px-2 text-sm outline-none"
              value={tempValue}
              onChange={e => setTempValue(e.target.value)}
            >
              <option value="">Selecciona una especialidad</option>
              {specialties.map((s: any) => (
                <option key={s.id} value={s.id}>{s.name_es}</option>
              ))}
            </select>
            <button type="button" onClick={cancelEdit} className="text-xs text-slate-500 px-2 py-1 border rounded-lg hover:bg-slate-50">Cancelar</button>
            <button type="button" onClick={() => saveField("specialty_id")} disabled={saving} className="text-xs font-semibold text-white bg-teal-600 px-2 py-1 rounded-lg hover:bg-teal-700 disabled:opacity-50">Guardar</button>
          </div>
        }
        onEdit={() => startEdit("specialty_id", generalForm.getValues("specialty_id") ?? "")}
      />
      {/* Years experience */}
      <FieldRow
        label="Años de experiencia"
        value={generalForm.watch("years_experience") != null ? String(generalForm.watch("years_experience")) : ""}
        editing={editingField === "years_experience"}
        editContent={
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={0}
              className="w-24 rounded-lg border border-teal-300 focus:border-teal-500 h-8 px-2.5 text-sm outline-none"
              value={tempValue}
              onChange={e => setTempValue(e.target.value)}
              autoFocus
            />
            <button type="button" onClick={cancelEdit} className="text-xs text-slate-500 px-2 py-1 border rounded-lg hover:bg-slate-50">Cancelar</button>
            <button type="button" onClick={() => { generalForm.setValue("years_experience", parseInt(tempValue, 10), { shouldDirty: true }); generalForm.handleSubmit(onSaveGeneral)(); setEditingField(null) }} disabled={saving} className="text-xs font-semibold text-white bg-teal-600 px-2 py-1 rounded-lg hover:bg-teal-700 disabled:opacity-50">Guardar</button>
          </div>
        }
        onEdit={() => startEdit("years_experience", String(generalForm.getValues("years_experience") ?? ""))}
      />
      {/* Registration number */}
      <FieldRow
        label="Nº Registro"
        value={generalForm.watch("registration_number") ?? ""}
        editing={editingField === "registration_number"}
        editContent={
          <div className="flex items-center gap-2">
            <input
              className="flex-1 rounded-lg border border-teal-300 focus:border-teal-500 h-8 px-2.5 text-sm outline-none"
              value={tempValue}
              onChange={e => setTempValue(e.target.value)}
              autoFocus
            />
            <button type="button" onClick={cancelEdit} className="text-xs text-slate-500 px-2 py-1 border rounded-lg hover:bg-slate-50">Cancelar</button>
            <button type="button" onClick={() => saveField("registration_number")} disabled={saving} className="text-xs font-semibold text-white bg-teal-600 px-2 py-1 rounded-lg hover:bg-teal-700 disabled:opacity-50">Guardar</button>
          </div>
        }
        onEdit={() => startEdit("registration_number", generalForm.getValues("registration_number") ?? "")}
      />
      {/* Registration institution */}
      <FieldRow
        label="Institución emisora"
        value={generalForm.watch("registration_institution") ?? ""}
        editing={editingField === "registration_institution"}
        editContent={
          <div className="flex items-center gap-2">
            <input
              className="flex-1 rounded-lg border border-teal-300 focus:border-teal-500 h-8 px-2.5 text-sm outline-none"
              value={tempValue}
              onChange={e => setTempValue(e.target.value)}
              autoFocus
            />
            <button type="button" onClick={cancelEdit} className="text-xs text-slate-500 px-2 py-1 border rounded-lg hover:bg-slate-50">Cancelar</button>
            <button type="button" onClick={() => saveField("registration_institution")} disabled={saving} className="text-xs font-semibold text-white bg-teal-600 px-2 py-1 rounded-lg hover:bg-teal-700 disabled:opacity-50">Guardar</button>
          </div>
        }
        onEdit={() => startEdit("registration_institution", generalForm.getValues("registration_institution") ?? "")}
      />
    </div>
  )
}

function BioAccordion({ generalForm, onSaveGeneral, saving }: any) {
  const [editing, setEditing] = useState(false)

  const bioHtml: string = generalForm.watch("bio") ?? ""
  const plainText = bioHtml
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .replace(/&nbsp;/g, " ")
    .trim()
  const preview = plainText.length > 60 ? `${plainText.slice(0, 60)}...` : plainText

  return (
    <AccordionSection
      title="Biografía profesional"
      subtitle="Tu presentación para los pacientes"
      icon={<MessageSquare className="h-4 w-4" />}
      iconVariant="teal"
      preview={preview || "Sin biografía"}
      editButton={
        !editing ? (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setEditing(true) }}
            className="text-xs font-semibold text-teal-600 border border-teal-200 rounded-lg px-3 py-1 hover:bg-teal-50 transition-colors"
          >
            Editar
          </button>
        ) : null
      }
    >
      {editing ? (
        <div className="space-y-3">
          <TipTapEditor
            value={generalForm.watch("bio")}
            onChange={(v: string) => generalForm.setValue("bio", v, { shouldDirty: true })}
            placeholder="Describe tu enfoque, especialidad y lo que ofreces a tus pacientes..."
          />
          <div className="flex items-center gap-2 justify-end">
            <button
              type="button"
              onClick={() => { setEditing(false); generalForm.resetField("bio") }}
              className="text-xs text-slate-500 px-3 py-1.5 border rounded-lg hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={() => { generalForm.handleSubmit(onSaveGeneral)(); setEditing(false) }}
              className="text-xs font-semibold text-white bg-teal-600 px-3 py-1.5 rounded-lg hover:bg-teal-700 disabled:opacity-50"
            >
              {saving ? "Guardando..." : "Guardar biografía"}
            </button>
          </div>
        </div>
      ) : (
        <p className="text-sm text-slate-600 whitespace-pre-wrap">
          {plainText || <span className="italic text-slate-400">Sin biografía. Haz clic en Editar para añadir tu presentación.</span>}
        </p>
      )}
    </AccordionSection>
  )
}
```

**Note:** `first_name` and `last_name` are in `profiles` table, not `professionals`. The `generalForm` doesn't have these fields. The `PersonalDataFields` component reads them from `profileName` prop (display only) and would need separate Supabase calls to update. For this iteration, show them as read-only FieldRows without pencil (set `onEdit` to undefined). The editable fields in Datos personales are: `gender`, `phone`, `show_phone`.

Adjust `PersonalDataFields` accordingly — remove the `startEdit`/`saveField` logic for `first_name` and `last_name`, and pass `onEdit={undefined}` to those FieldRows.

- [ ] **Step 8: Check for TypeScript errors**

```bash
npx tsc --noEmit 2>&1 | head -40
```

Fix any type errors before proceeding. Common issues:
- Missing `cn` import in AccordionSection helpers → already imported via `@/lib/utils`
- `GraduationCapIcon` naming conflict → the import alias resolves this
- `FlaskConical` and `MessageSquare` must be in the lucide-react import block

- [ ] **Step 9: Test in browser**

With dev server running (`npm run dev`), navigate to `http://localhost:3000/dashboard/professional/profile`.

Verify:
- Header shows "Hola, [FirstName] 👋" and subtitle with last edit date
- Hero card renders with 4 stats and live dots
- Clicking "Valoración ★" shows/hides ReviewsPanel
- Clicking "Modalidad" navigates to Clínica tab
- Clicking "Por sesión" navigates to Precios tab
- Accordions expand/collapse independently
- Per-field pencil → inline edit → save → form submits
- Bio accordion "Editar" button opens TipTapEditor

- [ ] **Step 10: Commit**

```bash
git add app/dashboard/(main)/professional/profile/page.tsx
git commit -m "feat: redesign General tab with hero card, live stats, and accordions"
```

---

## Final Verification

- [ ] Run TypeScript check: `npx tsc --noEmit` — zero errors
- [ ] Dev server boots without errors: `npm run dev`
- [ ] All 6 tabs still work (General, Clínica, Estudios, Galería, Precios, Seguridad, Verificación)
- [ ] No regressions in save handlers (toast success on each accordion save)

---

## Notes for implementer

1. **`first_name`/`last_name` are not in `generalForm`** — they live in `profiles` table, not `professionals`. The code in `PersonalDataFields` already shows them as read-only FieldRows (no `onEdit` prop). Only `gender`, `phone`, `show_phone` are editable via `generalForm`.

2. **`pageProfile` select query** — currently fetches `"first_name, last_name, gender, professional_title, show_phone"`. Expand it to `"id, first_name, last_name, gender, professional_title, show_phone, is_verified, updated_at"` in the `loadProfile` useEffect (line ~211) so HeroCard receives the verified badge and last-edit date. Also add `id: user.id` to `setPageProfile(profileData)` since the query won't return `id` unless selected — or simply set `setPageProfile({ ...profileData, id: user.id })`.

3. **`.maybeSingle()` vs `.single()` for booking_settings** — The plan intentionally uses `.maybeSingle()` (safer, returns `null` if no row) rather than the spec's `.single()` (throws on 0 rows). This prevents a runtime error for professionals who haven't configured booking settings yet.

3. **`ProfilePhotoUpload` hidden trick** — the existing ProfilePhotoUpload component is placed in a `hidden` div so its internal ref/button still works when triggered via `data-avatar-uploader-trigger`. Verify this attribute exists in `profile-photo-upload.tsx`.

4. **`cn` in helper components** — these are defined in the same file as the page, which already imports `cn`. No extra import needed.

5. **`ToggleRow` import** — `ToggleRow` is exported from `accordion-section.tsx` and imported in the page's import line above.
