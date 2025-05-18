import { LoaderFunctionArgs } from "@remix-run/node";

export const loader = async ({ request }: LoaderFunctionArgs) => {
	const env = new URL(request.url).searchParams.get("env") || process.env.VERCEL_ENV;

	const DATABASE_ENDPOINT = env === "production" ? process.env.PROD_SUPABASE_URL! : process.env.DEV_SUPABASE_URL!;
	const DATABASE_ANON_KEY =
		env === "production" ? process.env.PROD_SUPABASE_ANON_KEY! : process.env.DEV_SUPABASE_ANON_KEY!;

	const IMAGE_BUCKET_URLS = JSON.parse(
		(env === "production" ? process.env.IMAGE_BUCKET_URLS : process.env.IMAGE_BUCKET_URLS_DEV) || "[]",
	) as string[];

	const headers = new Headers(request.headers);
	headers.set("Cache-Control", "no-store");
	headers.set("Content-Type", "application/json");
	headers.set("Access-Control-Allow-Origin", "*");
	headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");

	return Response.json(
		{
			DATABASE_ENDPOINT,
			DATABASE_ANON_KEY,
			IMAGE_BUCKET_URLS,
		},
		{
			headers: headers,
			status: 200,
		},
	);
};
