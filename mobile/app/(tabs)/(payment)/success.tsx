import { Button, Text } from "@rneui/themed";
import { ScreenHeight } from "@rneui/themed/dist/config";
import { View } from "react-native";

export default function Success() {
	return (
		<View style={{ flex: 1, justifyContent: "center", alignItems: "center", paddingBottom: 100 }}>
			<View
				style={{
					height: ScreenHeight * 0.3,
					justifyContent: "center",
					alignItems: "center",
					borderColor: "green",
					borderRadius: 10,
					padding: 10,
					borderWidth: 1,
					backgroundColor: "#f7fff7",
				}}
			>
				<Text style={{ fontSize: 30, fontWeight: "700" }}>Pago exitoso!</Text>
				<Text style={{ fontSize: 20, fontWeight: "500" }}>Muchas gracias!</Text>
				<Text style={{ fontSize: 20, fontWeight: "500" }}>Ya le avisamos a la cancha 😉</Text>
			</View>
		</View>
	);
}
