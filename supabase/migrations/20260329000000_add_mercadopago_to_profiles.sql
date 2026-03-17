-- Migration: add_mercadopago_to_profiles
-- Description: Adds Mercado Pago Marketplace tracking fields to profiles table

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS mp_access_token text,
ADD COLUMN IF NOT EXISTS mp_refresh_token text,
ADD COLUMN IF NOT EXISTS mp_user_id text,
ADD COLUMN IF NOT EXISTS mp_public_key text,
ADD COLUMN IF NOT EXISTS mp_token_updated_at timestamp with time zone;
