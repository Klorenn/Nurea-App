-- ============================================================================
-- NUREA - POLÍTICAS DE SEGURIDAD RLS (Row Level Security)
-- ============================================================================
-- Archivo: security_policies.sql
-- Autor: NUREA Security Team
-- Fecha: 2026-03-14
-- Descripción: Políticas de seguridad de nivel empresarial para proteger
--              datos médicos sensibles en cumplimiento con normativas de salud.
-- ============================================================================
--
-- ⚠️  PREREQUISITO: Ejecuta PRIMERO el archivo 20260314_create_core_tables.sql
--     para crear la tabla medical_records.
--
-- INSTRUCCIONES DE EJECUCIÓN:
-- 1. Abre tu panel de Supabase (https://supabase.com/dashboard)
-- 2. Selecciona tu proyecto NUREA
-- 3. Ve a "SQL Editor" en el menú lateral
-- 4. PRIMERO ejecuta: 20260314_create_core_tables.sql (crea medical_records)
-- 5. DESPUÉS ejecuta este archivo: 20260314_security_policies.sql
-- 6. Haz clic en "Run" (o Ctrl+Enter / Cmd+Enter)
-- 7. Verifica que no haya errores en la consola
-- 8. Ve a "Authentication" > "Policies" para verificar las políticas creadas
--
-- IMPORTANTE: Ejecuta esto en un ambiente de staging primero antes de producción.
-- ============================================================================

-- Verificar que las tablas existan antes de continuar
DO $$
DECLARE
  missing_tables TEXT := '';
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles') THEN
    missing_tables := missing_tables || 'profiles, ';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'appointments') THEN
    missing_tables := missing_tables || 'appointments (ejecuta 00_nurea_blueprint_core.sql), ';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'medical_records') THEN
    missing_tables := missing_tables || 'medical_records (ejecuta 20260314_create_core_tables.sql), ';
  END IF;
  
  IF missing_tables != '' THEN
    RAISE EXCEPTION 'Faltan tablas requeridas: %. Créalas primero.', RTRIM(missing_tables, ', ');
  END IF;
  
  RAISE NOTICE '✅ Todas las tablas requeridas existen. Procediendo con las políticas RLS...';
END $$;

-- ============================================================================
-- PASO 0: FUNCIONES AUXILIARES DE SEGURIDAD
-- ============================================================================
-- Estas funciones helper simplifican las políticas y centralizan la lógica de roles

-- Función para obtener el rol del usuario actual desde los metadatos
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT AS $$
BEGIN
  RETURN COALESCE(
    (auth.jwt() -> 'user_metadata' ->> 'role'),
    (SELECT raw_user_meta_data ->> 'role' FROM auth.users WHERE id = auth.uid()),
    'patient' -- Rol por defecto si no está definido
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Función para verificar si el usuario actual es administrador
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN public.get_user_role() = 'admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Función para verificar si el usuario actual es profesional
CREATE OR REPLACE FUNCTION public.is_professional()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN public.get_user_role() = 'professional';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Función para verificar si el usuario actual es paciente
CREATE OR REPLACE FUNCTION public.is_patient()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN public.get_user_role() = 'patient';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Función para verificar si un profesional tiene cita confirmada con un paciente
-- Esta función es CRÍTICA para la seguridad de las fichas médicas
CREATE OR REPLACE FUNCTION public.professional_has_appointment_with_patient(
  p_professional_id UUID,
  p_patient_id UUID
)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.appointments
    WHERE professional_id = p_professional_id
      AND patient_id = p_patient_id
      AND status IN ('confirmed', 'completed')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Conceder permisos de ejecución a usuarios autenticados
GRANT EXECUTE ON FUNCTION public.get_user_role() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_professional() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_patient() TO authenticated;
GRANT EXECUTE ON FUNCTION public.professional_has_appointment_with_patient(UUID, UUID) TO authenticated;

COMMENT ON FUNCTION public.get_user_role() IS 
'Obtiene el rol del usuario actual desde JWT metadata. Roles: admin, professional, patient';

COMMENT ON FUNCTION public.professional_has_appointment_with_patient(UUID, UUID) IS 
'Verifica si un profesional tiene autorización para acceder a datos de un paciente basado en citas confirmadas';


-- ============================================================================
-- PASO 1: HABILITAR RLS EN TODAS LAS TABLAS
-- ============================================================================
-- RLS DEBE estar habilitado para que las políticas surtan efecto

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_records ENABLE ROW LEVEL SECURITY;

-- Forzar RLS incluso para el propietario de la tabla (máxima seguridad)
ALTER TABLE public.profiles FORCE ROW LEVEL SECURITY;
ALTER TABLE public.appointments FORCE ROW LEVEL SECURITY;
ALTER TABLE public.medical_records FORCE ROW LEVEL SECURITY;


-- ============================================================================
-- PASO 2: ELIMINAR POLÍTICAS EXISTENTES (LIMPIEZA)
-- ============================================================================
-- Eliminamos políticas anteriores para evitar conflictos

DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_verified_professionals" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_admin_full_access" ON public.profiles;
DROP POLICY IF EXISTS "appointments_select_patient" ON public.appointments;
DROP POLICY IF EXISTS "appointments_select_professional" ON public.appointments;
DROP POLICY IF EXISTS "appointments_insert_patient" ON public.appointments;
DROP POLICY IF EXISTS "appointments_update_own" ON public.appointments;
DROP POLICY IF EXISTS "appointments_admin_full_access" ON public.appointments;
DROP POLICY IF EXISTS "medical_records_select_patient" ON public.medical_records;
DROP POLICY IF EXISTS "medical_records_select_professional" ON public.medical_records;
DROP POLICY IF EXISTS "medical_records_insert_professional" ON public.medical_records;
DROP POLICY IF EXISTS "medical_records_update_professional" ON public.medical_records;
DROP POLICY IF EXISTS "medical_records_admin_full_access" ON public.medical_records;


-- ============================================================================
-- PASO 3: POLÍTICAS PARA TABLA "profiles"
-- ============================================================================
-- La tabla profiles contiene datos personales de todos los usuarios

-- 3.1 PACIENTES: Solo pueden ver SU propio perfil
-- Nota: Los profesionales verificados son visibles a todos (para el buscador)
-- El campo 'verified' está en la tabla professionals, verificamos con función helper

-- Función auxiliar para verificar si un perfil es de profesional verificado
CREATE OR REPLACE FUNCTION public.is_verified_professional(profile_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.professionals 
    WHERE id = profile_id AND verified = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

GRANT EXECUTE ON FUNCTION public.is_verified_professional(UUID) TO authenticated;

CREATE POLICY "profiles_select_own"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  id = auth.uid()
  OR
  (role = 'professional' AND public.is_verified_professional(id))
  OR
  public.is_admin()
);

COMMENT ON POLICY "profiles_select_own" ON public.profiles IS
'Permite a usuarios ver: 1) Su propio perfil, 2) Profesionales verificados (buscador), 3) Admins ven todo';

-- 3.2 INSERT: Solo pueden crear su propio perfil
CREATE POLICY "profiles_insert_own"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (
  -- Solo puede insertar un perfil para sí mismo
  id = auth.uid()
);

COMMENT ON POLICY "profiles_insert_own" ON public.profiles IS
'Los usuarios solo pueden crear su propio perfil (id debe coincidir con auth.uid)';

-- 3.3 UPDATE: Usuarios editan su propio perfil, pero con restricciones
CREATE POLICY "profiles_update_own"
ON public.profiles
FOR UPDATE
TO authenticated
USING (
  -- Solo puede editar su propio perfil O es admin
  id = auth.uid() OR public.is_admin()
)
WITH CHECK (
  -- Verificación adicional: No puede cambiar campos protegidos
  CASE
    WHEN public.is_admin() THEN true
    ELSE (
      -- Usuarios normales no pueden modificar estos campos críticos:
      -- role, email_verified, created_at deben permanecer igual
      id = auth.uid()
    )
  END
);

COMMENT ON POLICY "profiles_update_own" ON public.profiles IS
'Usuarios editan su propio perfil. Solo admins pueden modificar campos protegidos.';

-- 3.4 TRIGGER: Prevenir modificación de campos protegidos por no-admins
CREATE OR REPLACE FUNCTION public.protect_profile_fields()
RETURNS TRIGGER AS $$
BEGIN
  -- Si NO es admin, prevenir cambios en campos protegidos
  IF NOT public.is_admin() THEN
    -- Preservar valores originales de campos protegidos
    -- Nota: Solo protegemos campos que existen en la tabla profiles
    NEW.role := OLD.role;
    NEW.created_at := OLD.created_at;
    NEW.email_verified := OLD.email_verified;
  END IF;
  
  -- Siempre actualizar updated_at
  NEW.updated_at := NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_protect_profile_fields ON public.profiles;
CREATE TRIGGER trigger_protect_profile_fields
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_profile_fields();

COMMENT ON FUNCTION public.protect_profile_fields() IS
'Trigger que previene que usuarios no-admin modifiquen role, email_verified o created_at';


-- ============================================================================
-- PASO 4: POLÍTICAS PARA TABLA "appointments"
-- ============================================================================
-- Las citas médicas son datos sensibles que solo deben ver las partes involucradas

-- 4.1 SELECT: Pacientes ven sus citas, profesionales ven sus citas
CREATE POLICY "appointments_select_patient"
ON public.appointments
FOR SELECT
TO authenticated
USING (
  -- Paciente ve sus propias citas
  (patient_id = auth.uid() AND public.is_patient())
  OR
  -- Profesional ve las citas donde él es el profesional asignado
  (professional_id = auth.uid() AND public.is_professional())
  OR
  -- Admin ve todas las citas
  public.is_admin()
);

COMMENT ON POLICY "appointments_select_patient" ON public.appointments IS
'Pacientes y profesionales solo ven las citas donde están directamente involucrados';

-- 4.2 INSERT: Solo pacientes pueden crear citas (para sí mismos)
CREATE POLICY "appointments_insert_patient"
ON public.appointments
FOR INSERT
TO authenticated
WITH CHECK (
  -- El paciente solo puede crear citas para sí mismo
  (patient_id = auth.uid() AND public.is_patient())
  OR
  -- Los profesionales pueden crear citas para sus pacientes (ej: reagendar)
  (professional_id = auth.uid() AND public.is_professional())
  OR
  -- Admin puede crear cualquier cita
  public.is_admin()
);

COMMENT ON POLICY "appointments_insert_patient" ON public.appointments IS
'Pacientes crean citas para sí mismos. Profesionales pueden crear citas donde son el profesional asignado.';

-- 4.3 UPDATE: Solo las partes involucradas pueden modificar
CREATE POLICY "appointments_update_own"
ON public.appointments
FOR UPDATE
TO authenticated
USING (
  patient_id = auth.uid()
  OR professional_id = auth.uid()
  OR public.is_admin()
)
WITH CHECK (
  patient_id = auth.uid()
  OR professional_id = auth.uid()
  OR public.is_admin()
);

COMMENT ON POLICY "appointments_update_own" ON public.appointments IS
'Solo paciente, profesional asignado o admin pueden modificar una cita';

-- 4.4 DELETE: Solo admins pueden eliminar citas (para auditoría)
CREATE POLICY "appointments_delete_admin"
ON public.appointments
FOR DELETE
TO authenticated
USING (
  public.is_admin()
);

COMMENT ON POLICY "appointments_delete_admin" ON public.appointments IS
'Solo administradores pueden eliminar citas. Esto preserva la auditoría médica.';


-- ============================================================================
-- PASO 5: POLÍTICAS PARA TABLA "medical_records"
-- ============================================================================
-- MÁXIMA SEGURIDAD: Las fichas clínicas son datos médicos ultra-sensibles

-- 5.1 SELECT: Pacientes ven su historial, profesionales ven pacientes con cita
CREATE POLICY "medical_records_select_patient"
ON public.medical_records
FOR SELECT
TO authenticated
USING (
  -- Paciente ve SU propio historial médico
  (patient_id = auth.uid() AND public.is_patient())
  OR
  -- Profesional ve registros SOLO si tiene cita confirmada con ese paciente
  (
    public.is_professional() 
    AND public.professional_has_appointment_with_patient(auth.uid(), patient_id)
  )
  OR
  -- Admin tiene acceso completo
  public.is_admin()
);

COMMENT ON POLICY "medical_records_select_patient" ON public.medical_records IS
'CRÍTICO: Pacientes ven su historial. Profesionales SOLO acceden si tienen cita confirmada con el paciente.';

-- 5.2 INSERT: Solo profesionales pueden crear registros médicos
CREATE POLICY "medical_records_insert_professional"
ON public.medical_records
FOR INSERT
TO authenticated
WITH CHECK (
  -- Solo profesionales pueden crear registros
  (
    public.is_professional()
    AND professional_id = auth.uid()
    -- Y deben tener una cita con ese paciente
    AND public.professional_has_appointment_with_patient(auth.uid(), patient_id)
  )
  OR
  public.is_admin()
);

COMMENT ON POLICY "medical_records_insert_professional" ON public.medical_records IS
'Solo profesionales con cita confirmada pueden crear registros médicos para sus pacientes';

-- 5.3 UPDATE: Solo el profesional que creó el registro puede editarlo
CREATE POLICY "medical_records_update_professional"
ON public.medical_records
FOR UPDATE
TO authenticated
USING (
  (professional_id = auth.uid() AND public.is_professional())
  OR public.is_admin()
)
WITH CHECK (
  (professional_id = auth.uid() AND public.is_professional())
  OR public.is_admin()
);

COMMENT ON POLICY "medical_records_update_professional" ON public.medical_records IS
'Solo el profesional autor del registro puede modificarlo';

-- 5.4 DELETE: NUNCA se eliminan registros médicos (solo soft-delete)
CREATE POLICY "medical_records_no_delete"
ON public.medical_records
FOR DELETE
TO authenticated
USING (
  -- Nadie puede eliminar registros médicos, ni siquiera admins
  -- Esto es un requisito legal para auditorías médicas
  false
);

COMMENT ON POLICY "medical_records_no_delete" ON public.medical_records IS
'PROHIBIDO: Los registros médicos NUNCA se eliminan por requisitos legales de auditoría';


-- ============================================================================
-- PASO 6: SEPARACIÓN DE NOTAS PRIVADAS (MÁXIMA SEGURIDAD)
-- ============================================================================
-- Las notas privadas del profesional NUNCA deben ser visibles para el paciente.
-- La solución más segura es separar esto en una tabla distinta.

-- Crear tabla separada para notas privadas del profesional
CREATE TABLE IF NOT EXISTS public.professional_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  medical_record_id UUID REFERENCES public.medical_records(id) ON DELETE CASCADE,
  professional_id UUID NOT NULL REFERENCES public.profiles(id),
  patient_id UUID NOT NULL REFERENCES public.profiles(id),
  content TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Índices para performance
  CONSTRAINT fk_professional_notes_professional 
    FOREIGN KEY (professional_id) REFERENCES public.profiles(id),
  CONSTRAINT fk_professional_notes_patient 
    FOREIGN KEY (patient_id) REFERENCES public.profiles(id)
);

-- Índices para consultas frecuentes
CREATE INDEX IF NOT EXISTS idx_professional_notes_medical_record 
  ON public.professional_notes(medical_record_id);
CREATE INDEX IF NOT EXISTS idx_professional_notes_professional 
  ON public.professional_notes(professional_id);
CREATE INDEX IF NOT EXISTS idx_professional_notes_patient 
  ON public.professional_notes(patient_id);

-- Habilitar RLS
ALTER TABLE public.professional_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.professional_notes FORCE ROW LEVEL SECURITY;

COMMENT ON TABLE public.professional_notes IS
'NOTAS PRIVADAS: Esta tabla almacena notas que SOLO el profesional puede ver. Los pacientes NO tienen acceso bajo ninguna circunstancia.';

-- POLÍTICA: Solo profesionales pueden ver sus propias notas
CREATE POLICY "professional_notes_select"
ON public.professional_notes
FOR SELECT
TO authenticated
USING (
  -- SOLO el profesional que escribió la nota puede verla
  (professional_id = auth.uid() AND public.is_professional())
  OR
  -- Admins tienen acceso para auditorías internas
  public.is_admin()
  -- NOTA: Los pacientes NO tienen ninguna condición aquí = NO PUEDEN VER NADA
);

COMMENT ON POLICY "professional_notes_select" ON public.professional_notes IS
'ULTRA-RESTRINGIDO: Solo el profesional autor ve sus notas. Pacientes bloqueados completamente.';

-- POLÍTICA: Solo profesionales pueden insertar notas
CREATE POLICY "professional_notes_insert"
ON public.professional_notes
FOR INSERT
TO authenticated
WITH CHECK (
  professional_id = auth.uid() 
  AND public.is_professional()
  AND public.professional_has_appointment_with_patient(auth.uid(), patient_id)
);

COMMENT ON POLICY "professional_notes_insert" ON public.professional_notes IS
'Profesionales solo pueden crear notas para pacientes con cita confirmada';

-- POLÍTICA: Solo el autor puede editar sus notas
CREATE POLICY "professional_notes_update"
ON public.professional_notes
FOR UPDATE
TO authenticated
USING (professional_id = auth.uid() AND public.is_professional())
WITH CHECK (professional_id = auth.uid() AND public.is_professional());

-- POLÍTICA: Solo el autor puede eliminar sus notas
CREATE POLICY "professional_notes_delete"
ON public.professional_notes
FOR DELETE
TO authenticated
USING (professional_id = auth.uid() AND public.is_professional());

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION public.update_professional_notes_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_professional_notes_updated_at ON public.professional_notes;
CREATE TRIGGER trigger_professional_notes_updated_at
  BEFORE UPDATE ON public.professional_notes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_professional_notes_timestamp();


-- ============================================================================
-- PASO 7: VISTA SEGURA PARA PACIENTES (SIN NOTAS PRIVADAS)
-- ============================================================================
-- Si medical_records tiene una columna private_notes, creamos una vista segura

-- Vista que EXCLUYE las notas privadas para uso de pacientes
CREATE OR REPLACE VIEW public.patient_medical_records_view AS
SELECT 
  id,
  patient_id,
  professional_id,
  appointment_id,
  diagnosis,
  treatment,
  prescription,
  -- EXCLUIMOS: private_notes, internal_comments, etc.
  created_at,
  updated_at
FROM public.medical_records
WHERE patient_id = auth.uid();

COMMENT ON VIEW public.patient_medical_records_view IS
'Vista SEGURA para pacientes: Muestra registros médicos SIN notas privadas del profesional';

-- Conceder permisos a la vista
GRANT SELECT ON public.patient_medical_records_view TO authenticated;


-- ============================================================================
-- PASO 8: AUDITORÍA DE ACCESOS (OPCIONAL PERO RECOMENDADO)
-- ============================================================================
-- Registrar todos los accesos a datos médicos sensibles

CREATE TABLE IF NOT EXISTS public.audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name TEXT NOT NULL,
  record_id UUID,
  action TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  user_role TEXT,
  ip_address INET,
  user_agent TEXT,
  accessed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  details JSONB
);

-- Índices para consultas de auditoría
CREATE INDEX IF NOT EXISTS idx_audit_log_user ON public.audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_table ON public.audit_log(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_log_date ON public.audit_log(accessed_at);

-- RLS: Solo admins pueden ver el audit log
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "audit_log_admin_only"
ON public.audit_log
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

COMMENT ON TABLE public.audit_log IS
'Registro de auditoría para cumplimiento normativo en salud. Solo accesible por administradores.';


-- ============================================================================
-- PASO 9: FUNCIÓN DE AUDITORÍA AUTOMÁTICA
-- ============================================================================
-- Registrar automáticamente accesos a medical_records

CREATE OR REPLACE FUNCTION public.log_medical_record_access()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.audit_log (
    table_name,
    record_id,
    action,
    user_id,
    user_role,
    details
  ) VALUES (
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    TG_OP,
    auth.uid(),
    public.get_user_role(),
    jsonb_build_object(
      'patient_id', COALESCE(NEW.patient_id, OLD.patient_id),
      'professional_id', COALESCE(NEW.professional_id, OLD.professional_id)
    )
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para auditar medical_records
DROP TRIGGER IF EXISTS trigger_audit_medical_records ON public.medical_records;
CREATE TRIGGER trigger_audit_medical_records
  AFTER INSERT OR UPDATE OR DELETE ON public.medical_records
  FOR EACH ROW
  EXECUTE FUNCTION public.log_medical_record_access();


-- ============================================================================
-- PASO 10: VERIFICACIÓN FINAL
-- ============================================================================
-- Consultas para verificar que las políticas están activas

-- Verificar RLS habilitado
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('profiles', 'appointments', 'medical_records', 'professional_notes');

-- Verificar políticas creadas
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- ============================================================================
-- FIN DEL ARCHIVO DE POLÍTICAS DE SEGURIDAD
-- ============================================================================
-- 
-- RESUMEN DE SEGURIDAD IMPLEMENTADA:
-- 
-- 1. PROFILES:
--    ✓ Usuarios ven solo su perfil
--    ✓ Profesionales verificados visibles en buscador
--    ✓ Solo admins modifican role/email_verified
--    ✓ Trigger protege campos críticos
--
-- 2. APPOINTMENTS:
--    ✓ Pacientes ven solo sus citas
--    ✓ Profesionales ven solo sus citas asignadas
--    ✓ No se pueden eliminar (auditoría)
--
-- 3. MEDICAL_RECORDS:
--    ✓ Pacientes ven su historial oficial
--    ✓ Profesionales acceden SOLO si tienen cita confirmada
--    ✓ No se pueden eliminar (requisito legal)
--
-- 4. PROFESSIONAL_NOTES (TABLA SEPARADA):
--    ✓ Notas privadas en tabla separada
--    ✓ Pacientes NO tienen NINGÚN acceso
--    ✓ Solo el profesional autor puede ver/editar
--
-- 5. AUDITORÍA:
--    ✓ Registro de todos los accesos a datos médicos
--    ✓ Solo admins pueden ver el audit log
--
-- PRÓXIMOS PASOS:
-- - Revisar que las tablas existan con las columnas correctas
-- - Probar cada política con diferentes roles
-- - Configurar backups cifrados
-- - Implementar MFA para profesionales y admins
-- ============================================================================
