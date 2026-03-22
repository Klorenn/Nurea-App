# Spec: Professional Profile Page Redesign v2

**Date:** 2026-03-22
**Route:** `/dashboard/professional/profile`
**File:** `app/dashboard/(main)/professional/profile/page.tsx`

---

## Problem

The current profile page duplicates information: a read-only `ProfileSectionCard` preview and a form card below it show the same data. The layout uses oversized cards with excessive padding and no hierarchy. Professionals have no quick way to see live stats or respond to patient reviews.

---

## Goal

Redesign the **General tab** of the professional profile page to:
1. Eliminate duplicated preview + form pattern
2. Introduce a hero card with live stats
3. Replace form cards with collapsible accordion sections
4. Allow professionals to respond to patient reviews inline
5. Make the page header personal with a greeting

All other tabs (Clínica, Estudios, Galería, Precios, Seguridad, Verificación) keep their current structure for now.

---

## Page Header

**Before:** `<h1>María Jesús Chavez San Luis</h1>` (full name, static)

**After:**
```tsx
<h1>Hola, {firstName} 👋</h1>
<p>Tu perfil profesional · Última edición {relativeDate}</p>
```

- `firstName` = `profile.first_name` (first word only if multi-word)
- `relativeDate` = relative format of `profile.updated_at` (e.g. "hace 2 días") using `formatDistanceToNow` from `date-fns`
- Buttons unchanged: "Ver perfil público", "Editar direcciones"

---

## General Tab — New Structure

Remove all `ProfileSectionCard` preview components from the General tab. Replace the entire tab content with:

```
1. HeroCard
2. ReviewsPanel (hidden by default, shown when clicking Valoración stat)
3. Accordion: Datos personales
4. Accordion: Trayectoria profesional
5. Accordion: Condiciones (read-only, links to Clínica tab)
6. Accordion: Biografía profesional
```

The existing `<Form>` + `generalForm` (react-hook-form) + all save handlers remain intact. Only the UI layout changes around them.

---

## DB Dependencies

### Already-pending migrations (must be applied before implementation):
- `supabase/migrations/20260321_add_professional_title_to_profiles.sql` — adds `profiles.professional_title TEXT`
- `supabase/migrations/20260321_add_show_phone_to_profiles.sql` — adds `profiles.show_phone BOOLEAN DEFAULT true`

### New migration required for reviews reply feature:
```sql
-- supabase/migrations/20260322_add_review_reply_to_reviews.sql
ALTER TABLE public.reviews
  ADD COLUMN IF NOT EXISTS reply_text TEXT,
  ADD COLUMN IF NOT EXISTS replied_at TIMESTAMPTZ;

-- RLS: allow the professional to update reply_text/replied_at on their own reviews
-- Uses doctor_id (canonical since migration 20260315 renamed professional_id → doctor_id)
CREATE POLICY "professionals_can_reply_own_reviews"
  ON public.reviews
  FOR UPDATE
  USING (auth.uid() = doctor_id)
  WITH CHECK (auth.uid() = doctor_id);
```

A review is considered **unanswered** when `replied_at IS NULL`.

---

## Component: HeroCard

File: `components/professional/hero-card.tsx`

A white card at the top of the General tab.

### Props
```ts
interface HeroCardProps {
  profile: PageProfile         // profiles row fetched in page.tsx line ~211
  professional: PageProfessional // professionals row fetched in page.tsx line ~212
  specialties: { id: string; name_es: string }[]  // already fetched in page.tsx
  avatarUrl: string | null
  onPhotoClick: () => void
  onRatingClick: () => void
  onTabSwitch: (tab: string) => void  // call with "clinical" or "pricing"
}
```

**Do NOT use `useProfile` hook** — it only fetches `id, role, first_name, last_name, avatar_url, email_verified, onboarding_completed, status, last_seen, response_time`. Instead, receive the richer `profile` and `professional` objects already available in `page.tsx` local state as props.

### Tab switching mechanism

The `<Tabs>` component in `page.tsx` currently uses `defaultValue={initialTab}` (uncontrolled). Convert it to **controlled** by lifting state:

```tsx
// In page.tsx
const [activeTab, setActiveTab] = useState(initialTab)

<Tabs value={activeTab} onValueChange={setActiveTab}>
```

Pass `onTabSwitch={setActiveTab}` down to `HeroCard` and `AccordionSection` (Condiciones). When the user clicks "Modalidad" stat, call `onTabSwitch("clinical")`; for price call `onTabSwitch("pricing")`; for Condiciones link call `onTabSwitch("clinical")`.

### Top section (avatar + name + actions)

```
[Avatar 72px] [Name + chip + verified badge]    [Cambiar foto btn]
```

- Avatar: 72px circular, shows `profile.avatar_url`; fallback = initials from `first_name[0] + last_name[0]`
- Small pencil icon overlaid bottom-right on avatar → calls `onPhotoClick`
- **Name:** `profile.first_name + " " + profile.last_name` (no `display_name` column — concatenate)
- **Chip:** `profile.professional_title + " · " + profile.specialty` as teal pill. `professional_title` comes from `profiles.professional_title` (pending migration above)
- **Verified badge:** shown if `profile.is_verified === true`
- "Cambiar foto" button → calls `onPhotoClick`

### Stats bar (4 live stats)

Separated by a `border-top: 1px solid #f1f5f9`. Each stat has a green pulsing dot (live indicator, CSS animation only — not a websocket). Stats are fetched on mount via Supabase queries.

| Stat | Data source | Click behavior |
|---|---|---|
| Pacientes | `appointments` table, count of rows where `professional_id = userId AND patient_id IS NOT NULL`: `supabase.from('appointments').select('id', { count: 'exact', head: true }).eq('professional_id', userId).not('patient_id', 'is', null)` | None |
| Valoración ★ | `reviews` table, `AVG(rating)` computed client-side from fetched rows | Calls `onRatingClick` |
| Modalidad | `booking_settings` table, `modality` column, `.eq('professional_id', userId).single()` | Calls `onTabSwitch("clinical")` |
| Por sesión | `consultation_types` table, minimum `price` where `professional_id = userId` | Calls `onTabSwitch("pricing")` |

**Unanswered reviews count:** `reviews.filter(r => r.replied_at === null).length`

Secondary text per stat:
- Pacientes: "+N este mes" (count where `created_at > start of current month`)
- Valoración: "Ver comentarios →" if unanswered > 0, else "Ver valoraciones →"
- Modalidad: "Cambiar en Clínica →"
- Por sesión: "Cambiar en Precios →"

Stats show a loading skeleton (gray animated bar) while fetching. On error, show "—".

### Mobile layout (stats bar)

On screens < 640px: stats bar wraps into a 2×2 grid (`grid-cols-2`). Each stat keeps the same internal layout.

---

## Component: ReviewsPanel

File: `components/professional/reviews-panel.tsx`

### Props
```ts
interface ReviewsPanelProps {
  professionalId: string
  onClose: () => void
}
```

Fetches reviews on mount:
```ts
const { data: reviews } = await supabase
  .from('reviews')
  .select('id, rating, comment, created_at, reply_text, replied_at, patient:profiles(first_name, last_name)')
  .eq('doctor_id', professionalId)   // canonical column is doctor_id (renamed from professional_id in migration 20260315)
  .order('created_at', { ascending: false })
```

### Layout
- Header: "Valoraciones de pacientes — {avg} ★" + "{N} sin responder" in teal
- Close button top-right → calls `onClose`
- Card border: `1.5px solid #0d9488`

### Each review item
- Patient avatar: initials circle (colored by index)
- Patient name, date (`formatDistanceToNow(created_at)`)
- Star rating (★ filled/empty)
- Review text

**If `reply_text` is null (unanswered):**
- "Responder" button → expands `<textarea>` inline
- "Publicar" → `POST /api/professional/reviews/reply` with `{ review_id, reply_text }`
- On success: update local state to show the reply block, remove textarea

**If `reply_text` exists:**
- Shows reply block: left `3px solid #0d9488` border, "Tu respuesta" label, reply text

### API route: `POST /api/professional/reviews/reply`

File: `app/api/professional/reviews/reply/route.ts`

```ts
// Request body
{ review_id: string, reply_text: string }

// Validates:
// 1. User is authenticated
// 2. Review exists and belongs to this professional
// 3. reply_text is non-empty, max 500 chars

// Action: (use doctor_id — canonical column name since migration 20260315)
await supabase
  .from('reviews')
  .update({ reply_text, replied_at: new Date().toISOString() })
  .eq('id', review_id)
  .eq('doctor_id', userId)

// Response: { success: true } or { error: string }
```

---

## Component: AccordionSection

File: `components/professional/accordion-section.tsx`

### Props
```ts
interface AccordionSectionProps {
  title: string
  subtitle: string
  icon: React.ReactNode        // SVG icon element
  iconVariant: 'teal' | 'blue' | 'violet'
  preview: string              // Plain text shown when collapsed (always string)
  children: React.ReactNode
  defaultOpen?: boolean        // false by default
}
```

Accordions are **independent** — opening one does not close others.

### Collapsed state
- White background, `border: 1px solid #e2e8f0`, `border-radius: 12px`
- Header row: icon + title/subtitle on left; preview text + chevron (↓) on right
- Hover: background `#f8fafc`

### Expanded state
- Border: `1.5px solid #0d9488`
- Box shadow: `0 0 0 3px rgba(13,148,136,0.08)`
- Header background: `#f0fdfa`, bottom border: `1px solid #e0fdf4`
- Chevron rotates 180° (↑), stroke color `#0d9488`
- Content area: children rendered below header

### Field rows
```tsx
// View mode
<div className="field-row">
  <span className="field-label">{label}</span>         // 12.5px #94a3b8, width 160px
  <span className="field-value">{value || empty}</span> // 13.5px bold #1e293b; empty = italic #cbd5e1
  <button onClick={startEditing}><PencilIcon /></button>
</div>

// Edit mode (row transforms in place)
<div className="field-row editing">   // left border 3px #0d9488, bg #fafffe
  <span className="field-label">{label}</span>
  <input className="field-input" />   // teal border + focus ring
  <button onClick={cancel}>Cancelar</button>
  <button onClick={save}>Guardar</button>
</div>
```

**Per-field save strategy:** Each field calls `generalForm.setValue(fieldName, newValue)` then `generalForm.handleSubmit(onSaveGeneral)()` — a programmatic full-form submit. This reuses the existing save handler without duplication. On success the row returns to view mode.

### Toggle rows
```tsx
<div className="toggle-row">
  <div>
    <p className="t-label">{label}</p>
    <p className="t-desc">{description}</p>
  </div>
  <Switch checked={value} onCheckedChange={onChange} />  // shadcn Switch
</div>
```

---

## Accordion: Datos personales

- Icon: User icon, `iconVariant="teal"`
- Preview: `"{first_name} {last_name} · {gender}"`
- Fields: Nombre (`first_name`), Apellidos (`last_name`), Género (`gender`)
- Field: Teléfono (`phone`) — with toggle row below for `show_phone` (from `profiles.show_phone`)
- `defaultOpen={false}`

---

## Accordion: Trayectoria profesional

- Icon: Academic cap icon, `iconVariant="blue"`
- Preview: `"{professional_title} · {specialtyName} · {years_experience} años"` where `specialtyName = specialties.find(s => s.id === specialty_id)?.name_es`
- Fields:
  - **Título abreviado** (`professional_title`) — shown as teal pill; pencil opens a button-group selector (same pill buttons as current form), not a text input
  - **Especialidad** (`specialty_id`) — shown as resolved specialty name; pencil opens a `<Select>` dropdown populated from the `specialties` array (same as current form)
  - **Años de experiencia** (`years_experience`) — number input
  - **Nº Registro** (`registration_number`) — text input
  - **Institución emisora** (`registration_institution`) — text input, optional
- `defaultOpen={false}`

---

## Accordion: Condiciones que tratas

- Icon: Beaker/flask icon, `iconVariant="violet"`
- Preview: first 3 condition names joined by ", "
- Content: teal pills for each condition, link "Ir a Clínica para editar →" (calls tab switch to Clínica)
- No edit pencils — purely read-only in General tab
- `defaultOpen={false}`

---

## Accordion: Biografía profesional

- Icon: Chat bubble icon, `iconVariant="teal"`
- Preview: plain text of bio, first 60 chars + "..."
- Content: shows bio text when collapsed is replaced by TipTapEditor when "Editar" is clicked
- "Editar" button in accordion header (right side, next to chevron)
- Footer when editing: "Cancelar" + "Guardar biografía" (calls `generalForm.handleSubmit(onSaveGeneral)()`)
- `defaultOpen={false}`

---

## Files Modified/Created

| File | Action |
|---|---|
| `app/dashboard/(main)/professional/profile/page.tsx` | Modify General tab UI |
| `components/professional/hero-card.tsx` | Create |
| `components/professional/reviews-panel.tsx` | Create |
| `components/professional/accordion-section.tsx` | Create |
| `app/api/professional/reviews/reply/route.ts` | Create |
| `supabase/migrations/20260322_add_review_reply_to_reviews.sql` | Create |

---

## Files Unchanged

- All form logic, Zod schemas, save handlers in `page.tsx`
- `ProfilePhotoUpload`, `TipTapEditor`, `GoogleAddressInput`, `ProfileCompleteness`
- All other tabs: Clínica, Estudios, Galería, Precios, Seguridad, Verificación
- `ProfileSectionCard` (no longer used in General tab but not deleted)

---

## Design Tokens

| Element | Value |
|---|---|
| Teal primary | `#0d9488` |
| Teal light bg | `#f0fdfa` |
| Teal border | `#99f6e4` |
| Accordion open border | `1.5px solid #0d9488` |
| Field label | 12.5px, `#94a3b8` |
| Field value | 13.5px bold, `#1e293b` |
| Hero name | 18px bold |
| Stat values | 20px bold |
| Live dot | `#22c55e`, CSS pulse animation |
| Mobile stats | `grid-cols-2` on screens < 640px |
