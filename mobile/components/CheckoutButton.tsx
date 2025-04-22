import { useEffect, useState } from "react";
import { Animated, Easing, Platform, TouchableOpacity, View } from "react-native";

import { openBrowserAsync } from "expo-web-browser";
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import { fetch } from "expo/fetch";

import { Button, Image, Text } from "@rneui/themed";
import { supabase } from "@/lib/supabase";
import { IconSymbol } from "./ui/IconSymbol";

export default function CheckoutButton({ fieldId }: { fieldId: string }) {
	const [pending, setPending] = useState(false);
	const [error, setError] = useState<string>("");

	async function handlePress() {
		setPending(true);

		await supabase.auth.getSession().then(async (res) => {
			if (res.error || res.data == null) {
				throw new Error(res.error?.message || "Authentication error");
			}

			await fetch("https://matchpointapp.com.ar/api/v1/payments", {
				method: "POST",
				body: JSON.stringify({
					userId: res.data.session?.user.id,
					fieldId,
					processor: "mercado-pago-redirect",
					pending_url: Linking.createURL("/pending"),
					success_url: Linking.createURL("/success"),
					failure_url: Linking.createURL("/failure"),
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
				if (res.status >= 200 && res.status < 300) {
					const data = await res.text();
					await openBrowserAsync(data);
				} else {
					setError(await res.text());
				}
			});
		});
	}

	useEffect(() => {
		Linking.addEventListener("url", (event) => {
			const { url } = event;
			if ((url !== null && url.includes("matchpoint://")) || url.includes("exp://")) {
				Platform.OS === "ios" && WebBrowser.dismissBrowser();
			}
		});
	}, []);

	const spinValue = new Animated.Value(0);

	Animated.loop(
		Animated.timing(spinValue, {
			toValue: 360,
			duration: 1000 * 1,
			easing: Easing.linear,
			useNativeDriver: true,
		}),
	).start();

	return (
		<TouchableOpacity
			style={{ width: "100%", padding: "5%", backgroundColor: error ? "#DC6464" : "#3CAAFA" }}
			onPress={() => handlePress()}
		>
			<View style={{ flexDirection: "row", justifyContent: "center", alignItems: "center" }}>
				<Text style={{ fontWeight: "600", fontSize: 16, color: "white", textAlign: "center" }}>
					{error ? `Error: ${error}` : "Reservar"}
				</Text>

				{pending && (
					<Animated.View
						style={{
							marginLeft: 10,
							transform: [
								{
									rotate: spinValue.interpolate({
										inputRange: [0, 360],
										outputRange: ["0deg", "360deg"],
									}),
								},
							],
						}}
					>
						<Image
							source={require("@/assets/images/loader-circle.png")}
							style={{ width: 20, height: 20, padding: 0, margin: 0, resizeMode: "contain" }}
						/>
					</Animated.View>
				)}
			</View>
		</TouchableOpacity>
	);
}
