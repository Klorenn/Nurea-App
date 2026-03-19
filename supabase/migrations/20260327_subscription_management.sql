-- =============================================================================
-- NUREA – Advanced Subscription Management
-- Support for manual approvals and trial extensions
-- =============================================================================

-- Add new columns to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS trial_end_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS selected_plan_id TEXT;

-- Update constraint to include pending_approval
ALTER TABLE public.profiles 
DROP CONSTRAINT IF EXISTS profiles_subscription_status_check;

ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_subscription_status_check 
CHECK (subscription_status IN (
  'inactive',
  'active',
  'past_due',
  'canceled',
  'trialing',
  'unpaid',
  'pending_approval' -- Added state
));

-- Comments
COMMENT ON COLUMN public.profiles.trial_end_date IS 'Fecha en la que termina el período de gracia o prueba.';
COMMENT ON COLUMN public.profiles.selected_plan_id IS 'ID del plan seleccionado o solicitado (professional, graduate).';

-- Extension to the protection trigger to include new fields
CREATE OR REPLACE FUNCTION public.protect_subscription_fields()
RETURNS TRIGGER AS $$
BEGIN
  -- Si se están modificando campos de suscripción
  IF (OLD.stripe_customer_id IS DISTINCT FROM NEW.stripe_customer_id OR
      OLD.stripe_subscription_id IS DISTINCT FROM NEW.stripe_subscription_id OR
      OLD.subscription_status IS DISTINCT FROM NEW.subscription_status OR
      OLD.trial_end_date IS DISTINCT FROM NEW.trial_end_date OR
      OLD.selected_plan_id IS DISTINCT FROM NEW.selected_plan_id) THEN
    
    -- Verificar permisos
    IF NOT public.can_modify_subscription_fields() THEN
      RAISE EXCEPTION 'Solo administradores o el sistema pueden modificar campos de suscripción';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
