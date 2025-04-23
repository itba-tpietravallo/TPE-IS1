import { createServerClient, parseCookieHeader, serializeCookieHeader } from "@supabase/ssr";

export const createSupabaseServerClient = (request?: Request) => {
	const cookies = parseCookieHeader(request?.headers?.get("Cookie") ?? "");
	const headers = new Headers();
	const supabaseClient = createServerClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!, {
		cookies: {
			get(key) {
				return cookies.find((c) => c.name == key)?.value;
			},
			set(key, value, options) {
				headers.append("Set-Cookie", serializeCookieHeader(key, value, options));
			},
			remove(key, options) {
				headers.append("Set-Cookie", serializeCookieHeader(key, "", options));
			},
		},
	});
	return { supabaseClient, headers };
};
