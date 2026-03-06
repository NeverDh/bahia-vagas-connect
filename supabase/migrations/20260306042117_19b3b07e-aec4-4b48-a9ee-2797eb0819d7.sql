
-- Enable unaccent extension
CREATE EXTENSION IF NOT EXISTS unaccent SCHEMA public;

-- Create search function that handles accent-insensitive, partial, multi-word search
CREATE OR REPLACE FUNCTION public.search_jobs(search_text text)
RETURNS SETOF uuid
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  words text[];
BEGIN
  -- Split search text into words, removing empty strings
  words := array_remove(string_to_array(trim(search_text), ' '), '');
  
  IF array_length(words, 1) IS NULL THEN
    -- No search terms, return all active job ids
    RETURN QUERY SELECT j.id FROM jobs j WHERE j.status = 'active';
    RETURN;
  END IF;

  RETURN QUERY
  SELECT DISTINCT j.id
  FROM jobs j
  LEFT JOIN companies c ON j.company_id = c.id
  WHERE j.status = 'active'
  AND (
    SELECT bool_and(
      unaccent(lower(j.title)) LIKE '%' || unaccent(lower(w)) || '%'
      OR unaccent(lower(j.description)) LIKE '%' || unaccent(lower(w)) || '%'
      OR unaccent(lower(j.category)) LIKE '%' || unaccent(lower(w)) || '%'
      OR unaccent(lower(COALESCE(c.name, ''))) LIKE '%' || unaccent(lower(w)) || '%'
    )
    FROM unnest(words) AS w
  );
END;
$$;
