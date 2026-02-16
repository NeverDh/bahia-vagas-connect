
-- Table to store editable meta tags per page
CREATE TABLE public.meta_tags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  page_path TEXT NOT NULL UNIQUE,
  title TEXT,
  description TEXT,
  og_title TEXT,
  og_description TEXT,
  og_image TEXT,
  keywords TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.meta_tags ENABLE ROW LEVEL SECURITY;

-- Everyone can read meta tags (needed for SEO)
CREATE POLICY "Meta tags são públicas para leitura"
ON public.meta_tags FOR SELECT
USING (true);

-- Only admins can manage meta tags
CREATE POLICY "Admins podem inserir meta tags"
ON public.meta_tags FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins podem atualizar meta tags"
ON public.meta_tags FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins podem deletar meta tags"
ON public.meta_tags FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_meta_tags_updated_at
BEFORE UPDATE ON public.meta_tags
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
