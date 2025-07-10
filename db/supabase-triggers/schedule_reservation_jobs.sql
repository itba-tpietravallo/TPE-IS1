-- CREATE extension IF NOT EXISTS pg_cron WITH SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";
GRANT USAGE ON SCHEMA cron TO postgres;
GRANT ALL ON ALL TABLES IN SCHEMA cron TO postgres;

CREATE OR REPLACE FUNCTION public.schedule_reservation_jobs()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  warning_job_id BIGINT;
  cancellation_job_id BIGINT;
  warning_schedule TEXT;
  cancellation_schedule TEXT;
  project_url TEXT := vault.decrypted_secret('project_url');
  anon_key TEXT := vault.decrypted_secret('anon_key');
BEGIN
  warning_schedule := to_char(new.date_time - INTERVAL '2 days', 'MI HH DD MM *');
  cancellation_schedule := to_char(new.date_time - INTERVAL '1 day', 'MI HH DD MM *');

  SELECT cron.schedule(
    'reservation-warning-' || new.id::TEXT,
    warning_schedule,
    $$
    SELECT
      net.http_post(
        url:=vault.decrypted_secret('project_url') || '/reservation-warning',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer " || vault.decrypted_secret('anon_key')}'::jsonb,
        body:=('{"reservation_id": "' || new.id::TEXT || '"}')::jsonb
      )
    $$
  ) INTO warning_job_id;

  SELECT cron.schedule(
    'reservation-cancellation-' || new.id::TEXT,
    cancellation_schedule,
    $$
    SELECT
      net.http_post(
        url:=vault.decrypted_secret('project_url') || '/reservation-cancellation',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer " || vault.decrypted_secret('anon_key')}'::jsonb,
        body:=('{"reservation_id": "' || new.id::TEXT || '"}')::jsonb
      )
    $$
  ) INTO cancellation_job_id;

  INSERT INTO public.reservation_cron_jobs (reservation_id, warning_job_id, cancellation_job_id)
  VALUES (new.id, warning_job_id, cancellation_job_id);

  RETURN new;
END;
$$;

CREATE TRIGGER on_reservation_created
  AFTER INSERT ON public.reservations
  FOR EACH ROW EXECUTE FUNCTION public.schedule_reservation_jobs();