import { createSupabaseServerClient } from "@/lib/supabase.server";
import { ActionFunctionArgs, LoaderFunction, LoaderFunctionArgs, redirect } from "@remix-run/node";
import { User } from "@supabase/supabase-js";
import { MercadoPagoConfig, OAuth } from "mercadopago";

type RequestOAuthURL = {
	processor: string;
};

export async function action({ request }: ActionFunctionArgs) {
	let reqBody: RequestOAuthURL;

	const { supabaseClient, headers } = createSupabaseServerClient(request);

	const { data, error } = await supabaseClient.auth.getUser();

	if (error || data.user === null || data.user === null) {
		return new Response("Unauthorized access", {
			status: 401,
			statusText: `Unauthorized access. ${request.headers.get("Authorization")}`,
		});
	}

	try {
		reqBody = (await request.json()) as any;
	} catch (e) {
		return new Response("Invalid JSON", {
			status: 400,
			statusText: "Invalid JSON",
		});
	}

	const { processor } = reqBody;

	switch (processor) {
		case "mercado-pago": {
			return getMercadoPagoOAuthURL(data.user, reqBody, supabaseClient);
		}

		default:
			return new Response("Invalid payment processor", {
				status: 400,
				statusText: "Invalid payment processor",
			});
	}
}

async function getMercadoPagoOAuthURL(user: User, reqBody: RequestOAuthURL, supabaseClient: any) {
	const mercadoPagoConfig = new MercadoPagoConfig({ accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN! });

	const oauth = await new OAuth(mercadoPagoConfig).getAuthorizationURL({
		options: {
			client_id: process.env.MERCADO_PAGO_PUBLIC_CLIENT_ID!,
			redirect_uri: new URL(`/api/v1/payments/oauth/callback`, `https://matchpointapp.com.ar`).toString(),
		},
	});

	return Response.json({ oauth_url: oauth });
}
