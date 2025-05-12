import { json } from "@remix-run/node";
import { Resend } from "resend";
import { BottiEmail } from "../../../../../email/react-email-starter/emails/BottiEmail";

export const action = async ({ request }: { request: Request }) => {
	const resend = new Resend(process.env.RESEND_PAYMENT_MAILER);
	const body = await request.json();

	try {
		const data = await resend.emails.send({
			from: "MatchPoint <no-reply@payments.matchpointapp.com.ar>",
			to: body.name,
			subject: "No te quedes sin jugar",
			react: BottiEmail({
				name: body.name,
			}),
		});

		return json({ success: true, data });
	} catch (error) {
		console.error("Error sending email:", error);
		return json({ success: false, error }, { status: 500 });
	}
};
