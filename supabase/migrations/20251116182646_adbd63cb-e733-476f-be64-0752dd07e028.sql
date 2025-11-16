-- Remover temporariamente a constraint de foreign key em companies
ALTER TABLE public.companies DROP CONSTRAINT IF EXISTS companies_user_id_fkey;

-- Tornar user_id nullable temporariamente para permitir dados de teste
ALTER TABLE public.companies ALTER COLUMN user_id DROP NOT NULL;