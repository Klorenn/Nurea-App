# Professional Profile Page UI Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Compact the professional profile page UI — reduce padding, spacing, and element sizes throughout all 7 tabs without changing any logic or functionality.

**Architecture:** This is a CSS/spacing-only refactor of a single 2078-line Next.js page. No new files, no new components, no logic changes. All edits are Tailwind class substitutions on the existing JSX in `app/dashboard/(main)/professional/profile/page.tsx`.

**Tech Stack:** Next.js 14, Tailwind CSS, shadcn/ui (Card, Tabs, Form, Input, Select, Switch, Badge)

**Spec:** `docs/superpowers/specs/2026-03-22-professional-profile-ui-redesign.md`

---

## Files Modified

- `app/dashboard/(main)/professional/profile/page.tsx` — the only file changed. All tasks modify sections of this file.

---

## Task 1: Global card structure — reduce CardHeader, CardContent, CardFooter padding + shadows

**Files:**
- Modify: `app/dashboard/(main)/professional/profile/page.tsx`

This task applies the global rules to every Card component across all tabs (General, Clínica, Estudios, Galería, Precios, Seguridad, Verificación).

- [ ] **Step 1: Apply CardHeader padding change globally**

Find every occurrence of `p-6` in a `CardHeader` className and replace with `p-4`. There are ~8 CardHeader elements. Also change the icon wrapper from `p-2 rounded-xl` → `p-1.5 rounded-lg` and the icon from `h-5 w-5` to `h-4 w-4` in each header.

Example — General tab CardHeader (line ~897):
```tsx
// Before
<CardHeader className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800 p-6">
  <div className="flex items-center gap-3">
    <div className="p-2 bg-teal-50 dark:bg-teal-500/10 rounded-xl">
      <User className="h-5 w-5 text-teal-600 dark:text-teal-400" />
    </div>
    <div>
      <CardTitle className="text-xl font-black">Información General</CardTitle>
      <CardDescription className="text-sm font-medium">Detalles básicos sobre tu trayectoria profesional.</CardDescription>
    </div>
  </div>
</CardHeader>

// After
<CardHeader className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800 p-4">
  <div className="flex items-center gap-3">
    <div className="p-1.5 bg-teal-50 dark:bg-teal-500/10 rounded-lg">
      <User className="h-4 w-4 text-teal-600 dark:text-teal-400" />
    </div>
    <div>
      <CardTitle className="text-base font-bold">Información General</CardTitle>
      <CardDescription className="text-xs">Detalles básicos sobre tu trayectoria profesional.</CardDescription>
    </div>
  </div>
</CardHeader>
```

Apply the same pattern to every other CardHeader in the file (Clínica ~line 1231, Estudios ~line 1436, Galería ~line 1546, Precios ~line 1631, Seguridad ~line 1857, Verificación ~line 1925).

- [ ] **Step 2: Apply CardContent padding change globally**

Find every `CardContent className="p-6...` and change `p-6` → `p-4`. Also change inner spacing:
- `space-y-8` → `space-y-4`
- `space-y-6` → `space-y-4`

- [ ] **Step 3: Apply CardFooter padding change**

Find every `CardFooter className="... p-4 ..."` and change `p-4` → `p-3`.

- [ ] **Step 4: Reduce card shadows**

Find every card with `shadow-xl shadow-slate-200/30 dark:shadow-none` and replace with `shadow-sm dark:shadow-none`.

Also find `rounded-2xl` on Card components and change to `rounded-xl`.

- [ ] **Step 5: Reduce outer page container spacing**

Line ~764: change `space-y-8` → `space-y-4` on the outer `<div className="space-y-8 max-w-5xl mx-auto pb-12">`.

- [ ] **Step 6: Verify the page loads without errors**

Run the dev server and open `http://localhost:3000/dashboard/professional/profile`. Confirm no crashes, all cards render, all 7 tabs clickable.

- [ ] **Step 7: Commit**

```bash
git add app/dashboard/\(main\)/professional/profile/page.tsx
git commit -m "style: compact card headers, content, shadows globally on profile page"
```

---

## Task 2: Page header + tabs bar

**Files:**
- Modify: `app/dashboard/(main)/professional/profile/page.tsx` (lines ~766–822)

- [ ] **Step 1: Reduce page header bottom padding**

Line ~766: change `pb-5` → `pb-3` on the header border-bottom div.

- [ ] **Step 2: Compact tab triggers**

Line ~816: change `px-4 py-2` → `px-3 py-1.5` on each `TabsTrigger` className.

```tsx
// Before
className="rounded-lg px-4 py-2 data-[state=active]:bg-white ..."

// After
className="rounded-lg px-3 py-1.5 data-[state=active]:bg-white ..."
```

- [ ] **Step 3: Verify tabs render correctly**

Check all 7 tabs are still visible and clickable. Check that the active tab indicator still shows correctly.

- [ ] **Step 4: Commit**

```bash
git add app/dashboard/\(main\)/professional/profile/page.tsx
git commit -m "style: compact page header and tab triggers on profile page"
```

---

## Task 3: General tab — profile photo layout + form field spacing

**Files:**
- Modify: `app/dashboard/(main)/professional/profile/page.tsx` (lines ~895–1224)

- [ ] **Step 1: Replace profile photo grid layout with flex**

Lines ~908–916: Replace the two-column grid with a flex layout.

```tsx
// Before
<div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-10">
  {/* Left Column: Profile Photo */}
  <div className="flex flex-col items-center pt-4">
    <ProfilePhotoUpload
      currentUrl={avatarUrl || profile?.avatar_url || undefined}
      onUpload={handleProfilePhotoUpload}
    />
  </div>
  {/* Right Column: Fields */}
  <div className="space-y-8">

// After
<div className="flex gap-4 items-start">
  {/* Profile Photo */}
  <div className="flex-shrink-0">
    <ProfilePhotoUpload
      currentUrl={avatarUrl || profile?.avatar_url || undefined}
      onUpload={handleProfilePhotoUpload}
    />
  </div>
  {/* Fields */}
  <div className="flex-1 space-y-4">
```

The closing `</div>` structure stays the same — just two nested divs inside the outer flex container.

- [ ] **Step 2: Reduce form field row gaps**

Inside the right column (now `flex-1 space-y-4`), find each form grid and reduce gaps:
- `grid grid-cols-1 sm:grid-cols-3 gap-6` → `gap-3`
- `grid grid-cols-1 sm:grid-cols-2 gap-6` → `gap-3`
- Professional title `space-y-3` → `space-y-2`

- [ ] **Step 3: Reduce phone + Switch row padding**

Line ~1118: change `py-3` → `py-2` on the Switch row div.

```tsx
// Before
<div className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-800">

// After
<div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
```

- [ ] **Step 4: Reduce input heights globally**

Do a find-and-replace within this file for `h-10` → `h-9` on all `Input`, `SelectTrigger`, and `Textarea` classNames throughout the full file (all tabs). This is safe to do globally since `h-10` is only used for form inputs.

- [ ] **Step 5: Reduce FormLabel margin**

Do a find-and-replace within this file for `mb-1.5` → `mb-1` on all `FormLabel` / label divs.

- [ ] **Step 6: Verify General tab**

Open the General tab. Check:
- Photo uploader renders inline to the left of the fields
- Fields align correctly
- Phone toggle (show_phone Switch) is visible below the phone input
- Bio field (TipTapEditor) renders correctly
- Save button is present in the footer

- [ ] **Step 7: Commit**

```bash
git add app/dashboard/\(main\)/professional/profile/page.tsx
git commit -m "style: compact General tab layout — flex photo, tighter form spacing, h-9 inputs"
```

---

## Task 4: Clínica tab — modality cards + field spacing

**Files:**
- Modify: `app/dashboard/(main)/professional/profile/page.tsx` (lines ~1226–1420)

- [ ] **Step 1: Compact modality selector cards**

Lines ~1245–1275: Each modality card div:
```tsx
// Before
<div className="... p-4 ... h-24 ...">
  <type.icon className="h-6 w-6 mb-2 ..." />
  <span className="text-sm font-black uppercase tracking-wider ...">

// After
<div className="... p-3 ... h-16 ...">
  <type.icon className="h-5 w-5 mb-1 ..." />
  <span className="text-sm font-black uppercase tracking-wider ...">
```

Also change the grid gap: `grid-cols-1 sm:grid-cols-3 gap-4` → `gap-3`.

- [ ] **Step 2: Compact address/city grid**

Line ~1277: `grid sm:grid-cols-2 gap-6` → `gap-3`.

- [ ] **Step 3: Compact tag input areas**

For conditions, patient groups, and payment methods tag areas:
- `min-h-[100px]` → `min-h-[48px]`
- `min-h-[64px]` → `min-h-[48px]`

- [ ] **Step 4: Verify Clínica tab**

Open the Clínica tab. Check:
- 3 modality cards (Online / Presencial / Ambos) render at correct smaller height
- Clicking a modality card still activates it (logic unchanged)
- Address fields, tag inputs all visible and functional

- [ ] **Step 5: Commit**

```bash
git add app/dashboard/\(main\)/professional/profile/page.tsx
git commit -m "style: compact Clínica tab — smaller modality cards, tighter field spacing"
```

---

## Task 5: Estudios tab

**Files:**
- Modify: `app/dashboard/(main)/professional/profile/page.tsx` (lines ~1430–1540)

- [ ] **Step 1: Compact education entry fields**

The education entries use `useFieldArray`. For the education items container and each entry:
- Any remaining `gap-4` in education grids → `gap-3`
- The `CardContent className="p-6 space-y-6"` was already handled by Task 1 (global).
- Check that individual education entry divs use compact gap if they have their own `gap-4`.

- [ ] **Step 2: Verify Estudios tab**

Open Estudios tab. Check:
- Existing education entries render correctly
- "Añadir educación" button works (click and verify a new entry appears)
- Delete (Trash2) button on entries still present

- [ ] **Step 3: Commit**

```bash
git add app/dashboard/\(main\)/professional/profile/page.tsx
git commit -m "style: compact Estudios tab education entry spacing"
```

---

## Task 6: Galería, Precios, Seguridad, Verificación tabs

**Files:**
- Modify: `app/dashboard/(main)/professional/profile/page.tsx` (lines ~1545–2078)

These tabs received the global rules in Task 1. This task handles any tab-specific overrides missed.

- [ ] **Step 1: Galería — image grid gap**

Lines ~1545–1615: Find the image grid and change `gap-4` → `gap-3`. Upload area inner padding `p-4` → `p-3`.

- [ ] **Step 2: Precios — pricing entry cards**

Lines ~1624–1851: Each pricing entry card has its own padding. Change `p-4` → `p-3` on pricing entry containers, and form grid `gap-4` → `gap-3`.

- [ ] **Step 3: Verificación — section headings and credential items**

Lines ~1922–2078: Change section headings from `text-lg font-black` → `text-sm font-bold`. Credential list item padding `p-3` → `p-2.5`.

- [ ] **Step 4: Verify all remaining tabs**

Cycle through Galería, Precios, Seguridad, Verificación. Check:
- Galería: image grid visible, upload button works
- Precios: pricing entries show, add/remove works
- Seguridad: password fields visible, submit button present
- Verificación: credential upload areas visible, status badges show

- [ ] **Step 5: Final full-page review**

Open the page and click through all 7 tabs. Verify:
- No layout breaks
- No text overflow
- Dark mode: toggle dark mode and check all tabs look correct
- The `show_phone` Switch in General tab is clearly visible
- ProfileCompleteness bar renders

- [ ] **Step 6: Final commit**

```bash
git add app/dashboard/\(main\)/professional/profile/page.tsx
git commit -m "style: compact remaining tabs (Galería, Precios, Seguridad, Verificación) on profile page"
```

---

## Done

All 7 tabs should now display compact, well-proportioned cards with reduced padding and spacing throughout. No logic was changed.
