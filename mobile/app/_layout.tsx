import { SplashScreen, Stack } from "expo-router";

import "react-native-url-polyfill/auto";
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import Auth from "../components/Auth";
import { Session } from "@supabase/supabase-js";
import { StatusBar } from "expo-status-bar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AutocompleteDropdownContextProvider } from "react-native-autocomplete-dropdown";
import * as Sentry from "@sentry/react-native";

Sentry.init({
	dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
	// Adds more context data to events (IP address, cookies, user, etc.)
	// For more information, visit: https://docs.sentry.io/platforms/react-native/data-management/data-collected/
	sendDefaultPii: true,
});

function RootLayout() {
	const [session, setSession] = useState<Session | null>(null);

	useEffect(() => {
		supabase.auth.getSession().then(({ data: { session } }) => {
			setSession(session);
		});

		supabase.auth.onAuthStateChange((_event, session) => {
			setSession(session);
		});
	}, []);

	const queryClient = new QueryClient({
		defaultOptions: {
			queries: {
				gcTime: 1000 * 60 * 5,
				staleTime: 1000 * 60 * 5,
				refetchOnReconnect: "always",
				refetchOnWindowFocus: "always",
				refetchOnMount: "always",
			},
		},
	});

	return (
		// <ThemeProvider > */}
		<QueryClientProvider client={queryClient}>
			<AutocompleteDropdownContextProvider>
				{session && session.user ? (
					<>
						<Stack>
							<Stack.Screen name="(tabs)" options={{ headerShown: false }} />
							<Stack.Screen name="+not-found" />
						</Stack>
						<StatusBar style="auto" />
					</>
				) : (
					<Auth />
				)}
			</AutocompleteDropdownContextProvider>
		</QueryClientProvider>
	);
}

export default Sentry.wrap(RootLayout);
