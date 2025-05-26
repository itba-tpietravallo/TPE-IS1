import { useEffect, useState } from "react";
import { Animated, Easing, Platform, TouchableOpacity, View } from "react-native";

import { openBrowserAsync } from "expo-web-browser";
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import { fetch } from "expo/fetch";

import { Button, Image, Text } from "@rneui/themed";
import { supabase } from "@/lib/supabase";
import { IconSymbol } from "./ui/IconSymbol";
import { Link, usePathname } from "expo-router";

const ButtonStyles = {
	error: {
		backgroundColor: "#DC6464",
	},
	success: {
		backgroundColor: "#67FF67",
		text: "Pago exitoso",
	},
	pending: {
		backgroundColor: "#FFA500",
		text: "Esperando pago",
	},
	failure: {
		backgroundColor: "#DC6464",
		text: "Pago rechazado",
	},
	default: {
		backgroundColor: "#f18f04",
		text: "Pagar",
	},
};

export default function PayPending({
	reservationId,
	fieldId,
	date_time,
	price,
}: {
	reservationId: string;
	fieldId: string;
	date_time: string;
	price: number;
}) {
	const [pending, setPending] = useState(false);
	const [status, setStatus] = useState<"error" | "failure" | "pending" | "success" | "default">("default");
	const [error, setError] = useState<string | null>(null);
	const path = usePathname();

	async function handlePress() {
		setPending(true);

		await supabase.auth.getSession().then(async (res) => {
			if (res.error || res.data == null) {
				throw new Error(res.error?.message || "Authentication error");
			}

			await fetch(
				new URL(
					"/api/v1/payments",
					Linking.getLinkingURL()?.includes("exp://")
						? "https://tpe-is1-itba-5q1r5qblg-tomas-pietravallos-projects-3cd242b1.vercel.app"
						: "https://matchpointapp.com.ar/",
				).toString(),
				{
					method: "POST",
					body: JSON.stringify({
						userId: res.data.session?.user.id,
						fieldId,
						reservationId,
						processor: "mercado-pago-redirect",
						pending_url: Linking.createURL(`${path}?pending`),
						success_url: Linking.createURL(`${path}?success`),
						failure_url: Linking.createURL(`${path}?failure`),
						date_time,
						price,
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
				},
			).then(async (res) => {
				if (res.status >= 200 && res.status < 300) {
					const data = await res.text();
					await openBrowserAsync(data);
				} else {
					setError(await res.text());
					setStatus("error");
				}
			});
		});
	}

	useEffect(() => {
		Linking.addEventListener("url", (event) => {
			const { url } = event;

			const queryParams = Linking.parse(url).queryParams || {};
			if (queryParams.hasOwnProperty("failure")) {
				setStatus("failure");
			} else if (queryParams.hasOwnProperty("success")) {
				setStatus("success");
			} else if (queryParams.hasOwnProperty("pending")) {
				// @todo handle pending, check whether payment was successful via api
				setStatus("pending");
			} else {
				setStatus("pending");
				setPending(false);
			}

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
			disabled={pending}
			style={{
				width: 130,
				padding: "5%",
				backgroundColor: ButtonStyles[status].backgroundColor,
				borderRadius: 12,
				opacity: 1,
			}}
			onPress={() => handlePress()}
		>
			<View style={{ flexDirection: "row", justifyContent: "center", alignItems: "center" }}>
				<Text style={{ fontWeight: "600", fontSize: 16, color: "white", textAlign: "center" }}>
					{status === "error"
						? `Error: ${error}`
						: pending && status === "default"
							? "Pagando"
							: ButtonStyles[status].text}
				</Text>

				{pending && status == "default" && (
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
