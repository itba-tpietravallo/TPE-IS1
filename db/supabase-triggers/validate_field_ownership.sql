-- DROP FUNCTION validate_new_field CASCADE;
-- DROP FUNCTION validate_field_deletion CASCADE;

CREATE OR REPLACE FUNCTION validate_new_field() RETURNS trigger AS $$
BEGIN
    IF (new.owner IS NULL OR new.owner <> (select auth.uid())) THEN
        RAISE EXCEPTION 'Field owner (id, fk) cannot be different from the authenticated user -- @validate_new_field';
    END IF;
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION validate_field_deletion() RETURNS trigger AS $$
BEGIN
    IF (old.owner IS NULL OR old.owner <> (select auth.uid())) THEN
        RAISE EXCEPTION 'Field owner (id, fk) cannot be different from the authenticated user -- @validate_field_deletion';
    END IF;
    RETURN old;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_field_created
BEFORE INSERT ON public.fields
FOR EACH ROW EXECUTE PROCEDURE validate_new_field();

CREATE OR REPLACE TRIGGER on_field_updated
BEFORE UPDATE ON public.fields
FOR EACH ROW EXECUTE PROCEDURE validate_new_field();

CREATE OR REPLACE TRIGGER on_field_deleted
BEFORE DELETE ON public.fields
FOR EACH ROW EXECUTE PROCEDURE validate_field_deletion();