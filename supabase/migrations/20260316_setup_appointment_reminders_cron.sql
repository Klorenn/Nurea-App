-- ============================================================================
-- NUREA - RECORDATORIOS AUTOMATIZADOS (Cron + Edge Function)
-- ============================================================================

-- 1. Activar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;

-- 2. Eliminar cron job si ya existe para evitar duplicados
SELECT cron.unschedule('send-appointment-reminders-job');

-- 3. Programar el cron job para ejecutar la Edge Function cada 5 minutos
SELECT cron.schedule(
  'send-appointment-reminders-job',
  '*/5 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://' || current_setting('request.env.SUPABASE_PROJECT_ID') || '.supabase.co/functions/v1/send-appointment-reminders',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('request.env.SUPABASE_SERVICE_ROLE_KEY')
    )
  );
  $$
);

-- NOTA: `pg_net` funciona asíncronamente y no bloquea el hilo del cron job.
-- Logs de pg_cron pueden ser revisados en la tabla `cron.job_run_details`.
