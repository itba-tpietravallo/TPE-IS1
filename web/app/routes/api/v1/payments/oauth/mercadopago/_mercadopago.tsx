import { createSupabaseServerClient } from "@/lib/supabase.server";
import { __GET_PUBLIC_ENV } from "@lib/getenv.server";
import { LoaderFunctionArgs, redirect } from "@remix-run/node";
import { User } from "@supabase/supabase-js";
import { MercadoPagoConfig, OAuth } from "mercadopago";

export async function loader({ request }: LoaderFunctionArgs) {
	const { supabaseClient, headers } = createSupabaseServerClient(request);

	const { data, error } = await supabaseClient.auth.getUser();

	if (error || data.user === null || data.user === null) {
		return new Response("Unauthorized access", {
			status: 401,
			statusText: `Unauthorized access. ${request.headers.get("Authorization")}`,
		});
	}

	return await getMercadoPagoOAuthURL(data.user, supabaseClient);
}

async function getMercadoPagoOAuthURL(user: User, supabaseClient: any) {
	const mercadoPagoConfig = new MercadoPagoConfig({ accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN! });
	const url = __GET_PUBLIC_ENV().URL_ORIGIN;

	const oauth = await new OAuth(mercadoPagoConfig).getAuthorizationURL({
		options: {
			client_id: process.env.MERCADO_PAGO_PUBLIC_CLIENT_ID!,
			redirect_uri: new URL(`/api/v1/payments/oauth/callback`, url).toString(),
		},
	});

	return redirect(oauth, {
		status: 302,
	});
}
