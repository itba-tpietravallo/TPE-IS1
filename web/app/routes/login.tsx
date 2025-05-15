import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { Card, CardTitle } from "~/components/ui/card";
import { Link, useLoaderData } from "@remix-run/react";
import { Suspense, useEffect } from "react";
import { LoaderFunctionArgs } from "@remix-run/node";
import { createSupabaseClient } from "~/lib/supabase";

export function loader(args: LoaderFunctionArgs) {
	const env = {
		SUPABASE_URL:
			process.env.VERCEL_ENV === "production" ? process.env.PROD_SUPABASE_URL! : process.env.DEV_SUPABASE_URL!,
		SUPABASE_ANON_KEY:
			process.env.VERCEL_ENV === "production"
				? process.env.PROD_SUPABASE_ANON_KEY!
				: process.env.DEV_SUPABASE_ANON_KEY!,
	};

	return {
		env,
		url: new URL(args.request.url),
	};
}

export function LoginCard() {
	const { url, env } = useLoaderData<typeof loader>();
	const supabase = createSupabaseClient(env);
	const rurl =
		url.origin.toString() + "/login/callback" + `?path=` + encodeURIComponent(url.searchParams.get("path") ?? "");

	useEffect(() => {
		supabase.auth.onAuthStateChange((event, session) => {
			supabase.auth.getUser().then(({ data, error }) => {
				if (error) return;
				if (event === "SIGNED_IN" && data.user.app_metadata.provider === "email") {
					// Redirect to the path specified in the query string
					const path = new URLSearchParams(window.location.search).get("path");
					if (path) {
						window.location.href = path;
					} else {
						window.location.href = "/canchas";
					}
				} else if (event === "SIGNED_OUT") {
					// Handle sign out event if needed
				}
			});
		});
	}, []);

	return (
		<Card className="flex flex-col items-center justify-center p-4">
			<CardTitle>Welcome to MatchPoint!</CardTitle>
			<div className="min-w-96">
				<Suspense fallback={<div>Loading...</div>}>
					<Auth
						supabaseClient={supabase}
						appearance={{ theme: ThemeSupa }}
						providers={["google", "facebook"]}
						redirectTo={rurl}
						onlyThirdPartyProviders={false}
					/>
				</Suspense>
			</div>
			<div className="flex flex-row items-start justify-start gap-4">
				<Link className="text-sm text-gray-500 underline" to={"/privacy"} hrefLang="en">
					Privacy Policy
				</Link>
				<Link className="text-sm text-gray-500 underline" to={"/tos"} hrefLang="en">
					Terms of Service
				</Link>
			</div>
		</Card>
	);
}

export default function () {
	return (
		<div className="flex h-screen items-center justify-center">
			<LoginCard />
		</div>
	);
}
