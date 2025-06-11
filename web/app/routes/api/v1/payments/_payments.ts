import { ActionFunctionArgs } from "@remix-run/node";
import { SupabaseClient, User } from "@supabase/supabase-js";

import { MercadoPagoConfig, Preference } from "mercadopago";
import {
	__DANGEROUS_createSupabaseServerClient_BYPASS_RLS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED,
	createSupabaseServerClient,
} from "~/lib/supabase.server";
import { PreferenceCreateData } from "mercadopago/dist/clients/preference/create/types";
import { __GET_PUBLIC_ENV } from "@lib/getenv.server";
import { Database } from "@lib/autogen/database.types";

type PaymentRequest = {
	userId: string;
	fieldId: string;
	reservationId: string;
	processor: string;
	pending_url: string;
	success_url: string;
	failure_url: string;
	date_time: string;
	price?: number;
};

function uuidv4() {
	return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (c) =>
		(+c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (+c / 4)))).toString(16),
	);
}

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

	const user = (await supabaseClient.auth.getUser()).data.user;

	if (error || user === null || error) {
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

	if (userId !== user.id) {
		return new Response("Authorization mismatch", {
			status: 400,
			statusText: "Authorization mismatch",
		});
	}

	switch (processor) {
		case "mercado-pago-redirect": {
			let ___DANGEROUS_createSupabaseServerClient_BYPASS_RLS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED: SupabaseClient<Database>;
			try {
				if (
					!process.env.PROD_DANGEROUS_SUPABASE_SECRET_SERVICE_KEY &&
					!process.env.DEV_DANGEROUS_SUPABASE_SECRET_SERVICE_KEY
				) {
					throw new Error("Missing environment variables for Supabase secret service key.");
				}
				___DANGEROUS_createSupabaseServerClient_BYPASS_RLS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED =
					__DANGEROUS_createSupabaseServerClient_BYPASS_RLS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED(
						request,
					).supabaseClient;
			} catch (e) {
				if (request.url.includes("localhost")) {
					return new Response("Unauthorized access", {
						status: 401,
						statusText: "Unauthorized access.",
					});
				} else {
					return new Response("Internal Server Error", {
						status: 500,
						statusText: "Internal Server Error",
					});
				}
			}

			return await getMercadoPagoRedirectURL(
				user,
				reqBody,
				___DANGEROUS_createSupabaseServerClient_BYPASS_RLS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED,
			);
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
	___DANGEROUS_createSupabaseServerClient_BYPASS_RLS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED: SupabaseClient<Database>,
): Promise<Response> {
	const { success_url, failure_url, pending_url, fieldId, date_time, price } = reqBody;

	if (!success_url || !pending_url || !failure_url || !fieldId || !date_time) {
		return new Response("Missing required fields", {
			status: 400,
			statusText: "Missing required fields",
		});
	}

	// GET FIELD MP OAUTH_ACCESS_TOKEN
	const { data, error } = await ___DANGEROUS_createSupabaseServerClient_BYPASS_RLS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED
		.from("fields")
		.select(
			`
			id,
			owner,
			name,
			description,
			price,
			avatar_url,
			images,
			users!owner (
				mp_oauth_authorization!user_id (
					access_token
				)
			)
		`,
		)
		.eq("id", fieldId)
		.limit(1)
		.single();

	if (error) {
		return new Response(`Error fetching field data: ${error.message}`, {
			status: 500,
			statusText: `Error fetching field data: ${error.message}`,
		});
	}

	if (
		!data ||
		!data.users ||
		// @ts-ignore Not an array
		!data.users.mp_oauth_authorization ||
		// @ts-ignore Not an array either
		!data?.users.mp_oauth_authorization.access_token
	) {
		return new Response(`Cancha no autorizada.`, {
			status: 406,
			statusText: `Cancha no autorizada.`,
		});
	}

	const mercadoPagoConfig = new MercadoPagoConfig({
		// @ts-ignore Not an array
		accessToken: data.users.mp_oauth_authorization.access_token,
		options: { timeout: 5000 },
	});

	const RESERVATION_ID = reqBody.reservationId;

	const url = __GET_PUBLIC_ENV().URL_ORIGIN;

	const BODY: PreferenceCreateData = {
		body: {
			items: [
				{
					id: fieldId,
					title: data.name,
					description: data.description!,
					unit_price: price === undefined ? data.price : price,
					quantity: 1,
					currency_id: "ARS",
					category_id: "others",
					picture_url: data.avatar_url!,
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
			notification_url: new URL(
				`api/v1/payments/notifications?user_id=${user.id}&reservation_id=${RESERVATION_ID}&amount=${price === undefined ? data.price : price}&merchant_fee=${0}`,
				url,
			).toString(),
			external_reference: `${RESERVATION_ID}`,
			marketplace: "8221763286725670",
			marketplace_fee: 0,
		},
		requestOptions: {
			timeout: 5000,
			idempotencyKey: `${RESERVATION_ID}-${Math.floor(new Date().getTime() / 1000 / 60)}`,
		},
	};

	const preference = await new Preference(mercadoPagoConfig).create(BODY);

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
