import { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { createBrowserClient } from "@supabase/ssr";
import { useEffect, useState } from "react";

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
		URL_ORIGIN: new URL(args.request.url).origin,
	};
}

export default function () {
	const { URL_ORIGIN, env } = useLoaderData<typeof loader>();
	const supabase = createBrowserClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);

	const [users, setUsers] = useState<any[]>([]);

	useEffect(() => {
		supabase
			.from("users")
			.select("*")
			// .limit(10)
			.then(({ data, error }) => {
				setUsers(data as any[]);
			});
	}, []);

	return (
		<div>
			<p>Hola</p>
			{users.map((user, i) => {
				return <p key={i}> {JSON.stringify(user)} </p>;
			})}
		</div>
	);
}
