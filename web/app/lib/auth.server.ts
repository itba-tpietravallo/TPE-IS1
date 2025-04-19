import { User } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "./supabase.server";
import { LoaderFunctionArgs, redirect } from "@remix-run/node";

/**
 * Call this function within the loader of any route you with to protect.
 * YOU **MUST** AWAIT THIS FUNCTION.
 * @param request - The request object from the loader function
 * @returns
 */
export async function authenticateUser(request: LoaderFunctionArgs["request"]) {
	const { supabaseClient } = createSupabaseServerClient(request);
	const url = new URL(request.url);

	const {
		data: { user },
	} = await supabaseClient.auth.getUser();

	if (!user) {
		return redirect(new URL(`/login?path=${encodeURIComponent(url.pathname)}`, url.origin).toString());
	}

	return {
		user,
		avatar_url: user.user_metadata?.avatar_url as string | undefined | null,
		email: user.user_metadata?.email as string | undefined | null,
		phone: user.user_metadata?.phone as string | undefined | null,
		full_name: user.user_metadata?.full_name as string | undefined | null,
	};
}
