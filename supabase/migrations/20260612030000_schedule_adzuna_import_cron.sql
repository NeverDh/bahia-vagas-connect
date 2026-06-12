-- Importação Adzuna a cada hora via pg_cron + pg_net (chama a API NestJS).
-- Requer: extensões pg_cron e pg_net (já habilitadas em migration anterior).
--
-- Após deploy da API pública, configure no SQL Editor do Supabase:
--
--   INSERT INTO public.cron_config (key, value) VALUES
--     ('import_api_url', 'https://SUA-API.com/api/cron/jobs/import'),
--     ('cron_secret', 'MESMO_VALOR_DE_CRON_SECRET_NO_API_ENV')
--   ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now();
--
-- E desligue o cron interno do Nest: ADZUNA_CRON_ENABLED=false

CREATE TABLE IF NOT EXISTS public.cron_config (
  key text PRIMARY KEY,
  value text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.cron_config IS
  'URLs e segredos para jobs pg_cron (ex.: importação Adzuna na API Nest)';

ALTER TABLE public.cron_config ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.invoke_adzuna_import_cron()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions, net, pg_catalog
AS $$
DECLARE
  api_url text;
  cron_secret text;
BEGIN
  SELECT value INTO api_url FROM public.cron_config WHERE key = 'import_api_url';
  SELECT value INTO cron_secret FROM public.cron_config WHERE key = 'cron_secret';

  IF api_url IS NULL OR cron_secret IS NULL OR length(trim(api_url)) = 0 THEN
    RAISE LOG 'invoke_adzuna_import_cron: configure cron_config (import_api_url, cron_secret)';
    RETURN;
  END IF;

  PERFORM net.http_post(
    url := api_url,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'X-Cron-Secret', cron_secret
    ),
    body := '{}'::jsonb,
    timeout_milliseconds := 120000
  );
END;
$$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'adzuna-import-hourly') THEN
    PERFORM cron.unschedule('adzuna-import-hourly');
  END IF;
END $$;

SELECT cron.schedule(
  'adzuna-import-hourly',
  '0 * * * *',
  $$SELECT public.invoke_adzuna_import_cron()$$
);
