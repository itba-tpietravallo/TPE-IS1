-- DROP FUNCTION handle_new_user CASCADE;

CREATE OR REPLACE FUNCTION handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
AS $$
BEGIN
    INSERT INTO public.users (id, full_name, avatar_url, email)
    VALUES (
        new.id, 
        new.raw_user_meta_data->>'full_name', 
        new.raw_user_meta_data->>'avatar_url',
        new.email
    );
    RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE PROCEDURE handle_new_user();