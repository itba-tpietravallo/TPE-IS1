import { LoaderFunctionArgs } from "@remix-run/node";
import { __GET_PUBLIC_ENV } from "@lib/getenv.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
	const env = (new URL(request.url).searchParams.get("env") || process.env.VERCEL_ENV) as
		| "production"
		| "development";

	const headers = new Headers(request.headers);
	headers.set("Cache-Control", "no-store");
	headers.set("Content-Type", "application/json");
	headers.set("Access-Control-Allow-Origin", "*");
	headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");

	return Response.json(__GET_PUBLIC_ENV(env), {
		headers: headers,
		status: 200,
	});
};
