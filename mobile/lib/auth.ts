import { Button } from "react-native";
import { makeRedirectUri } from "expo-auth-session";
import * as QueryParams from "expo-auth-session/build/QueryParams";
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import { supabase } from "./supabase";

WebBrowser.maybeCompleteAuthSession(); // required for web only

const redirectTo = makeRedirectUri({ scheme: "matchpointapp://", preferLocalhost: true, path: "/" });

export const createSessionFromUrl = async (url: string) => {
	const { params, errorCode } = QueryParams.getQueryParams(url);

	if (errorCode) throw new Error(errorCode);

	const { access_token, refresh_token } = params;
	if (!access_token) return;

	const { data, error } = await supabase.auth.setSession({
		access_token,
		refresh_token,
	});

	if (error) throw error;
	return data.session;
};

export const performOAuth = async (provider: "google" | "facebook") => {
	console.log("performOAuth", provider);
	console.log("redirectTo", redirectTo);
	// console.log("linking", Linking.useURL());

	const { data, error } = await supabase.auth.signInWithOAuth({
		provider: provider,
		options: {
			redirectTo,
			skipBrowserRedirect: true,
		},
	});

	if (error) throw error;

	const res = await WebBrowser.openAuthSessionAsync(data?.url ?? "", redirectTo);

	if (res.type === "success") {
		const { url } = res;
		await createSessionFromUrl(url);
	}
};

export const sendMagicLink = async () => {
	const { error } = await supabase.auth.signInWithOtp({
		email: "valid.email@supabase.io",
		options: {
			emailRedirectTo: redirectTo,
		},
	});
	if (error) throw error;
	// Email sent.
};
