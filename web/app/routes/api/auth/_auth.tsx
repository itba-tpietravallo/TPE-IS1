import { LoaderFunctionArgs } from "@remix-run/node";

const SUPABASE_URL_CALLBACK = "https://xqliokcqwbwivehrgaft.supabase.co/auth/v1/callback";
const REDIRECT_STATUS = 307;

export async function loader(args: LoaderFunctionArgs) {
	const params = new URL(args.request.url).searchParams;
	const headers = new Headers(args.request.headers);
	headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
	headers.set("Pragma", "no-cache");
	headers.set("Expires", "0");
	headers.set(
		"Location",
		`${new URL(SUPABASE_URL_CALLBACK).origin}${new URL(SUPABASE_URL_CALLBACK).pathname}?${params}`,
	);

	return new Response(null, {
		status: REDIRECT_STATUS,
		headers,
	});
}
