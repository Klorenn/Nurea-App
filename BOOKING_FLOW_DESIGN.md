# 📅 Diseño del Flujo de Reserva de Citas - NUREA

**Objetivo:** Reservar una cita en menos de 30 segundos desde cualquier dispositivo  
**Filosofía:** Confianza, no velocidad agresiva. Simple, humano, tranquilizador.

---

## 🎯 COMPARACIÓN CON DOCTORALIA

### Lo que Doctoralia hace mal:
- ❌ Múltiples pantallas innecesarias
- ❌ Formularios largos antes de ver disponibilidad
- ❌ Muchos campos opcionales que confunden
- ❌ Lenguaje corporativo y frío
- ❌ No muestra progreso claro
- ❌ Pago separado en múltiples pasos

### Lo que NUREA hará mejor:
- ✅ Máximo 3 pasos (vs 5-6 de Doctoralia)
- ✅ Ver disponibilidad primero, datos después
- ✅ Solo campos esenciales
- ✅ Lenguaje humano y tranquilizador
- ✅ Indicador de progreso visible
- ✅ Pago integrado en el flujo

---

## 📍 PUNTOS DE ENTRADA

### 1. Home (`/`)
**Acción:** Clic en "Buscar profesional" o búsqueda directa  
**Micro-copy:** "Encuentra el profesional que necesitas"  
**Tiempo:** 0 segundos (ya está en la página)

### 2. Búsqueda (`/search`)
**Acción:** Clic en "Ver perfil" o "Agendar consulta"  
**Micro-copy:** "Agendar consulta" (botón prominente)  
**Tiempo:** 1 segundo

### 3. Perfil del Profesional (`/professionals/[id]`)
**Acción:** Clic en "Agendar Consulta" (botón fijo sticky)  
**Micro-copy:** "Agendar Consulta"  
**Tiempo:** 1 segundo

**Recomendación:** Botón sticky en móvil para acceso rápido.

---

## 🚀 FLUJO OPTIMIZADO (3 PASOS)

### **PASO 1: Selección de Horario** (10-15 segundos)

#### Qué ve el usuario:
- **Header:** Nombre del profesional, especialidad, precio
- **Calendario semanal:** Días con disponibilidad visible
- **Horarios disponibles:** Botones de tiempo clickeables
- **Tipo de consulta:** Online/Presencial (si aplica)
- **Indicador de progreso:** "Paso 1 de 3"

#### Qué acción realiza:
1. Ve horarios disponibles
2. Selecciona día y hora (1 clic)
3. Si hay ambos tipos, selecciona Online o Presencial (1 clic)
4. Clic en "Continuar"

#### Micro-copy:
- **Título:** "Elige tu horario"
- **Subtítulo:** "Selecciona el día y hora que mejor te convenga"
- **Botón:** "Continuar"
- **Sin disponibilidad:** "No hay horarios disponibles esta semana. Prueba la siguiente."

#### Validaciones:
- ✅ Verificar que el horario esté disponible
- ✅ Verificar que no sea en el pasado
- ✅ Verificar que no sea muy pronto (<2 horas)
- ✅ Verificar que el profesional esté disponible

#### Errores posibles:
1. **Horario ocupado:**
   - **Mensaje:** "Este horario ya no está disponible. Por favor, elige otro."
   - **Acción:** Mostrar otros horarios disponibles

2. **Horario muy pronto:**
   - **Mensaje:** "Necesitamos al menos 2 horas de anticipación. Elige un horario más tarde."
   - **Acción:** Deshabilitar horarios muy próximos

3. **Sin disponibilidad:**
   - **Mensaje:** "No hay horarios disponibles esta semana. ¿Quieres que te avisemos cuando haya disponibilidad?"
   - **Acción:** Botón "Avisarme cuando haya disponibilidad"

#### Mobile:
- Calendario horizontal scroll
- Horarios en grid 2 columnas
- Botón sticky abajo
- Sin scroll innecesario

---

### **PASO 2: Confirmación y Pago** (15-20 segundos)

#### Qué ve el usuario:
- **Resumen de la cita:**
  - Profesional y especialidad
  - Fecha y hora seleccionada
  - Tipo de consulta
  - Duración (60 minutos)
  - Precio total
- **Formulario de pago:** (solo si no está logueado, mostrar login rápido)
- **Consentimiento:** Checkbox simple
- **Indicador de progreso:** "Paso 2 de 3"

#### Qué acción realiza:
1. Revisa resumen (automático, no requiere acción)
2. Si no está logueado: Login rápido (email + contraseña) o "Continuar con Google"
3. Completa datos de pago (si es primera vez)
4. Marca consentimiento (1 clic)
5. Clic en "Confirmar y Pagar"

#### Micro-copy:
- **Título:** "Confirma tu cita"
- **Subtítulo:** "Revisa los detalles y completa tu pago"
- **Resumen:**
  - "Tu cita con [Nombre]"
  - "[Fecha] a las [Hora]"
  - "Consulta [Online/Presencial]"
  - "Duración: 60 minutos"
- **Precio:** "Total: $[Precio] CLP"
- **Consentimiento:**
  - "He leído y acepto los Términos de Servicio y Política de Privacidad"
  - "Entiendo que NUREA es un intermediario tecnológico y no presta servicios médicos"
- **Botón:** "Confirmar y Pagar $[Precio] CLP"
- **Seguridad:** "Tu pago está protegido con encriptación SSL"

#### Validaciones:
- ✅ Usuario autenticado (o login rápido)
- ✅ Datos de pago válidos
- ✅ Consentimiento marcado
- ✅ Verificar disponibilidad nuevamente (última verificación)
- ✅ Verificar que el precio no haya cambiado

#### Errores posibles:
1. **Usuario no autenticado:**
   - **Mensaje:** "Necesitas iniciar sesión para agendar. Es rápido y seguro."
   - **Acción:** Mostrar login rápido (email + contraseña o Google)

2. **Horario ya ocupado:**
   - **Mensaje:** "Este horario ya no está disponible. Te mostramos otros horarios disponibles."
   - **Acción:** Volver al paso 1 con otros horarios

3. **Pago fallido:**
   - **Mensaje:** "No pudimos procesar el pago. Verifica tus datos e intenta nuevamente."
   - **Acción:** Resaltar campo con error, permitir reintentar

4. **Consentimiento no marcado:**
   - **Mensaje:** "Por favor, acepta los términos para continuar."
   - **Acción:** Resaltar checkbox

#### Legal (sin fricción):
- **Checkbox simple:** "Acepto términos y condiciones"
- **Link discreto:** "Términos" y "Privacidad" (abren en modal)
- **Aviso pequeño:** "NUREA es intermediario tecnológico" (visible pero no intrusivo)

#### Mobile:
- Resumen compacto
- Formulario de pago optimizado (autocompletar habilitado)
- Botón sticky abajo
- Teclado numérico para CVV

---

### **PASO 3: Éxito y Próximos Pasos** (5 segundos)

#### Qué ve el usuario:
- **Confirmación visual:** Checkmark animado
- **Mensaje de éxito:** Claro y tranquilizador
- **Detalles de la cita:** Resumen final
- **Próximos pasos:** Qué esperar

#### Qué acción realiza:
1. Ve confirmación (automático)
2. Opcionalmente: Compartir o agregar a calendario
3. Clic en "Ver mis citas" o "Volver al inicio"

#### Micro-copy:
- **Título:** "¡Cita confirmada!"
- **Mensaje principal:**
  - "Tu cita con [Nombre] está confirmada"
  - "Te enviaremos un recordatorio 24 horas antes"
- **Detalles:**
  - "[Fecha] a las [Hora]"
  - "Consulta [Online/Presencial]"
  - "Código de cita: [NR-XXXXX]"
- **Próximos pasos:**
  - "📧 Recibirás un email de confirmación"
  - "📱 Te enviaremos un recordatorio 24h antes"
  - "💬 Podrás chatear con [Nombre] después de la cita"
- **Botones:**
  - "Ver mis citas" (primario)
  - "Agregar a calendario" (secundario)
  - "Volver al inicio" (terciario)

#### Validaciones:
- ✅ Verificar que la cita se creó correctamente
- ✅ Verificar que el pago se procesó
- ✅ Enviar email de confirmación (background)

#### Errores posibles:
1. **Cita creada pero email falló:**
   - **Mensaje:** "Tu cita está confirmada. Hubo un problema al enviar el email, pero puedes verla en 'Mis Citas'."
   - **Acción:** Mostrar botón "Ver mis citas"

2. **Pago procesado pero cita no creada:**
   - **Mensaje:** "Tu pago se procesó correctamente. Estamos creando tu cita, recibirás confirmación en breve."
   - **Acción:** Procesar cita en background, notificar después

#### Mobile:
- Pantalla completa de éxito
- Botones grandes y táctiles
- Fácil compartir o agregar a calendario

---

## 🔄 FLUJO COMPLETO VISUAL

```
┌─────────────────────────────────────────┐
│  PUNTO DE ENTRADA                       │
│  (Home / Búsqueda / Perfil)             │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  PASO 1: SELECCIÓN DE HORARIO           │
│  ─────────────────────────────────────  │
│  • Ver disponibilidad                   │
│  • Seleccionar día y hora               │
│  • Seleccionar tipo (si aplica)        │
│  • Clic "Continuar"                     │
│                                          │
│  Tiempo: 10-15 segundos                 │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  ¿Usuario autenticado?                   │
│  ─────────────────────────────────────  │
│  NO → Login rápido (email/Google)       │
│  SÍ → Continuar                         │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  PASO 2: CONFIRMACIÓN Y PAGO            │
│  ─────────────────────────────────────  │
│  • Ver resumen de cita                  │
│  • Completar pago (si primera vez)      │
│  • Aceptar términos                     │
│  • Clic "Confirmar y Pagar"             │
│                                          │
│  Tiempo: 15-20 segundos                 │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  PASO 3: ÉXITO                          │
│  ─────────────────────────────────────  │
│  • Confirmación visual                  │
│  • Detalles de la cita                  │
│  • Próximos pasos                       │
│  • Acciones (ver citas, calendario)    │
│                                          │
│  Tiempo: 5 segundos                     │
└─────────────────────────────────────────┘
```

**Tiempo total:** 30-40 segundos (objetivo: <30 segundos con usuario experimentado)

---

## 📱 OPTIMIZACIONES MOBILE-FIRST

### 1. Selección de Horario
- **Calendario:** Scroll horizontal, días visibles
- **Horarios:** Grid 2 columnas, botones grandes (min 44x44px)
- **Navegación:** Swipe para cambiar semana
- **Botón continuar:** Sticky abajo, siempre visible

### 2. Confirmación y Pago
- **Resumen:** Card compacto, información esencial
- **Formulario:** Campos grandes, autocompletar habilitado
- **Teclado:** Numérico para CVV, email para email
- **Consentimiento:** Checkbox grande, fácil de tocar
- **Botón:** Sticky abajo, siempre visible

### 3. Éxito
- **Pantalla completa:** Sin distracciones
- **Botones:** Grandes y táctiles
- **Compartir:** Fácil acceso a compartir o calendario

---

## 💬 MICRO-COPY POR SECCIÓN

### Selección de Horario

**Título:**
- ES: "Elige tu horario"
- EN: "Choose your time"

**Subtítulo:**
- ES: "Selecciona el día y hora que mejor te convenga"
- EN: "Select the day and time that works best for you"

**Botón continuar:**
- ES: "Continuar"
- EN: "Continue"

**Sin disponibilidad:**
- ES: "No hay horarios disponibles esta semana. ¿Quieres que te avisemos cuando haya disponibilidad?"
- EN: "No available times this week. Would you like us to notify you when times become available?"

**Horario ocupado:**
- ES: "Este horario ya no está disponible. Por favor, elige otro."
- EN: "This time is no longer available. Please choose another."

---

### Confirmación y Pago

**Título:**
- ES: "Confirma tu cita"
- EN: "Confirm your appointment"

**Subtítulo:**
- ES: "Revisa los detalles y completa tu pago"
- EN: "Review the details and complete your payment"

**Resumen:**
- ES: "Tu cita con [Nombre]"
- EN: "Your appointment with [Name]"

**Precio:**
- ES: "Total: $[Precio] CLP"
- EN: "Total: $[Price] CLP"

**Consentimiento:**
- ES: "He leído y acepto los Términos de Servicio y Política de Privacidad. Entiendo que NUREA es un intermediario tecnológico y no presta servicios médicos."
- EN: "I have read and accept the Terms of Service and Privacy Policy. I understand that NUREA is a technology intermediary and does not provide medical services."

**Botón:**
- ES: "Confirmar y Pagar $[Precio] CLP"
- EN: "Confirm and Pay $[Price] CLP"

**Seguridad:**
- ES: "Tu pago está protegido con encriptación SSL"
- EN: "Your payment is secured with SSL encryption"

---

### Éxito

**Título:**
- ES: "¡Cita confirmada!"
- EN: "Appointment confirmed!"

**Mensaje principal:**
- ES: "Tu cita con [Nombre] está confirmada. Te enviaremos un recordatorio 24 horas antes."
- EN: "Your appointment with [Name] is confirmed. We'll send you a reminder 24 hours before."

**Próximos pasos:**
- ES:
  - "📧 Recibirás un email de confirmación"
  - "📱 Te enviaremos un recordatorio 24h antes"
  - "💬 Podrás chatear con [Nombre] después de la cita"
- EN:
  - "📧 You'll receive a confirmation email"
  - "📱 We'll send you a reminder 24h before"
  - "💬 You can chat with [Name] after the appointment"

**Botones:**
- ES: "Ver mis citas" / "Agregar a calendario" / "Volver al inicio"
- EN: "View my appointments" / "Add to calendar" / "Back to home"

---

## ✅ VALIDACIONES Y ERRORES

### Validaciones en cada paso:

#### Paso 1: Selección de Horario
- ✅ Horario disponible
- ✅ No en el pasado
- ✅ Mínimo 2 horas de anticipación
- ✅ Profesional disponible

#### Paso 2: Confirmación y Pago
- ✅ Usuario autenticado
- ✅ Datos de pago válidos
- ✅ Consentimiento marcado
- ✅ Disponibilidad verificada nuevamente
- ✅ Precio no ha cambiado

#### Paso 3: Éxito
- ✅ Cita creada correctamente
- ✅ Pago procesado
- ✅ Email enviado (background)

### Manejo de errores:

**Principio:** Siempre explicar qué pasó y qué hacer.

**Formato de mensajes:**
1. **Qué pasó:** "Este horario ya no está disponible"
2. **Por qué:** "Otra persona lo reservó hace un momento"
3. **Qué hacer:** "Por favor, elige otro horario"

**Tono:** Empatía, no culpa. Tranquilizador, no alarmante.

---

## 🎨 INDICADOR DE PROGRESO

### Diseño:
```
┌─────────────────────────────────────┐
│  [●]────[○]────[○]                 │
│  Paso 1  Paso 2  Paso 3            │
└─────────────────────────────────────┘
```

### Micro-copy:
- **Paso 1:** "Elige horario"
- **Paso 2:** "Confirma y paga"
- **Paso 3:** "¡Listo!"

### Mobile:
- Barra de progreso horizontal
- Texto debajo de cada paso
- Paso actual resaltado

---

## 🔒 ASPECTOS LEGALES (SIN FRICCIÓN)

### Consentimiento:
- **Checkbox simple:** "Acepto términos y condiciones"
- **Links discretos:** "Términos" y "Privacidad" (abren en modal)
- **Ubicación:** Justo antes del botón de pago
- **Tamaño:** Legible pero no intrusivo

### Aviso de intermediario:
- **Texto pequeño:** "NUREA es intermediario tecnológico. No prestamos servicios médicos."
- **Ubicación:** Footer del resumen, antes del botón
- **Estilo:** Info icon, color azul suave

### Política de cancelación:
- **Link discreto:** "Ver política de cancelación" (abre modal)
- **Ubicación:** Cerca del precio
- **No obligatorio:** No bloquea el flujo

---

## 🚫 LO QUE NO HACER (VS DOCTORALIA)

### ❌ Eliminar:
1. **Formulario largo antes de ver disponibilidad**
2. **Múltiples pantallas de confirmación**
3. **Campos opcionales innecesarios**
4. **Lenguaje corporativo**
5. **Contadores de tiempo agresivos**
6. **Múltiples pasos de pago**
7. **Solicitar datos médicos antes de agendar**

### ✅ Hacer:
1. **Ver disponibilidad primero**
2. **Una sola pantalla de confirmación**
3. **Solo campos esenciales**
4. **Lenguaje humano y tranquilizador**
5. **Sin presión artificial**
6. **Pago integrado en un paso**
7. **Datos médicos opcionales después**

---

## 📊 MÉTRICAS DE ÉXITO

### Objetivos:
- **Tiempo promedio:** <30 segundos
- **Tasa de abandono:** <10%
- **Tasa de error:** <5%
- **Satisfacción:** >4.5/5

### Puntos de medición:
1. **Tiempo en cada paso**
2. **Abandono en cada paso**
3. **Errores por tipo**
4. **Tiempo de carga**
5. **Tasa de éxito de pago**

---

## 🎯 PRÓXIMOS PASOS DE IMPLEMENTACIÓN

### Fase 1: Estructura básica
1. Crear componente `BookingFlow`
2. Implementar Paso 1 (selección de horario)
3. Implementar Paso 2 (confirmación y pago)
4. Implementar Paso 3 (éxito)

### Fase 2: Optimizaciones
1. Validaciones robustas
2. Manejo de errores
3. Indicador de progreso
4. Mobile optimizations

### Fase 3: Integraciones
1. Integración con Stripe/MercadoPago
2. Envío de emails
3. Notificaciones
4. Calendario (Google Calendar)

---

## 📝 NOTAS FINALES

### Filosofía:
- **Confianza, no velocidad agresiva:** El objetivo es que el usuario se sienta seguro, no presionado.
- **Simple, no simplón:** Eliminar fricción sin perder información importante.
- **Humano, no robótico:** Lenguaje cálido y empático en cada paso.

### Comparación con Doctoralia:
- **NUREA:** 3 pasos, <30 segundos, lenguaje humano
- **Doctoralia:** 5-6 pasos, 60-90 segundos, lenguaje corporativo

### Resultado esperado:
Un flujo que el usuario disfruta usar, que genera confianza, y que es significativamente más rápido que la competencia.

---

**Este diseño está listo para implementación. Prioriza mobile-first y lenguaje humano en cada paso.** 🚀

