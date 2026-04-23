-- ============================================================================
--  NUREA · SCHEMA CONSOLIDADO · 00 — Extensiones y utilidades
--  Chile · Temuco · Plataforma de cuidado y bienestar
--  Moneda: CLP · Timezone: America/Santiago
-- ============================================================================
--  Ejecutar este archivo primero en una instancia Supabase nueva.
--  Luego: 01_schema.sql → 02_rls.sql → 03_functions.sql → 04_storage.sql → 05_seeds.sql
-- ============================================================================

begin;

-- Extensiones estándar de Supabase
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";
create extension if not exists "pg_trgm";           -- búsqueda fuzzy
create extension if not exists "unaccent";          -- normalización de tildes
create extension if not exists "citext";            -- texto case-insensitive (emails)

-- Zona horaria por defecto del clúster (aplicar a nivel DB después del init)
-- ALTER DATABASE postgres SET timezone TO 'America/Santiago';

-- ============================================================================
--  Helpers genéricos
-- ============================================================================

-- Trigger para updated_at
create or replace function public.tg_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- Slugify básico con soporte para tildes
create or replace function public.slugify(input text)
returns text
language sql
immutable
as $$
  select trim(both '-' from
    regexp_replace(
      regexp_replace(
        lower(unaccent(coalesce(input, ''))),
        '[^a-z0-9]+', '-', 'g'
      ),
      '-+', '-', 'g'
    )
  )
$$;

-- Validación básica de RUT chileno (formato + dígito verificador módulo 11)
create or replace function public.valida_rut(rut text)
returns boolean
language plpgsql
immutable
as $$
declare
  clean text;
  body text;
  dv  text;
  sum int := 0;
  mult int := 2;
  i int;
  dv_calc int;
  dv_final text;
begin
  if rut is null then return false; end if;
  clean := upper(regexp_replace(rut, '[^0-9K]', '', 'g'));
  if length(clean) < 2 then return false; end if;
  body := substring(clean, 1, length(clean) - 1);
  dv   := substring(clean, length(clean), 1);
  if body !~ '^[0-9]+$' then return false; end if;
  for i in reverse length(body)..1 loop
    sum := sum + (substring(body, i, 1)::int) * mult;
    mult := mult + 1;
    if mult > 7 then mult := 2; end if;
  end loop;
  dv_calc := 11 - (sum % 11);
  dv_final := case
    when dv_calc = 11 then '0'
    when dv_calc = 10 then 'K'
    else dv_calc::text
  end;
  return dv = dv_final;
end;
$$;

commit;
