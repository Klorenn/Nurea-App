-- Add latitude and longitude to professionals table
ALTER TABLE public.professionals 
ADD COLUMN IF NOT EXISTS latitude NUMERIC(10, 7),
ADD COLUMN IF NOT EXISTS longitude NUMERIC(10, 7);

-- Comment on the new columns
COMMENT ON COLUMN public.professionals.latitude IS 'Geographic latitude for map placement.';
COMMENT ON COLUMN public.professionals.longitude IS 'Geographic longitude for map placement.';

-- Update existing professionals with some mock coordinates in Santiago, Chile for testing
-- (Only if they don't have coordinates already)
UPDATE public.professionals
SET latitude = -33.41 + (random() * 0.1),
    longitude = -70.60 + (random() * 0.1)
WHERE latitude IS NULL AND longitude IS NULL;
