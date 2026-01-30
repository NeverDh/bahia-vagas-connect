-- Create policy for admins to view all jobs (including inactive)
CREATE POLICY "Admins podem ver todas as vagas"
ON public.jobs
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Create policy for admins to insert jobs
CREATE POLICY "Admins podem criar vagas"
ON public.jobs
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Create policy for admins to update any job
CREATE POLICY "Admins podem atualizar qualquer vaga"
ON public.jobs
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Create policy for admins to delete any job
CREATE POLICY "Admins podem deletar qualquer vaga"
ON public.jobs
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Create policy for admins to view all companies
CREATE POLICY "Admins podem ver todas as empresas"
ON public.companies
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Create policy for admins to update any company
CREATE POLICY "Admins podem atualizar empresas"
ON public.companies
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Create policy for admins to delete any company
CREATE POLICY "Admins podem deletar empresas"
ON public.companies
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Create policy for admins to manage user_roles
CREATE POLICY "Admins podem ver roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins podem inserir roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins podem atualizar roles"
ON public.user_roles
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins podem deletar roles"
ON public.user_roles
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));