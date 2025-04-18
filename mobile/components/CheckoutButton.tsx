import { useEffect, useState } from "react";
import { Platform } from "react-native";

import { openBrowserAsync } from "expo-web-browser";
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import { fetch } from "expo/fetch";

import { Button } from "@rneui/themed";
import { supabase } from "@/lib/supabase";

export default function CheckoutButton() {
	const [ready, setReady] = useState(false);
	const [url, setUrl] = useState<string>("");

	useEffect(() => {
		Linking.addEventListener("url", (event) => {
			const { url } = event;
			if ((url !== null && url.includes("matchpoint://")) || url.includes("exp://")) {
				Platform.OS === "ios" && WebBrowser.dismissBrowser();
			}
		});
	}, []);

	useEffect(() => {
		supabase.auth.getSession().then((res) => {
			if (res.error || res.data == null) {
				throw new Error(res.error?.message || "Authentication error");
			}

			fetch("http://localhost:5173/api/v1/payments", {
				method: "POST",
				body: JSON.stringify({
					userId: res.data.session?.user.id,
					fieldId: "3ae59ad0-57d4-4cbc-bd39-99a29ba7d12e",
					processor: "mercado-pago-redirect",
					pending_url: Linking.createURL("/payment/pending"),
					success_url: Linking.createURL("/(tabs)/(payment)/success"),
					failure_url: Linking.createURL("/payment/failure"),
					// Failure redirect example:
					// exp://10.7.218.143:8081?collection_id=null&collection_status=null&payment_id=null&status=null&external_reference=field:3ae59ad0-57d4-4cbc-bd39-99a29ba7d12e-user:85a36c63-97f6-4c8d-b967-94c8d452a8b1&payment_type=null&merchant_order_id=null&preference_id=449538966-3da6a0e8-89e8-438f-b5ea-4737c408158f&site_id=MLA&processing_mode=aggregator&merchant_account_id=null
				}),
				headers: {
					"Content-Type": "application/json",
					Accept: "application/json",
					apiKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
					access_token: `${res.data.session!.access_token}`,
					refresh_token: `${res.data.session!.refresh_token}`,
				},
			}).then(async (res) => {
				console.log(res);
				if (res.status >= 200 && res.status < 300) {
					const data = await res.text();
					setUrl(data);
					setReady(true);
				} else {
					console.log("Error fetching payment URL", await res.text());
				}
			});
		});
	}, []);

	return <Button disabled={!ready} title="Pagar" onPress={() => openBrowserAsync(url)} />;
}
