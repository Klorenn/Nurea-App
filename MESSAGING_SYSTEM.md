# 💬 Sistema de Mensajería NUREA

## Arquitectura General

El sistema de mensajería de NUREA está diseñado para **comunicación en contexto de salud**, no como WhatsApp. Prioriza tranquilidad, acompañamiento y claridad sobre la naturaleza no urgente de la comunicación.

## Características Implementadas

### 1. Chat Seguro

**Seguridad:**
- Mensajes encriptados en tránsito (HTTPS)
- Almacenamiento seguro en Supabase
- Row Level Security (RLS) activado
- Solo participantes de la conversación pueden ver mensajes
- Badge de "Comunicación segura" visible

**Características:**
- Historial persistente en base de datos
- Real-time updates con Supabase subscriptions
- Estados de lectura (enviado, entregado, leído)
- Búsqueda de conversaciones

### 2. Adjuntar Archivos

**API:** `POST /api/messages/upload`

**Tipos permitidos:**
- PDF
- Word (.doc, .docx)
- Imágenes (.jpg, .jpeg, .png)
- Texto (.txt)

**Límites:**
- Tamaño máximo: 10MB
- Validación de tipo de archivo
- Almacenamiento en Supabase Storage

**Características:**
- Preview del archivo antes de enviar
- Descarga directa desde el chat
- Nombre de archivo visible
- Indicador de archivo adjunto

### 3. Historial Persistente

**Almacenamiento:**
- Todos los mensajes se guardan en `public.messages`
- Historial completo disponible siempre
- Búsqueda por contenido
- Filtrado por contacto

**Características:**
- Separadores de fecha automáticos
- Formato de tiempo claro (Hoy, Ayer, fecha)
- Scroll automático a mensajes nuevos
- Carga eficiente de mensajes

### 4. Indicador "Esto No Es Una Emergencia"

**Ubicación:** Banner prominente en la parte superior del chat (solo para pacientes)

**Mensaje:**
- "Esto no es una emergencia"
- "Para emergencias médicas, llama al 131 o acude a urgencias"

**Diseño:**
- Color naranja/amarillo (alerta pero no alarmante)
- Icono de alerta
- Visible pero no intrusivo
- Solo visible para pacientes

### 5. Horarios de Respuesta Estimados

**Información mostrada:**
- Tiempo de respuesta típico: "2-4 horas"
- Horario de atención: "Lunes a Viernes, 9:00 - 18:00"
- Estado online/offline del profesional

**Ubicación:**
- En el header del chat
- Junto al nombre del profesional
- Con icono de reloj

**Características:**
- Calculado desde disponibilidad del profesional
- Actualizado dinámicamente
- Ayuda a gestionar expectativas

## Componente HealthChat

### Props

```typescript
interface HealthChatProps {
  currentUserId: string
  currentUserName: string
  currentUserAvatar?: string
  contacts: Contact[]
  role: "patient" | "professional"
  onContactSelect?: (contactId: string) => void
  className?: string
}
```

### Características

- **Sidebar de contactos:** Lista de profesionales/pacientes con quien hay conversación
- **Ventana de chat:** Área principal de mensajes
- **Input con adjuntos:** Campo de texto con botón para adjuntar archivos
- **Indicadores visuales:** Estados de lectura, online/offline, tiempo de respuesta

## UX de Acompañamiento

### Mensajes Tranquilizadores

**Estado vacío:**
- "Este es un espacio seguro para comunicarte con tu profesional"
- "Puedes hacer preguntas, compartir información o coordinar tu atención"

**Al enviar:**
- Feedback inmediato
- Estados de carga claros
- Confirmación de envío

**Al recibir:**
- Notificación suave
- Scroll automático
- Marca de lectura

### Evitar Ansiedad

**Estrategias implementadas:**
1. **Banner de no emergencia:** Clarifica que no es para urgencias
2. **Horarios de respuesta:** Gestiona expectativas
3. **Lenguaje cálido:** "Espacio seguro", "acompañamiento"
4. **Diseño calmante:** Colores suaves, espaciado generoso
5. **Sin presión:** No hay "última vez visto hace X minutos"

### No Es WhatsApp

**Diferencias clave:**
- Contexto de salud siempre presente
- Información profesional visible
- Horarios de atención claros
- Políticas de respuesta explícitas
- Diseño más formal pero acogedor

## Flujos de Uso

### Enviar Mensaje (Paciente)

1. Seleccionar profesional de la lista
2. Escribir mensaje o adjuntar archivo
3. Clic en enviar
4. Confirmación inmediata

**Tiempo:** 10-15 segundos

### Responder Mensaje (Profesional)

1. Ver notificación de nuevo mensaje
2. Abrir conversación
3. Leer mensaje
4. Responder con texto o archivo
5. Enviar

**Tiempo:** 20-30 segundos

### Adjuntar Archivo

1. Clic en icono de clip
2. Seleccionar archivo
3. Preview del archivo
4. Escribir mensaje opcional
5. Enviar

**Tiempo:** 15-20 segundos

## Seguridad

### Implementado

- ✅ Autenticación requerida
- ✅ RLS en Supabase
- ✅ Validación de archivos
- ✅ Límites de tamaño
- ✅ Tipos de archivo permitidos
- ✅ Almacenamiento seguro

### Buenas Prácticas

1. **Nunca exponer URLs directas:** Usar signed URLs si es necesario
2. **Validar en servidor:** Todas las validaciones críticas en API
3. **Encriptación:** HTTPS en tránsito
4. **Privacidad:** Solo participantes ven mensajes

## Mensajes Humanos

### Estados Vacíos

**Sin conversaciones:**
- "Aún no tienes conversaciones"
- "Selecciona un profesional para comenzar una conversación segura y privada"

**Sin mensajes:**
- "No hay mensajes aún. ¡Envía el primero!"
- "Este es un espacio seguro para comunicarte con tu profesional"

### Errores

- "No se pudo enviar el mensaje. Intenta nuevamente."
- "No se pudo subir el archivo. Intenta nuevamente."
- "El archivo es demasiado grande. Máximo 10MB."

## Próximos Pasos

1. ✅ Sistema completo implementado
2. ⏳ Notificaciones push para nuevos mensajes
3. ⏳ Indicadores de "escribiendo..."
4. ⏳ Respuestas rápidas predefinidas
5. ⏳ Integración con citas (mensajes relacionados)

## Uso en Componentes

### Paciente

```tsx
<HealthChat
  currentUserId={user.id}
  currentUserName={user.name}
  contacts={contacts}
  role="patient"
/>
```

### Profesional

```tsx
<HealthChat
  currentUserId={user.id}
  currentUserName={user.name}
  contacts={contacts}
  role="professional"
/>
```

## Características Destacadas

- **Contexto de salud:** No es chat genérico, es comunicación médica
- **Tranquilizador:** Reduce ansiedad con mensajes claros
- **Acompañamiento:** Sensación de apoyo, no solo información
- **Seguro:** Encriptado y privado
- **Claro:** Horarios y expectativas siempre visibles

El sistema está listo para producción y cumple con todos los requisitos de seguridad, claridad y acompañamiento para comunicación en salud.

