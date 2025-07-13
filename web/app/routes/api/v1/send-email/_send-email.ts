import { json } from "@remix-run/node";
import { Resend } from "resend";
import { PaymentConfirmationEmail } from "../../../../../email/react-email-starter/emails/PaymentConfirmationEmail";
import ReservationConfirmationEmail from "email/react-email-starter/emails/ReservationConfirmationEmail";
import CancelledReservationEmail from "email/react-email-starter/emails/CancelledReservationEmail";

export const action = async ({ request }: { request: Request }) => {
	const resend = new Resend(process.env.RESEND_PAYMENT_MAILER);
	const body = await request.json();
	
	try {
		let data;
		if (body.type === "confirm_reservation") {
			data = await resend.emails.send({
				from: "MatchPoint <no-reply@payments.matchpointapp.com.ar>",
				to: body.player_email,
				subject: "¡Tu reserva está confirmada!",
				react: ReservationConfirmationEmail({
					player_name: body.player_name,
					address: body.address,
					field_name: body.field_name,
					reservation_date: new Date(body.reservation_date),
				}),
			});
		} else if (body.type === "confirm_payment") {
			data = await resend.emails.send({
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
		} else if (body.type === "cancelled_reservation") {
			data = await resend.emails.send({
				from: "MatchPoint <no-reply@payments.matchpointapp.com.ar>",
				to: body.player_email,
				subject: "Reserva cancelada - Procesando reembolso",
				react: CancelledReservationEmail({
					player_name: body.player_name,
					amount: body.amount,
					payment_id: body.payment_id,
					field_name: body.field_name,
					reservation_date: new Date(body.reservation_date),
				}),
			});
		} else {
			throw new Error("Unsupported email type");
		}

		return json({ success: true, data });
	} catch (error) {
		console.error("Error sending email:", error);
		return json({ success: false, error }, { status: 500 });
	}
};
