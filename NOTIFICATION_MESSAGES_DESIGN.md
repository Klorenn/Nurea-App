# Mensajes de Notificaciones - NUREA

## Principios de Diseño

✅ **Tono humano**: Como si una persona real escribiera  
✅ **Claro y específico**: Información útil, no genérica  
✅ **Tranquilizador**: Contexto de salud, evitar ansiedad  
✅ **Accionable**: Qué hacer después  
✅ **Evitar**: Lenguaje automático, jerga técnica, mensajes corporativos

---

## 1. Cita Confirmada (`appointment_confirmed`)

### Título
**ES**: "¡Tu cita está confirmada!"  
**EN**: "Your appointment is confirmed!"

### Mensaje
**ES**: "Tu cita con [Nombre del profesional] está lista para el [día] [fecha] a las [hora]. Te recordaremos mañana. Si necesitas cambiar algo, puedes hacerlo desde tu panel."  
**EN**: "Your appointment with [Professional name] is set for [day] [date] at [time]. We'll remind you tomorrow. If you need to change anything, you can do it from your dashboard."

**Por qué funciona**: 
- Celebra la confirmación ("¡está lista!")
- Es específico (fecha y hora claras)
- Tranquiliza (recordatorio automático)
- Da control (puedes cambiar)

---

## 2. Recordatorio de Cita (`appointment_reminder`)

### Título
**ES**: "Recordatorio: Tu cita es mañana"  
**EN**: "Reminder: Your appointment is tomorrow"

### Mensaje
**ES**: "Hola, te recordamos que mañana a las [hora] tienes tu cita con [Nombre del profesional]. Si es online, encontrarás el enlace en tu panel. Si es presencial, la dirección es [dirección]. ¡Nos vemos pronto!"  
**EN**: "Hi, just a reminder that tomorrow at [time] you have your appointment with [Professional name]. If it's online, you'll find the link in your dashboard. If it's in-person, the address is [address]. See you soon!"

**Por qué funciona**:
- Saludo personal ("Hola")
- Información práctica (enlace o dirección)
- Tono cercano ("¡Nos vemos pronto!")

---

## 3. Cita Cancelada (`appointment_cancelled`)

### Título
**ES**: "Tu cita fue cancelada"  
**EN**: "Your appointment was cancelled"

### Mensaje
**ES**: "Tu cita del [fecha] con [Nombre del profesional] fue cancelada. Si la cancelaste tú, todo está bien. Si fue el profesional, te contactaremos pronto para reagendar. Si tienes dudas, puedes escribirle desde tu panel de mensajes."  
**EN**: "Your appointment on [date] with [Professional name] was cancelled. If you cancelled it, everything is fine. If it was the professional, we'll contact you soon to reschedule. If you have questions, you can message them from your dashboard."

**Por qué funciona**:
- No asume culpabilidad
- Tranquiliza ("todo está bien")
- Ofrece solución (reagendar)
- Da control (puedes escribir)

---

## 4. Cita Reagendada (`appointment_rescheduled`)

### Título
**ES**: "Tu cita cambió de fecha"  
**EN**: "Your appointment date changed"

### Mensaje
**ES**: "Tu cita con [Nombre del profesional] cambió. Nueva fecha: [día] [fecha] a las [hora]. Si este horario no te funciona, puedes cambiarlo desde tu panel o escribirle al profesional."  
**EN**: "Your appointment with [Professional name] changed. New date: [day] [date] at [time]. If this time doesn't work for you, you can change it from your dashboard or message the professional."

**Por qué funciona**:
- Directo y claro
- Información específica
- Da opciones (cambiar o escribir)

---

## 5. Cita Completada (`appointment_completed`)

### Título
**ES**: "Tu cita finalizó"  
**EN**: "Your appointment ended"

### Mensaje
**ES**: "Tu cita con [Nombre del profesional] finalizó. Esperamos que haya sido útil. Si quieres, puedes dejar una reseña o escribirle si tienes alguna pregunta de seguimiento."  
**EN**: "Your appointment with [Professional name] ended. We hope it was helpful. If you'd like, you can leave a review or message them if you have any follow-up questions."

**Por qué funciona**:
- Agradecimiento implícito
- Invita a participar (reseña)
- Mantiene la conexión (preguntas de seguimiento)

---

## 6. Nuevo Mensaje (`message_new`)

### Título
**ES**: "[Nombre del profesional] te escribió"  
**EN**: "[Professional name] wrote to you"

### Mensaje
**ES**: "[Nombre del profesional] te envió un mensaje: '[Preview del mensaje]'. Puedes responder desde tu panel de mensajes. Recuerda: este chat no es para emergencias médicas."  
**EN**: "[Professional name] sent you a message: '[Message preview]'. You can reply from your messages dashboard. Remember: this chat is not for medical emergencies."

**Por qué funciona**:
- Personalizado (nombre del profesional)
- Preview útil
- Recordatorio importante (no emergencias)

---

## 7. Pago Confirmado (`payment_confirmed`)

### Título
**ES**: "Tu pago se procesó correctamente"  
**EN**: "Your payment was processed successfully"

### Mensaje
**ES**: "Tu pago de $[monto] para tu cita del [fecha] se procesó correctamente. Puedes descargar tu recibo desde tu panel de pagos en cualquier momento."  
**EN**: "Your payment of $[amount] for your appointment on [date] was processed successfully. You can download your receipt from your payments dashboard at any time."

**Por qué funciona**:
- Confirmación clara
- Información específica (monto y fecha)
- Acción útil (descargar recibo)

---

## 8. Pago Fallido (`payment_failed`)

### Título
**ES**: "Tu pago no se pudo procesar"  
**EN**: "Your payment couldn't be processed"

### Mensaje
**ES**: "Hubo un problema al procesar tu pago de $[monto]. No te preocupes, tu cita sigue reservada. Por favor, intenta nuevamente desde tu panel de pagos o contáctanos si el problema persiste."  
**EN**: "There was a problem processing your payment of $[amount]. Don't worry, your appointment is still reserved. Please try again from your payments dashboard or contact us if the problem persists."

**Por qué funciona**:
- Tranquiliza ("No te preocupes")
- Asegura que la cita está bien
- Ofrece solución clara

---

## 9. Documento Subido (`document_uploaded`)

### Título
**ES**: "Nuevo documento disponible"  
**EN**: "New document available"

### Mensaje
**ES**: "[Nombre del profesional] subió un documento para ti: '[Nombre del documento]'. Puedes verlo y descargarlo desde tu panel de documentos."  
**EN**: "[Professional name] uploaded a document for you: '[Document name]'. You can view and download it from your documents dashboard."

**Por qué funciona**:
- Específico (quién y qué)
- Acción clara (ver y descargar)

---

## 10. Sistema (`system`)

### Título
**ES**: "Actualización importante"  
**EN**: "Important update"

### Mensaje
**ES**: "[Mensaje específico del sistema]. Si tienes dudas, escríbenos a soporte@nurea.app"  
**EN**: "[Specific system message]. If you have questions, contact us at soporte@nurea.app"

**Por qué funciona**:
- Genérico pero útil
- Siempre ofrece contacto

---

## Comparación: Antes vs. Después

### ❌ Antes (Automático/Robótico)
- "Tu cita con el profesional ha sido confirmada para 05/10/2024 a las 14:30"
- "Tu pago de $50000 ha sido procesado exitosamente"
- "Nuevo Mensaje"

### ✅ Después (Humano/Tranquilizador)
- "¡Tu cita está confirmada! Tu cita con Dr. Elena Vargas está lista para el viernes 5 de octubre a las 14:30. Te recordaremos mañana."
- "Tu pago de $50.000 para tu cita del 5 de octubre se procesó correctamente. Puedes descargar tu recibo desde tu panel de pagos en cualquier momento."
- "Dr. Elena Vargas te escribió: 'Hola, te envío los resultados...'"

---

## Implementación

Estos mensajes se implementan en:
1. **Triggers SQL** (`SQL_CREATE_NOTIFICATIONS_TABLE.sql`) - Para notificaciones automáticas
2. **Plantillas de Email** (`lib/emails/templates.ts`) - Para emails
3. **API Routes** - Para notificaciones creadas manualmente

