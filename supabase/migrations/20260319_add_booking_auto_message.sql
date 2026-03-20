-- Add booking_auto_message column to professionals table
-- Used by /api/professional/booking-settings to store the professional's automatic message

ALTER TABLE public.professionals ADD COLUMN IF NOT EXISTS booking_auto_message TEXT;
