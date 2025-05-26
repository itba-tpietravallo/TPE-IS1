import { createSupabaseServerClient } from "@/lib/supabase.server";
import { LoaderFunctionArgs, redirect } from "@remix-run/node";
import { MercadoPagoConfig, OAuth } from "mercadopago";

export async function loader({ request }: LoaderFunctionArgs) {
	const url = new URL(request.url);
	// Mercado Pago sends code with the format ?code=TG-68XXXXX4deeff00010XXXXX-XX96307XXX
	// If more processorts were added, we could regex this to infer the processor
	const code = url.searchParams.get("code");
	const origin = url.origin;

	const mercadoPagoConfig = new MercadoPagoConfig({ accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN! });

	const credentials = await new OAuth(mercadoPagoConfig).create({
		body: {
			client_id: process.env.MERCADO_PAGO_PUBLIC_CLIENT_ID!,
			client_secret: process.env.MERCADO_PAGO_CLIENT_SECRET!,
			code: code!,
			redirect_uri: new URL(`/api/v1/payments/oauth/callback`, origin).toString(),
		},
	});

	if (
		!(
			credentials.access_token &&
			credentials.refresh_token &&
			typeof credentials.expires_in === "number" &&
			credentials.expires_in > 0
		)
	) {
		return new Response("Error getting Mercado Pago credentials", {
			status: 500,
			statusText: "Error getting Mercado Pago credentials",
		});
	}

	const { supabaseClient } = createSupabaseServerClient(request);

	const { data, error } = await supabaseClient.auth.getUser();

	if (error || data.user === null || data.user.id === null) {
		return new Response("Unauthorized access", {
			status: 401,
			statusText: `Unauthorized access`,
		});
	}

	const { access_token, refresh_token, expires_in, scope, user_id, public_key, live_mode } = credentials;

	const insert = await supabaseClient.from("mp_oauth_authorization").upsert(
		{
			user_id: data.user.id,
			mercado_pago_user_id: user_id,
			processor: "mercado-pago",
			access_token,
			refresh_token,
			expires_in,
			scope,
			public_key,
			live_mode: live_mode ? 1 : 0,
		},
		{
			count: "exact",
			onConflict: "user_id",
			ignoreDuplicates: false,
		},
	);

	if (insert.error) {
		return new Response(`Error inserting data. ${JSON.stringify(insert.error)}`, {
			status: 500,
			statusText: `Error inserting data. ${JSON.stringify(insert.error)}`,
		});
	}

	return redirect("/api/v1/payments/oauth/success", {
		status: 302,
	});
}
