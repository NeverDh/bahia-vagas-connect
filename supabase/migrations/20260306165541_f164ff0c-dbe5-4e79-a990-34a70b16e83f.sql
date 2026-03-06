
-- Drop existing RESTRICTIVE policies on candidate_profiles
DROP POLICY IF EXISTS "Candidatos podem criar seu próprio perfil" ON candidate_profiles;
DROP POLICY IF EXISTS "Candidatos podem ver seu próprio perfil" ON candidate_profiles;
DROP POLICY IF EXISTS "Candidatos podem atualizar seu próprio perfil" ON candidate_profiles;
DROP POLICY IF EXISTS "Perfis de candidatos são visíveis para empresas" ON candidate_profiles;

-- Recreate as PERMISSIVE policies
CREATE POLICY "Users can insert their own profile"
ON candidate_profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own profile"
ON candidate_profiles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
ON candidate_profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Profiles visible to companies"
ON candidate_profiles
FOR SELECT
TO authenticated
USING (true);
