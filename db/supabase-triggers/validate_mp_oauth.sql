-- DROP FUNCTION validate_mp_oauth CASCADE;

CREATE OR REPLACE FUNCTION validate_mp_oauth() RETURNS trigger AS $$
BEGIN
    IF (new.user_id IS NULL OR new.user_id <> (select auth.uid())) THEN
        RAISE EXCEPTION 'Field owner (id, fk) cannot be different from the authenticated user -- @validate_mp_oauth';
    END IF;
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_mp_oauth_created
BEFORE INSERT ON public.mp_oauth_authorization
FOR EACH ROW EXECUTE PROCEDURE validate_mp_oauth();

CREATE OR REPLACE TRIGGER on_mp_oauth_updated
BEFORE UPDATE ON public.mp_oauth_authorization
FOR EACH ROW EXECUTE PROCEDURE validate_mp_oauth();
