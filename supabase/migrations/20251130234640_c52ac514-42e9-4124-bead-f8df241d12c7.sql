-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('candidate', 'company');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- RLS policy for user_roles - users can read their own roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

-- Create storage bucket for resumes
INSERT INTO storage.buckets (id, name, public)
VALUES ('resumes', 'resumes', false);

-- Storage policies for resumes
CREATE POLICY "Candidates can upload their own resume"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'resumes' 
  AND auth.uid()::text = (storage.foldername(name))[1]
  AND public.has_role(auth.uid(), 'candidate')
);

CREATE POLICY "Candidates can update their own resume"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'resumes' 
  AND auth.uid()::text = (storage.foldername(name))[1]
  AND public.has_role(auth.uid(), 'candidate')
);

CREATE POLICY "Candidates can delete their own resume"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'resumes' 
  AND auth.uid()::text = (storage.foldername(name))[1]
  AND public.has_role(auth.uid(), 'candidate')
);

CREATE POLICY "Authenticated users can view resumes"
ON storage.objects
FOR SELECT
USING (bucket_id = 'resumes' AND auth.role() = 'authenticated');

-- Trigger to automatically create user role on profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if creating a candidate profile
  IF TG_TABLE_NAME = 'candidate_profiles' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.user_id, 'candidate'::app_role);
  END IF;
  
  -- Check if creating a company profile
  IF TG_TABLE_NAME = 'companies' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.user_id, 'company'::app_role);
  END IF;
  
  RETURN NEW;
END;
$$;

-- Triggers for automatic role assignment
CREATE TRIGGER on_candidate_profile_created
  AFTER INSERT ON public.candidate_profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_role();

CREATE TRIGGER on_company_created
  AFTER INSERT ON public.companies
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_role();