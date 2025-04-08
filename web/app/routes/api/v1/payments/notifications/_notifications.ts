import { ActionFunctionArgs } from "@remix-run/node";
import createHmac from "create-hmac";

export function action({ request }: ActionFunctionArgs) {
	const urlParams = new URLSearchParams(request.url.split("?")[1] || "");
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
	const manifest = `id:${dataID};request-id:${xRequestId};ts:${ts};`;
	// Create an HMAC signature
	const hmac = createHmac("sha256", secret);

	hmac.update(manifest);

	const sha = hmac.digest("hex");
	if (sha === hash) {
		return new Response("HMAC verification passed", {
			status: 200,
			statusText: "HMAC verification passed",
		});
	} else {
		return new Response("HMAC verification failed", {
			status: 400,
			statusText: "HMAC verification failed",
		});
	}
}
