import { ActionFunctionArgs } from "@remix-run/node";
import { SupabaseClient, User } from "@supabase/supabase-js";

import { MercadoPagoConfig, Payment } from "mercadopago";
import { PaymentCreateData } from "mercadopago/dist/clients/payment/create/types";
import { createSupabaseServerClient } from "~/lib/supabase.server";

type PaymentRequest = {
	processor: string;
	amount: number;
	currency: string;
	description: string;
	userId: string;
	email: string;
	installments?: number;
	token: string;
	name: string;
};

export async function action({
	params,
	context,
	request,
}: ActionFunctionArgs & { params: { [key: string]: any } & PaymentRequest }) {
	let reqBody: PaymentRequest;

	const { supabaseClient, headers } = createSupabaseServerClient(request);
	const { data, error } = await supabaseClient.auth.getUser();

	if (error) {
		return new Response("Unauthorized access", {
			status: 401,
			statusText: "Unauthorized access",
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
		case "mercado-pago": {
			return await processMercadoPagoPayment(data.user, reqBody, supabaseClient);
		}

		default:
			return new Response("Invalid payment processor", {
				status: 400,
				statusText: "Invalid payment processor",
			});
	}
}

async function processMercadoPagoPayment(
	user: User,
	reqBody: PaymentRequest,
	supabaseClient: SupabaseClient<any, "public", any>,
) {
	const field = await supabaseClient.from("fields").select("id").limit(1).single();

	if (field.error)
		return new Response("Failed to fetch field", {
			status: 500,
			statusText: field.error.message,
		});

	const time = Math.floor(new Date().getTime() / 1000);

	const reservation = await supabaseClient.from("reservations").insert({
		date: new Date().toISOString().split("T")[0],
		field_id: field.data.id,
		start_time: time,
		owner_id: user.id,
	} as {
		date: string;
		field_id: string;
		start_time: number;
		owner_id: string;
		id?: string | undefined;
	});

	if (reservation.error)
		return new Response("Failed to create reservation", {
			status: 500,
			statusText: reservation.error.message,
		});

	const reservation_id = await supabaseClient
		.from("reservations")
		.select("id")
		.eq("field_id", field.data.id)
		.eq("owner_id", user.id)
		.eq("date", new Date().toISOString().split("T")[0])
		.eq("start_time", time)
		.limit(1)
		.single();

	if (reservation_id.error || !reservation_id.data)
		return new Response("Failed to fetch reservation", {
			status: 500,
			statusText: reservation_id.error.message,
		});

	const { amount, description, userId, email, installments, token, name } = reqBody;

	const parts = (name || "Tomas Pietravallo").toString().split(" ");
	const first_name = parts.shift();
	const last_name = parts.join(" ");

	const mercadoPagoConfig = new MercadoPagoConfig({
		accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN!,
	});

	const paymentData: PaymentCreateData["body"] = {
		transaction_amount: Number(amount),
		description: description.toString(),
		payer: {
			email: email,
			first_name: first_name,
			last_name: last_name,
		},
		installments: Number(installments) || 1,
		notification_url: "https://matchpoint.com/api/v1/payments/notifications",
		external_reference: reservation_id.data.id.toString(),
		token: token.toString(),
	};

	console.log("paymentData", paymentData);

	const payment = await new Payment(mercadoPagoConfig).create({ body: paymentData });

	if (payment.api_response.status !== 201) {
		return new Response("Failed to create Mercado Pago payment", {
			status: payment.api_response.status,
			statusText: payment.status_detail,
		});
	}

	console.log(payment);

	console.log("strfied", JSON.stringify(payment));

	return new Response("Mercado Pago payment processed successfully", {
		status: 200,
		statusText: "OK",
	});
}
