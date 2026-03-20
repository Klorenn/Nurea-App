# AGENTS.md - NUREA App Development Guide

## Project Overview
NUREA is a medical/healthcare platform built with Next.js 16, React 19, TypeScript, Tailwind CSS, and Supabase.

---

## Build, Lint, and Test Commands

```bash
# Development
npm run dev          # Start development server (localhost:3000)
npm run build        # Production build
npm run start        # Start production server

# Code Quality
npm run lint         # Run ESLint on app, components, hooks, lib, actions, middleware
npm run verify       # TypeScript type checking (tsc --noEmit)
npm run verify:full  # Full check: types + build

# Database
npx prisma generate   # Generate Prisma client
npx prisma db push    # Push schema changes to database

# Seed Scripts
npm run seed:realistic           # Seed realistic test data
npm run seed:test-professional   # Seed test professional account

# Other
npm run doctor     # Run react-doctor diagnostics
```

---

## TypeScript Configuration

- **Strict mode enabled** (`strict: true`)
- Use `import type` for type-only imports when possible
- Avoid `any` - use proper types or `unknown` with type guards
- Use explicit return types for exported functions

```typescript
// Good
export function getUser(id: string): Promise<User | null> { ... }

// Avoid
export function getUser(id) { ... }
```

---

## Import Conventions

### Order (follow standard conventions):
1. React/Next.js imports (`"use client"`, `useState`, etc.)
2. External libraries (lucide-react, framer-motion, recharts, etc.)
3. UI components (`@/components/ui/*`)
4. Internal lib/hooks (`@/lib/*`, `@/hooks/*`)
5. Types (`@/types/*`, `@/lib/auth/*`)
6. Relative imports (local files)

### Path Aliases:
```typescript
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/use-auth"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"
```

---

## Naming Conventions

### Files:
- Components: `PascalCase.tsx` (e.g., `AdminDashboard.tsx`, `StatsCard.tsx`)
- Hooks: `camelCase.ts` (e.g., `useDashboardStats.ts`)
- Utils/Lib: `camelCase.ts` (e.g., `dashboard-utils.ts`)
- API routes: `route.ts` (Next.js App Router)

### Variables and Functions:
- Use `camelCase` for variables and functions
- Use `PascalCase` for React components and TypeScript types/interfaces
- Prefix boolean variables with `is`, `has`, `should`, `can`

```typescript
const [isLoading, setIsLoading] = useState(true)
const [hasPermission, setHasPermission] = useState(false)
```

### Database:
- Use `snake_case` for database tables and columns (Supabase convention)
- Use `camelCase` for TypeScript property mapping

---

## Code Style Guidelines

### General:
- Use **double quotes** for strings
- Use **semicolons** at the end of statements
- Use **trailing commas** in multiline objects/arrays
- Maximum line length: ~120 characters
- Use **arrow functions** for callbacks and anonymous functions

### React:
- Use **function components** with `"use client"` directive for client components
- Use **named exports** for components (not default exports when possible)
- Props interface naming: `<ComponentName>Props`
- Use `useCallback` for functions passed as dependencies to `useEffect`

```typescript
"use client"

interface StatsCardProps {
  title: string
  value: number
  trend?: "up" | "down"
}

export function StatsCard({ title, value, trend }: StatsCardProps) {
  ...
}
```

### State Management:
- Use React `useState` for local component state
- Use `@tanstack/react-query` for server state (data fetching/caching)
- Use Supabase real-time subscriptions for live updates

### Error Handling:
- Always wrap async operations in try/catch
- Show user-friendly errors with `toast.error()` from sonner
- Log errors to console in development with context

```typescript
try {
  const { error } = await supabase.from("profiles").update({ ... })
  if (error) throw error
  toast.success("Profile updated successfully")
} catch (err) {
  console.error("Error updating profile:", err)
  toast.error("Failed to update profile")
}
```

---

## Supabase/Backend Conventions

### Queries:
- Use `select()` with specific columns when possible (not `select("*")`)
- Use `{ count: "exact", head: true }` for count-only queries
- Always handle null/error cases with `??` or `||`

```typescript
const { data, error, count } = await supabase
  .from("profiles")
  .select("id, first_name, last_name", { count: "exact" })
  .eq("role", "professional")
  .limit(10)
```

### Authentication:
- Use `useAuth()` hook for auth state
- Use `RouteGuard` component for protected routes
- Always verify user role server-side in API routes

---

## UI Component Patterns

### Card Pattern:
```typescript
<Card className="border-border/40 bg-white dark:bg-slate-900 shadow-xl rounded-[32px]">
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>Content</CardContent>
</Card>
```

### Loading States:
- Use `useState` with `isLoading` boolean
- Show skeleton/spinner during loading
- Use `Sonner` toast for notifications

---

## Performance Considerations

- Use `React.memo` for expensive components
- Use `useMemo` for expensive calculations
- Use `useCallback` for stable function references
- Use `@tanstack/react-query` for deduplication and caching
- Use Next.js `Image` component for optimized images
- Use dynamic imports for heavy components (`next/dynamic`)

---

## Common Patterns

### Debouncing:
```typescript
const debouncedSearch = useMemo(
  () => debounce((query: string) => fetchResults(query), 300),
  []
)
```

### Real-time Updates:
```typescript
useEffect(() => {
  const channel = supabase
    .channel("schema-db-changes")
    .on("postgres_changes", { event: "*", schema: "public", table: "profiles" }, handleChange)
    .subscribe()
  return () => { supabase.removeChannel(channel) }
}, [])
```

---

## Testing

Tests are not currently set up in this project. When adding tests:
- Use **Vitest** or **Jest** for unit tests
- Use **Playwright** or **Cypress** for E2E tests
- Place tests alongside source files: `Component.tsx` → `Component.test.tsx`
