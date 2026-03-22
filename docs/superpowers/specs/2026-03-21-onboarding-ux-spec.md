# Especificación UX — Flujos de Onboarding de Nurea
**Fecha:** 2026-03-21
**Versión:** 1.0
**Autor:** UX Spec (generado para el equipo de desarrollo de Nurea)
**Scope:** Flujo de onboarding para `patient` y `professional` post-registro

---

## Índice

1. [Principios de Diseño](#1-principios-de-diseño)
2. [Onboarding Paciente (5 pasos)](#2-onboarding-paciente-5-pasos)
3. [Onboarding Profesional (6 pasos)](#3-onboarding-profesional-6-pasos)
4. [Patrones UX Comunes](#4-patrones-ux-comunes)
5. [Confianza y Cumplimiento Legal](#5-confianza-y-cumplimiento-legal)
6. [Criterios de Aceptación para QA](#6-criterios-de-aceptación-para-qa)

---

## 1. Principios de Diseño

### 1.1 Filosofía General

El onboarding médico tiene un umbral de abandono altísimo si se percibe como burocrático. El objetivo de Nurea es que el usuario sienta que está siendo **cuidado**, no procesado. Cada paso debe comunicar un beneficio claro para el usuario, no solo una necesidad de la plataforma.

Referentes analizados:
- **Doctoralia**: usa un asistente paso a paso con barra de progreso numérica clara, guarda automáticamente en cada paso, y explica con íconos el valor de cada dato.
- **Zocdoc**: aplica progressive disclosure agresiva — solo pide lo mínimo para activar la cuenta y expande el perfil en el tiempo de uso.
- **AgendaMedica.cl**: onboarding corto pero sin contexto de por qué pide los datos. Abandono alto en paso de RUT.

Nurea debe tomar lo mejor de Doctoralia (contexto y confianza) con la velocidad de Zocdoc (no abrumar) y superar a AgendaMedica en explicación de datos sensibles.

### 1.2 Principios Clave

**1. Un solo trabajo por pantalla**
Cada paso tiene exactamente un propósito cognitivo. No mezclar datos demográficos con datos médicos. No poner 8 campos en un step.

**2. Progressive disclosure con intención**
Los datos más sensibles (RUT, previsión, historial médico) se piden después de que el usuario ya tiene contexto y confianza establecida. No abrir con RUT.

**3. El "por qué" siempre visible**
Cada campo delicado lleva un microtexto de ayuda que explica el uso concreto. "¿Para qué necesitamos esto?" no debe ser una pregunta que el usuario tenga que hacerse.

**4. Skippable cuando es honesto serlo**
Si un campo realmente es opcional (alergias, medicamentos), hay que decirlo explícitamente con un CTA "Prefiero omitir". Falsa obligatoriedad destruye confianza.

**5. Guardado incremental — nunca se pierde trabajo**
Cada paso completado se persiste en Supabase inmediatamente. Si el usuario cierra el navegador y vuelve, retoma donde estaba. El campo `onboarding_completed` solo se marca `true` en el último paso.

**6. Mobile-first**
El 70% de pacientes chilenos accede desde móvil. Todos los layouts son de una columna en mobile, sin scroll horizontal, con botones de al menos 48px de alto.

**7. Señales de confianza médica en cada pantalla**
Lock icon + "Datos protegidos — Ley 19.628" en el footer. Avatar del sistema de salud. Logos de previsiones conocidas. Nunca mostrar los datos en URL visible.

### 1.3 Señales de Confianza por Contexto

| Tipo de Dato | Señal de Confianza |
|---|---|
| RUT / national_id | "Solo lo usamos para validar tu identidad. Nunca se comparte con terceros." |
| Previsión de salud | "Tu previsión no afecta tu acceso a Nurea. Es para que tu médico te conozca mejor." |
| Historial médico | "Esta información es privada. Solo tu médico tratante puede verla." |
| RNPI (profesionales) | "Lo verificamos para garantizar la seguridad de nuestros pacientes." |
| Precio de consulta | "Tú controlas tus tarifas. Puedes cambiarlas en cualquier momento." |

### 1.4 Tono de Escritura

- **Pacientes**: cálido, cercano, en segunda persona ("Tu salud, a tu ritmo").
- **Profesionales**: respeto profesional, lenguaje entre colegas ("Configura cómo quieres que Nurea te represente").
- Evitar tecnicismos innecesarios en flujo de paciente.
- Usar tecnicismos correctos en flujo de profesional (RNPI, especialidad, etc.).
- Sin exclamaciones vacías ("¡Excelente!"). Sí a reconocimientos genuinos ("Listo — ya casi terminamos.").

---

## 2. Onboarding Paciente (5 pasos)

### Estructura General

```
Bienvenida → Tu Perfil → Identificación & Previsión → Tu Salud → Tu Objetivo
   (1/5)        (2/5)              (3/5)                (4/5)         (5/5)
```

Ruta: `/onboarding/patient/[step]`
Guard: Si `onboarding_completed === true`, redirigir a `/dashboard`.
Persistencia: `PATCH /api/profiles` al presionar "Guardar y continuar" en cada paso.

---

### Paso 1 — Bienvenida (1/5)

**Propósito:** Establecer el tono emocional de la plataforma. Que el usuario sienta que registrarse valió la pena. Dar expectativas claras sobre lo que viene.

**Duración esperada de lectura:** 20–30 segundos.

**No hay campos en este paso** — es puramente orientativo.

#### Layout

```
[Ilustración: figura médica amigable con gradiente teal/emerald — Framer Motion fade-in]

Hola, [nombre_del_usuario] 👋

Bienvenido/a a Nurea.

En los próximos 3 minutos te pediremos algunos datos para
personalizar tu experiencia y conectarte con los mejores
especialistas de Chile.

¿Qué configuraremos?

  ✓ Tu perfil básico
  ✓ Tu identificación y previsión de salud
  ✓ Tu historial de salud (opcional)
  ✓ Qué tipo de atención buscas

[Botón primario: "Comenzar →"]
[Link texto: "Ya tengo cuenta, ir al inicio"]
```

#### Microcopy

- Título: `"Hola, [nombre]. Bienvenido/a a Nurea."`
- Subtítulo: `"Tu salud en buenas manos — empecemos."`
- CTA: `"Comenzar"`
- Nota inferior: `"Puedes completar esto en cualquier momento desde tu perfil."`

#### UX Notes

- El nombre del usuario se lee desde `profiles.full_name` (ya disponible post-registro).
- Si no hay nombre disponible, usar `"Hola"` sin nombre — no mostrar el email.
- La animación de entrada (Framer Motion) debe completarse en menos de 600ms. No bloquear el CTA.
- El checklist de 4 ítems prepara cognición: el usuario llega al paso 2 sabiendo qué esperar.
- NO mostrar el step indicator en este paso (rompe el flujo de bienvenida). El indicador aparece desde el paso 2.

#### Skip Logic

- No aplica. El botón "Comenzar" es el único CTA.

---

### Paso 2 — Tu Perfil (2/5)

**Propósito:** Recoger datos de identidad básicos no sensibles. El avatar genera apropiación emocional de la cuenta (referencia: Zocdoc aumenta retención en 23% con foto de perfil en onboarding).

**Campos:**

| Campo | Tipo | Columna DB | Obligatorio |
|---|---|---|---|
| Avatar / Foto de perfil | Upload de imagen | `avatar_url` | No (pero incentivado) |
| Teléfono | Tel input | `phone` | Sí |
| Género | Radio / select | `gender` ('M', 'F', 'other') | Sí |
| Fecha de nacimiento | Date picker | `date_of_birth` | Sí |

#### Layout

```
[Step indicator: ● ○ ○ ○ ○]   Paso 2 de 5

Tu Perfil

[Avatar upload — círculo grande, 120px]
[Ícono de cámara al hover]
"Agrega una foto (opcional)"
Subtexto: "Tu médico podrá reconocerte más fácilmente"

─────────────────────────────────────

Teléfono *
[+56] [9 XXXX XXXX]
"Para que tu médico pueda contactarte si necesita confirmar tu consulta"

─────────────────────────────────────

Género *
○ Masculino   ○ Femenino   ○ Prefiero no indicar

─────────────────────────────────────

Fecha de nacimiento *
[DD] / [MM] / [AAAA]
"Necesaria para calcular dosis y referencias por edad"

─────────────────────────────────────

[← Atrás]                [Guardar y continuar →]
```

#### Validaciones

- **Teléfono**: formato chileno `+56 9 XXXX XXXX`. Regex: `/^(\+56)?[\s]?9[\s]?\d{4}[\s]?\d{4}$/`. Mostrar error inline: `"Ingresa un número chileno válido, ej: 9 8765 4321"`
- **Fecha de nacimiento**: rango válido entre 1900 y (fecha actual - 1 año). Error si menor de 1 año o fecha futura: `"Ingresa una fecha válida"`
- **Género**: campo requerido, al menos una opción seleccionada.
- **Avatar**: solo JPG/PNG/WEBP, máximo 5MB. Si excede: `"La imagen debe pesar menos de 5MB"`. Upload a Supabase Storage, guardar URL en `avatar_url`.

#### Microcopy

- Encabezado: `"Cuéntanos un poco sobre ti"`
- Descripción: `"Estos datos ayudan a tus médicos a darte una atención más personalizada."`
- Placeholder teléfono: `"9 8765 4321"`
- Placeholder fecha: `"15 / 04 / 1990"`
- Helper text fecha: `"Necesaria para calcular dosis y referencias por edad"`

#### Skip Logic

- El avatar es skippable: mostrar `"Agregar después"` bajo el upload. Al hacer clic, el campo se ignora en el submit.
- Teléfono, género y fecha de nacimiento son **requeridos**. No hay skip.

#### UX Notes

- El input de teléfono debe tener prefijo `+56` no editable como decorador visual a la izquierda.
- El date picker en mobile debe usar 3 selects separados (DD / MM / AAAA) en lugar de un date picker nativo (mejor UX en iOS/Android).
- Al subir foto: preview inmediato con crop circular. No enviar al servidor hasta que se presione "Guardar y continuar".
- `"Guardar y continuar"` solo se habilita cuando los 3 campos requeridos están completos y válidos.

---

### Paso 3 — Identificación & Previsión (3/5)

**Propósito:** Recoger RUT y previsión de salud. Es el paso más sensible del flujo de paciente. Requiere el mayor esfuerzo de construcción de confianza.

**Campos:**

| Campo | Tipo | Columna DB | Obligatorio |
|---|---|---|---|
| RUT | Text input con formato | `national_id` | No (pero incentivado) |
| Previsión de salud | Select + campo condicional | `health_insurance` | No |

#### Layout

```
[Step indicator: ● ● ● ○ ○]   Paso 3 de 5

Identificación y Previsión

──────────── RUT ────────────

RUT (opcional)
[12.345.678-9]
"¿Para qué sirve?"  [ícono de info → tooltip]

Tooltip: "Tu RUT nos permite validar tu identidad en consultas
          bonificables por FONASA. Nunca se comparte con terceros."

Nota de seguridad: 🔒 "Datos protegidos — Ley 19.628"

──────────── Previsión ────────────

¿Cuál es tu previsión de salud? (opcional)

○ FONASA
    Si selecciona: [dropdown: Tramo A / B / C / D]
○ ISAPRE
    Si selecciona: [text input: nombre de la ISAPRE, ej: "Cruz Blanca"]
○ Particular / Sin previsión
○ Prefiero no indicar

"Tu previsión no afecta tu acceso a Nurea. Es para que tu médico
 te atienda con la información correcta."

──────────── ────────────

[← Atrás]          [Omitir este paso]     [Guardar y continuar →]
```

#### Validaciones

- **RUT**: validar con algoritmo de dígito verificador chileno estándar. Formatear automáticamente con puntos y guión al escribir (`12345678` → `12.345.678-9`).
  - Error: `"Este RUT no es válido. Revisa el formato: 12.345.678-9"`
  - Éxito: mostrar un checkmark verde inline.
- **FONASA tramo**: requerido si se selecciona FONASA.
- **ISAPRE nombre**: requerido si se selecciona ISAPRE. Mínimo 3 caracteres.
- **Guardado en DB**: concatenar tipo + detalle en `health_insurance`, ej: `"FONASA - Tramo B"`, `"ISAPRE - Cruz Blanca"`, `"Particular"`.

#### Microcopy

- Título: `"Identificación y Previsión"`
- Descripción: `"Esta información es completamente opcional. Si la añades, tu médico podrá darte una atención más precisa."`
- CTA skip: `"Omitir este paso"`
- CTA continuar: `"Guardar y continuar"`
- Tooltip RUT: `"Tu RUT nos permite validar tu identidad para consultas bonificables por FONASA o ISAPRE. Nunca se comparte con terceros ni se usa para otros fines."`
- Helper FONASA: `"El tramo determina tu copago en consultas bonificadas"`

#### Skip Logic

- Todo el paso es opcional. `"Omitir este paso"` salta al paso 4 sin guardar nada (los campos quedan `NULL` en DB).
- Si el usuario ingresó RUT inválido y presiona "Omitir", no validar — simplemente no guardar.
- Si el usuario ingresó RUT válido y presiona "Omitir", preguntar: `"¿Seguro? Tu RUT ya está validado, solo falta guardarlo."` con opciones "Guardar RUT y continuar" / "Sí, omitir".

#### UX Notes

- Este es el paso con mayor probabilidad de abandono. Medir con analytics (evento `onboarding_drop_step_3`).
- El formato del RUT debe autoapplicarse mientras el usuario escribe (no solo al perder foco). Usar librería `rut.js` o implementar el algoritmo de módulo 11.
- No mostrar el campo de previsión hasta que el usuario haya visto el texto introductorio (100ms delay con Framer Motion — simula que la página "respira").
- La opción `"Prefiero no indicar"` debe estar siempre visible para evitar presión.

---

### Paso 4 — Tu Salud (4/5)

**Propósito:** Recoger información médica básica que permite a los profesionales prepararse antes de la consulta. Todo es opcional y el usuario debe sentir control total.

**Campos:**

| Campo | Tipo | Columna DB | Obligatorio |
|---|---|---|---|
| Alergias | Textarea | `allergies` | No |
| Enfermedades crónicas | Textarea | `chronic_diseases` | No |
| Medicamentos actuales | Textarea | `current_medications` | No |

#### Layout

```
[Step indicator: ● ● ● ● ○]   Paso 4 de 5

Tu Salud

"Esta información es privada. Solo tú y tu médico tratante pueden verla."

🔒 Datos protegidos — Ley 19.628

──────────── ────────────

Alergias
[Textarea: placeholder "Ej: penicilina, mariscos, polen..."]
[Botón: "No tengo alergias conocidas"] ← al clic, rellena "Ninguna" y deshabilita textarea

──────────── ────────────

Enfermedades crónicas
[Textarea: placeholder "Ej: diabetes tipo 2, hipertensión arterial..."]
[Botón: "No tengo enfermedades crónicas"] ← mismo comportamiento

──────────── ────────────

Medicamentos actuales
[Textarea: placeholder "Ej: metformina 500mg, enalapril 10mg..."]
[Botón: "No tomo medicamentos actualmente"] ← mismo comportamiento

──────────── ────────────

[← Atrás]              [Prefiero omitir →]          [Guardar y continuar →]
```

#### Validaciones

- No hay validaciones de formato. Son campos de texto libre.
- Si el usuario presiona un botón de "No tengo..." el valor guardado en DB es la cadena `"Ninguna"` (no NULL — permite distinguir entre "no completó" y "completó con valor negativo").
- Máximo 1000 caracteres por campo. Contador visible desde los 800 caracteres: `"200 caracteres restantes"`.
- `"Guardar y continuar"` funciona aunque los 3 campos estén vacíos — se guardan como `NULL`.

#### Microcopy

- Título: `"Tu historial de salud"`
- Descripción: `"Completar esta información es opcional. Si lo haces, tu médico llegará a la consulta mejor preparado para ayudarte."`
- CTA skip: `"Prefiero omitir"`
- CTA continuar: `"Guardar y continuar"`
- Nota de privacidad: `"Esta información es privada. Solo tu médico tratante puede verla durante una consulta activa."`
- Botones negativos: `"No tengo alergias conocidas"` / `"No tengo enfermedades crónicas"` / `"No tomo medicamentos actualmente"`

#### Skip Logic

- `"Prefiero omitir"` salta directamente al paso 5. Ningún campo se guarda (permanecen `NULL`).
- Los 3 campos son independientes: el usuario puede llenar solo uno y dejar los otros vacíos o usar los botones de negación.
- Si `"Prefiero omitir"` se presiona y algún campo tiene contenido, mostrar: `"¿Deseas guardar lo que ya escribiste antes de continuar?"` con `"Sí, guardar"` / `"Omitir de todas formas"`.

#### UX Notes

- El diseño visual de este paso debe transmitir privacidad: fondo levemente diferenciado (gris muy tenue o borde izquierdo teal), ícono de candado visible.
- Los botones de negación (`"No tengo alergias..."`) deben ser de estilo `ghost` o `outline` — no el mismo peso visual que el CTA principal. Al activarse, cambiar a estado `checked` (borde teal, checkmark).
- Al activar un botón de negación, la textarea se deshabilita visualmente (opacity 0.5) pero no desaparece, para que el usuario pueda deshacer.
- Considerar un tooltip global: `"¿Por qué nos pides esto?"` → `"Tu médico puede revisar esta información antes de tu consulta para llegar más preparado. Nunca se comparte sin tu consentimiento."`

---

### Paso 5 — Tu Objetivo en Nurea (5/5)

**Propósito:** Personalización final y celebración de completar el onboarding. El `patient_goal` permite mostrar contenido relevante en el dashboard y priorizar búsquedas de especialistas.

**Campos:**

| Campo | Tipo | Columna DB | Obligatorio |
|---|---|---|---|
| Objetivo de consulta | Select / cards | `patient_goal` | Sí |

**Opciones de `patient_goal`:**

| Valor en DB | Etiqueta UI | Ícono sugerido |
|---|---|---|
| `medico_general` | Médico general | 🩺 |
| `salud_mental` | Salud mental | 🧠 |
| `cronica` | Control de enfermedad crónica | ❤️ |
| `segunda_opinion` | Segunda opinión médica | 💬 |
| `nutricion` | Nutrición y bienestar | 🥗 |
| `otro` | Otro | ✨ |

#### Layout

```
[Step indicator: ● ● ● ● ●]   Paso 5 de 5

¿Qué tipo de atención estás buscando?

"Esto nos ayuda a mostrarte los especialistas más relevantes para ti."

[Card grid 2x3 — mobile: 1 columna, tablet/desktop: 2-3 columnas]

┌─────────────────┐  ┌─────────────────┐
│  🩺             │  │  🧠             │
│  Médico general │  │  Salud mental   │
└─────────────────┘  └─────────────────┘
┌─────────────────┐  ┌─────────────────┐
│  ❤️             │  │  💬             │
│  Control de     │  │  Segunda        │
│  enf. crónica   │  │  opinión        │
└─────────────────┘  └─────────────────┘
┌─────────────────┐  ┌─────────────────┐
│  🥗             │  │  ✨             │
│  Nutrición y    │  │  Otro           │
│  bienestar      │  └─────────────────┘
└─────────────────┘

─────────── Al seleccionar una opción ───────────

[← Atrás]                  [Comenzar en Nurea →]

═══════════════════════════════════════════════
ESTADO POST-COMPLETAR — mostrar en overlay/modal
═══════════════════════════════════════════════

✅ ¡Todo listo, [nombre]!

Tu perfil está completo. Ahora puedes:

  → Buscar especialistas en Chile
  → Agendar tu primera consulta
  → Consultar con Nura, tu asistente de salud

[Botón primario: "Ir a mi dashboard"]
```

#### Validaciones

- La selección es **requerida**. El botón `"Comenzar en Nurea"` se mantiene deshabilitado hasta que se seleccione una card.
- Al seleccionar: estado visual de la card seleccionada (borde teal, fondo teal/10, checkmark).
- Al presionar `"Comenzar en Nurea"`: guardar `patient_goal` + marcar `onboarding_completed = true` en una sola llamada a la API. Redirigir a `/dashboard`.

#### Microcopy

- Título: `"¿Qué tipo de atención estás buscando?"`
- Descripción: `"Esto nos ayuda a encontrar los especialistas más relevantes para ti. Puedes cambiarlo después."`
- CTA final: `"Comenzar en Nurea"`
- Mensaje de celebración: `"¡Todo listo, [nombre]! Tu perfil está completo."`
- Nota: `"Puedes actualizar tus preferencias en cualquier momento desde tu perfil."`

#### Skip Logic

- No hay skip en este paso. Es el último y la selección es requerida (es la acción que activa el dashboard personalizado).
- Si el usuario llega sin haber completado pasos anteriores (URL directa), redirigir al primer paso incompleto.

#### UX Notes

- La celebración final debe tener una microanimación (Framer Motion: confetti suave o particles teal/emerald, no intrusivo). Duración máxima: 2 segundos.
- El overlay de celebración reemplaza las cards — no es un modal encima del formulario.
- `onboarding_completed = true` se escribe **solo** en este momento (paso 5 completado). Nunca antes.
- Después de redirigir al dashboard, el RouteGuard no debe volver a mostrar el onboarding.

---

## 3. Onboarding Profesional (6 pasos)

### Estructura General

```
Bienvenida → Tu Presentación → Tus Credenciales → Tu Perfil Público → Tu Consulta → Finalizar
   (1/6)          (2/6)              (3/6)               (4/6)           (5/6)         (6/6)
```

Ruta: `/onboarding/professional/[step]`
Guard: Si `onboarding_completed === true`, redirigir a `/dashboard/professional`.
Persistencia: `PATCH /api/professionals` al presionar "Guardar y continuar" en cada paso.
Nota: El perfil profesional queda en estado `verification_status = 'pending'` hasta revisión manual. Esto se comunica explícitamente en el paso 6.

---

### Paso 1 — Bienvenida Profesional (1/6)

**Propósito:** Enmarcar Nurea como una plataforma que trabaja **para** el profesional, no solo que lo registra. Mostrar el valor concreto: pacientes, visibilidad, herramientas de IA. Preparar expectativas sobre los 6 pasos.

**No hay campos en este paso.**

#### Layout

```
[Ilustración: dashboard médico / red de conexión — gradiente teal/emerald]

Hola, Dr./Dra. [nombre] 👋

Nurea conecta tus servicios con pacientes que te necesitan.

En los próximos 5 minutos configuraremos tu perfil profesional
para que puedas comenzar a recibir consultas.

¿Qué configuraremos?

  ✓ Tu foto y datos de contacto
  ✓ Tu especialidad y número de registro (RNPI)
  ✓ Tu bio y presentación pública
  ✓ Tus modalidades de consulta y tarifas
  ✓ Cómo quieres que Nura IA te represente

[Botón primario: "Configurar mi perfil →"]
[Link texto: "Completar más tarde"]
```

#### Microcopy

- Título: `"Hola, Dr./Dra. [nombre]. Bienvenido/a a Nurea."`
- Subtítulo: `"Tu plataforma para atender pacientes online y presencialmente en Chile."`
- CTA: `"Configurar mi perfil"`
- CTA secundario: `"Completar más tarde"` — este link cierra el onboarding y lleva al dashboard con un banner persistente `"Completa tu perfil para aparecer en búsquedas"`.

#### UX Notes

- Usar `"Dr."` / `"Dra."` basado en `profiles.gender`. Si no hay género, usar `"Dr./Dra."`.
- El checklist de 5 ítems es más largo que en pacientes — esto es intencional. Los profesionales necesitan saber la inversión de tiempo antes de empezar.
- El link `"Completar más tarde"` debe ser claramente secundario (estilo `ghost`, color gris). Los profesionales con perfil incompleto no aparecen en búsquedas — comunicar esto sutilmente en la pantalla: `"Tu perfil no será visible para pacientes hasta que lo completes."`.

---

### Paso 2 — Tu Presentación (2/6)

**Propósito:** Avatar (obligatorio para profesionales — señal de confianza crítica), teléfono de contacto y género. El avatar es lo primero que ven los pacientes en los resultados de búsqueda.

**Campos:**

| Campo | Tipo | Columna DB | Obligatorio |
|---|---|---|---|
| Foto de perfil profesional | Upload de imagen | `avatar_url` (profiles) | **Sí** |
| Teléfono | Tel input | `phone` (profiles) | Sí |
| Género | Radio | `gender` (profiles) | Sí |

#### Layout

```
[Step indicator: ● ○ ○ ○ ○ ○]   Paso 2 de 6

Tu Presentación

"Tu foto es lo primero que ven los pacientes. Los perfiles con foto
reciben un 3x más de consultas."

[Avatar upload — círculo grande, 140px, borde teal]
[Ícono de cámara obligatorio]
"Foto de perfil *"
Subtexto: "Usa una foto profesional con fondo claro"
Si no hay foto y se intenta continuar → error: "La foto es obligatoria para tu perfil profesional"

─────────────────────────────────────

Teléfono de contacto *
[+56] [9 XXXX XXXX]
"Para coordinación interna de Nurea — no se muestra a pacientes"

─────────────────────────────────────

Género *
○ Masculino   ○ Femenino   ○ Prefiero no indicar

─────────────────────────────────────

[← Atrás]                [Guardar y continuar →]
```

#### Validaciones

- **Avatar**: obligatorio. Si no se sube, el botón `"Guardar y continuar"` muestra un error inline arriba del upload: `"Agrega una foto para continuar — es esencial para la confianza de tus pacientes."` El botón no se deshabilita, pero sí valida al intentar avanzar.
- **Foto**: JPG/PNG/WEBP, máximo 8MB (más permisivo que pacientes — fotos profesionales pueden ser más pesadas). Recomendación: `"Imagen cuadrada de al menos 400x400px"`.
- **Teléfono**: mismo regex que paciente. `+56 9 XXXX XXXX`.
- **Género**: requerido.

#### Microcopy

- Encabezado: `"Tu presentación profesional"`
- Descripción: `"Tu foto y datos de contacto son la base de tu perfil en Nurea."`
- Helper foto: `"Usa una foto profesional con fondo claro o neutro. Sin filtros."`
- Helper teléfono: `"Este número es solo para coordinación con Nurea. No se muestra a los pacientes."`

#### UX Notes

- A diferencia del flujo de paciente, la foto **no tiene opción de skip**. El copy explica el por qué con un dato concreto ("3x más consultas") para reducir fricción.
- Crop tool: al subir, mostrar un crop circular interactivo (librería como `react-easy-crop`) para que el profesional encuadre su foto correctamente.
- El dato del teléfono se aclara que es interno — esto es importante porque muchos profesionales son sensibles a que su número personal sea visible.

---

### Paso 3 — Tus Credenciales (3/6)

**Propósito:** Verificación profesional. El RNPI es el elemento central de confianza de la plataforma. Este paso establece que Nurea verifica a sus profesionales.

**Campos:**

| Campo | Tipo | Columna DB | Obligatorio |
|---|---|---|---|
| Especialidad | Searchable dropdown | `specialty_id` (FK) | Sí |
| RNPI | Text input | `registration_number` | Sí |
| Años de experiencia | Number input | `years_experience` | Sí |

#### Layout

```
[Step indicator: ● ● ● ○ ○ ○ ○]   Paso 3 de 6

Tus Credenciales

"Verificamos tus credenciales para garantizar la seguridad
de nuestros pacientes. Solo toma un momento."

──────────── Especialidad ────────────

Especialidad médica *
[Searchable dropdown: "Busca tu especialidad..."]
Ejemplos visibles: Medicina General, Cardiología, Psicología,
                   Nutrición y Dietética, Dermatología...

──────────── RNPI ────────────

Número de Registro (RNPI) *
[Input: placeholder "Ej: 123456"]

ℹ️ "¿Dónde encuentro mi RNPI?"
→ Tooltip/expandable: "Lo encuentras en tu certificado de la
  Superintendencia de Salud o en el Registro Nacional de
  Prestadores Individuales (rnpi.superdesalud.gob.cl)"

[Link externo: "Ir al registro RNPI ↗"]

──────────── Experiencia ────────────

Años de experiencia *
[Number input: min 0, max 50, stepper +/-]
"Incluye años de residencia y formación especializada si aplica"

──────────── ────────────

[← Atrás]                [Guardar y continuar →]
```

#### Validaciones

- **Especialidad**: campo requerido. El dropdown debe ser searchable con debounce de 300ms para buscar en la tabla `specialties` de Supabase. Si no encuentra: `"¿No encuentras tu especialidad? Escríbenos a soporte@nurea.cl"`.
- **RNPI**: formato numérico, entre 4 y 8 dígitos. No validar existencia en base de datos (eso es parte de la revisión manual posterior). Error: `"El RNPI debe contener solo números (ej: 123456)"`.
- **Años de experiencia**: entero entre 0 y 50. Si escribe 0: `"Si eres recién egresado, 0 años es válido."` (mensaje de apoyo, no error).

#### Microcopy

- Título: `"Tus Credenciales"`
- Descripción: `"Esta información es revisada por el equipo de Nurea antes de activar tu perfil. Es un proceso rápido."`
- RNPI tooltip: `"Lo encuentras en tu certificado emitido por la Superintendencia de Salud, o buscando tu RUT en rnpi.superdesalud.gob.cl"`
- Nota de verificación: `"Tu RNPI será verificado antes de que tu perfil sea visible para pacientes."`
- Helper experiencia: `"Incluye residencia y formación especializada si corresponde."`

#### UX Notes

- El link al RNPI debe abrir en nueva pestaña (`target="_blank"`) con `rel="noopener noreferrer"`.
- El dropdown de especialidades debe cargar con las 10 más comunes prelistadas antes de que el usuario escriba (reduce tiempo de interacción).
- Especialidades sugeridas para precargar: Medicina General, Psicología, Nutrición, Cardiología, Dermatología, Ginecología, Pediatría, Traumatología, Otorrinolaringología, Oftalmología.
- No marcar el RNPI como "verificado" en este paso — eso es parte del proceso post-onboarding.

---

### Paso 4 — Tu Perfil Público (4/6)

**Propósito:** Construir la presentación pública del profesional. La bio y el slogan son lo que los pacientes leen en la ficha del médico. Ayudar al profesional a escribir bien estos campos.

**Campos:**

| Campo | Tipo | Columna DB | Obligatorio |
|---|---|---|---|
| Bio profesional | Textarea | `bio` | Sí (mín. 100 chars) |
| Slogan profesional | Text input | `professional_slogan` | No (máx. 80 chars) |

#### Layout

```
[Step indicator: ● ● ● ● ○ ○]   Paso 4 de 6

Tu Perfil Público

"Esto es lo que ven los pacientes cuando encuentran tu perfil.
Sé auténtico/a — los pacientes valoran la cercanía."

──────────── Bio ────────────

Presentación profesional *
[Textarea, 6 líneas]

Placeholder (rotar entre ejemplos):
"Ej: 'Soy médico internista con 12 años de experiencia en el sistema
público y privado. Me especializo en enfermedades metabólicas y
atención de adultos mayores. Mi enfoque es la medicina preventiva
y el trato cercano con mis pacientes...'"

[Contador: "142 / 1000 caracteres" — en rojo si < 100, en verde si ≥ 100]
Error inline: "Tu presentación debe tener al menos 100 caracteres"

──────────── Slogan ────────────

Tagline (opcional)
[Text input, max 80 chars]
Placeholder: "Ej: 'Salud mental sin listas de espera'"
[Contador: "32 / 80 caracteres"]
"Aparece bajo tu nombre en los resultados de búsqueda"

──────────── Preview ────────────

[Vista previa en tiempo real — card médico simplificada]
┌───────────────────────────────────────┐
│ [Avatar]  Dr./Dra. [nombre]          │
│           [Especialidad]              │
│           [Slogan — si existe]        │
│                                       │
│  "[Primeros 120 chars de la bio]..."  │
└───────────────────────────────────────┘

──────────── ────────────

[← Atrás]                [Guardar y continuar →]
```

#### Validaciones

- **Bio**: mínimo 100 caracteres, máximo 1000 caracteres. Contador en tiempo real. Color del contador: rojo si < 100 caracteres, gris-neutro entre 100 y 900, ámbar sobre 900, rojo sobre 1000 (bloqueado).
- **Slogan**: máximo 80 caracteres. Sin mínimo. Si excede 80: no permitir escribir más (input bloqueado).
- `"Guardar y continuar"` deshabilitado si bio < 100 caracteres.

#### Microcopy

- Título: `"Tu Perfil Público"`
- Descripción: `"Esta es tu carta de presentación ante los pacientes. Una bio completa genera más consultas."`
- Label bio: `"Presentación profesional *"`
- Helper bio: `"Cuéntale a los pacientes quién eres, tu enfoque y qué tipo de atención ofreces. Mínimo 100 caracteres."`
- Label slogan: `"Tagline (opcional)"`
- Helper slogan: `"Una frase corta que aparece en los resultados de búsqueda. Máx. 80 caracteres."`

#### UX Notes

- La vista previa en tiempo real es el elemento diferenciador de este paso. Mostrar cómo se ve el perfil mientras el profesional escribe genera apropiación y motiva a completar la bio con calidad.
- El placeholder de la bio debe ser un ejemplo real y completo, no solo "Escribe tu presentación...". Los ejemplos reducen el blank-page anxiety.
- Si el profesional abandona con menos de 100 caracteres y vuelve, recuperar el borrador desde DB (guardado parcial).
- El preview card usa `avatar_url` del paso anterior — si no hay foto, mostrar placeholder con las iniciales.

---

### Paso 5 — Tu Consulta (5/6)

**Propósito:** Configurar la modalidad de atención y precios. Es la decisión comercial más importante del onboarding. Usar cards visuales para simplificar la elección.

**Campos:**

| Campo | Tipo | Columna DB | Obligatorio | Condición |
|---|---|---|---|---|
| Tipo de consulta | Cards visuales | `consultation_type` | Sí | Siempre |
| Precio online | Number input (CLP) | `online_price` | Sí si online/ambas | Si `online` o `both` |
| Precio presencial | Number input (CLP) | `in_person_price` | Sí si presencial/ambas | Si `in_person` o `both` |
| Dirección clínica | Text input | `clinic_address` | Sí si presencial/ambas | Si `in_person` o `both` |

#### Layout

```
[Step indicator: ● ● ● ● ● ○]   Paso 5 de 6

Tu Consulta

"Tú controlas cómo y cuánto cobras. Puedes cambiar tus tarifas
en cualquier momento desde tu dashboard."

──────────── Modalidad ────────────

¿Cómo ofreces tus consultas? *

┌────────────────┐  ┌────────────────┐  ┌────────────────┐
│     💻         │  │     🏥         │  │     🔄         │
│    Online      │  │  Presencial    │  │     Ambas      │
│                │  │                │  │                │
│  Videollamada  │  │  En tu clínica │  │  Ofrece las    │
│  desde Nurea   │  │  u oficina     │  │  dos opciones  │
└────────────────┘  └────────────────┘  └────────────────┘

──────────── Condicional: si Online o Ambas ────────────

Precio consulta online *
[CLP] [Input numérico, placeholder "25000"]
"Precio en pesos chilenos (CLP)"
Referencia: "El promedio en Nurea es $22.000 – $35.000 CLP"

──────────── Condicional: si Presencial o Ambas ────────────

Precio consulta presencial *
[CLP] [Input numérico, placeholder "30000"]

Dirección de tu consulta *
[Text input: "Ej: Av. Apoquindo 4500, Of. 701, Las Condes, Santiago"]

──────────── ────────────

[← Atrás]                [Guardar y continuar →]
```

#### Validaciones

- **Tipo de consulta**: requerido. El botón "Guardar y continuar" no se habilita sin selección.
- **Precios**: enteros positivos, mínimo $1.000 CLP, máximo $500.000 CLP. Error si fuera de rango: `"Ingresa un precio válido entre $1.000 y $500.000 CLP"`.
- **Dirección**: mínimo 10 caracteres si `consultation_type` es `in_person` o `both`. No validar dirección real (es texto libre).
- Los campos condicionales aparecen con animación suave (Framer Motion `AnimatePresence`) al seleccionar la modalidad.

#### Microcopy

- Título: `"Tu Consulta"`
- Descripción: `"Configura cómo quieres atender a tus pacientes. Puedes cambiar esto cuando quieras."`
- Referencia de precio: `"El rango promedio en Nurea para tu especialidad es $22.000 – $45.000 CLP"` (mostrar rango dinámico si existe data de la especialidad seleccionada).
- Helper dirección: `"Incluye número de oficina o piso para que los pacientes lleguen fácilmente."`
- Nota: `"Nurea cobra una comisión por consulta completada. Revisa los términos en nurea.cl/terminos"`

#### UX Notes

- Las 3 cards de modalidad deben ser igualmente prominentes — sin sugerir cuál es mejor. Nurea no debe sesgar esta decisión.
- El precio de referencia de rango reduce la incertidumbre y el abandono en este campo. Si hay data disponible por especialidad, usarla.
- Los campos condicionales no deben empujar el layout de forma abrupta — usar altura animada para que la aparición sea fluida.
- `"Guardar y continuar"` aplica validación a todos los campos visibles, no a los ocultos.

---

### Paso 6 — Finalizar (6/6)

**Propósito:** Configurar la personalidad de la IA de Nurea (Nura) que represente al profesional. Código de referido (opcional). Cierre con celebración y comunicar el proceso de verificación.

**Campos:**

| Campo | Tipo | Columna DB | Obligatorio |
|---|---|---|---|
| Tono de IA | Cards visuales | `nura_ai_tone` | Sí |
| Código de referido | Text input | `referral_code_used` | No |

**Opciones de `nura_ai_tone`:**

| Valor DB | Etiqueta | Descripción para el profesional |
|---|---|---|
| `formal` | Formal | "Nura se comunica con rigor técnico y distancia profesional" |
| `empatico` | Empático | "Nura prioriza el bienestar emocional y la calidez en cada mensaje" |
| `cientifico` | Científico | "Nura basa sus respuestas en evidencia y referencias bibliográficas" |
| `cercano` | Cercano | "Nura habla con naturalidad, como un colega de confianza" |

#### Layout

```
[Step indicator: ● ● ● ● ● ●]   Paso 6 de 6

Finalizar tu perfil

──────────── Tono de Nura IA ────────────

¿Cómo quieres que Nura te represente ante tus pacientes? *

"Nura es el asistente de IA que responde preguntas básicas de tus
pacientes en tu nombre, fuera de tu horario de atención."

┌─────────────────────┐  ┌─────────────────────┐
│     📋 Formal       │  │   ❤️ Empático        │
│                     │  │                     │
│  "Según la          │  │  "Entiendo que       │
│  evidencia clínica  │  │  esto puede ser      │
│  disponible..."     │  │  preocupante..."     │
└─────────────────────┘  └─────────────────────┘
┌─────────────────────┐  ┌─────────────────────┐
│  🔬 Científico      │  │  😊 Cercano          │
│                     │  │                     │
│  "El meta-análisis  │  │  "Mira, lo que       │
│  de 2023 indica..." │  │  generalmente        │
│                     │  │  ocurre es..."       │
└─────────────────────┘  └─────────────────────┘

──────────── Código de referido ────────────

¿Tienes un código de referido? (opcional)
[Text input: "NUREA-XXXXX"]
"Si un colega te invitó a Nurea, ingresa su código para activar
 beneficios para ambos."

──────────── ────────────

[← Atrás]           [Completar mi perfil →]

═══════════════════════════════════════════════════
POST-COMPLETAR — overlay o página de confirmación
═══════════════════════════════════════════════════

✅  ¡Tu perfil está configurado, Dr./Dra. [nombre]!

┌─────────────────────────────────────────────────┐
│  🔍  Tu perfil está bajo revisión               │
│                                                 │
│  El equipo de Nurea verificará tus credenciales │
│  en un plazo de 24–48 horas hábiles.            │
│                                                 │
│  Te avisaremos por email a [email] cuando       │
│  tu perfil esté activo y visible para pacientes.│
└─────────────────────────────────────────────────┘

Mientras tanto puedes:
→ Explorar tu dashboard
→ Configurar tu disponibilidad
→ Revisar tu perfil público (modo preview)

[Botón primario: "Ir a mi dashboard"]
```

#### Validaciones

- **Tono de IA**: requerido. Sin selección, `"Completar mi perfil"` no avanza.
- **Código de referido**: si se ingresa, validar formato `NUREA-XXXXX` con regex `/^NUREA-[A-Z0-9]{5,10}$/i`. Si formato inválido: `"El código no tiene el formato correcto. Ej: NUREA-ABC12"`. Si formato válido, guardar en `referral_code_used` (verificación real en backend, no en cliente).
- Al presionar `"Completar mi perfil"`: guardar todos los campos + marcar `onboarding_completed = true` en `profiles` + fijar `verification_status = 'pending'` en `professionals`.

#### Microcopy

- Título: `"Últimos detalles"`
- Descripción tono: `"Nura responde preguntas básicas de tus pacientes en tu nombre. Elige el estilo que mejor te representa."`
- Label tono: `"¿Cómo quieres que Nura te represente? *"`
- Nota tono: `"Puedes cambiarlo en cualquier momento desde tu configuración."`
- Label referido: `"Código de referido (opcional)"`
- CTA final: `"Completar mi perfil"`
- Título confirmación: `"¡Tu perfil está configurado!"`
- Mensaje verificación: `"Revisaremos tus credenciales en 24–48 horas hábiles y te notificaremos por email."`

#### UX Notes

- Las 4 cards de tono deben incluir un ejemplo de frase real (como se muestra en el layout) — no solo el nombre del tono. Esto permite al profesional elegir con información concreta.
- El mensaje de `"perfil bajo revisión"` es crítico: evita que el profesional se frustre al no ver su perfil activo inmediatamente. Debe ser claro, con plazos concretos.
- `verification_status` en DB puede tener valores: `'pending'` | `'approved'` | `'rejected'`. El onboarding siempre termina en `'pending'`.
- La microanimación de celebración debe ser más sobria que la de pacientes — el contexto es profesional. Un checkmark animado con confetti teal muy sutil es apropiado.
- Si se ingresa código de referido válido, mostrar un badge `"¡Código aplicado!"` inline antes de continuar.

---

## 4. Patrones UX Comunes

### 4.1 Step Indicator

```
Paciente (5 pasos):
○ ─── ○ ─── ○ ─── ○ ─── ○
Paso 1 de 5

Profesional (6 pasos):
○ ─── ○ ─── ○ ─── ○ ─── ○ ─── ○
Paso 2 de 6
```

**Comportamiento:**
- Dots rellenos (teal) = completados
- Dot con borde teal = actual
- Dots vacíos = pendientes
- No clickeable (no permite saltar pasos) — la progresión es lineal
- En mobile (< 640px): mostrar solo `"Paso X de Y"` en texto, sin dots (ahorra espacio)
- El step indicator no aparece en el Paso 1 (Bienvenida) de ningún flujo

**Implementación sugerida:**
```tsx
// Componente: <OnboardingStepIndicator currentStep={2} totalSteps={5} />
// Mostrar en el header de cada step card, debajo del título
```

### 4.2 Navegación Back/Next

**Botones:**
- `"← Atrás"`: siempre presente desde el paso 2. Estilo `ghost` o `outline`. Al hacer clic, no guarda el paso actual — solo navega atrás.
- `"Guardar y continuar →"`: botón primario (teal/emerald). Ejecuta validación + llamada a API + navegación al siguiente paso. Mostrar estado de loading spinner mientras procesa.
- `"Omitir este paso"` / `"Prefiero omitir"` / `"Completar después"`: enlace de texto (no botón). Color gris. Solo en pasos marcados como opcionales.

**Layout de navegación (mobile-first):**
```
Mobile: botones en columna, Guardar primero, Atrás debajo
Desktop: botones en fila, Atrás a la izquierda, Guardar a la derecha
```

**Estados del botón primario:**
- Default: teal sólido, texto blanco
- Hover: teal oscuro (10% más oscuro)
- Loading: spinner blanco, texto `"Guardando..."`, deshabilitado
- Error de API: toast de error + botón vuelve a default
- Deshabilitado (validación): gris, cursor not-allowed, tooltip `"Completa los campos requeridos"`

### 4.3 Persistencia y Guardado

**Estrategia:** Guardado por paso, no en tiempo real (evita llamadas excesivas a la API).

```
Al presionar "Guardar y continuar":
1. Validar campos del paso actual (client-side)
2. Si inválido → mostrar errores inline, no avanzar
3. Si válido → PATCH /api/profiles o /api/professionals con los campos del paso
4. Si API error → toast de error, no avanzar, mantener datos en el form
5. Si API success → navegar al siguiente step (URL)
```

**Recuperación de sesión:**
- Al cargar el onboarding, consultar el estado actual de `profiles` y `professionals` en DB
- Pre-llenar los campos con datos existentes
- Determinar el `currentStep` basado en qué campos están completos
- Si `onboarding_completed === true`, redirigir a `/dashboard` inmediatamente

**Nota técnica:** Almacenar el `currentStep` en `localStorage` como respaldo para casos edge. La fuente de verdad siempre es Supabase.

### 4.4 Validación Inline

```
Estado de campo — secuencia de interacción:
1. Focus inicial: sin estado visual (neutral)
2. Escribiendo: sin estado (no validar mid-typing, excepto formateo)
3. Blur (pierde foco): validar → mostrar error o success
4. Submit con error: todos los campos inválidos muestran error simultáneamente
```

**Error inline:**
```
[Campo con borde rojo]
⚠ "Mensaje de error específico y accionable"
```

**Success inline (solo para campos que lo ameritan: RUT, RNPI):**
```
[Campo con borde verde]
✓ "RUT válido"
```

**Helper text (siempre visible, bajo el campo):**
```
[Campo]
ℹ Texto de ayuda en gris tenue
```

### 4.5 Mobile-First Layout

**Reglas de layout por paso:**

```css
/* Contenedor base */
.onboarding-container {
  max-width: 480px;      /* mobile: 100% - padding */
  margin: 0 auto;
  padding: 24px 16px;    /* mobile */
}

@media (min-width: 640px) {
  .onboarding-container {
    padding: 48px 24px;
  }
}
```

**Targets táctiles:**
- Todos los botones: mínimo 48px de altura
- Radio buttons y cards: mínimo 44px de altura
- Spacing entre elementos interactivos: mínimo 8px

**Teclado en mobile:**
- Campos numéricos (teléfono, precio, RNPI): `inputMode="numeric"` para abrir teclado numérico
- Campos de fecha: 3 selects en lugar de date picker nativo
- Campos de texto largo (bio): expandir textarea automáticamente con el contenido

### 4.6 Toast Notifications

Usar para:
- Error de API al guardar: `"No pudimos guardar tus datos. Intenta de nuevo."` (toast rojo, 5s)
- Upload exitoso de foto: `"Foto cargada correctamente"` (toast verde, 2s)
- Código de referido aplicado: `"¡Código aplicado!"` (toast teal, 2s)

No usar para errores de validación de formulario — esos van inline.

---

## 5. Confianza y Cumplimiento Legal

### 5.1 Footer de Privacidad (todos los pasos)

Mostrar en **todos** los pasos de ambos flujos, en el footer de la card:

```
🔒  Datos protegidos según la Ley 19.628 sobre Protección de la Vida Privada
```

Estilo: texto pequeño (12px), color gris tenue, ícono de candado. Link al aviso de privacidad: `nurea.cl/privacidad`.

### 5.2 Explicación Contextual de Datos

Cada dato sensible debe tener su "por qué" visible o accesible con un clic:

| Campo | Explicación en UI |
|---|---|
| Teléfono (paciente) | `"Para que tu médico pueda contactarte si necesita confirmar tu consulta"` |
| RUT | `"Para validar tu identidad en consultas bonificables. No se comparte con terceros."` |
| Previsión de salud | `"Para que tu médico conozca tu situación de salud. No afecta tu acceso a Nurea."` |
| Alergias | `"Tu médico la revisará antes de la consulta. Solo visible para tu médico tratante."` |
| Medicamentos | `"Para evitar interacciones. Solo tu médico tratante puede verlos."` |
| RNPI | `"Lo verificamos para garantizar la seguridad de nuestros pacientes."` |
| Precio de consulta | `"Tú defines tu tarifa. Puedes cambiarla en cualquier momento."` |

### 5.3 Verificación de Profesionales

El flujo de profesionales termina siempre en estado `verification_status = 'pending'`. Comunicar esto claramente:

```
Al finalizar el onboarding de profesional, mostrar:

"Tu perfil está configurado y en revisión."
"El equipo de Nurea verificará tu RNPI y credenciales en 24–48 horas hábiles."
"Te notificaremos a [email] cuando tu perfil esté activo."

Mientras tanto:
- El profesional puede acceder al dashboard (solo lectura)
- No aparece en resultados de búsqueda
- Puede completar disponibilidad y configuración adicional
```

Email de notificación de aprobación debe enviarse desde `no-reply@nurea.cl` con el asunto `"Tu perfil en Nurea está activo — ya puedes recibir consultas"`.

### 5.4 Consentimiento de Datos Médicos

En el Paso 4 (paciente — Tu Salud), antes del primer campo de datos médicos, mostrar:

```
"Al compartir tu historial de salud, aceptas que esta información
sea visible únicamente para tu médico tratante durante consultas activas.
Consulta nuestra Política de Privacidad para más detalles."
[Link: "Política de Privacidad →"]
```

Este no es un checkbox de consentimiento (ya está cubierto en los Términos de registro), sino un recordatorio contextual que refuerza la confianza.

### 5.5 Datos Nunca Visibles en URL

Ningún dato sensible debe aparecer en la URL del onboarding. Usar rutas de step sin parámetros:

```
✓ Correcto:   /onboarding/patient/3
✗ Incorrecto: /onboarding?step=3&rut=12345678-9
```

### 5.6 Sesión y Seguridad

- El onboarding requiere sesión activa (token JWT válido de Supabase Auth). Si la sesión expira mid-onboarding, redirigir a login con `returnTo=/onboarding/[role]/[step]`.
- Los datos parciales ya guardados persisten — el usuario retoma donde estaba al re-autenticarse.
- No permitir acceso al onboarding de profesional desde una cuenta de paciente y viceversa.

---

## 6. Criterios de Aceptación para QA

### 6.1 Flujo de Paciente

- [ ] El RouteGuard redirige a `/onboarding/patient/1` si `onboarding_completed === false`
- [ ] El RouteGuard redirige a `/dashboard` si `onboarding_completed === true`
- [ ] El Paso 1 no muestra el step indicator
- [ ] Los pasos 2–5 muestran el step indicator correcto (X de 5)
- [ ] El avatar es opcional: se puede avanzar sin foto
- [ ] El validador de RUT rechaza RUTs inválidos (ej: 12345678-0 si el DV correcto es diferente)
- [ ] El validador de RUT formatea automáticamente al escribir (ej: `12345678` → `12.345.678-K`)
- [ ] Los campos del Paso 4 aceptan texto vacío (guardan como NULL)
- [ ] Los botones "No tengo..." guardan `"Ninguna"` en DB (no NULL)
- [ ] El Paso 5 requiere selección antes de habilitar el CTA final
- [ ] `onboarding_completed` se marca `true` solo al completar el Paso 5
- [ ] Si el usuario cierra y vuelve, retoma en el paso correcto con datos pre-llenados
- [ ] El footer de privacidad aparece en todos los pasos
- [ ] El layout funciona correctamente en viewport 375px (iPhone SE)

### 6.2 Flujo de Profesional

- [ ] El RouteGuard redirige a `/onboarding/professional/1` si `onboarding_completed === false`
- [ ] El avatar es requerido: no se puede avanzar desde el Paso 2 sin foto
- [ ] El dropdown de especialidades es searchable y carga las top 10 por defecto
- [ ] El RNPI solo acepta formato numérico (4–8 dígitos)
- [ ] La bio muestra el contador en tiempo real y bloquea el CTA si < 100 chars
- [ ] El preview del perfil se actualiza en tiempo real al escribir bio y slogan
- [ ] Los campos condicionales de precio/dirección aparecen/desaparecen según `consultation_type`
- [ ] Las cards de `nura_ai_tone` muestran ejemplos de frase real
- [ ] El código de referido valida el formato pero no bloquea el flujo si es inválido (solo advierte)
- [ ] Al completar: `verification_status = 'pending'`, `onboarding_completed = true`
- [ ] El mensaje de "perfil bajo revisión" aparece claramente al finalizar
- [ ] El profesional puede acceder al dashboard pero sin aparecer en búsquedas
- [ ] El footer de privacidad aparece en todos los pasos

### 6.3 Accesibilidad (WCAG 2.1 AA mínimo)

- [ ] Todos los campos tienen `<label>` asociado
- [ ] Los errores inline tienen `role="alert"` o `aria-live="polite"`
- [ ] El step indicator tiene `aria-label="Paso X de Y"`
- [ ] Las cards de selección (modalidad, tono IA, objetivo) son navegables con teclado
- [ ] Contraste de texto ≥ 4.5:1 en modo claro y oscuro
- [ ] Todos los botones tienen texto descriptivo (no solo "→")

---

*Fin del documento de especificación.*
*Próximos pasos: revisión con el equipo de diseño, prototipo en Figma, y planificación de sprints para implementación.*
