import { Links, Meta, Outlet, Scripts, ScrollRestoration } from "@remix-run/react";
import type { LinksFunction } from "@remix-run/node";

import { Hydrate, QueryCache, QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { useDehydratedState } from "use-dehydrated-state";

import styles from "./tailwind.css?url";
import { useState } from "react";

export const links: LinksFunction = () => [
	{ rel: "stylesheet", href: styles },
	{ rel: "preconnect", href: "https://fonts.googleapis.com" },
	{
		rel: "preconnect",
		href: "https://fonts.gstatic.com",
		crossOrigin: "anonymous",
	},
	{
		rel: "stylesheet",
		href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
	},
];

export function Layout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<head>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<Meta />
				<Links />
			</head>
			<body>
				{children}
				<ScrollRestoration />
				<Scripts />
			</body>
		</html>
	);
}

export default function App() {
	const [queryClient] = useState(
		() =>
			new QueryClient({
				defaultOptions: {
					queries: {
						cacheTime: 1000 * 60 * 5,
						staleTime: 1000 * 60 * 5,
						refetchOnWindowFocus: "always",
						refetchOnReconnect: true,
					}, 
				},
			}),
	);

	const dehydratedState = useDehydratedState();

	return (
		<QueryClientProvider client={queryClient}>
			<Hydrate state={dehydratedState}>
				<Outlet />
			</Hydrate>
		</QueryClientProvider>
	);
}
