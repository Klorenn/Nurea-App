-- Incrementa uses_count de un referral_code de forma atómica.
-- Solo incrementa si el código sigue activo y no superó max_uses.
CREATE OR REPLACE FUNCTION public.increment_referral_uses(p_code_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.referral_codes
  SET uses_count = uses_count + 1
  WHERE id = p_code_id
    AND is_active = true
    AND uses_count < max_uses;
END;
$$;
