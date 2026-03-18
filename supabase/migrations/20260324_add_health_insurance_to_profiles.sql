-- Add missing health_insurance column to profiles table

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS health_insurance text;

