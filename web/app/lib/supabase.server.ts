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

export const __DANGEROUS_createSupabaseServerClient_BYPASS_RLS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = (
	request?: Request,
) => {
	const cookies = parseCookieHeader("");
	const headers = new Headers();
	const supabaseClient = createServerClient(
		process.env.SUPABASE_URL!,
		process.env.DANGEROUS_SUPABASE_SECRET_SERVICE_KEY!,
		{
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
		},
	);
	return { supabaseClient, headers };
};
