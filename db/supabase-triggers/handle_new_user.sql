-- DROP FUNCTION handle_new_user CASCADE;

CREATE OR REPLACE FUNCTION handle_new_user() RETURNS trigger AS $$
BEGIN
    INSERT INTO public.users (id, full_name, avatar_url)
    VALUES (
        new.id, 
        new.raw_user_meta_data->>'full_name', 
        new.raw_user_meta_data->>'avatar_url'
    )
    ON CONFLICT (id) DO NOTHING;  -- This will ignore the insert if the id already exists
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        RAISE WARNING 'An error occurred while handling the new user: %', SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE PROCEDURE handle_new_user();