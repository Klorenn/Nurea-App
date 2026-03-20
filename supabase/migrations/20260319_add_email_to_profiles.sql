-- Ensure `public.profiles.email` exists for backend queries
-- (your schema connects profiles.id to auth.users(id))

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS email TEXT;

-- Backfill existing profiles
UPDATE public.profiles p
SET email = u.email
FROM auth.users u
WHERE u.id = p.id;

-- Keep `profiles.email` populated for new profile inserts
CREATE OR REPLACE FUNCTION public.profiles_set_email_from_auth()
RETURNS trigger AS $$
BEGIN
  IF NEW.email IS NULL THEN
    SELECT u.email INTO NEW.email
    FROM auth.users u
    WHERE u.id = NEW.id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS profiles_set_email_from_auth_trg ON public.profiles;
CREATE TRIGGER profiles_set_email_from_auth_trg
BEFORE INSERT ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.profiles_set_email_from_auth();

