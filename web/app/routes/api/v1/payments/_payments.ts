import { ActionFunctionArgs } from "@remix-run/node";
import { SupabaseClient, User } from "@supabase/supabase-js";

import { MercadoPagoConfig, Payment, Preference } from "mercadopago";
import { PaymentCreateData } from "mercadopago/dist/clients/payment/create/types";
import { createSupabaseServerClient } from "~/lib/supabase.server";

type PaymentRequest = {
	userId: string;
	fieldId: string;
	processor: string;
	pending_url: string;
	success_url: string;
	failure_url: string;
};

export async function action({
	params,
	context,
	request,
}: ActionFunctionArgs & { params: { [key: string]: any } & PaymentRequest }) {
	let reqBody: PaymentRequest;

	const { supabaseClient, headers } = createSupabaseServerClient(request);

	const { data, error } = await supabaseClient.auth.setSession({
		access_token: `${request.headers.get("access_token")}`,
		refresh_token: `${request.headers.get("refresh_token")}`,
	});

	if (error || data.user === null || data.session === null) {
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

	const { processor, userId } = reqBody;

	if (userId !== data.user.id) {
		return new Response("Authorization mismatch", {
			status: 400,
			statusText: "Authorization mismatch",
		});
	}

	switch (processor) {
		case "mercado-pago-redirect": {
			return await getMercadoPagoRedirectURL(data.user, reqBody, supabaseClient);
		}

		default:
			return new Response("Invalid payment processor", {
				status: 400,
				statusText: "Invalid payment processor",
			});
	}
}

async function getMercadoPagoRedirectURL(
	user: User,
	reqBody: PaymentRequest,
	supabaseClient: SupabaseClient,
): Promise<Response> {
	const { success_url, failure_url, pending_url, fieldId } = reqBody;

	if (!success_url || !pending_url || !failure_url || !fieldId) {
		return new Response("Missing required fields", {
			status: 400,
			statusText: "Missing required fields",
		});
	}

	// GET FIELD MP OAUTH_ACCESS_TOKEN
	const { data, error } = await supabaseClient
		.from("fields")
		.select(
			`
			id,
			owner,
			name,
			description,
			neighborhood,
			city,
			avatar_url,
			images,
			mp_oauth_authorization (
				access_token
			)
		`,
		)
		.single();

	if (error) {
		return new Response(`Error fetching field data: ${error.message}`, {
			status: 500,
			statusText: `Error fetching field data: ${error.message}`,
		});
	}

	if (!data?.mp_oauth_authorization?.at(0)?.access_token) {
		return new Response("Missing Mercado Pago access token", {
			status: 500,
			statusText: "Missing Mercado Pago access token",
		});
	}

	const mercadoPagoConfig = new MercadoPagoConfig({
		accessToken: data?.mp_oauth_authorization?.at(0)?.access_token,
		options: {},
	});

	const preference = await new Preference(mercadoPagoConfig).create({
		body: {
			items: [
				{
					id: fieldId,
					title: data.name,
					description: data.description,
					unit_price: data.price || 100,
					quantity: 1,
					currency_id: "ARS",
					category_id: "others",
				},
			],
			back_urls: {
				success: success_url,
				failure: failure_url,
				pending: pending_url,
			},
			auto_return: "approved",
			payer: {
				name: user.user_metadata.full_name.split(" ")[0],
				surname: user.user_metadata.full_name.split(" ")[1],
				email: user.email,
			},
			binary_mode: true,
			notification_url: "https://matchpointapp.com.ar/api/v1/payments/notifications",
			external_reference: `field:${fieldId}::user:${user.id}`,
		},
	});

	if (
		!preference ||
		preference.api_response.status < 200 ||
		preference.api_response.status >= 300 ||
		!preference.init_point
	) {
		return new Response(`Error connecting to Mercado Pago preference.`, {
			status: 500,
			statusText: `Error connecting to Mercado Pago preference.`,
		});
	}

	return new Response(preference.init_point, {
		status: 200,
	});
}
