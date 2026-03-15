-- Add slug column to professionals for SEO-friendly URLs
ALTER TABLE public.professionals 
ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;

-- Function to generate slug from name
CREATE OR REPLACE FUNCTION public.generate_professional_slug(p_id UUID)
RETURNS TEXT AS $$
DECLARE
    v_first_name TEXT;
    v_last_name TEXT;
    v_specialty TEXT;
    v_slug TEXT;
BEGIN
    SELECT first_name, last_name INTO v_first_name, v_last_name
    FROM public.profiles
    WHERE id = p_id;

    SELECT specialty INTO v_specialty
    FROM public.professionals
    WHERE id = p_id;

    -- Basic slug generation: dr-first-last-specialty
    v_slug := lower(regexp_replace(
        'dr-' || v_first_name || '-' || v_last_name || '-' || v_specialty,
        '[^a-zA-Z0-9]+', '-', 'g'
    ));
    
    -- Trim hyphens from ends
    v_slug := trim(both '-' from v_slug);

    RETURN v_slug;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update existing professionals with slugs
UPDATE public.professionals
SET slug = public.generate_professional_slug(id)
WHERE slug IS NULL;

-- Trigger to auto-generate slug on new professional or name/specialty change
CREATE OR REPLACE FUNCTION public.trigger_generate_professional_slug()
RETURNS TRIGGER AS $$
BEGIN
    NEW.slug := public.generate_professional_slug(NEW.id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- We might need to listen to profile changes too, but for simplicity we'll just handle it here or via manual updates.
-- For now, let's just make sure new professionals get a slug.
DROP TRIGGER IF EXISTS tr_generate_professional_slug ON public.professionals;
CREATE TRIGGER tr_generate_professional_slug
BEFORE INSERT OR UPDATE OF specialty ON public.professionals
FOR EACH ROW
EXECUTE FUNCTION public.trigger_generate_professional_slug();
