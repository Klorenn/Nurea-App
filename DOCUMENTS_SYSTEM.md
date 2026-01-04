# 📄 Sistema de Gestión de Documentos Médicos NUREA

## Arquitectura General

El sistema de documentos médicos de NUREA está diseñado para **máxima seguridad y claridad**. Prioriza la protección de datos sensibles y una UX que no abruma al usuario, enfatizando siempre la seguridad visible.

## Características Implementadas

### 1. Subida Segura

**API:** `POST /api/documents/upload`

**Validaciones:**
- Tamaño máximo: 25MB
- Tipos permitidos: PDF, imágenes médicas (JPG, PNG, TIFF), Word (DOC, DOCX), texto (TXT)
- Validación de tipo de archivo
- Verificación de permisos (solo paciente o profesional autorizado)

**Características:**
- Almacenamiento en Supabase Storage (bucket privado)
- URLs firmadas (signed URLs) para acceso temporal
- Encriptación marcada en base de datos
- Asociación opcional a citas
- Metadatos completos (nombre, descripción, categoría)

**Componente:** `UploadDialog`
- Interfaz clara y no abrumadora
- Indicadores de seguridad visibles
- Validación en tiempo real
- Preview de archivo seleccionado

### 2. Visualización

**API:** `GET /api/documents/view?id={documentId}`

**Características:**
- Verificación de permisos estricta
- URLs firmadas temporales (1 hora)
- Registro de acceso (timestamp y contador)
- Soporte para PDF (iframe) e imágenes (img tag)
- Fallback para tipos no visualizables

**Componente:** `ViewerDialog`
- Visualizador integrado para PDF e imágenes
- Información del documento visible
- Botón de descarga directa
- Aviso de seguridad siempre visible

### 3. Descarga

**API:** `GET /api/documents/download?id={documentId}`

**Características:**
- Verificación de permisos
- URLs firmadas temporales
- Registro de acceso
- Descarga directa del archivo original

### 4. Asociación a Citas

**Funcionalidad:**
- Documentos pueden asociarse a citas específicas
- Verificación de que el usuario tiene acceso a la cita
- Filtrado por cita en la lista
- Contexto completo del documento

**Casos de Uso:**
- Resultados de laboratorio de una consulta específica
- Recetas generadas en una cita
- Informes de consulta
- Imágenes médicas relacionadas

### 5. Control de Acceso Estricto

**Políticas RLS:**
- Pacientes solo ven sus propios documentos
- Profesionales solo ven documentos de sus pacientes
- Verificación en cada operación (subida, visualización, descarga)
- Registro de accesos para auditoría

**Niveles de Acceso:**
- `patient_only`: Solo el paciente
- `patient_and_professional`: Paciente y profesional
- `professional_only`: Solo el profesional (raro, pero posible)

**Seguridad:**
- URLs firmadas con expiración
- Bucket privado en Supabase Storage
- Validación de permisos en cada request
- No exposición de rutas directas

## Base de Datos

### Tabla `documents`

```sql
CREATE TABLE public.documents (
  id UUID PRIMARY KEY,
  patient_id UUID REFERENCES profiles(id),
  professional_id UUID REFERENCES profiles(id),
  appointment_id UUID REFERENCES appointments(id),
  name TEXT NOT NULL,
  description TEXT,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size BIGINT,
  category TEXT,
  encrypted BOOLEAN DEFAULT TRUE,
  access_level TEXT,
  uploaded_by UUID REFERENCES profiles(id),
  uploaded_at TIMESTAMP,
  last_accessed_at TIMESTAMP,
  access_count INTEGER DEFAULT 0,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### Políticas RLS

- **SELECT:** Pacientes ven sus documentos, profesionales ven documentos de sus pacientes
- **INSERT:** Pacientes pueden crear, profesionales solo para citas autorizadas
- **UPDATE:** Solo el propietario (uploaded_by)
- **DELETE:** Solo el propietario o el paciente

## UX: Claridad y Seguridad Visible

### No Abrumar al Usuario

**Estrategias:**
1. **Información esencial:** Solo mostrar lo necesario
2. **Agrupación lógica:** Por categoría, fecha, profesional
3. **Búsqueda simple:** Campo único, sin filtros complejos
4. **Acciones claras:** Ver, Descargar (sin opciones ocultas)
5. **Estados visibles:** Loading, error, vacío claros

### Seguridad Visible

**Indicadores:**
- Badge de "Documento Protegido" siempre visible
- Card de seguridad en página principal
- Aviso en modal de subida
- Aviso en visualizador
- Iconos de seguridad (Shield) prominentes

**Mensajes:**
- "Tu documento será encriptado y almacenado de forma segura"
- "Solo tú y el profesional autorizado podrán acceder"
- "Documento médico protegido y seguro"

### Lenguaje Claro

**Evitar:**
- ❌ "Archivo subido exitosamente"
- ❌ "Error de procesamiento"
- ❌ "Acceso denegado"

**Usar:**
- ✅ "Documento subido exitosamente. Está protegido y solo accesible para ti y tu profesional."
- ✅ "No se pudo subir el documento. Por favor, verifica el archivo e intenta nuevamente."
- ✅ "No tienes permiso para acceder a este documento."

## Categorías de Documentos

1. **Resultados de Laboratorio** (`lab_results`)
2. **Receta Médica** (`prescription`)
3. **Informe de Consulta** (`consultation_report`)
4. **Historial Médico** (`medical_record`)
5. **Imágenes Médicas** (`imaging`)
6. **Otro** (`other`)

## Flujos de Uso

### Subir Documento (Paciente)

1. Usuario va a `/dashboard/documents`
2. Clic en "Subir Documento"
3. Selecciona archivo
4. Completa nombre y categoría
5. Opcionalmente asocia a cita
6. Confirma subida
7. Documento aparece en lista

**Tiempo:** 30-45 segundos

### Ver Documento

1. Usuario hace clic en "Ver"
2. Se abre visualizador
3. Documento se carga (PDF o imagen)
4. Usuario puede ver y descargar

**Tiempo:** 2-5 segundos

### Descargar Documento

1. Usuario hace clic en "Descargar"
2. Se genera URL firmada
3. Descarga automática del archivo

**Tiempo:** 1-3 segundos

## Seguridad

### Implementado

- ✅ Autenticación requerida
- ✅ RLS en Supabase
- ✅ Validación de tipos de archivo
- ✅ Límites de tamaño
- ✅ URLs firmadas temporales
- ✅ Bucket privado
- ✅ Registro de accesos
- ✅ Verificación de permisos en cada operación

### Buenas Prácticas

1. **Nunca exponer rutas directas:** Solo signed URLs
2. **Validar en servidor:** Todas las validaciones críticas en API
3. **Encriptación:** HTTPS en tránsito, encriptación en reposo
4. **Auditoría:** Registrar todos los accesos
5. **Expiración:** URLs firmadas con tiempo limitado

## Configuración de Supabase Storage

### Crear Bucket

1. Ir a Supabase Dashboard > Storage
2. Crear bucket `documents`
3. Configurar como **privado**
4. Configurar políticas de acceso

### Políticas de Storage

```sql
-- Permitir subida solo a usuarios autenticados
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'documents');

-- Permitir lectura solo con signed URLs (manejado por la app)
-- No crear políticas de SELECT públicas
```

## Próximos Pasos

1. ✅ Sistema completo implementado
2. ⏳ Compartir documentos con otros profesionales (con permiso)
3. ⏳ Versiones de documentos (historial)
4. ⏳ Firma digital de documentos
5. ⏳ Integración con sistemas externos (laboratorios)
6. ⏳ Notificaciones cuando se sube documento

## Características Destacadas

- **Seguridad máxima:** Control de acceso estricto, encriptación, auditoría
- **Claridad:** UX simple, no abrumadora
- **Seguridad visible:** Indicadores siempre presentes
- **Funcional:** Subida, visualización, descarga completas
- **Asociación:** Documentos vinculados a citas
- **Auditoría:** Registro de todos los accesos

El sistema está listo para producción y cumple con todos los requisitos de seguridad y claridad para gestión de documentos médicos sensibles.

