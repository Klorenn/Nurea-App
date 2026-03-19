-- Advanced search for health professionals
-- Extensions
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS unaccent;

-- Synonyms table for search aliases
CREATE TABLE IF NOT EXISTS public.search_synonyms (
  id SERIAL PRIMARY KEY,
  alias TEXT NOT NULL,
  value TEXT NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_search_synonyms_alias
  ON public.search_synonyms (lower(alias));

-- Seed common Spanish medical synonyms (idempotent)
INSERT INTO public.search_synonyms (alias, value)
VALUES
  ('psico', 'psicologo'),
  ('psicologa', 'psicologo'),
  ('psicología', 'psicologo'),
  ('psicologia', 'psicologo'),
  ('gneral', 'medicina general'),
  ('general', 'medicina general'),
  ('dermatolo', 'dermatologo')
ON CONFLICT (lower(alias)) DO NOTHING;

-- Trigram indexes to speed up fuzzy search
CREATE INDEX IF NOT EXISTS idx_professionals_specialty_trgm
  ON public.professionals
  USING gin (unaccent(coalesce(specialty, '')) gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_professionals_bio_trgm
  ON public.professionals
  USING gin (unaccent(coalesce(bio, '')) gin_trgm_ops);

-- If you also store a cached searchable text column, index it here
-- CREATE INDEX IF NOT EXISTS idx_professionals_search_text_trgm
--   ON public.professionals
--   USING gin (unaccent(coalesce(search_text, '')) gin_trgm_ops);

-- Helper function to normalize and resolve query synonyms
CREATE OR REPLACE FUNCTION public.normalize_search_query(p_query TEXT)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  v_q TEXT;
  v_syn TEXT;
BEGIN
  IF p_query IS NULL OR btrim(p_query) = '' THEN
    RETURN NULL;
  END IF;

  v_q := lower(unaccent(btrim(p_query)));

  SELECT s.value
  INTO v_syn
  FROM public.search_synonyms s
  WHERE lower(unaccent(s.alias)) = v_q
  LIMIT 1;

  IF v_syn IS NOT NULL THEN
    RETURN lower(unaccent(btrim(v_syn)));
  END IF;

  RETURN v_q;
END;
$$;

-- Smart search over professionals with fuzzy matching and ranking
CREATE OR REPLACE FUNCTION public.buscar_profesionales(p_query TEXT, p_limit INT DEFAULT 30)
RETURNS TABLE (
  id UUID,
  professional_id UUID,
  profile_id UUID,
  first_name TEXT,
  last_name TEXT,
  full_name TEXT,
  specialty TEXT,
  bio TEXT,
  city TEXT,
  rating NUMERIC,
  review_count INT,
  relevance NUMERIC
)
LANGUAGE sql
AS $$
WITH normalized AS (
  SELECT normalize_search_query(p_query) AS q
),
base AS (
  SELECT
    pr.id AS professional_id,
    pr.profile_id,
    pr.specialty,
    pr.bio,
    pr.location AS city,
    pr.rating,
    pr.review_count,
    pf.first_name,
    pf.last_name,
    (coalesce(pf.first_name, '') || ' ' || coalesce(pf.last_name, ''))::text AS full_name
  FROM public.professionals pr
  JOIN public.profiles pf
    ON pf.id = pr.profile_id
  WHERE pr.verified = TRUE
),
scored AS (
  SELECT
    gen_random_uuid() AS id,
    b.professional_id,
    b.profile_id,
    b.first_name,
    b.last_name,
    b.full_name,
    b.specialty,
    b.bio,
    b.city,
    b.rating,
    b.review_count,
    GREATEST(
      similarity(unaccent(coalesce(b.specialty, '')), n.q),
      similarity(unaccent(coalesce(b.full_name, '')), n.q),
      similarity(unaccent(coalesce(b.bio, '')), n.q)
    ) AS relevance
  FROM base b
  CROSS JOIN normalized n
  WHERE
    n.q IS NOT NULL
    AND (
      -- Partial / prefix matches (ILIKE, accent-insensitive)
      unaccent(b.full_name) ILIKE unaccent('%' || n.q || '%') OR
      unaccent(b.specialty) ILIKE unaccent('%' || n.q || '%') OR
      unaccent(coalesce(b.bio, '')) ILIKE unaccent('%' || n.q || '%')
      OR
      -- Fuzzy trigram matches with threshold
      similarity(unaccent(coalesce(b.specialty, '')), n.q) > 0.25 OR
      similarity(unaccent(coalesce(b.full_name, '')), n.q) > 0.3
    )
)
SELECT
  s.id,
  s.professional_id,
  s.profile_id,
  s.first_name,
  s.last_name,
  s.full_name,
  s.specialty,
  s.bio,
  s.city,
  s.rating,
  s.review_count,
  s.relevance
FROM scored s
WHERE s.relevance IS NOT NULL
ORDER BY
  -- Priority: specialty, then name, then bio
  s.relevance DESC,
  s.rating DESC NULLS LAST,
  s.review_count DESC NULLS LAST
LIMIT LEAST(GREATEST(p_limit, 1), 50);
$$;

