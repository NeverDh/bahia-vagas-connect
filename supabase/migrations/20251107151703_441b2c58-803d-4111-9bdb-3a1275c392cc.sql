-- Criar tipo enum para status de vaga
CREATE TYPE public.job_status AS ENUM ('active', 'closed', 'draft');

-- Criar tipo enum para tipo de contrato
CREATE TYPE public.contract_type AS ENUM ('clt', 'pj', 'temporary', 'intern', 'freelance');

-- Criar tipo enum para nível de experiência
CREATE TYPE public.experience_level AS ENUM ('intern', 'junior', 'mid', 'senior', 'specialist');

-- Criar tabela de empresas/recrutadores
CREATE TABLE public.companies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  logo_url TEXT,
  website TEXT,
  location TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de vagas
CREATE TABLE public.jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  requirements TEXT,
  benefits TEXT,
  salary_min DECIMAL(10,2),
  salary_max DECIMAL(10,2),
  location TEXT NOT NULL,
  contract_type public.contract_type NOT NULL,
  experience_level public.experience_level NOT NULL,
  status public.job_status NOT NULL DEFAULT 'active',
  category TEXT NOT NULL,
  remote_option BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Criar tabela de perfis de candidatos
CREATE TABLE public.candidate_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT,
  resume_url TEXT,
  bio TEXT,
  skills TEXT[],
  linkedin_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de candidaturas
CREATE TABLE public.applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  candidate_id UUID NOT NULL REFERENCES public.candidate_profiles(id) ON DELETE CASCADE,
  cover_letter TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(job_id, candidate_id)
);

-- Habilitar RLS
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidate_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

-- Políticas para companies
CREATE POLICY "Empresas podem ver seus próprios dados"
  ON public.companies FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Empresas podem criar seu próprio perfil"
  ON public.companies FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Empresas podem atualizar seus próprios dados"
  ON public.companies FOR UPDATE
  USING (auth.uid() = user_id);

-- Políticas para jobs (vagas públicas para leitura)
CREATE POLICY "Todos podem ver vagas ativas"
  ON public.jobs FOR SELECT
  USING (status = 'active');

CREATE POLICY "Empresas podem criar vagas"
  ON public.jobs FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.companies
    WHERE companies.id = company_id
    AND companies.user_id = auth.uid()
  ));

CREATE POLICY "Empresas podem atualizar suas vagas"
  ON public.jobs FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.companies
    WHERE companies.id = company_id
    AND companies.user_id = auth.uid()
  ));

CREATE POLICY "Empresas podem deletar suas vagas"
  ON public.jobs FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.companies
    WHERE companies.id = company_id
    AND companies.user_id = auth.uid()
  ));

-- Políticas para candidate_profiles
CREATE POLICY "Candidatos podem ver seu próprio perfil"
  ON public.candidate_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Candidatos podem criar seu próprio perfil"
  ON public.candidate_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Candidatos podem atualizar seu próprio perfil"
  ON public.candidate_profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- Políticas para applications
CREATE POLICY "Candidatos podem ver suas candidaturas"
  ON public.applications FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.candidate_profiles
    WHERE candidate_profiles.id = candidate_id
    AND candidate_profiles.user_id = auth.uid()
  ));

CREATE POLICY "Empresas podem ver candidaturas de suas vagas"
  ON public.applications FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.jobs
    JOIN public.companies ON jobs.company_id = companies.id
    WHERE jobs.id = job_id
    AND companies.user_id = auth.uid()
  ));

CREATE POLICY "Candidatos podem criar candidaturas"
  ON public.applications FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.candidate_profiles
    WHERE candidate_profiles.id = candidate_id
    AND candidate_profiles.user_id = auth.uid()
  ));

CREATE POLICY "Candidatos podem atualizar suas candidaturas"
  ON public.applications FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.candidate_profiles
    WHERE candidate_profiles.id = candidate_id
    AND candidate_profiles.user_id = auth.uid()
  ));

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
CREATE TRIGGER update_companies_updated_at
  BEFORE UPDATE ON public.companies
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_jobs_updated_at
  BEFORE UPDATE ON public.jobs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_candidate_profiles_updated_at
  BEFORE UPDATE ON public.candidate_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_applications_updated_at
  BEFORE UPDATE ON public.applications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();