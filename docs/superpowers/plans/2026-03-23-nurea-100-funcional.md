# Nurea 100% Funcional Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Gate the professional dashboard behind KYP verification + active subscription, and filter explore results to only show fully-activated professionals.

**Architecture:** (1) Extend the existing `ProfessionalLayout` to also fetch `verification_status` from `professionals` and render a contextual banner. (2) Add a SQL migration that adds `slug` + subscription filter to `search_professionals` RPC and update the fallback query in `/api/explore/route.ts`. The existing `SubscriptionPaywall` component is kept intact — the new banner complements it.

**Tech Stack:** Next.js App Router, TypeScript, Supabase (PostgreSQL + PostgREST), Tailwind CSS, shadcn/ui, Framer Motion

**Spec:** `docs/superpowers/specs/2026-03-23-nurea-100-funcional-design.md`

---

## File Map

| File | Action | Purpose |
|------|--------|---------|
| `app/dashboard/(main)/professional/layout.tsx` | Modify | Add verification_status fetch + banner render |
| `components/professional/access-banner.tsx` | Create | Contextual banner component |
| `supabase/migrations/20260323_fix_search_professionals_slug_and_subscription.sql` | Create | Add slug + subscription filter to RPC |
| `app/api/explore/route.ts` | Modify | Add subscription filter to fallbackSearch() |

---

## Task 1: Fix Build (Stale Cache)

**Files:**
- No source files changed — only `.next/` cache cleared

- [ ] **Step 1: Clear stale Next.js build cache and rebuild**

```bash
cd "/Volumes/SSD PAU /GitHub/Nurea-App-1"
rm -rf .next
npm run build 2>&1 | tail -20
```

Expected: Build completes with `✓ Compiled successfully` or `Route (app) ...` table. No TypeScript errors in source files.

- [ ] **Step 2: Run lint and verify no error-level violations**

```bash
npm run lint 2>&1 | grep -E "^.*error.*$" | head -20
echo "Exit code: $?"
```

Expected: No lines containing ` error ` at level `error`. Warnings are acceptable.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "chore: clear stale .next build cache — no source changes"
```

---

## Task 2: Create ProfessionalAccessBanner Component

**Files:**
- Create: `components/professional/access-banner.tsx`

This component shows a non-intrusive banner at the top of the professional dashboard explaining what's blocking full access. It does NOT block navigation — the existing `SubscriptionPaywall` already handles blocking chat/patients.

- [ ] **Step 1: Create the component file**

Create `components/professional/access-banner.tsx`:

```tsx
"use client"

import { AlertCircle, Clock, XCircle, CreditCard, CheckCircle2 } from "lucide-react"
import { motion } from "framer-motion"
import Link from "next/link"
import { cn } from "@/lib/utils"

type VerificationStatus = "pending" | "under_review" | "verified" | "rejected"
type SubscriptionStatus = "inactive" | "active" | "past_due" | "canceled" | "trialing" | "unpaid" | "pending_approval"

interface ProfessionalAccessBannerProps {
  verificationStatus: VerificationStatus
  subscriptionStatus: SubscriptionStatus | null
  rejectionReason?: string | null
}

interface BannerConfig {
  icon: typeof AlertCircle
  message: string
  subMessage?: string
  cta?: { label: string; href: string }
  variant: "warning" | "error" | "info"
}

function getBannerConfig(
  verificationStatus: VerificationStatus,
  subscriptionStatus: SubscriptionStatus | null,
  rejectionReason?: string | null
): BannerConfig | null {
  const isVerified = verificationStatus === "verified"
  const isSubscriptionActive = subscriptionStatus === "active"

  // Full access — no banner
  if (isVerified && isSubscriptionActive) return null

  // Rejected credentials — show always regardless of subscription
  if (verificationStatus === "rejected") {
    return {
      icon: XCircle,
      message: "Tus credenciales fueron rechazadas.",
      subMessage: rejectionReason
        ? `Motivo: ${rejectionReason}. Edita tu perfil para corregir la información y reenviar.`
        : "Edita tu perfil para corregir la información y reenviar documentación.",
      cta: { label: "Editar perfil", href: "/dashboard/professional/profile" },
      variant: "error",
    }
  }

  // Verified but subscription not active
  if (isVerified && !isSubscriptionActive) {
    if (subscriptionStatus === "pending_approval") {
      return {
        icon: Clock,
        message: "Tu suscripción está pendiente de aprobación del equipo.",
        subMessage: "Recibirás un correo cuando sea activada.",
        variant: "info",
      }
    }
    return {
      icon: CreditCard,
      message: "Tu suscripción no está activa.",
      subMessage: "Activa tu suscripción para aparecer en búsquedas y recibir pacientes.",
      cta: { label: "Activar →", href: "/pricing" },
      variant: "warning",
    }
  }

  // Credentials pending/under review + active subscription
  if (!isVerified && isSubscriptionActive) {
    return {
      icon: Clock,
      message: "Tus credenciales están en revisión.",
      subMessage: "Serás notificado por email cuando sean verificadas.",
      variant: "info",
    }
  }

  // Neither verified nor active subscription
  return {
    icon: AlertCircle,
    message: "Cuenta pendiente de activación.",
    subMessage: "Completa la verificación de credenciales y activa tu suscripción para operar.",
    variant: "warning",
  }
}

const variantStyles: Record<BannerConfig["variant"], string> = {
  warning: "bg-amber-50 border-amber-200 text-amber-900 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-200",
  error: "bg-red-50 border-red-200 text-red-900 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200",
  info: "bg-blue-50 border-blue-200 text-blue-900 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-200",
}

const iconStyles: Record<BannerConfig["variant"], string> = {
  warning: "text-amber-500",
  error: "text-red-500",
  info: "text-blue-500",
}

const ctaStyles: Record<BannerConfig["variant"], string> = {
  warning: "text-amber-700 underline hover:text-amber-900 dark:text-amber-300",
  error: "text-red-700 underline hover:text-red-900 dark:text-red-300",
  info: "text-blue-700 underline hover:text-blue-900 dark:text-blue-300",
}

export function ProfessionalAccessBanner({
  verificationStatus,
  subscriptionStatus,
  rejectionReason,
}: ProfessionalAccessBannerProps) {
  const config = getBannerConfig(verificationStatus, subscriptionStatus, rejectionReason)

  if (!config) return null

  const Icon = config.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={cn(
        "flex items-start gap-3 rounded-xl border px-4 py-3 mb-4 text-sm",
        variantStyles[config.variant]
      )}
      role="alert"
    >
      <Icon className={cn("h-4 w-4 mt-0.5 shrink-0", iconStyles[config.variant])} aria-hidden="true" />
      <div className="flex-1 min-w-0">
        <span className="font-semibold">{config.message}</span>
        {config.subMessage && (
          <span className="ml-1 opacity-80">{config.subMessage}</span>
        )}
        {config.cta && (
          <Link
            href={config.cta.href}
            className={cn("ml-2 font-semibold text-xs", ctaStyles[config.variant])}
          >
            {config.cta.label}
          </Link>
        )}
      </div>
    </motion.div>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles (no import errors)**

```bash
cd "/Volumes/SSD PAU /GitHub/Nurea-App-1"
npx tsc --noEmit 2>&1 | grep "access-banner" | head -10
```

Expected: No output (no errors for this file).

- [ ] **Step 3: Commit**

```bash
git add components/professional/access-banner.tsx
git commit -m "feat: add ProfessionalAccessBanner component for KYP/subscription state"
```

---

## Task 3: Extend ProfessionalLayout to Check Verification Status

**Files:**
- Modify: `app/dashboard/(main)/professional/layout.tsx`

The existing layout already fetches `profiles.subscription_status`. We extend it to also fetch `professionals.verification_status` and `professionals.verification_notes`, then render the banner.

- [ ] **Step 1: Update the ProfileInfo interface and state in the layout**

In `app/dashboard/(main)/professional/layout.tsx`, find the `ProfileInfo` interface (lines 23-29) and the `loadProfile` function. Make the following changes:

**Change 1 — extend ProfileInfo interface** (replace the existing interface):

```tsx
interface ProfileInfo {
  subscription_status: string | null
  stripe_subscription_id: string | null
  trial_end_date: string | null
  selected_plan_id: string | null
  is_onboarded: boolean | null
  verification_status: "pending" | "under_review" | "verified" | "rejected" | null
  verification_notes: string | null
}
```

**Change 2 — add import for ProfessionalAccessBanner** (at top of file, after other imports):

```tsx
import { ProfessionalAccessBanner } from "@/components/professional/access-banner"
```

**Change 3 — update default error state** in the `if (error)` branch of `loadProfile` (replace the `setProfileInfo` call in error handler):

```tsx
setProfileInfo({
  subscription_status: "inactive",
  stripe_subscription_id: null,
  trial_end_date: null,
  selected_plan_id: null,
  is_onboarded: false,
  verification_status: null,
  verification_notes: null,
})
```

Also update the catch block's `setProfileInfo`:

```tsx
setProfileInfo({
  subscription_status: "inactive",
  stripe_subscription_id: null,
  trial_end_date: null,
  selected_plan_id: null,
  is_onboarded: false,
  verification_status: null,
  verification_notes: null,
})
```

- [ ] **Step 2: Add the verification fetch inside loadProfile**

After the existing `supabase.from("profiles").select(...)` call succeeds and `setProfileInfo` is called (around line 79-83), add a second fetch for the professionals table:

```tsx
// Fetch verification status from professionals table
const { data: profData } = await supabase
  .from("professionals")
  .select("verification_status, verification_notes")
  .eq("id", user.id)
  .maybeSingle()

setProfileInfo(prev => prev ? {
  ...prev,
  verification_status: (profData?.verification_status as ProfileInfo["verification_status"]) ?? null,
  verification_notes: profData?.verification_notes ?? null,
} : null)
```

Place this immediately after the existing `setProfileInfo({ ...data, ... })` call (around line 83, before the `// AUTO-REDIRECT TO CHECKOUT` comment block).

- [ ] **Step 3: Render the banner above children**

Replace the current `return <>{children}</>` at the bottom of the component (line 179) with:

```tsx
return (
  <div className="w-full">
    {profileInfo && (
      <div className="px-0">
        <ProfessionalAccessBanner
          verificationStatus={(profileInfo.verification_status as any) ?? "pending"}
          subscriptionStatus={(profileInfo.subscription_status as any)}
          rejectionReason={profileInfo.verification_notes}
        />
      </div>
    )}
    {children}
  </div>
)
```

- [ ] **Step 4: Verify TypeScript compiles**

```bash
cd "/Volumes/SSD PAU /GitHub/Nurea-App-1"
npx tsc --noEmit 2>&1 | grep "layout\|access-banner" | head -20
```

Expected: No errors.

- [ ] **Step 5: Commit**

```bash
git add app/dashboard/(main)/professional/layout.tsx
git commit -m "feat: add KYP verification banner to professional dashboard layout"
```

---

## Task 4: SQL Migration — Add slug + Subscription Filter to search_professionals

**Files:**
- Create: `supabase/migrations/20260323_fix_search_professionals_slug_and_subscription.sql`
- Modify: `app/api/explore/route.ts` (fallbackSearch function, lines ~226-327)

This migration does two things to `search_professionals`:
1. Adds `slug TEXT` to the RETURNS TABLE and SELECT (bug fix — it was missing, causing `undefined` slugs in explore results)
2. Adds `pf.subscription_status = 'active'` filter to both the COUNT sub-query and RETURN QUERY blocks

- [ ] **Step 1: Create the SQL migration file**

Create `supabase/migrations/20260323_fix_search_professionals_slug_and_subscription.sql`:

```sql
-- =============================================================================
-- NUREA: Fix search_professionals — add slug to output + subscription filter
--
-- Changes:
--   1. Adds `slug TEXT` to RETURNS TABLE and SELECT (was missing, broke profile links)
--   2. Adds `pf.subscription_status = 'active'` filter to COUNT and RETURN QUERY
--      so unsubscribed professionals are never shown in /explore
-- =============================================================================

CREATE OR REPLACE FUNCTION public.search_professionals(
  p_lang TEXT DEFAULT 'es',
  p_specialty_slug TEXT DEFAULT NULL,
  p_category_slug TEXT DEFAULT NULL,
  p_consultation_type TEXT DEFAULT NULL,
  p_available_today BOOLEAN DEFAULT false,
  p_price_min NUMERIC DEFAULT NULL,
  p_price_max NUMERIC DEFAULT NULL,
  p_verified_only BOOLEAN DEFAULT false,
  p_language TEXT DEFAULT NULL,
  p_location TEXT DEFAULT NULL,
  p_search TEXT DEFAULT NULL,
  p_sort_by TEXT DEFAULT 'rating',
  p_page INTEGER DEFAULT 1,
  p_limit INTEGER DEFAULT 12
)
RETURNS TABLE (
  id UUID,
  slug TEXT,
  first_name TEXT,
  last_name TEXT,
  avatar_url TEXT,
  specialty_name TEXT,
  specialty_slug TEXT,
  specialty_icon TEXT,
  category_name TEXT,
  category_slug TEXT,
  bio TEXT,
  university TEXT,
  location TEXT,
  consultation_type TEXT,
  consultation_price NUMERIC,
  online_price NUMERIC,
  in_person_price NUMERIC,
  rating NUMERIC,
  review_count INTEGER,
  verified BOOLEAN,
  years_experience INTEGER,
  languages TEXT[],
  availability JSONB,
  total_count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_offset INTEGER;
  v_total BIGINT;
BEGIN
  v_offset := (p_page - 1) * p_limit;

  -- COUNT (includes subscription filter so total_count is accurate)
  SELECT COUNT(DISTINCT pr.id) INTO v_total
  FROM public.professionals pr
  JOIN public.profiles pf ON pf.id = pr.id
  LEFT JOIN public.specialties s ON s.id = pr.specialty_id
  LEFT JOIN public.categories c ON c.id = s.category_id
  WHERE
    pf.subscription_status = 'active'
    AND (NOT p_verified_only OR pr.verified = true)
    AND (p_specialty_slug IS NULL OR s.slug = p_specialty_slug)
    AND (p_category_slug IS NULL OR c.slug = p_category_slug)
    AND (
      p_consultation_type IS NULL
      OR p_consultation_type = 'all'
      OR pr.consultation_type = p_consultation_type
      OR pr.consultation_type = 'both'
    )
    AND (p_price_min IS NULL OR pr.consultation_price >= p_price_min)
    AND (p_price_max IS NULL OR pr.consultation_price <= p_price_max)
    AND (p_language IS NULL OR p_language = ANY(pr.languages))
    AND (p_location IS NULL OR pr.location ILIKE '%' || p_location || '%')
    AND (
      p_search IS NULL
      OR pf.first_name ILIKE '%' || p_search || '%'
      OR pf.last_name ILIKE '%' || p_search || '%'
      OR pr.specialty ILIKE '%' || p_search || '%'
      OR s.name_es ILIKE '%' || p_search || '%'
      OR s.name_en ILIKE '%' || p_search || '%'
    );

  -- RETURN QUERY (same filters as COUNT above)
  RETURN QUERY
  SELECT
    pr.id,
    pr.slug,
    pf.first_name,
    pf.last_name,
    pf.avatar_url,
    CASE WHEN p_lang = 'en' THEN s.name_en ELSE s.name_es END AS specialty_name,
    s.slug AS specialty_slug,
    s.icon AS specialty_icon,
    CASE WHEN p_lang = 'en' THEN c.name_en ELSE c.name_es END AS category_name,
    c.slug AS category_slug,
    pr.bio,
    pr.university,
    pr.location,
    pr.consultation_type,
    pr.consultation_price,
    pr.online_price,
    pr.in_person_price,
    pr.average_rating AS rating,
    pr.review_count,
    pr.verified,
    pr.years_experience,
    pr.languages,
    pr.availability,
    v_total AS total_count
  FROM public.professionals pr
  JOIN public.profiles pf ON pf.id = pr.id
  LEFT JOIN public.specialties s ON s.id = pr.specialty_id
  LEFT JOIN public.categories c ON c.id = s.category_id
  WHERE
    pf.subscription_status = 'active'
    AND (NOT p_verified_only OR pr.verified = true)
    AND (p_specialty_slug IS NULL OR s.slug = p_specialty_slug)
    AND (p_category_slug IS NULL OR c.slug = p_category_slug)
    AND (
      p_consultation_type IS NULL
      OR p_consultation_type = 'all'
      OR pr.consultation_type = p_consultation_type
      OR pr.consultation_type = 'both'
    )
    AND (p_price_min IS NULL OR pr.consultation_price >= p_price_min)
    AND (p_price_max IS NULL OR pr.consultation_price <= p_price_max)
    AND (p_language IS NULL OR p_language = ANY(pr.languages))
    AND (p_location IS NULL OR pr.location ILIKE '%' || p_location || '%')
    AND (
      p_search IS NULL
      OR pf.first_name ILIKE '%' || p_search || '%'
      OR pf.last_name ILIKE '%' || p_search || '%'
      OR pr.specialty ILIKE '%' || p_search || '%'
      OR s.name_es ILIKE '%' || p_search || '%'
      OR s.name_en ILIKE '%' || p_search || '%'
    )
  ORDER BY
    CASE WHEN p_sort_by = 'rating' THEN pr.average_rating END DESC NULLS LAST,
    CASE WHEN p_sort_by = 'price_asc' THEN pr.consultation_price END ASC NULLS LAST,
    CASE WHEN p_sort_by = 'price_desc' THEN pr.consultation_price END DESC NULLS LAST,
    CASE WHEN p_sort_by = 'experience' THEN pr.years_experience END DESC NULLS LAST,
    CASE WHEN p_sort_by = 'reviews' THEN pr.review_count END DESC NULLS LAST,
    pr.average_rating DESC NULLS LAST
  LIMIT p_limit
  OFFSET v_offset;
END;
$$;
```

- [ ] **Step 2: Apply migration to Supabase**

Run the migration in the Supabase SQL Editor (copy-paste the file contents) or via CLI:

```bash
# If using Supabase CLI:
supabase db push
# OR manually paste the SQL into Supabase Dashboard > SQL Editor > Run
```

Verify the function was updated:
```sql
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_name = 'search_professionals';
```

Expected: `search_professionals | FUNCTION`

Also verify `slug` is now in the return type:
```sql
SELECT column_name FROM information_schema.columns
WHERE table_name = 'search_professionals' LIMIT 5;
-- Or just run a test call:
SELECT id, slug FROM search_professionals(p_verified_only := true) LIMIT 3;
```

- [ ] **Step 3: Update fallbackSearch() in the explore route**

In `app/api/explore/route.ts`, find the `fallbackSearch` function. In the `.select(...)` block (around line 248), the `profiles!inner` already joins profiles. Add `subscription_status` to the profile select and add a filter after the `verifiedOnly` check.

**Change the profiles!inner select** (find this block):
```tsx
      profiles!inner (
        first_name,
        last_name,
        role,
        avatar_url
      ),
```
Replace with:
```tsx
      profiles!inner (
        first_name,
        last_name,
        role,
        avatar_url,
        subscription_status
      ),
```

**Add subscription filter** after the `verifiedOnly` block (around line 273):
```tsx
  // Solo profesionales con suscripción activa
  query = query.eq('profiles.subscription_status', 'active')
```

Place this line immediately after:
```tsx
  if (verifiedOnly) {
    query = query.eq('verified', true)
  }
```

- [ ] **Step 4: Verify TypeScript compiles**

```bash
cd "/Volumes/SSD PAU /GitHub/Nurea-App-1"
npx tsc --noEmit 2>&1 | grep "explore" | head -10
```

Expected: No errors.

- [ ] **Step 5: Commit**

```bash
git add \
  supabase/migrations/20260323_fix_search_professionals_slug_and_subscription.sql \
  app/api/explore/route.ts
git commit -m "feat: filter explore results by active subscription + add slug to RPC"
```

---

## Task 5: Final Validation

- [ ] **Step 1: Full build**

```bash
cd "/Volumes/SSD PAU /GitHub/Nurea-App-1"
npm run build 2>&1 | tail -30
```

Expected: No TypeScript errors, build succeeds.

- [ ] **Step 2: Lint**

```bash
npm run lint 2>&1 | grep " error " | head -20
echo "Lint exit: $?"
```

Expected: No error-level lint issues.

- [ ] **Step 3: Manual smoke test checklist**

Log in as a professional with `verification_status = 'pending'` (or any non-verified state):
- [ ] Banner appears at top of professional dashboard
- [ ] Can still navigate to profile page and edit it
- [ ] Cannot see agenda/citas/patients (covered by existing SubscriptionPaywall if no subscription)

Log in as a professional with `verification_status = 'rejected'`:
- [ ] Banner shows rejection reason from `verification_notes`
- [ ] Link to profile page works

Log in as a professional with `verified = true` + `subscription_status = 'active'`:
- [ ] No banner visible
- [ ] Full dashboard access

Check `/explore`:
- [ ] Only shows professionals where `verified = true` AND `subscription_status = 'active'`

- [ ] **Step 4: Final commit (if any cleanup needed)**

```bash
git add -A
git commit -m "chore: final validation pass — Nurea professional gate complete"
```

---

## Summary of Changes

| What | Where | Effect |
|------|-------|--------|
| New banner component | `components/professional/access-banner.tsx` | Contextual status banners by KYP + subscription state |
| Extended professional layout | `app/dashboard/(main)/professional/layout.tsx` | Fetches verification_status, renders banner |
| SQL migration | `supabase/migrations/20260323_...sql` | RPC now returns `slug`, only shows active-subscribed professionals |
| Explore fallback filter | `app/api/explore/route.ts` | Fallback query matches RPC: subscription_status = 'active' required |
