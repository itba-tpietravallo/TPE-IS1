import { json } from "@remix-run/node";
import { Resend } from "resend";
import { PaymentConfirmationEmail } from "../../../../../email/react-email-starter/emails/PaymentConfirmationEmail";
import ReservationConfirmationEmail from "email/react-email-starter/emails/ReservationConfirmationEmail";
import CancelledReservationEmail from "email/react-email-starter/emails/CancelledReservationEmail";
import BottiMailFinal from "email/react-email-starter/emails/BottiMailFinal";

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
		} else if (body.type === "botti_mail") {
			const recipientsList = [
				{ name: "Lu", email: "loliveto@itba.edu.ar" },
				{ name: "Max", email: "mwehncke@itba.edu.ar" },
				// { "name": "Fede", "email": "fbotti@itba.edu.ar" },
				// { "name": "Nico", "email": "nmargenat@itba.edu.ar" },
				// { "name": "Elian", "email": "eparedes@itba.edu.ar" },
				// { "name": "Theo", "email": "tshlamovitz@itba.edu.ar" }
			];

			for (const recipient of recipientsList) {
				if (!recipient.email) {
					throw new Error(`Email not provided for ${recipient.name}`);
				}

				console.log(`Sending email to ${recipient.name} at ${recipient.email}`);
				
				await resend.emails.send({
					from: "MatchPoint <no-reply@payments.matchpointapp.com.ar>",
					to: recipient.email,
					subject: "Matchpoint te espera 🏟️",
					cc: 'tpietravallo@itba.edu.ar',
					react: BottiMailFinal({
						player_name: recipient.name,
					}),
				});
			}

			data = { success: true, message: "Emails sent successfully to all recipients." };
		} else {
			throw new Error("Unsupported email type");
		}

		return json({ success: true, data });
	} catch (error) {
		console.error("Error sending email:", error);
		return json({ success: false, error }, { status: 500 });
	}
};
