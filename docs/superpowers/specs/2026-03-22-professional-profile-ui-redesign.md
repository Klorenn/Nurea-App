# Spec: Professional Profile Page UI Redesign

**Date:** 2026-03-22
**Route:** `/dashboard/professional/profile`
**File:** `app/dashboard/(main)/professional/profile/page.tsx` (2078 lines)

---

## Problem

The current profile page uses oversized cards with excessive padding (`p-6`, `space-y-8`, `gap-6`), large shadows (`shadow-xl`), and overly tall form elements (`h-10` inputs, `h-24` modality cards). The result is too much visual white space and a poor-density layout for a settings/profile page.

---

## Goal

Compact the entire page layout so it feels like a well-designed web app — not too small, not too big. Keep the same data and features, just tighter and more refined. This is a **CSS/spacing-only refactor — no logic, schema, or handler changes.**

---

## Global Rules (apply to ALL tabs)

| Element | Before | After |
|---|---|---|
| `CardHeader` padding | `p-6` | `p-4` |
| `CardContent` padding | `p-6` | `p-4` |
| `CardFooter` padding | `p-4` | `p-3` |
| Outer page container spacing | `space-y-8` | `space-y-4` |
| Card `space-y` in content | `space-y-8` | `space-y-4` |
| Form grid gaps | `gap-6` | `gap-3` |
| Form sub-section spacing | `space-y-6` | `space-y-4` |
| Input / select height | `h-10` | `h-9` |
| `CardTitle` text | `text-xl font-black` | `text-base font-bold` |
| `CardDescription` text | `text-sm font-medium` | `text-xs` |
| Card icon wrapper | `p-2 rounded-xl` | `p-1.5 rounded-lg` |
| Card icon size | `h-5 w-5` | `h-4 w-4` |
| Card shadow | `shadow-xl shadow-slate-200/30 dark:shadow-none` | `shadow-sm dark:shadow-none` |
| FormLabel uppercase tracking text | `text-[10px] font-black uppercase tracking-wider` | keep as-is |
| Margin below FormLabel | `mb-1.5` | `mb-1` |
| All `rounded-2xl` on cards | `rounded-2xl` | `rounded-xl` |

---

## Page Header (`line ~766`)

- Keep `text-2xl font-bold` for the display name — this is the page title, not a CardTitle.
- Keep the two header buttons unchanged.
- Reduce `pb-5` → `pb-3` on the border-bottom header div.

---

## ProfileCompleteness Component (`line ~794`)

This component manages its own internal layout. No changes to the component itself. Only ensure the outer wrapper uses `space-y-4` (handled by the global rule on the page container).

---

## Tabs Bar (`line ~802`)

- `TabsList`: keep `p-1`, keep `rounded-xl`, keep `mb-6`
- Each `TabsTrigger`: change `px-4 py-2` → `px-3 py-1.5`
- Icon inside trigger: `h-4 w-4 mr-2` → keep as-is (already correct size)

---

## TAB: General

### Preview cards (ProfileSectionCard, lines ~827–892)

Both preview cards (Información básica, Introducción) remain. They receive the global card compact rules above via their internal styling. No structural changes needed to `ProfileSectionCard`.

### Form card — Profile photo layout (lines ~909–916)

**Current:** `grid grid-cols-1 md:grid-cols-[300px_1fr] gap-10` — left column is 300px wide with the photo uploader, right column has all fields.

**New layout:** Replace with `flex gap-4 items-start` (not grid). The photo uploader becomes a `flex-shrink-0` block containing:
- `ProfilePhotoUpload` component with reduced size (pass existing props unchanged)
- The component itself already renders a circular/square avatar — no size prop changes needed inside the component

The right column (fields) becomes `flex-1` instead of a grid column. This is purely a container class change.

### Form card — Field rows (lines ~919–1208)

- Row 1 (`grid-cols-1 sm:grid-cols-3 gap-6`): change `gap-6` → `gap-3`
- Professional title pills section (`space-y-3`): change to `space-y-2`
- Gender field: no structural change, just spacing inherits from parent
- Phone field section (`space-y-2`): keep as-is
- **Phone + Switch row** (`line ~1118`): change `py-3` → `py-2`, keep `border-b border-slate-100 dark:border-slate-800`
- Row 2 specialty/conditions grid (`grid-cols-1 sm:grid-cols-2 gap-6`): change `gap-6` → `gap-3`
- Bio field: TipTapEditor receives no changes. Only reduce the `mb-1.5` on FormLabel → `mb-1`.

### Form card footer

`p-4` → `p-3`, keep `justify-end` and save button styles.

---

## TAB: Clínica

### Modality selector cards (lines ~1245–1275)

- Container grid: `gap-4` → `gap-3`
- Each card div: `p-4 h-24` → `p-3 h-16`
- Icon inside each card: `h-6 w-6 mb-2` → `h-5 w-5 mb-1`
- Label text: `text-sm font-black uppercase tracking-wider` → keep as-is

### Address/city grid (lines ~1277–1309)

- `grid sm:grid-cols-2 gap-6` → `gap-3`

### Conditions, patient groups, payment methods tag inputs (lines ~1310–1420)

- Container `space-y-8` → `space-y-4`
- Tag area `min-h-[100px]` and `min-h-[64px]` → reduce to `min-h-[48px]` each
- Input below tag area: `h-10` → `h-9` (global rule)

---

## TAB: Estudios

### Card content (lines ~1430–1540)

- `CardContent className="p-6 space-y-6"` → `p-4 space-y-4`
- Each education entry: outer div `gap-4` → `gap-3`
- Input fields: `h-10` → `h-9` (global rule)
- Delete button: keep as-is
- "Añadir educación" button: keep size and style, just inherits compact spacing from parent

---

## TAB: Galería

### Card content (lines ~1545–1615)

- `CardContent className="p-6"` → `p-4`
- Image grid: `grid-cols-2 md:grid-cols-4 gap-4` → keep grid-cols but change `gap-4` → `gap-3`
- Upload area: inner padding `p-4` → `p-3`

---

## TAB: Precios

### Card content (lines ~1624–1851)

- `CardContent className="p-6 space-y-6"` → `p-4 space-y-4`
- Each pricing entry card: outer `p-4` → `p-3`, inner form grid `gap-4` → `gap-3`
- All form inputs: `h-10` → `h-9` (global rule)
- Select inputs: `h-10` → `h-9` (global rule)
- "Añadir tipo de consulta" button: keep size

---

## TAB: Seguridad

### Card content (lines ~1855–1920)

- `CardContent className="p-6 space-y-4"` → `p-4 space-y-3`
- Input fields: `h-10` → `h-9` (global rule)
- Submit button: keep

---

## TAB: Verificación

### Card content (lines ~1922–2078)

- `CardContent className="p-6 space-y-6"` → `p-4 space-y-4`
- Section headings (`text-lg font-black`): change to `text-sm font-bold`
- Credential upload areas: inner padding `p-4` → `p-3`
- Credential list items: `p-3` → `p-2.5`
- Badge/status pills: keep sizes as-is (these are small already)

---

## Dark Mode

All existing `dark:` variants are preserved. The only shadow change is `shadow-xl shadow-slate-200/30 dark:shadow-none` → `shadow-sm dark:shadow-none`. The `dark:shadow-none` is explicitly kept to maintain current dark mode behavior.

---

## What stays unchanged

- All logic, forms, Zod schemas, save handlers, API calls
- All 7 tabs and their content/features
- Component APIs: `ProfilePhotoUpload`, `TipTapEditor`, `GoogleAddressInput`, `ProfileSectionCard`, `ProfileCompleteness`
- `show_phone` Switch toggle — must remain, visually prominent below phone input
- Animations: `animate-in fade-in slide-in-from-bottom-4 duration-500`
- `FormMessage`, `FormDescription` elements — not removed
- All `scroll-mt-*` attributes on anchor cards

---

## Implementation order

1. Apply global rules to all `CardHeader`, `CardContent`, `CardFooter` across the full file
2. Fix profile photo container layout (flex instead of grid)
3. Fix per-tab specific overrides in order: General → Clínica → Estudios → Galería → Precios → Seguridad → Verificación
4. Fix tabs bar trigger padding
