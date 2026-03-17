-- =============================================================================
-- NUREA: Funciones RPC para Sistema de Especialidades
-- Ejecutar en Supabase SQL Editor DESPUÉS de crear las tablas y seed
-- =============================================================================

-- =============================================================================
-- 1. Obtener categorías con conteo de especialidades
-- =============================================================================
CREATE OR REPLACE FUNCTION public.get_categories_with_counts(
  p_lang TEXT DEFAULT 'es'
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  slug TEXT,
  description TEXT,
  icon TEXT,
  sort_order INTEGER,
  specialty_count BIGINT,
  professional_count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    CASE WHEN p_lang = 'en' THEN c.name_en ELSE c.name_es END as name,
    c.slug,
    CASE WHEN p_lang = 'en' THEN c.description_en ELSE c.description_es END as description,
    c.icon,
    c.sort_order,
    COUNT(DISTINCT s.id) as specialty_count,
    COUNT(DISTINCT p.id) FILTER (WHERE p.verified = true) as professional_count
  FROM public.categories c
  LEFT JOIN public.specialties s ON s.category_id = c.id AND s.is_active = true
  LEFT JOIN public.professionals p ON p.specialty_id = s.id
  GROUP BY c.id
  ORDER BY c.sort_order;
END;
$$;

-- =============================================================================
-- 2. Obtener especialidades con conteo de profesionales
-- =============================================================================
CREATE OR REPLACE FUNCTION public.get_specialties_with_counts(
  p_lang TEXT DEFAULT 'es',
  p_category_slug TEXT DEFAULT NULL,
  p_search TEXT DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  category_id UUID,
  category_name TEXT,
  category_slug TEXT,
  parent_id UUID,
  name TEXT,
  slug TEXT,
  icon TEXT,
  requires_license BOOLEAN,
  sort_order INTEGER,
  professional_count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.id,
    s.category_id,
    CASE WHEN p_lang = 'en' THEN c.name_en ELSE c.name_es END as category_name,
    c.slug as category_slug,
    s.parent_id,
    CASE WHEN p_lang = 'en' THEN s.name_en ELSE s.name_es END as name,
    s.slug,
    s.icon,
    s.requires_license,
    s.sort_order,
    COUNT(DISTINCT p.id) FILTER (WHERE p.verified = true) as professional_count
  FROM public.specialties s
  JOIN public.categories c ON c.id = s.category_id
  LEFT JOIN public.professionals p ON p.specialty_id = s.id
  WHERE s.is_active = true
    AND (p_category_slug IS NULL OR c.slug = p_category_slug)
    AND (
      p_search IS NULL 
      OR s.name_es ILIKE '%' || p_search || '%'
      OR s.name_en ILIKE '%' || p_search || '%'
    )
  GROUP BY s.id, c.id
  ORDER BY c.sort_order, s.sort_order;
END;
$$;

-- =============================================================================
-- 3. Búsqueda avanzada de profesionales
-- =============================================================================
CREATE OR REPLACE FUNCTION public.search_professionals(
  p_lang TEXT DEFAULT 'es',
  p_specialty_slug TEXT DEFAULT NULL,
  p_category_slug TEXT DEFAULT NULL,
  p_consultation_type TEXT DEFAULT NULL,
  p_available_today BOOLEAN DEFAULT false,
  p_price_min NUMERIC DEFAULT NULL,
  p_price_max NUMERIC DEFAULT NULL,
  p_verified_only BOOLEAN DEFAULT false,
  p_language TEXT DEFAULT NULL,
  p_location TEXT DEFAULT NULL,
  p_search TEXT DEFAULT NULL,
  p_sort_by TEXT DEFAULT 'rating',
  p_page INTEGER DEFAULT 1,
  p_limit INTEGER DEFAULT 12
)
RETURNS TABLE (
  id UUID,
  first_name TEXT,
  last_name TEXT,
  avatar_url TEXT,
  specialty_name TEXT,
  specialty_slug TEXT,
  specialty_icon TEXT,
  category_name TEXT,
  category_slug TEXT,
  bio TEXT,
  university TEXT,
  location TEXT,
  consultation_type TEXT,
  consultation_price NUMERIC,
  online_price NUMERIC,
  in_person_price NUMERIC,
  rating NUMERIC,
  review_count INTEGER,
  verified BOOLEAN,
  years_experience INTEGER,
  languages TEXT[],
  availability JSONB,
  latitude NUMERIC,
  longitude NUMERIC,
  total_count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_offset INTEGER;
  v_total BIGINT;
BEGIN
  v_offset := (p_page - 1) * p_limit;

  -- Calcular total para paginación
  SELECT COUNT(DISTINCT pr.id) INTO v_total
  FROM public.professionals pr
  JOIN public.profiles pf ON pf.id = pr.id
  LEFT JOIN public.specialties s ON s.id = pr.specialty_id
  LEFT JOIN public.categories c ON c.id = s.category_id
  WHERE 
    (NOT p_verified_only OR pr.verified = true)
    AND (p_specialty_slug IS NULL OR s.slug = p_specialty_slug)
    AND (p_category_slug IS NULL OR c.slug = p_category_slug)
    AND (
      p_consultation_type IS NULL 
      OR p_consultation_type = 'all'
      OR pr.consultation_type = p_consultation_type 
      OR pr.consultation_type = 'both'
    )
    AND (p_price_min IS NULL OR pr.consultation_price >= p_price_min)
    AND (p_price_max IS NULL OR pr.consultation_price <= p_price_max)
    AND (p_language IS NULL OR p_language = ANY(pr.languages))
    AND (p_location IS NULL OR pr.location ILIKE '%' || p_location || '%')
    AND (
      p_search IS NULL 
      OR pf.first_name ILIKE '%' || p_search || '%'
      OR pf.last_name ILIKE '%' || p_search || '%'
      OR pr.specialty ILIKE '%' || p_search || '%'
      OR s.name_es ILIKE '%' || p_search || '%'
      OR s.name_en ILIKE '%' || p_search || '%'
    );

  RETURN QUERY
  SELECT 
    pr.id,
    pf.first_name,
    pf.last_name,
    pf.avatar_url,
    CASE WHEN p_lang = 'en' THEN s.name_en ELSE s.name_es END as specialty_name,
    s.slug as specialty_slug,
    s.icon as specialty_icon,
    CASE WHEN p_lang = 'en' THEN c.name_en ELSE c.name_es END as category_name,
    c.slug as category_slug,
    pr.bio,
    pr.university,
    pr.location,
    pr.consultation_type,
    pr.consultation_price,
    pr.online_price,
    pr.in_person_price,
    pr.rating,
    pr.review_count,
    pr.verified,
    pr.years_experience,
    pr.languages,
    pr.availability,
    pr.latitude,
    pr.longitude,
    v_total as total_count
  FROM public.professionals pr
  JOIN public.profiles pf ON pf.id = pr.id
  LEFT JOIN public.specialties s ON s.id = pr.specialty_id
  LEFT JOIN public.categories c ON c.id = s.category_id
  WHERE 
    (NOT p_verified_only OR pr.verified = true)
    AND (p_specialty_slug IS NULL OR s.slug = p_specialty_slug)
    AND (p_category_slug IS NULL OR c.slug = p_category_slug)
    AND (
      p_consultation_type IS NULL 
      OR p_consultation_type = 'all'
      OR pr.consultation_type = p_consultation_type 
      OR pr.consultation_type = 'both'
    )
    AND (p_price_min IS NULL OR pr.consultation_price >= p_price_min)
    AND (p_price_max IS NULL OR pr.consultation_price <= p_price_max)
    AND (p_language IS NULL OR p_language = ANY(pr.languages))
    AND (p_location IS NULL OR pr.location ILIKE '%' || p_location || '%')
    AND (
      p_search IS NULL 
      OR pf.first_name ILIKE '%' || p_search || '%'
      OR pf.last_name ILIKE '%' || p_search || '%'
      OR pr.specialty ILIKE '%' || p_search || '%'
      OR s.name_es ILIKE '%' || p_search || '%'
      OR s.name_en ILIKE '%' || p_search || '%'
    )
  ORDER BY
    CASE WHEN p_sort_by = 'rating' THEN pr.rating END DESC NULLS LAST,
    CASE WHEN p_sort_by = 'price_asc' THEN pr.consultation_price END ASC NULLS LAST,
    CASE WHEN p_sort_by = 'price_desc' THEN pr.consultation_price END DESC NULLS LAST,
    CASE WHEN p_sort_by = 'experience' THEN pr.years_experience END DESC NULLS LAST,
    CASE WHEN p_sort_by = 'reviews' THEN pr.review_count END DESC NULLS LAST,
    pr.rating DESC NULLS LAST
  LIMIT p_limit
  OFFSET v_offset;
END;
$$;

-- =============================================================================
-- 4. Obtener rango de precios para filtros
-- =============================================================================
CREATE OR REPLACE FUNCTION public.get_price_range(
  p_specialty_slug TEXT DEFAULT NULL,
  p_category_slug TEXT DEFAULT NULL
)
RETURNS TABLE (
  min_price NUMERIC,
  max_price NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(MIN(pr.consultation_price), 0) as min_price,
    COALESCE(MAX(pr.consultation_price), 100000) as max_price
  FROM public.professionals pr
  LEFT JOIN public.specialties s ON s.id = pr.specialty_id
  LEFT JOIN public.categories c ON c.id = s.category_id
  WHERE pr.verified = true
    AND pr.consultation_price > 0
    AND (p_specialty_slug IS NULL OR s.slug = p_specialty_slug)
    AND (p_category_slug IS NULL OR c.slug = p_category_slug);
END;
$$;

-- =============================================================================
-- 5. Verificar disponibilidad hoy (helper function)
-- =============================================================================
CREATE OR REPLACE FUNCTION public.is_available_today(
  p_availability JSONB
)
RETURNS BOOLEAN
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  v_today TEXT;
  v_day_schedule JSONB;
BEGIN
  -- Obtener día de la semana en minúsculas (monday, tuesday, etc.)
  v_today := LOWER(to_char(CURRENT_DATE, 'Day'));
  v_today := TRIM(v_today);
  
  -- Mapear a español si es necesario
  v_today := CASE v_today
    WHEN 'monday' THEN 'lunes'
    WHEN 'tuesday' THEN 'martes'
    WHEN 'wednesday' THEN 'miercoles'
    WHEN 'thursday' THEN 'jueves'
    WHEN 'friday' THEN 'viernes'
    WHEN 'saturday' THEN 'sabado'
    WHEN 'sunday' THEN 'domingo'
    ELSE v_today
  END;
  
  -- Verificar si hay slots disponibles hoy
  v_day_schedule := p_availability->v_today;
  
  IF v_day_schedule IS NULL THEN
    RETURN false;
  END IF;
  
  -- Si tiene al menos un slot, está disponible
  RETURN jsonb_array_length(v_day_schedule) > 0;
END;
$$;

-- =============================================================================
-- 6. Obtener profesional por ID con detalles completos
-- =============================================================================
CREATE OR REPLACE FUNCTION public.get_professional_details(
  p_professional_id UUID,
  p_lang TEXT DEFAULT 'es'
)
RETURNS TABLE (
  id UUID,
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  avatar_url TEXT,
  phone TEXT,
  specialty_id UUID,
  specialty_name TEXT,
  specialty_slug TEXT,
  specialty_icon TEXT,
  category_id UUID,
  category_name TEXT,
  category_slug TEXT,
  bio TEXT,
  university TEXT,
  location TEXT,
  consultation_type TEXT,
  consultation_price NUMERIC,
  online_price NUMERIC,
  in_person_price NUMERIC,
  rating NUMERIC,
  review_count INTEGER,
  verified BOOLEAN,
  years_experience INTEGER,
  languages TEXT[],
  availability JSONB,
  registration_number TEXT,
  registration_institution TEXT,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pr.id,
    pf.first_name,
    pf.last_name,
    u.email,
    pf.avatar_url,
    pf.phone,
    s.id as specialty_id,
    CASE WHEN p_lang = 'en' THEN s.name_en ELSE s.name_es END as specialty_name,
    s.slug as specialty_slug,
    s.icon as specialty_icon,
    c.id as category_id,
    CASE WHEN p_lang = 'en' THEN c.name_en ELSE c.name_es END as category_name,
    c.slug as category_slug,
    pr.bio,
    pr.university,
    pr.location,
    pr.consultation_type,
    pr.consultation_price,
    pr.online_price,
    pr.in_person_price,
    pr.rating,
    pr.review_count,
    pr.verified,
    pr.years_experience,
    pr.languages,
    pr.availability,
    pr.registration_number,
    pr.registration_institution,
    pr.created_at
  FROM public.professionals pr
  JOIN public.profiles pf ON pf.id = pr.id
  JOIN auth.users u ON u.id = pr.id
  LEFT JOIN public.specialties s ON s.id = pr.specialty_id
  LEFT JOIN public.categories c ON c.id = s.category_id
  WHERE pr.id = p_professional_id;
END;
$$;

-- =============================================================================
-- Permisos: Permitir llamadas anónimas (lectura pública)
-- =============================================================================
GRANT EXECUTE ON FUNCTION public.get_categories_with_counts TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_specialties_with_counts TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.search_professionals TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_price_range TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_available_today TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_professional_details TO anon, authenticated;
