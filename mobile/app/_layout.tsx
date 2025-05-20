import { SplashScreen, Stack } from "expo-router";

import "react-native-url-polyfill/auto";
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import Auth from "../components/Auth";
import { Session } from "@supabase/supabase-js";
import { StatusBar } from "expo-status-bar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AutocompleteDropdownContextProvider } from "react-native-autocomplete-dropdown";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
	const [session, setSession] = useState<Session | null>(null);

	// This loads instantly, but is set up so it can await fonts or other critical resources.
	const [loaded, setLoaded] = useState(true);

	useEffect(() => {
		if (loaded) {
			SplashScreen.hideAsync();
		}
	}, [loaded]);

	if (!loaded) {
		return null;
	}

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
