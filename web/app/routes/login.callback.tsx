import type { ActionFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { createSupabaseServerClient } from "../lib/supabase.server";

export const loader = async ({ request }: ActionFunctionArgs) => {
	const url = new URL(request.url);
	const code = url.searchParams.get("code");
	const path = url.searchParams.get("path");

	const redirectPath = path ? decodeURIComponent(path) : "/canchas";

	if (code) {
		const { supabaseClient, headers } = createSupabaseServerClient(request);
		const { error } = await supabaseClient.auth.exchangeCodeForSession(code);

		if (error) {
			return redirect(new URL("/login", url.origin).toString());
		}

		return redirect(new URL(redirectPath, url.origin).toString(), {
			headers,
		});
	}

	return new Response("Authentication failed", {
		status: 400,
	});
};
