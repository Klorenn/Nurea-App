# Nurea · Schema consolidado Supabase

Scripts SQL auto-contenidos para levantar **una instancia Supabase nueva** con todo lo que la app Nurea necesita: tablas, RLS, funciones, storage y datos semilla. Proyecto con base en **Temuco, Chile** · moneda **CLP** · timezone **America/Santiago**.

## Orden de ejecución

Corre los archivos **en orden**. Cada uno es idempotente (`IF NOT EXISTS`, `DROP POLICY IF EXISTS` antes de `CREATE POLICY`, `ON CONFLICT DO NOTHING/UPDATE`).

```
00_extensions.sql   → extensiones (uuid-ossp, pgcrypto, pg_trgm, unaccent, citext)
                      + helpers genéricos (updated_at, slugify, valida_rut)
01_schema.sql       → tablas + índices + triggers de updated_at
02_rls.sql          → Row Level Security + helpers is_admin / is_professional
03_functions.sql    → triggers (auth → profile), recálculo de rating,
                      RPC search_professionals, complete_appointment_and_release_funds
04_storage.sql      → buckets (avatars, documents, messages, credentials,
                      verification, imaging-studies, dicom-files) + políticas
05_seeds.sql        → platform_settings, categorías, especialidades chilenas,
                      sinónimos de búsqueda
```

## Formas de aplicarlo

**A) Supabase CLI (recomendado)**

```bash
cd supabase
for f in schema/00_extensions.sql schema/01_schema.sql schema/02_rls.sql \
         schema/03_functions.sql schema/04_storage.sql schema/05_seeds.sql; do
  psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f "$f"
done
```

**B) Supabase Dashboard → SQL Editor**

Pega cada archivo y corre en el orden listado.

**C) Docker local (`supabase start`)**

Copia el contenido de cada `.sql` a un archivo timestampeado en `supabase/migrations/` (por ejemplo `20260422010000_consolidated_00_extensions.sql`, etc.) y luego:

```bash
supabase db reset
```

## Después de aplicar

1. Configura la zona horaria a nivel DB (solo disponible con privilegios superusuario):

   ```sql
   alter database postgres set timezone to 'America/Santiago';
   ```

2. Promueve a un usuario a **admin** cuando ya tenga cuenta creada (el trigger `handle_new_user` lo crea como `patient` por defecto):

   ```sql
   update public.profiles set role = 'admin' where email = 'tu@email.cl';
   ```

3. Si vas a usar pagos en prueba, agrega tus claves Stripe / MercadoPago en `platform_settings`:

   ```sql
   insert into public.platform_settings (key, value, description)
   values
     ('stripe_mode', '"test"'::jsonb, 'test | live'),
     ('mercadopago_mode', '"test"'::jsonb, 'test | live')
   on conflict (key) do update set value = excluded.value;
   ```

## Qué cubre

| Tabla | Propósito |
| --- | --- |
| `profiles` | Perfil universal (paciente / profesional / admin) |
| `professionals` | Datos clínicos y comerciales del profesional |
| `professional_specialties`, `professional_credentials` | Especialidades M2M y títulos validables |
| `categories`, `specialties`, `search_synonyms` | Taxonomía + búsqueda con tildes |
| `appointments` | Citas online / presenciales |
| `medical_records`, `prescriptions`, `documents` | Fichas clínicas, recetas, documentos |
| `conversations`, `chat_messages` | Chat paciente ↔ profesional con realtime |
| `reviews`, `favorites` | Reseñas (1 por cita), favoritos |
| `payments` | Stripe + MercadoPago + escrow |
| `support_tickets`, `ticket_messages` | Soporte |
| `notifications`, `admin_notifications` | Notificaciones |
| `platform_settings`, `waitlist`, `audit_log` | Configuración, hard-gate, auditoría |

## RLS en dos líneas

- **Lectura pública**: `profiles` (básico), `professionals`, `reviews`, `specialties`, `categories`, `platform_settings`.
- **Solo participantes**: `appointments`, `medical_records`, `conversations`, `chat_messages`, `documents`, `support_tickets`.
- **Solo admin**: `admin_notifications`, `audit_log`, `waitlist` (lectura), escritura sobre `specialties` / `categories` / `platform_settings`.

Helpers disponibles en RLS:

```sql
select public.is_admin();         -- boolean
select public.is_professional();  -- boolean
```

## Validaciones chilenas

- `public.valida_rut('12.345.678-5')` → `boolean` (valida dígito verificador módulo 11).
- `public.slugify('Nutrición clínica')` → `'nutricion-clinica'`.
- `public.search_professionals('psico', 12)` → top 12 profesionales relevantes (ignora tildes).

## Realtime

Para activar realtime sobre chat, en el Dashboard Supabase:

```
Database → Replication → supabase_realtime
→ incluir: public.chat_messages, public.conversations, public.notifications
```

## Notas

- Todos los campos de dinero son `numeric(12,2)` con `currency` default `'CLP'`.
- Default city/region de nuevos perfiles: `Temuco / Araucanía / CL`.
- El trigger `handle_new_user` crea la fila en `public.profiles` automáticamente al registrarse en `auth.users` y, si el metadata dice `role='professional'`, crea también la fila en `public.professionals`.
