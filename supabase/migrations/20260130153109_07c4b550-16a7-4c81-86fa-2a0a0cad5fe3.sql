-- Add column to store the original job URL
ALTER TABLE public.jobs ADD COLUMN external_url TEXT;