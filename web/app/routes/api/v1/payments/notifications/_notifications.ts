import { __DANGEROUS_createSupabaseServerClient_BYPASS_RLS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED } from "@/lib/supabase.server";
import { ActionFunctionArgs } from "@remix-run/node";
import { SupabaseClient } from "@supabase/supabase-js";

import { MercadoPagoConfig, MerchantOrder, Payment } from "mercadopago";

import createHmac from "create-hmac";

import { mpPaymentsTable } from "@/../../db/schema";

type NotificationType = {
	action: string;
	api_version: "v1";
	data: { id: string }; // number
	date_created: string; // Supabase NEEDS ISO String (assert)
	id: number;
	live_mode: true;
	type: "payment";
	user_id: string; // number
};

export async function action({ request }: ActionFunctionArgs) {
	const urlParams = new URLSearchParams(request.url.split("?")[1] || "");
	const user_id = urlParams.get("user_id")!;
	const amount = urlParams.get("amount")!;
	const merchant_fee = urlParams.get("merchant_fee")!;
	const reservation_id = urlParams.get("reservation_id")!;

	const dataID = urlParams.get("data.id") || "";

	const xSignature = request.headers.get("x-signature") || "";
	const xRequestId = request.headers.get("x-request-id") || "";

	const parts = xSignature?.split(",");

	let ts;
	let hash;

	parts?.forEach((part) => {
		const [key, value] = part.split("=");
		if (key && value) {
			const trimmedKey = key.trim();
			const trimmedValue = value.trim();
			if (trimmedKey === "ts") {
				ts = trimmedValue;
			} else if (trimmedKey === "v1") {
				hash = trimmedValue;
			}
		}
	});

	// Obtain the secret key for the user/application from Mercadopago developers site
	const secret = process.env.MERCADO_PAGO_SECRET_KEY!;
	// Generate the manifest string
	const manifest = dataID ? `id:${dataID};request-id:${xRequestId};ts:${ts};` : `request-id:${xRequestId};ts:${ts};`;
	// Create an HMAC signature
	const hmac = createHmac("sha256", secret);

	hmac.update(manifest);

	const sha = hmac.digest("hex");
	if (sha === hash) {
		// const { supabaseClient } =
		// 	__DANGEROUS_createSupabaseServerClient_BYPASS_RLS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED(request);
		// const resp = await processMercadoPagoNotification(
		// 	await request.json(),
		// 	supabaseClient,
		// 	user_id,
		// 	reservation_id,
		// 	Number(amount || 0),
		// 	Number(merchant_fee || 0),
		// );

		// if (resp) {
		// 	return resp;
		// }

		return new Response("HMAC verification passed", {
			status: 200,
			statusText: "HMAC verification passed",
		});
	} else {
		console.error("HMAC verification failed");
		return new Response("HMAC verification failed", {
			status: 400,
			statusText: "HMAC verification failed",
		});
	}
}

async function processMercadoPagoNotification(
	data: NotificationType,
	supabaseClient: SupabaseClient,
	user_id: string,
	reservation_id: string,
	amount: number,
	merchant_fee: number,
): Promise<Response | void> {
	const mercadoPagoConfig = new MercadoPagoConfig({ accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN! });

	switch (data.action) {
		case "payment": {
			const { error } = await supabaseClient.from("mp_payments").insert({
				payment_id: Number(data.data.id),
				user_id: user_id,
				reservation_id: reservation_id,
				status: data.action,
				last_updated: new Date(),
				transaction_amount: amount,
				net_received_amount: merchant_fee,
				total_paid_amount: amount,
			} as typeof mpPaymentsTable.$inferInsert);

			if (error) {
				console.error("Error inserting notification:", error);
				return new Response("Error inserting notification", {
					status: 500,
					statusText: "Error inserting notification",
				});
			}
			break;
		}
		case "merchant_order": {
			// const MO = await new MerchantOrder(mercadoPagoConfig).get({
			// 	merchantOrderId: data.data.id,
			// });

			// if (MO.status === "closed") {
			// 	try {
			// 		await new Payment(mercadoPagoConfig).cancel({
			// 			id: data.data.id,
			// 		})
			// 		.then(res => {
			// 			console.log("Payment canceled:", res);
			// 		})
			// 		.catch(e => {
			// 			throw e;
			// 		});
			// 	} catch (err) {
			// 		console.error("Error canceling payment:", err);
			// 	}
			// } else {
			// 	console.log("Merchant order is not closed:", MO);
			// }

			break;
		}
	}
	return;
}
