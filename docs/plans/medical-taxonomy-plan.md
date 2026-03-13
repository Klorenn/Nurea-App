# Plan: Sistema Global de Especialistas NUREA

**Generated**: 2026-03-13
**Estimated Complexity**: High

## Overview

Implementar una taxonomía médica robusta y escalable para NUREA que organice a los profesionales de salud en categorías bien definidas, con un sistema de búsqueda avanzado y una interfaz de usuario moderna con animaciones.

### Arquitectura Propuesta

```
┌─────────────────────────────────────────────────────────────────┐
│                    CATEGORÍAS PRINCIPALES                        │
├─────────────────────┬─────────────────────┬─────────────────────┤
│ Medicina            │ Salud Integral y    │ Servicios de        │
│ Especializada       │ Bienestar           │ Diagnóstico         │
├─────────────────────┼─────────────────────┼─────────────────────┤
│ • Cardiología       │ • Psicología        │ • Radiología        │
│ • Dermatología      │ • Nutrición         │ • Patología         │
│ • Pediatría         │ • Fisioterapia      │ • Genética Médica   │
│ • Ginecología       │ • Odontología       │ • Laboratorio       │
│ • Psiquiatría       │ • Kinesiología      │ • Imagenología      │
│ • Neurología        │ • Terapia Ocupac.   │                     │
│ • Oftalmología      │ • Fonoaudiología    │                     │
│ • etc...            │ • etc...            │                     │
└─────────────────────┴─────────────────────┴─────────────────────┘
```

### Relaciones de Base de Datos

```
┌─────────────────┐       ┌─────────────────────────┐       ┌────────────────────┐
│   categories    │──────<│      specialties        │>──────│ professional_      │
│                 │       │                         │       │ specialties        │
│ id              │       │ id                      │       │                    │
│ name_es         │       │ category_id (FK)        │       │ professional_id    │
│ name_en         │       │ name_es                 │       │ specialty_id       │
│ slug            │       │ name_en                 │       │ is_primary         │
│ description_es  │       │ slug                    │       │ certification_url  │
│ description_en  │       │ icon                    │       │ certified_at       │
│ icon            │       │ parent_id (self-ref)    │       └────────────────────┘
│ sort_order      │       │ requires_license        │                │
└─────────────────┘       │ is_active               │                │
                          │ sort_order              │                │
                          └─────────────────────────┘                │
                                                                     │
                                      ┌──────────────────────────────┘
                                      │
                                      ▼
                          ┌─────────────────────────┐
                          │     professionals       │
                          │                         │
                          │ id                      │
                          │ specialty (legacy)      │
                          │ verified               │
                          │ ...                     │
                          └─────────────────────────┘
```

## Prerequisites

- Acceso a Supabase Dashboard (para ejecutar migraciones)
- Supabase CLI instalado (`npx supabase`)
- Node.js 18+ y pnpm/npm
- Variables de entorno configuradas

## Sprint 1: Infraestructura de Datos

**Goal**: Crear la estructura de base de datos para categorías y especialidades con datos iniciales.
**Demo/Validation**:
- Verificar tablas creadas en Supabase Dashboard
- Consultar categorías y especialidades vía SQL
- Ejecutar queries de relación Many-to-Many

### Task 1.1: Crear tipos TypeScript centralizados

- **Location**: `types/database.ts`, `types/specialists.ts`
- **Description**: Definir interfaces TypeScript para el sistema de especialidades
- **Dependencies**: Ninguna
- **Acceptance Criteria**:
  - Tipo `Category` con campos multilenguaje
  - Tipo `Specialty` con relación a categoría
  - Tipo `ProfessionalSpecialty` para la tabla puente
  - Tipo `SpecialistCard` para componentes UI
  - Exportar todos los tipos desde `types/index.ts`
- **Validation**:
  - `tsc --noEmit` sin errores
  - Tipos importables desde cualquier archivo

### Task 1.2: Crear migración para tabla `categories`

- **Location**: `supabase/migrations/XXXXXX_create_categories_table.sql`
- **Description**: Tabla de categorías principales (Medicina Especializada, Salud Integral, Diagnóstico)
- **Dependencies**: Task 1.1
- **Acceptance Criteria**:
  - Campos: `id`, `name_es`, `name_en`, `slug`, `description_es`, `description_en`, `icon`, `sort_order`, `created_at`
  - Constraint UNIQUE en `slug`
  - RLS policies para lectura pública
- **Validation**:
  - Migración ejecuta sin errores
  - Tabla visible en Supabase Dashboard

### Task 1.3: Crear migración para tabla `specialties`

- **Location**: `supabase/migrations/XXXXXX_create_specialties_table.sql`
- **Description**: Tabla de especialidades médicas con soporte para sub-especialidades
- **Dependencies**: Task 1.2
- **Acceptance Criteria**:
  - Campos: `id`, `category_id`, `parent_id`, `name_es`, `name_en`, `slug`, `icon`, `requires_license`, `is_active`, `sort_order`, `created_at`
  - FK a `categories(id)`
  - Self-reference opcional para sub-especialidades
  - RLS policies para lectura pública
- **Validation**:
  - Relación con categories funcional
  - Queries jerárquicas funcionan

### Task 1.4: Crear migración para tabla puente `professional_specialties`

- **Location**: `supabase/migrations/XXXXXX_create_professional_specialties_table.sql`
- **Description**: Tabla Many-to-Many entre profesionales y especialidades
- **Dependencies**: Task 1.3
- **Acceptance Criteria**:
  - Campos: `id`, `professional_id`, `specialty_id`, `is_primary`, `certification_url`, `certified_at`, `created_at`
  - FK a `professionals(id)` ON DELETE CASCADE
  - FK a `specialties(id)` ON DELETE RESTRICT
  - Constraint UNIQUE en `(professional_id, specialty_id)`
  - Solo una especialidad primaria por profesional (check constraint o trigger)
- **Validation**:
  - Insertar y consultar relaciones
  - Cascade delete funciona

### Task 1.5: Seed de categorías y especialidades iniciales

- **Location**: `supabase/seeds/specialties-seed.sql`, `scripts/seed-specialties.ts`
- **Description**: Poblar tablas con catálogo completo de especialidades médicas
- **Dependencies**: Task 1.4
- **Acceptance Criteria**:
  - 3 categorías principales
  - Mínimo 50 especialidades cubriendo todas las áreas médicas
  - Incluir especialidades de Chile, México, España, Argentina
  - Datos en español e inglés
- **Validation**:
  - Todas las especialidades visibles en queries
  - Iconos asignados correctamente

### Task 1.6: Crear funciones RPC de Supabase

- **Location**: `supabase/migrations/XXXXXX_create_specialty_functions.sql`
- **Description**: Funciones para consultas optimizadas de especialidades
- **Dependencies**: Task 1.5
- **Acceptance Criteria**:
  - `get_specialties_with_counts()`: Especialidades con conteo de profesionales
  - `get_professionals_by_specialty(specialty_slug)`: Profesionales filtrados
  - `search_professionals(filters JSONB)`: Búsqueda avanzada con múltiples filtros
- **Validation**:
  - Llamar funciones desde cliente Supabase
  - Performance < 100ms para queries típicas

---

## Sprint 2: API y Lógica de Backend

**Goal**: Crear endpoints y lógica de negocio para el sistema de especialidades
**Demo/Validation**:
- Probar endpoints con Postman/Insomnia
- Verificar respuestas JSON correctas
- Validar filtros funcionando

### Task 2.1: Crear API route para categorías

- **Location**: `app/api/categories/route.ts`
- **Description**: GET endpoint para listar categorías con sus especialidades
- **Dependencies**: Sprint 1 completo
- **Acceptance Criteria**:
  - GET devuelve categorías con `specialties[]` anidadas
  - Soporte para `?lang=es|en` para respuesta localizada
  - Cache headers para CDN
  - Manejo de errores consistente
- **Validation**:
  - `curl localhost:3000/api/categories` devuelve JSON válido
  - Respuesta incluye conteo de profesionales por especialidad

### Task 2.2: Crear API route para especialidades

- **Location**: `app/api/specialties/route.ts`
- **Description**: GET endpoint con filtros avanzados
- **Dependencies**: Task 2.1
- **Acceptance Criteria**:
  - Filtro por `category_slug`
  - Filtro por `parent_id` para sub-especialidades
  - Búsqueda por texto en `name_es` y `name_en`
  - Paginación con `limit` y `offset`
- **Validation**:
  - Filtros combinables funcionan
  - Performance con 100+ especialidades

### Task 2.3: Actualizar API de profesionales

- **Location**: `app/api/professionals/route.ts`
- **Description**: Añadir filtros de especialidad al endpoint existente
- **Dependencies**: Task 2.2
- **Acceptance Criteria**:
  - Filtro `?specialty_slug=cardiologia`
  - Filtro `?category_slug=medicina-especializada`
  - Filtro `?consultation_type=online|in-person|both`
  - Filtro `?available_today=true` (basado en `availability` JSONB)
  - Filtro `?price_min=X&price_max=Y`
  - Ordenamiento por `rating`, `price`, `distance`
  - Respuesta incluye `specialties[]` del profesional
- **Validation**:
  - Todos los filtros funcionan individualmente y combinados
  - Resultados correctos según filtros aplicados

### Task 2.4: Crear hook de React Query

- **Location**: `hooks/use-specialists.ts`, `hooks/use-specialties.ts`
- **Description**: Hooks para fetching con cache y estados de carga
- **Dependencies**: Task 2.3
- **Acceptance Criteria**:
  - `useSpecialties(categorySlug?)`: Lista de especialidades
  - `useCategories()`: Lista de categorías
  - `useSpecialists(filters)`: Profesionales con filtros reactivos
  - `useSpecialist(id)`: Detalle de un profesional
  - Invalidación de cache apropiada
  - Estados `isLoading`, `error`, `data` manejados
- **Validation**:
  - Hooks funcionan en componentes
  - Cache reduce requests repetidos

---

## Sprint 3: Interfaz de Búsqueda Avanzada

**Goal**: Crear página de exploración con filtros visuales y UX premium
**Demo/Validation**:
- Navegar a `/explore` y usar todos los filtros
- Verificar que resultados se actualizan en tiempo real
- Probar en móvil y desktop

### Task 3.1: Crear layout de página explore

- **Location**: `app/explore/page.tsx`, `app/explore/layout.tsx`
- **Description**: Estructura base de la página de exploración
- **Dependencies**: Sprint 2 completo
- **Acceptance Criteria**:
  - Layout responsivo: sidebar de filtros en desktop, drawer en móvil
  - Header con breadcrumbs y contador de resultados
  - Grid de cards con toggle grid/list
  - Metadata SEO para página
- **Validation**:
  - Página renderiza sin errores
  - Layout responsivo funciona

### Task 3.2: Componente de filtro por categoría

- **Location**: `components/explore/category-filter.tsx`
- **Description**: Tabs o pills para seleccionar categoría principal
- **Dependencies**: Task 3.1
- **Acceptance Criteria**:
  - Mostrar 3 categorías principales con iconos
  - Estado activo visual claro
  - Opción "Todas" para quitar filtro
  - Actualizar URL con query params
- **Validation**:
  - Click cambia categoría y actualiza resultados
  - URL refleja estado

### Task 3.3: Componente de filtro por especialidad

- **Location**: `components/explore/specialty-filter.tsx`
- **Description**: Dropdown con autocompletado y agrupación
- **Dependencies**: Task 3.2
- **Acceptance Criteria**:
  - Combobox con búsqueda de texto
  - Agrupar por categoría en dropdown
  - Mostrar icono junto a cada especialidad
  - Multi-select opcional
  - Chips de especialidades seleccionadas
- **Validation**:
  - Búsqueda filtra opciones en tiempo real
  - Selección actualiza resultados

### Task 3.4: Componente de filtro por modalidad

- **Location**: `components/explore/modality-filter.tsx`
- **Description**: Toggle para consulta presencial vs telemedicina
- **Dependencies**: Task 3.1
- **Acceptance Criteria**:
  - Segmented control: "Todos", "Presencial", "Telemedicina"
  - Iconos distintivos (🏥, 💻)
  - Mantener estado en URL
- **Validation**:
  - Filtro funciona correctamente
  - Combina con otros filtros

### Task 3.5: Componente de filtro por disponibilidad

- **Location**: `components/explore/availability-filter.tsx`
- **Description**: Filtro "Disponible hoy" con lógica de horarios
- **Dependencies**: Task 3.1
- **Acceptance Criteria**:
  - Checkbox o switch "Disponibles ahora"
  - Considerar timezone del usuario
  - Lógica para parsear `availability` JSONB
  - Mostrar badge de "Disponible" en cards
- **Validation**:
  - Solo muestra profesionales con slots disponibles hoy
  - Timezone manejado correctamente

### Task 3.6: Componente de filtro por precio

- **Location**: `components/explore/price-filter.tsx`
- **Description**: Range slider dual para rango de precios
- **Dependencies**: Task 3.1
- **Acceptance Criteria**:
  - Slider con dos handles (min y max)
  - Mostrar valores en tiempo real
  - Input numérico alternativo
  - Rango basado en datos reales (min/max de DB)
  - Formato de moneda local
- **Validation**:
  - Slider actualiza resultados
  - Valores extremos no rompen UI

### Task 3.7: Integración de todos los filtros

- **Location**: `components/explore/filters-sidebar.tsx`
- **Description**: Sidebar que agrupa todos los filtros con estado compartido
- **Dependencies**: Tasks 3.2-3.6
- **Acceptance Criteria**:
  - Todos los filtros en un sidebar coherente
  - Botón "Limpiar filtros"
  - Estado sincronizado con URL (shareable links)
  - Contador de filtros activos
  - Versión móvil como sheet/drawer
- **Validation**:
  - Copiar URL con filtros y abrirla aplica los mismos filtros
  - Reset limpia todo

---

## Sprint 4: Cards de Especialistas y Animaciones

**Goal**: Crear tarjetas visuales atractivas con animaciones fluidas
**Demo/Validation**:
- Verificar animaciones de entrada suaves
- Skeleton loading visible durante fetch
- Cards interactivas con hover effects

### Task 4.1: Rediseñar SpecialistCard

- **Location**: `components/specialists/specialist-card.tsx`
- **Description**: Card moderna siguiendo diseño del prompt
- **Dependencies**: Sprint 3 completo
- **Acceptance Criteria**:
  - Foto de perfil con badge de verificado
  - Tags de especialidades (max 3 visibles + "+X más")
  - Rating con estrellas y número de reseñas
  - Precio de consulta visible
  - Modalidades disponibles (iconos)
  - Botón "Ver Perfil" y "Agendar Cita"
  - Hover effect sutil
  - Responsive: stack en móvil
- **Validation**:
  - Card renderiza todos los datos
  - Hover effects funcionan
  - Accesibilidad (teclado navegable)

### Task 4.2: Crear SpecialistCardSkeleton

- **Location**: `components/specialists/specialist-card-skeleton.tsx`
- **Description**: Skeleton loader que replica estructura de card
- **Dependencies**: Task 4.1
- **Acceptance Criteria**:
  - Mismo tamaño y proporción que card real
  - Animación de shimmer/pulse
  - Elementos correspondientes a cada parte de la card
- **Validation**:
  - Skeleton visible durante loading
  - Transición suave a card real

### Task 4.3: Grid de especialistas con animaciones

- **Location**: `components/specialists/specialists-grid.tsx`
- **Description**: Grid responsivo con Framer Motion
- **Dependencies**: Tasks 4.1, 4.2
- **Acceptance Criteria**:
  - Grid: 1 col móvil, 2 cols tablet, 3-4 cols desktop
  - Animación de entrada escalonada (staggered)
  - Animación al cambiar filtros (layout animation)
  - Infinite scroll o paginación con transición
  - Empty state animado
- **Validation**:
  - Animaciones fluidas a 60fps
  - No layout shift durante animaciones

### Task 4.4: Componente de contador de resultados animado

- **Location**: `components/explore/results-counter.tsx`
- **Description**: "Mostrando X de Y especialistas" con animación de número
- **Dependencies**: Task 4.3
- **Acceptance Criteria**:
  - Número animado al cambiar (count up/down)
  - Texto pluralizado correctamente
  - Incluir tiempo de búsqueda (opcional)
- **Validation**:
  - Número se anima suavemente al cambiar filtros

### Task 4.5: Implementar vista de mapa (opcional)

- **Location**: `components/explore/map-view.tsx`
- **Description**: Vista alternativa con mapa de profesionales
- **Dependencies**: Task 4.3
- **Acceptance Criteria**:
  - Integración con Mapbox o Google Maps
  - Clusters de profesionales
  - Popup con mini-card al hacer click
  - Sincronizar con filtros activos
- **Validation**:
  - Mapa renderiza correctamente
  - Interacciones funcionan

---

## Sprint 5: Migración y Compatibilidad

**Goal**: Migrar datos existentes y asegurar retrocompatibilidad
**Demo/Validation**:
- Profesionales existentes tienen especialidades asignadas
- Búsqueda legacy sigue funcionando
- No hay regresiones en funcionalidad existente

### Task 5.1: Script de migración de datos

- **Location**: `scripts/migrate-specialties.ts`
- **Description**: Asignar especialidades a profesionales existentes basado en campo `specialty` actual
- **Dependencies**: Sprint 4 completo
- **Acceptance Criteria**:
  - Mapear strings existentes a IDs de `specialties`
  - Crear registros en `professional_specialties`
  - Log de profesionales no mapeados
  - Modo dry-run para preview
  - Rollback automático en error
- **Validation**:
  - Ejecutar en entorno de staging
  - Verificar asignaciones correctas

### Task 5.2: Actualizar página de search existente

- **Location**: `app/search/page.tsx`
- **Description**: Integrar nuevos filtros en página existente o redirigir a `/explore`
- **Dependencies**: Task 5.1
- **Acceptance Criteria**:
  - Decidir: ¿mantener `/search` o redirigir a `/explore`?
  - Si mantener: adaptar a usar nueva API
  - Si redirigir: 301 redirect con mapeo de params
- **Validation**:
  - URLs existentes no se rompen
  - SEO preservado

### Task 5.3: Actualizar formularios de registro profesional

- **Location**: `components/auth/professional-registration.tsx` (o similar)
- **Description**: Usar nuevo selector de especialidades en registro
- **Dependencies**: Task 5.2
- **Acceptance Criteria**:
  - Dropdown de especialidades desde BD
  - Permitir múltiples especialidades
  - Marcar una como primaria
  - Validación: al menos una especialidad
- **Validation**:
  - Nuevo registro usa sistema nuevo
  - Datos se guardan correctamente

### Task 5.4: Actualizar dashboard de profesional

- **Location**: `app/dashboard/professional/page.tsx`, `components/dashboard/profile-edit.tsx`
- **Description**: Permitir editar especialidades desde dashboard
- **Dependencies**: Task 5.3
- **Acceptance Criteria**:
  - Sección "Mis Especialidades" editable
  - Añadir/remover especialidades
  - Marcar primaria
  - Subir certificaciones (opcional)
- **Validation**:
  - Cambios persisten en BD
  - UI refleja cambios inmediatamente

---

## Testing Strategy

### Por Sprint:
1. **Sprint 1**: Verificar tablas en Supabase Dashboard, ejecutar queries SQL
2. **Sprint 2**: Tests de API con Vitest, verificar respuestas JSON
3. **Sprint 3**: Tests de componentes con Testing Library, tests E2E con Playwright
4. **Sprint 4**: Tests de animaciones (visual regression), performance audits
5. **Sprint 5**: Tests de migración en staging, smoke tests de flujos existentes

### Tests Críticos:
- Crear profesional con múltiples especialidades
- Buscar por especialidad específica
- Filtrar por categoría + modalidad + precio
- Cambiar especialidad primaria
- Verificar que cards muestran datos correctos

---

## Potential Risks & Gotchas

### Performance
- **Riesgo**: Queries con JOINs múltiples pueden ser lentas
- **Mitigación**: Crear índices apropiados, usar funciones RPC con caché, considerar vistas materializadas

### Migración de datos
- **Riesgo**: Specialty strings existentes no mapean a nuevas especialidades
- **Mitigación**: Crear mapeo manual exhaustivo, flag de "necesita revisión" para casos ambiguos

### Internacionalización
- **Riesgo**: Nuevas especialidades sin traducción
- **Mitigación**: Requerir `name_es` y `name_en` en insert, usar fallback a español

### Escalabilidad
- **Riesgo**: Sistema no soporta nuevos tipos (veterinarios, laboratorios)
- **Mitigación**: Campo `category_type` para diferenciar, diseño modular desde inicio

### RLS Policies
- **Riesgo**: Políticas muy permisivas o muy restrictivas
- **Mitigación**: Policies explícitas por operación, tests de seguridad

---

## Rollback Plan

### Base de datos:
```sql
-- Revertir migraciones en orden inverso
DROP TABLE IF EXISTS professional_specialties CASCADE;
DROP TABLE IF EXISTS specialties CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
```

### Código:
- Mantener rama `feature/medical-taxonomy` separada
- No eliminar `specialty` TEXT de `professionals` hasta migración completa
- Feature flag para nuevos filtros: `NEXT_PUBLIC_NEW_SPECIALTY_SYSTEM=true`

---

## Catálogo de Especialidades Propuesto

### Medicina Especializada
| Especialidad | Slug | Icon |
|-------------|------|------|
| Cardiología | cardiologia | ❤️ |
| Dermatología | dermatologia | 🧴 |
| Pediatría | pediatria | 👶 |
| Ginecología y Obstetricia | ginecologia | 👩 |
| Psiquiatría | psiquiatria | 🧠 |
| Neurología | neurologia | 🧠 |
| Oftalmología | oftalmologia | 👁️ |
| Otorrinolaringología | otorrino | 👂 |
| Traumatología | traumatologia | 🦴 |
| Urología | urologia | 💧 |
| Gastroenterología | gastroenterologia | 🫃 |
| Neumología | neumologia | 🫁 |
| Endocrinología | endocrinologia | 🦋 |
| Reumatología | reumatologia | 🤲 |
| Nefrología | nefrologia | 🫘 |
| Hematología | hematologia | 🩸 |
| Oncología | oncologia | 🎗️ |
| Infectología | infectologia | 🦠 |
| Geriatría | geriatria | 👴 |
| Medicina Interna | medicina-interna | ⚕️ |
| Medicina General | medicina-general | 🩺 |
| Medicina Familiar | medicina-familiar | 👨‍👩‍👧 |
| Cirugía General | cirugia-general | 🔪 |
| Anestesiología | anestesiologia | 💉 |
| Medicina Deportiva | medicina-deportiva | ⚽ |

### Salud Integral y Bienestar
| Especialidad | Slug | Icon |
|-------------|------|------|
| Psicología | psicologia | 🧘 |
| Psicología Clínica | psicologia-clinica | 🛋️ |
| Neuropsicología | neuropsicologia | 🧠 |
| Nutrición | nutricion | 🥗 |
| Nutrición Deportiva | nutricion-deportiva | 💪 |
| Fisioterapia | fisioterapia | 🏃 |
| Kinesiología | kinesiologia | 🤸 |
| Odontología | odontologia | 🦷 |
| Ortodoncia | ortodoncia | 😁 |
| Endodoncia | endodoncia | 🦷 |
| Periodoncia | periodoncia | 🦷 |
| Fonoaudiología | fonoaudiologia | 🗣️ |
| Terapia Ocupacional | terapia-ocupacional | 🎨 |
| Matronería | matroneria | 🤰 |
| Enfermería | enfermeria | 💊 |
| Acupuntura | acupuntura | 📍 |
| Quiropraxia | quiropraxia | 🔙 |
| Podología | podologia | 🦶 |
| Optometría | optometria | 👓 |

### Servicios de Diagnóstico
| Especialidad | Slug | Icon |
|-------------|------|------|
| Radiología | radiologia | 📷 |
| Imagenología | imagenologia | 🖥️ |
| Patología | patologia | 🔬 |
| Genética Médica | genetica-medica | 🧬 |
| Laboratorio Clínico | laboratorio-clinico | 🧪 |
| Medicina Nuclear | medicina-nuclear | ☢️ |
| Anatomía Patológica | anatomia-patologica | 🔬 |

---

## Estado de Implementación

### ✅ Sprint 1: Infraestructura de Datos - COMPLETADO
- [x] Tipos TypeScript centralizados (`types/database.ts`, `types/specialists.ts`)
- [x] Migración para tabla `categories`
- [x] Migración para tabla `specialties`
- [x] Migración para añadir `specialty_id` a `professionals`
- [x] Seed de 120+ especialidades en 3 categorías
- [x] Funciones RPC de Supabase para búsquedas

### ✅ Sprint 2: API y Backend - COMPLETADO
- [x] API route `/api/categories`
- [x] API route `/api/specialties` y `/api/specialties/[slug]`
- [x] API route `/api/explore` con búsqueda avanzada
- [x] Hooks: `useCategories`, `useSpecialties`, `useSpecialists`

### ✅ Sprint 3: Interfaz de Búsqueda - COMPLETADO
- [x] Página `/explore` con layout responsivo
- [x] Componente `CategoryTabs`
- [x] Componente `SpecialtyCombobox`
- [x] Componente `ModalityFilter`
- [x] Componente `PriceRangeFilter`
- [x] Componente `AvailabilityToggle`
- [x] Componente `FiltersSidebar` con estado sincronizado a URL

### ✅ Sprint 4: Cards y Animaciones - COMPLETADO
- [x] `SpecialistCard` con badges de verificación y tags
- [x] `SpecialistCardSkeleton` con shimmer animation
- [x] `SpecialistsGrid` con Framer Motion
- [ ] Vista de mapa (cancelada, usar integración existente)

### ✅ Sprint 5: Migración y Compatibilidad - COMPLETADO
- [x] Script de migración `scripts/migrate-specialties.ts`
- [x] Componente `SpecialtySelector` para registro
- [x] Actualizado endpoint de onboarding para soportar `specialty_id`

## Archivos Creados

### Tipos
- `types/index.ts`
- `types/database.ts`
- `types/specialists.ts`

### Migraciones SQL
- `supabase/migrations/20260313_create_categories_table.sql`
- `supabase/migrations/20260313_create_specialties_table.sql`
- `supabase/migrations/20260313_add_specialty_id_to_professionals.sql`
- `supabase/migrations/20260313_create_specialty_functions.sql`
- `supabase/seeds/specialties-seed.sql`

### API Routes
- `app/api/categories/route.ts`
- `app/api/specialties/route.ts`
- `app/api/specialties/[slug]/route.ts`
- `app/api/explore/route.ts`

### Hooks
- `hooks/use-categories.ts`
- `hooks/use-specialties.ts`
- `hooks/use-specialists.ts`

### Componentes
- `components/explore/category-tabs.tsx`
- `components/explore/specialty-combobox.tsx`
- `components/explore/modality-filter.tsx`
- `components/explore/price-range-filter.tsx`
- `components/explore/availability-toggle.tsx`
- `components/explore/filters-sidebar.tsx`
- `components/explore/index.ts`
- `components/specialists/specialist-card.tsx`
- `components/specialists/specialist-card-skeleton.tsx`
- `components/specialists/specialists-grid.tsx`
- `components/specialists/index.ts`
- `components/professional/specialty-selector.tsx`

### Páginas
- `app/explore/layout.tsx`
- `app/explore/page.tsx`

### Scripts
- `scripts/migrate-specialties.ts`

## Próximos Pasos para Producción

1. **Ejecutar migraciones SQL** en Supabase Dashboard (en orden)
2. **Ejecutar seed de especialidades** 
3. **Ejecutar script de migración** de profesionales existentes
4. **Probar página `/explore`** en desarrollo
5. **Desplegar a producción**
