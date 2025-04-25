import { __DANGEROUS_createSupabaseServerClient_BYPASS_RLS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED } from "@/lib/supabase.server";
import { ActionFunctionArgs } from "@remix-run/node";
import { SupabaseClient } from "@supabase/supabase-js";

import { MercadoPagoConfig, MerchantOrder, Payment, PaymentRefund } from "mercadopago";

import createHmac from "create-hmac";

import { mpPaymentsTable } from "@/../../db/schema";

type NotificationType = {
	action: string;
	api_version: "v1";
	data: { id: string }; // number
	date_created: string; // Supabase NEEDS ISO String (assert)
	id: number;
	live_mode: true;
	type: "payment" | "merchant_order";
	user_id: string; // number
};

export async function action({ request }: ActionFunctionArgs) {
	const urlParams = new URLSearchParams(request.url.split("?")[1] || "");
	const user_id = urlParams.get("user_id")!;
	const amount = urlParams.get("amount")!;
	const merchant_fee = urlParams.get("merchant_fee")!;
	const reservation_id = urlParams.get("reservation_id")!;

	const dataID = urlParams.get("data.id");

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
	const manifest = [
		{ id: "id", data: dataID },
		{ id: "request-id", data: xRequestId },
		{ id: "ts", data: ts },
	]
		.map((r) => (r.data ? `${r.id}:${r.data};` : null))
		.filter((a) => !!a)
		.join("");

	// Create an HMAC signature
	const hmac = createHmac("sha256", secret);

	hmac.update(manifest);

	const sha = hmac.digest("hex");
	if (sha === hash) {
		const { supabaseClient } =
			__DANGEROUS_createSupabaseServerClient_BYPASS_RLS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED(request);
		const resp = await processMercadoPagoNotification(
			await request.json(),
			supabaseClient,
			user_id,
			reservation_id,
			Number(amount || 0),
			Number(merchant_fee || 0),
			urlParams.get("id")!, // notification id OR merchant order id
		);

		if (resp) {
			return resp;
		}

		return new Response("HMAC verification passed", {
			status: 200,
			statusText: "HMAC verification passed",
		});
	} else {
		return new Response(`HMAC verification failed. ${manifest}. ${dataID}. ${xRequestId}. ${ts}. ${hash}`, {
			status: 400,
			statusText: `HMAC verification failed. ${manifest}. ${dataID}. ${xRequestId}. ${ts}. ${hash}`,
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
	dataID: string,
): Promise<Response | void> {
	if (!reservation_id || !user_id) {
		return new Response("Missing reservation_id or user_id", {
			status: 200,
			statusText: "Missing reservation_id or user_id",
		});
	}

	const res = await supabaseClient
		.from("reservations")
		.select(
			`
			id,
			fields (
				users!owner (
					full_name,
					mp_oauth_authorization (
						access_token
					)
				)
			)
		`,
		)
		.eq("id", reservation_id)
		.limit(1)
		.single();

	if (
		!res ||
		!res.data ||
		!res.data.fields ||
		!res.data.fields.users ||
		!res.data?.fields.users.mp_oauth_authorization.access_token
	) {
		return new Response("Reservation not found", {
			status: 404,
			statusText: "Reservation not found",
		});
	}

	const mercadoPagoConfig = new MercadoPagoConfig({
		accessToken: res.data?.fields.users.mp_oauth_authorization.access_token,
	});

	switch (data.type || data.topic) {
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

			const { error: error2 } = await supabaseClient
				.from("reservations")
				.update({
					payment_id: Number(data.data.id),
				})
				.eq("id", reservation_id);

			if (error2) {
				console.error("Error updating reservation:", error2);
				return new Response("Error updating reservation", {
					status: 500,
					statusText: "Error updating reservation",
				});
			}

			break;
		}
		case "merchant_order": {
			console.log("Merchant order notification:", JSON.stringify(data));

			const MO = await new MerchantOrder(mercadoPagoConfig)
				.get({
					merchantOrderId: dataID,
				})
				.catch((err) => {
					console.error("Error fetching merchant order:", dataID, err);
					throw new Response("Error fetching merchant order", {
						status: 500,
						statusText: "Error fetching merchant order",
					});
				});

			if (MO && MO.status === "closed") {
				for (let i = 0; i < MO.payments?.length! || 0; i++) {
					const payment = MO.payments![i]!;
					try {
						if (payment.status == "approved") {
							await new PaymentRefund(mercadoPagoConfig)
								.create({
									payment_id: payment.id!,
								})
								.then((res) => {
									console.log("Payment canceled:", res);
								});
						} else {
							await new Payment(mercadoPagoConfig)
								.cancel({
									id: payment.id!,
								})
								.then((res) => {
									console.log("Payment canceled:", res);
								});
						}
					} catch (err) {
						console.warn("Error canceling payment:", err);
					}
				}
			} else {
				console.log("Merchant order is not closed:", MO);
			}

			break;
		}
		default: {
			console.log("Unknown action:", JSON.stringify(data));
			break;
		}
	}

	return;
}
