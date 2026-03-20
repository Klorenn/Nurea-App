-- Fix: provide an overloaded RPC wrapper with the argument order
-- that supabase-js expects when building the RPC signature.
--
-- Current supabase-js error:
-- "Could not find the function public.update_verification_status(p_new_status, p_notes, p_professional_id) in the schema cache"
--
-- The original function (from 20260313_add_kyp_verification_fields.sql) is:
-- update_verification_status(p_professional_id UUID, p_new_status verification_status, p_notes TEXT)
--
-- This migration adds an overload with swapped types order:
-- update_verification_status(p_new_status verification_status, p_notes TEXT, p_professional_id UUID)
-- which simply forwards the call to the original function.

CREATE OR REPLACE FUNCTION public.update_verification_status(
  p_new_status public.verification_status,
  p_professional_id UUID,
  p_notes TEXT DEFAULT NULL
)
RETURNS BOOLEAN
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Forward to the original implementation with the expected parameter order.
  RETURN public.update_verification_status(p_professional_id, p_new_status, p_notes);
END;
$$;

