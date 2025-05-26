import { json } from "@remix-run/node";
import { Resend } from "resend";
import { ReservationConfirmedEmail } from "../../../../../email/react-email-starter/emails/ReservationConfirmedEmail";

export const action = async ({ request }: { request: Request }) => {
	const resend = new Resend(process.env.RESEND_PAYMENT_MAILER);
	const body = await request.json();

	try {
		const data = await resend.emails.send({
			from: "MatchPoint <no-reply@payments.matchpointapp.com.ar>",
			to: body.player_email,
			subject: "Confirmamos tu reserva!",
			react: ReservationConfirmedEmail({
				player_name: body.player_name,
				field_name: body.field_name,
				reservation_date: new Date(body.reservation_date),
				...(body.team_name ? { team_name: body.team_name } : {}),
			}),
		});

		return json({ success: true, data });
	} catch (error) {
		console.error("Error sending email:", error);
		return json({ success: false, error }, { status: 500 });
	}
};
