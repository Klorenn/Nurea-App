-- =============================================================================
-- NUREA – Add Stripe Subscription Columns to Profiles
-- Migración para soportar suscripciones SaaS con Stripe
-- =============================================================================

-- Añadir columnas de Stripe a la tabla profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'inactive';

-- Crear índice para búsquedas rápidas por stripe_customer_id
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer_id 
ON public.profiles(stripe_customer_id) 
WHERE stripe_customer_id IS NOT NULL;

-- Crear índice para filtrar por estado de suscripción
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_status 
ON public.profiles(subscription_status);

-- Añadir constraint para validar estados de suscripción permitidos
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'profiles_subscription_status_check'
  ) THEN
    ALTER TABLE public.profiles 
    ADD CONSTRAINT profiles_subscription_status_check 
    CHECK (subscription_status IN (
      'inactive',      -- Sin suscripción
      'active',        -- Suscripción activa
      'past_due',      -- Pago pendiente/atrasado
      'canceled',      -- Suscripción cancelada
      'trialing',      -- En período de prueba
      'unpaid'         -- Impago
    ));
  END IF;
END $$;

-- Comentarios descriptivos
COMMENT ON COLUMN public.profiles.stripe_customer_id IS 'ID del cliente en Stripe (cus_xxx)';
COMMENT ON COLUMN public.profiles.stripe_subscription_id IS 'ID de la suscripción activa en Stripe (sub_xxx)';
COMMENT ON COLUMN public.profiles.subscription_status IS 'Estado actual de la suscripción: inactive, active, past_due, canceled, trialing, unpaid';

-- =============================================================================
-- Políticas RLS para las nuevas columnas
-- Solo el admin y el webhook (service role) pueden modificar estos campos
-- =============================================================================

-- Crear función helper para verificar si es admin o service role
CREATE OR REPLACE FUNCTION public.can_modify_subscription_fields()
RETURNS BOOLEAN AS $$
BEGIN
  -- Service role siempre puede (webhooks)
  IF current_setting('role', true) = 'service_role' THEN
    RETURN true;
  END IF;
  
  -- Admins pueden
  IF EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  ) THEN
    RETURN true;
  END IF;
  
  RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Trigger para proteger campos de suscripción
CREATE OR REPLACE FUNCTION public.protect_subscription_fields()
RETURNS TRIGGER AS $$
BEGIN
  -- Si se están modificando campos de suscripción
  IF (OLD.stripe_customer_id IS DISTINCT FROM NEW.stripe_customer_id OR
      OLD.stripe_subscription_id IS DISTINCT FROM NEW.stripe_subscription_id OR
      OLD.subscription_status IS DISTINCT FROM NEW.subscription_status) THEN
    
    -- Verificar permisos
    IF NOT public.can_modify_subscription_fields() THEN
      RAISE EXCEPTION 'Solo administradores o el sistema pueden modificar campos de suscripción';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Aplicar trigger (solo si no existe)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'protect_subscription_fields_trigger'
  ) THEN
    CREATE TRIGGER protect_subscription_fields_trigger
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.protect_subscription_fields();
  END IF;
END $$;

-- =============================================================================
-- Verificación
-- =============================================================================
DO $$
DECLARE
  col_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO col_count
  FROM information_schema.columns
  WHERE table_schema = 'public' 
    AND table_name = 'profiles'
    AND column_name IN ('stripe_customer_id', 'stripe_subscription_id', 'subscription_status');
  
  IF col_count = 3 THEN
    RAISE NOTICE '✓ Columnas de Stripe añadidas correctamente a profiles';
  ELSE
    RAISE WARNING '⚠ Solo se encontraron % de 3 columnas esperadas', col_count;
  END IF;
END $$;
