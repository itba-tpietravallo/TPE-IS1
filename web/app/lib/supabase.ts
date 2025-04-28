import { createBrowserClient } from "@supabase/ssr";

export function createSupabaseClient(env: { SUPABASE_URL: string; SUPABASE_ANON_KEY: string }) {
	return createBrowserClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);
}
