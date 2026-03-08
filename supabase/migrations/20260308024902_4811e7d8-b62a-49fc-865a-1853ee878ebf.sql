
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.user_id IS NOT NULL THEN
    IF TG_TABLE_NAME = 'candidate_profiles' THEN
      INSERT INTO public.user_roles (user_id, role)
      VALUES (NEW.user_id, 'candidate'::app_role)
      ON CONFLICT (user_id, role) DO NOTHING;
    END IF;
    
    IF TG_TABLE_NAME = 'companies' THEN
      INSERT INTO public.user_roles (user_id, role)
      VALUES (NEW.user_id, 'company'::app_role)
      ON CONFLICT (user_id, role) DO NOTHING;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$function$;
