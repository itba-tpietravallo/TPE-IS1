import { json } from "@remix-run/node";
import { Resend } from "resend";
import { PaymentConfirmationEmail } from "../../../../../email/react-email-starter/emails/PaymentConfirmationEmail";

export const action = async ({ request }: { request: Request }) => {
	const resend = new Resend(process.env.RESEND_PAYMENT_MAILER);
	const body = await request.json();

	try {
		const data = await resend.emails.send({
			from: "MatchPoint <no-reply@payments.matchpointapp.com.ar>",
			to: body.player_email,
			subject: "Confirmamos tu pago!",
			react: PaymentConfirmationEmail({
				player_name: body.player_name,
				amount: body.amount,
				payment_id: body.payment_id,
				field_name: body.field_name,
				reservation_date: new Date(body.reservation_date),
			}),
		});

		return json({ success: true, data });
	} catch (error) {
		console.error("Error sending email:", error);
		return json({ success: false, error }, { status: 500 });
	}
};
