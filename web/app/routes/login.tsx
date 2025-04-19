import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { Card, CardTitle } from "~/components/ui/card";
import { Link, useLoaderData } from "@remix-run/react";
import { Suspense } from "react";
import { LoaderFunctionArgs } from "@remix-run/node";
import { createSupabaseClient } from "~/lib/supabase";

export function loader(args: LoaderFunctionArgs) {
	const env = {
		SUPABASE_URL: process.env.SUPABASE_URL!,
		SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY!,
	};

	return {
		env,
		URL_ORIGIN: new URL(args.request.url).origin,
	};
}

export function LoginCard() {
	const { URL_ORIGIN, env } = useLoaderData<typeof loader>();
	const supabase = createSupabaseClient(env);

	return (
		<Card className="flex flex-col items-center justify-center p-4">
			<CardTitle>Welcome to MatchPoint!</CardTitle>
			<div className="min-w-96">
				<Suspense fallback={<div>Loading...</div>}>
					<Auth
						supabaseClient={supabase}
						appearance={{ theme: ThemeSupa }}
						providers={["google", "facebook"]}
						redirectTo={new URL(URL_ORIGIN).toString() + "login/callback"}
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
