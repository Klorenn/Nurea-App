# Diseño de Sección de Documentos - NUREA

## Principios de Diseño

✅ **Seguridad visible**: Indicadores claros de protección  
✅ **Claridad**: Información esencial, fácil de escanear  
✅ **Control del usuario**: Permisos visibles, acciones claras  
✅ **Sin complejidad**: Evitar historia clínica pesada, mantener simple

---

## Estructura Visual

### 1. Header con Seguridad Prominente
- Título claro: "Tus Documentos"
- Subtítulo tranquilizador: "Todo está protegido y solo tú y tus profesionales autorizados tienen acceso"
- Badge de seguridad visible
- Botón de subir destacado

### 2. Indicador de Seguridad (Siempre Visible)
- Card verde con icono de escudo
- Mensaje claro: "Tus documentos están encriptados y almacenados de forma segura"
- Información sobre quién tiene acceso

### 3. Filtros Simples
- Búsqueda por nombre/descripción
- Filtro por categoría (opcional, no obligatorio)
- Toggle para agrupar por cita (opcional, no por defecto)

### 4. Lista de Documentos
- Cards limpios y escaneables
- Información esencial visible:
  - Nombre del documento
  - Categoría (badge)
  - Fecha
  - Profesional asociado (si aplica)
  - Permisos de acceso (icono claro)
  - Tamaño del archivo
- Acciones visibles: Ver, Descargar
- Asociación con cita (si aplica) - discreta pero visible

### 5. Agrupación Opcional por Cita
- Solo si el usuario lo activa
- No por defecto (evitar complejidad)
- Agrupa documentos relacionados con la misma cita
- Muestra fecha de la cita como encabezado

---

## Indicadores de Seguridad

### Por Documento
- **Solo tú** (patient_only): 🔒 Icono de candado + texto "Solo tú"
- **Compartido** (patient_and_professional): 🔓 Icono de candado abierto + texto "Compartido con [Nombre profesional]"
- **Solo profesional** (professional_only): 🔒 Icono de candado + texto "Solo [Nombre profesional]"

### Global
- Badge de seguridad en header
- Card informativo sobre encriptación
- Mensaje de privacidad visible

---

## Control del Usuario

### Permisos Visibles
- Cada documento muestra claramente quién puede verlo
- Iconos intuitivos (candado cerrado/abierto)
- Colores diferenciados

### Acciones Claras
- Ver: Abre en visor seguro
- Descargar: Descarga con URL firmada
- Subir: Proceso simple y seguro

### Información Contextual
- Asociación con cita (si aplica) - discreta
- Profesional que subió/compartió - visible
- Fecha de subida - clara

---

## Evitar Historia Clínica Pesada

### ❌ NO hacer:
- Agrupar todo por defecto
- Mostrar historial completo
- Campos médicos complejos
- Información técnica innecesaria
- Jerarquía compleja

### ✅ SÍ hacer:
- Lista simple y cronológica
- Información esencial visible
- Agrupación opcional (toggle)
- Lenguaje claro y humano
- Enfoque en documentos recientes

---

## Estados Vacíos

### Sin Documentos
- Icono grande y amigable
- Mensaje tranquilizador: "Aún no tienes documentos"
- Subtítulo: "Los documentos de tus consultas aparecerán aquí automáticamente"
- CTA claro: "Subir Documento"

### Sin Resultados de Búsqueda
- Mensaje: "No encontramos documentos con ese nombre"
- Sugerencia: "Intenta con otros términos o revisa tus filtros"

---

## Responsive

- Mobile: Cards apilados, acciones en fila
- Tablet: 2 columnas opcionales
- Desktop: Lista completa con toda la información

