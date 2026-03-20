-- Drop the duplicate overload introduced in 20260331_fix_update_verification_status_rpc.sql.
-- That overload was meant to fix a supabase-js schema-cache mismatch, but it caused ambiguity
-- because both overloads accept the same three parameter *types* (text/uuid/text after casting).
-- The original function already supports named parameters, so a single definition is enough.

DROP FUNCTION IF EXISTS public.update_verification_status(
  public.verification_status,
  UUID,
  TEXT
);
