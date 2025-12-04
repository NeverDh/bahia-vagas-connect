-- Add verification fields to companies table
ALTER TABLE public.companies 
ADD COLUMN IF NOT EXISTS cnpj text,
ADD COLUMN IF NOT EXISTS is_freelancer boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS is_verified boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS phone text;

-- Create index for CNPJ lookup
CREATE INDEX IF NOT EXISTS idx_companies_cnpj ON public.companies(cnpj);

-- Add comment to explain the fields
COMMENT ON COLUMN public.companies.cnpj IS 'CNPJ da empresa (opcional para freelancers)';
COMMENT ON COLUMN public.companies.is_freelancer IS 'Se true, é freelancer e só pode postar vagas freelance';
COMMENT ON COLUMN public.companies.is_verified IS 'Se true, perfil está completo e pode postar vagas';