# Plan: NUREA App - Producción Ready

**Generated**: 2026-03-22
**Estimated Complexity**: High

## Overview
NUREA es una plataforma médica/profesional de salud construida con Next.js 16, React 19, TypeScript, Tailwind CSS y Supabase. Este plan cubre todas las tareas para deixarla lista para producción: bugs, lint, testing, CI/CD, documentación, SEO, performance, seguridad y PWA.

## Prerequisites
- Acceso a Supabase dashboard
- Cuenta de hosting (Vercel)
- Dominio configurado
- Variables de entorno documentadas
- SSL/HTTPS habilitado

---

## Sprint 1: Bug Fixing & Code Quality
**Goal**: Resolver errores críticos, limpiar warnings y dejar el codebase sin errores
**Demo/Validation**: `npm run lint` y `npm run verify` sin errores

### Task 1.1: Fix TypeScript/ESLint Errors Críticos
- **Location**: Múltiples archivos
- **Description**: Resolver los 627 errores de lint preexistentes
- **Dependencies**: Ninguno
- **Acceptance Criteria**: `npm run lint` pasa sin errores
- **Validation**: `npm run lint 2>&1 | grep -c error` == 0

### Task 1.2: Fix Errores en lib/utils/schedule-generator.ts
- **Location**: `lib/utils/schedule-generator.ts:190, 279`
- **Description**: Arreglar ramas de código inalcanzables (no-dupe-else-if)
- **Dependencies**: Task 1.1
- **Acceptance Criteria**: Sin errores de unreachable code
- **Validation**: ESLint pasa

### Task 1.3: Fix Errores en lib/utils/date-helpers.ts
- **Location**: `lib/utils/date-helpers.ts`
- **Description**: Eliminar variables no usadas (fullMonthNamesEs, fullMonthNamesEn, currentDay)
- **Dependencies**: Task 1.1
- **Validation**: ESLint pasa

### Task 1.4: Fix Error de RegExp en lib/utils/sanitize.ts
- **Location**: `lib/utils/sanitize.ts:19`
- **Description**: Corregir control characters en regex o ajustar eslint
- **Dependencies**: Task 1.1
- **Validation**: ESLint pasa

### Task 1.5: Fix Errores en lib/utils/calculate-ranking.ts
- **Location**: `lib/utils/calculate-ranking.ts`
- **Description**: Remover variables no usadas (supabase, professionalId) y unreachable code
- **Dependencies**: Task 1.1
- **Validation**: ESLint pasa

---

## Sprint 2: Testing Setup
**Goal**: Implementar suite de testing para garantizar calidad
**Demo/Validation**: Tests pasan en CI

### Task 2.1: Configurar Vitest
- **Location**: `package.json`, `vitest.config.ts`
- **Description**: Instalar y configurar Vitest para unit tests
- **Dependencies**: Sprint 1 completado
- **Acceptance Criteria**: `npm run test` funciona
- **Validation**: Tests pasan

### Task 2.2: Escribir Tests para Utils/Helpers
- **Location**: `lib/utils/*.test.ts`
- **Description**: Tests para date-helpers, sanitize, calculate-ranking
- **Dependencies**: Task 2.1
- **Validation**: Tests pasan

### Task 2.3: Escribir Tests para Hooks
- **Location**: `hooks/*.test.ts`
- **Description**: Tests para useAuth, useProfile
- **Dependencies**: Task 2.1
- **Validation**: Tests pasan

### Task 2.4: Configurar Playwright para E2E
- **Location**: `playwright.config.ts`
- **Description**: Setup Playwright para tests end-to-end
- **Dependencies**: Task 2.1
- **Validation**: Tests E2E corren

### Task 2.5: Tests E2E Críticos
- **Location**: `e2e/*.spec.ts`
- **Description**: Tests E2E para flujos principales (login, signup, booking)
- **Dependencies**: Task 2.4
- **Validation**: Tests pasan

---

## Sprint 3: CI/CD Pipeline
**Goal**: Automatizar build, test y deploy
**Demo/Validation**: Merge a main hace deploy automático

### Task 3.1: Configurar GitHub Actions
- **Location**: `.github/workflows/ci.yml`
- **Description**: Pipeline CI con lint, typecheck, test
- **Dependencies**: Sprint 2 completado
- **Acceptance Criteria**: CI corre en cada PR
- **Validation**: Workflow se ejecuta

### Task 3.2: Configurar Vercel Deploy Preview
- **Location**: `vercel.json`
- **Description**: Preview deployments para PRs
- **Dependencies**: Task 3.1
- **Validation**: Preview URL en cada PR

### Task 3.3: Configurar Deploy Production
- **Location**: Vercel dashboard
- **Description**: Deploy production desde main branch
- **Dependencies**: Task 3.2
- **Validation**: Deploy exitoso a producción

### Task 3.4: Setup Branch Protection
- **Location**: GitHub settings
- **Description**: Proteger main, requerir reviews, pasar CI
- **Dependencies**: Task 3.1
- **Validation**: PR no puede mergear sin CI verde

---

## Sprint 4: Performance Optimization
**Goal**: Optimizar bundle, load times y Core Web Vitals
**Demo/Validation**: Lighthouse score > 90

### Task 4.1: Analizar Bundle Size
- **Location**: `next.config.js`
- **Description**: Analizar con next-bundle-analyzer
- **Dependencies**: Sprint 1
- **Acceptance Criteria**: Identificar chunks grandes
- **Validation**: Reporte de bundle generado

### Task 4.2: Implementar Code Splitting
- **Location**: Componentes pesados
- **Description**: Dynamic imports para componentes pesados (TipTap, Charts)
- **Dependencies**: Task 4.1
- **Validation**: Bundle size reducido

### Task 4.3: Optimizar Imágenes
- **Location**: Componentes con `<img>`
- **Description**: Usar Next.js Image, lazy loading, WebP
- **Dependencies**: Ninguno
- **Validation**: Imágenes optimizadas en Lighthouse

### Task 4.4: Implementar Caching Strategies
- **Location**: API routes, Supabase queries
- **Description**: Revalidate tags para fetch con React Query
- **Dependencies**: Ninguno
- **Validation**: Cache headers correctos

### Task 4.5: Optimizar Fuentes
- **Location**: `app/layout.tsx`
- **Description**: Font subsetting, display swap, preload
- **Dependencies**: Ninguno
- **Validation**: Lighthouse score mejorado

---

## Sprint 5: SEO & Documentation
**Goal**: Optimizar para search engines y documentar API
**Demo/Validation**: Lighthouse SEO > 95

### Task 5.1: Metadata Completa
- **Location**: `app/**/*.tsx`
- **Description**: Agregar title, description, og:image a todas las páginas
- **Dependencies**: Ninguno
- **Acceptance Criteria**: Ninguna página sin metadata
- **Validation**: Lighthouse SEO score

### Task 5.2: Optimizar sitemap.xml
- **Location**: `app/sitemap.ts`
- **Description**: Sitemap dinámico con todas las rutas importantes
- **Dependencies**: Ninguno
- **Validation**: sitemap.xml accesible

### Task 5.3: Optimizar robots.txt
- **Location**: `app/robots.ts`
- **Description**: Configurar crawling apropiado
- **Dependencies**: Ninguno
- **Validation**: robots.txt correcto

### Task 5.4: Structured Data (JSON-LD)
- **Location**: `app/professionals/[id]/page.tsx`
- **Description**: Agregar Schema.org markup para médicos
- **Dependencies**: Ninguno
- **Validation**: JSON-LD válido en Google Rich Results

### Task 5.5: Documentación de API
- **Location**: `docs/api.md` o inline comments
- **Description**: Documentar endpoints de API routes
- **Dependencies**: Ninguno
- **Validation**: Docs generadas

### Task 5.6: README Actualizado
- **Location**: `README.md`
- **Description**: Setup instructions, env vars, deploy guide
- **Dependencies**: Sprint 3
- **Validation**: README completo

---

## Sprint 6: Security Hardening
**Goal**: Asegurar la aplicación contra vulnerabilidades comunes
**Demo/Validation**: Security audit pasa

### Task 6.1: Security Headers
- **Location**: `middleware.ts` o `next.config.js`
- **Description**: CSP, X-Frame-Options, HSTS, etc.
- **Dependencies**: Ninguno
- **Acceptance Criteria**: Headers configurados
- **Validation**: securityheaders.com score A

### Task 6.2: Rate Limiting en API
- **Location**: API routes críticas
- **Description**: Proteger contra brute force, spam
- **Dependencies**: Ninguno
- **Validation**: Rate limiting activo

### Task 6.3: Validación de Inputs
- **Location**: Formularios, API routes
- **Description**: Zod schemas en todos los inputs
- **Dependencies**: Ninguno
- **Validation**: Inputs validados

### Task 6.4: Environment Variables Audit
- **Location**: `.env.example`
- **Description**: Documentar todas las env vars, asegurar no exponer secrets
- **Dependencies**: Ninguno
- **Validation**: .env.example existe, no secrets en código

### Task 6.5: Dependabot/Snyk Setup
- **Location**: GitHub settings
- **Description**: Alerts de vulnerabilidades en dependencias
- **Dependencies**: Ninguno
- **Validation**: Dependabot activo

---

## Sprint 7: PWA Setup
**Goal**: Experiencia tipo app nativa
**Demo/Validation**: PWA installable en móvil

### Task 7.1: manifest.json
- **Location**: `app/manifest.ts`
- **Description**: PWA manifest con iconos, theme, name
- **Dependencies**: Ninguno
- **Acceptance Criteria**: Manifest válido
- **Validation**: PWA installable

### Task 7.2: Service Worker
- **Location**: `app/service-worker.ts`
- **Description**: Offline support, cache strategies
- **Dependencies**: Task 7.1
- **Validation**: Offline funciona

### Task 7.3: Iconos PWA
- **Location**: `public/icons/`
- **Description**: Generar iconos 192x192, 512x512
- **Dependencies**: Task 7.1
- **Validation**: Iconos visibles

### Task 7.4: Meta Tags para Móvil
- **Location**: `app/layout.tsx`
- **Description**: viewport, theme-color, apple-mobile-web-app
- **Dependencies**: Ninguno
- **Validation**: Safari PWA compatible

---

## Testing Strategy
1. **Por Sprint**: Ejecutar `npm run lint && npm run verify && npm run test` después de cada sprint
2. **Pre-deploy**: Build completo (`npm run build`) debe pasar
3. **Post-deploy**: Verificar en staging/production

## Potential Risks & Gotchas
1. **Errores de lint preexistentes**: Algunos pueden ser intencionales - verificar antes de borrar
2. **Breaking changes en testing**: Puede afectar código existente
3. **Rate limiting en Supabase**: No exceder límites en producción
4. **PWA en iOS**: Safari tiene soporte limitado para某些 features
5. **Dependabot PRs**: Mantener dependencias actualizadas pero no romper build

## Rollback Plan
- Git revert para cambios problemáticos
- Feature flags para toggles de risky features
- Deploy rollback en Vercel si es necesario

---

## Estimated Timeline
- Sprint 1: 1-2 días
- Sprint 2: 2-3 días
- Sprint 3: 1 día
- Sprint 4: 2 días
- Sprint 5: 1-2 días
- Sprint 6: 1-2 días
- Sprint 7: 1 día

**Total estimado**: 9-14 días de trabajo
