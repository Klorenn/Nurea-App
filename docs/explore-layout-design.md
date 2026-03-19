# Diseño: Pantalla Explorar Especialistas

Estilo de referencia: Doctoralia / Zocdoc — limpio, confiable, jerarquía clara.

---

## Desktop (≥1024px)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  NAVBAR: logo NUREA .app  |  Cómo Funciona  Para Profesionales  Precios  │ 🌐 ☀️ 👤  │
├─────────────────────────────────────────────────────────────────────────────┤
│  HERO (fondo suave, max-w-6xl mx-auto px-4)                                 │
│  • Título: "Explorar Especialistas" (text-2xl/3xl font-bold)                │
│  • Subtítulo: "Encuentra al profesional..." (text-muted)                    │
│                                                                              │
│  BÚSQUEDA (una fila, gap-3)                                                  │
│  [🔍 Buscar por nombre, especialidad o ubicación... ] [ Ciudad ] [ Buscar ]  │
│                                                                              │
│  CHIPS DE CATEGORÍA (scroll horizontal, gap-2)                              │
│  [ ✨ Todos ] [ ⚕️ Medicina General ] [ 🧘 Bienestar ] [ 🔬 Especialidades ]  │
│                                                                              │
│  FILTROS (una barra, flex wrap, alineados)                                   │
│  Especialidad: [ Select... ▼ ]   Modalidad: ( Todos | Telemedicina | Presencial )   │
│  [ ] Disponible hoy    [ ✓ ] Solo verificados    [ Limpiar filtros ]         │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│  CONTENIDO (max-w-6xl mx-auto, flex gap-8)                                  │
│                                                                              │
│  OPCIONAL: Sidebar filtros (w-64)  │  GRID DE CARDS                          │
│  (si se prefiere aside)            │  "Mostrando X de Y especialistas"  [⊞][≡][🗺] │
│                                    │  ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│                                    │  │ SpecialistCard │ SpecialistCard │ ...   │
│                                    │  └──────────┘ └──────────┘ └──────────┘  │
│                                    │  [ Anterior ]  Página 1 de N  [ Siguiente ]│
└─────────────────────────────────────────────────────────────────────────────┘
```

- **Jerarquía**: Navbar → Hero (título + búsqueda + chips) → Filtros → Resultados.
- **Grid**: 3 columnas (xl:grid-cols-3), gap-6, cards con mismo alto visual (flex, contenido distribuido).

---

## Mobile (< 768px)

```
┌─────────────────────────────────────┐
│  NAVBAR (logo + menú hamburguesa)     │
├─────────────────────────────────────┤
│  HERO                                │
│  Explorar Especialistas              │
│  Encuentra al profesional...        │
│                                      │
│  [ 🔍 Buscar...        ]             │
│  [ Ciudad ]  [ Buscar ]              │
│                                      │
│  CHIPS (scroll horizontal)           │
│  [ ✨ Todos ] [ ⚕️ ... ] [ 🧘 ... ]  │
│                                      │
│  [ 🔘 Filtros (2) ]  ← abre Sheet   │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  Mostrando 4 de 12    [ ⊞ ] [ ≡ ]   │
├─────────────────────────────────────┤
│  ┌─────────────────────────────────┐ │
│  │     SpecialistCard (stacked)    │ │
│  │  Foto | Nombre, especialidad    │ │
│  │  ★★★★☆ 5.0 · 10 reseñas        │ │
│  │  [Verificado] [Favorito]         │ │
│  │  Online · Presencial · 10 años  │ │
│  │  Desde $30.000                   │ │
│  │  [ Ver perfil ]  [ Agendar ]    │ │
│  └─────────────────────────────────┘ │
│  ┌─────────────────────────────────┐ │
│  │     ... más cards (1 columna)   │ │
│  └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

- **Una columna** para las cards; filtros en Sheet desde botón flotante o barra.
- **Chips** con scroll horizontal sin scrollbar visible (scrollbar-hide).

---

## SpecialistCard (estructura interna)

- **Arriba**: Badge “Disponible hoy” (si aplica) + foto (rounded-2xl) con badge Verificado (✓) en esquina.
- **Bloque nombre**: Nombre (font-semibold), especialidad (text-sm muted).
- **Rating**: Estrellas (★★★★☆) + número (5.0) + “X reseñas”. Badge “Favorito de los pacientes” si rating ≥ 4.8 y reseñas ≥ 5.
- **Tags**: Online | Presencial, “X años exp.” (icono opcional).
- **Ubicación** (si hay): icono + texto truncado.
- **Bio**: 2 líneas max (line-clamp-2), muted.
- **Pie**: “Consulta desde” + precio destacado (teal); botones “Ver perfil” (outline) y “Agendar” (primario).

---

## Filtros (barra superior)

- **Consistencia**: mismos border-radius (rounded-xl), altura similar (h-10/h-11), espaciado (gap-3/gap-4).
- **Especialidad**: select o combobox ancho controlado (min-w-[200px]).
- **Modalidad**: 3 botones tipo toggle (Todos | Telemedicina | Presencial), uno activo.
- **Checkboxes**: “Disponible hoy” y “Solo verificados” con mismo estilo (label + checkbox o toggle).
- **Limpiar**: link o botón ghost, solo visible si hay filtros activos.
