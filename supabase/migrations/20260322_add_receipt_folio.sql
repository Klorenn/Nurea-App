-- Migration to add receipt_folio and automated generation logic
ALTER TABLE public.finances ADD COLUMN IF NOT EXISTS receipt_folio TEXT UNIQUE;

-- Function to generate a sequential receipt folio
CREATE OR REPLACE FUNCTION generate_receipt_folio()
RETURNS TRIGGER AS $$
DECLARE
  v_year TEXT;
  v_count INT;
BEGIN
  v_year := to_char(now(), 'YYYY');
  -- Count receipts in current year to generate sequence
  SELECT count(*) + 1 INTO v_count FROM public.finances WHERE to_char(created_at, 'YYYY') = v_year;
  
  -- Format: REC-2026-000001
  NEW.receipt_folio := 'REC-' || v_year || '-' || lpad(v_count::text, 6, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate folio on insert
DROP TRIGGER IF EXISTS trigger_generate_receipt_folio ON public.finances;
CREATE TRIGGER trigger_generate_receipt_folio
BEFORE INSERT ON public.finances
FOR EACH ROW
WHEN (NEW.receipt_folio IS NULL)
EXECUTE FUNCTION generate_receipt_folio();
