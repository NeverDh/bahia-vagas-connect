-- Update trigger to handle null user_id (for imported companies without an owner)
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Only create role if user_id is not null
  IF NEW.user_id IS NOT NULL THEN
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
  END IF;
  
  RETURN NEW;
END;
$function$;
