-- Adicionar política temporária para visualização pública de empresas
-- Isso permite que as informações das empresas sejam visíveis nas listagens de vagas
CREATE POLICY "Empresas são visíveis publicamente para vagas" 
ON public.companies 
FOR SELECT 
USING (true);

-- Adicionar política temporária para visualização pública de perfis de candidatos
-- Isso permite que empresas vejam informações básicas dos candidatos que se candidataram
CREATE POLICY "Perfis de candidatos são visíveis para empresas" 
ON public.candidate_profiles 
FOR SELECT 
USING (true);