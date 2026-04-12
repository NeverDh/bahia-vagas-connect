-- Concede role `admin` ao utilizador com este e-mail (idempotente).
INSERT INTO public.user_roles (user_id, role)
SELECT u.id, 'admin'::public.app_role
FROM auth.users AS u
WHERE lower(u.email) = lower('luisgabriel20000@outlook.com')
ON CONFLICT (user_id, role) DO NOTHING;
