-- Add Stripe Connect columns to professionals table
ALTER TABLE professionals 
ADD COLUMN IF NOT EXISTS stripe_account_id TEXT,
ADD COLUMN IF NOT EXISTS payouts_enabled BOOLEAN DEFAULT FALSE;

-- Create an index for faster lookups
CREATE INDEX IF NOT EXISTS idx_professionals_stripe_account_id ON professionals(stripe_account_id);

-- Update RLS policies if necessary (assuming they are already set to allow professionals to read their own data)
COMMENT ON COLUMN professionals.stripe_account_id IS 'Stripe Connect Account ID for the professional';
COMMENT ON COLUMN professionals.payouts_enabled IS 'Whether the professional has completed boarding and can receive payouts';
