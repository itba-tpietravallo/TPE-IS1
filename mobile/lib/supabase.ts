import { AppState } from "react-native";
import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

import { focusManager } from "@tanstack/react-query";
import { onlineManager } from "@tanstack/react-query";
import * as Network from "expo-network";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useRef } from "react";
import { MODE_BASE_URL } from "./mode";

export let supabase: ReturnType<typeof createClient>;

export let DATABASE_ANON_KEY: string;

export const initializeSupabaseClient = async () => {
	if (supabase) {
		return supabase;
	}

	const res = await fetch(new URL(`/api/v1/env`, MODE_BASE_URL).toString(), {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
			"Cache-Control": "no-cache",
			Pragma: "no-cache",
			Expires: "0",
		},
	});

	if (!res.ok) {
		throw new Error(`Failed to fetch Supabase configuration: ${res.status} ${res.statusText}`);
	}

	const data = (await res.json()) as { DATABASE_ENDPOINT: string; DATABASE_ANON_KEY: string };

	const supabaseUrl = data.DATABASE_ENDPOINT!;
	const supabaseAnonKey = data.DATABASE_ANON_KEY!;

	DATABASE_ANON_KEY = data.DATABASE_ANON_KEY!;

	supabase = createClient(supabaseUrl, supabaseAnonKey, {
		auth: {
			storage: AsyncStorage,
			autoRefreshToken: true,
			persistSession: true,
			detectSessionInUrl: false,
			debug: false, // enable to print Supabase auth logs
		},
	});
};

onlineManager.setEventListener((setOnline) => {
	const eventSubscription = Network.addNetworkStateListener((state) => {
		setOnline(!!state.isConnected);
	});
	return eventSubscription.remove;
});

// Tells Supabase Auth to continuously refresh the session automatically
// if the app is in the foreground. When this is added, you will continue
// to receive `onAuthStateChange` events with the `TOKEN_REFRESHED` or
// `SIGNED_OUT` event if the user's session is terminated. This should
// only be registered once.
let sub = AppState.addEventListener("change", (state) => {
	focusManager.setFocused(state === "active");

	if (state === "active") {
		supabase.auth.startAutoRefresh();
	} else {
		supabase.auth.stopAutoRefresh();
	}
});

export function useRefreshOnFocus<T>(refetch: () => Promise<T>) {
	const firstTimeRef = useRef(true);

	useFocusEffect(
		useCallback(() => {
			console.log("useRefreshOnFocus");
			if (firstTimeRef.current) {
				firstTimeRef.current = false;
				return;
			}

			refetch();
		}, [refetch]),
	);
}
