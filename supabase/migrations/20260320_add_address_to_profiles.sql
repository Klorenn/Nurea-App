-- =============================================================================
-- NUREA - Add address column to profiles
-- Fecha: 2026-03-20
-- Descripción: La página de perfil del paciente muestra y permite editar la
--              dirección, pero la columna no existía en la tabla profiles.
--              Sin esta columna el PUT /api/user/profile falla con un error
--              de columna desconocida.
-- =============================================================================

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS address TEXT;
