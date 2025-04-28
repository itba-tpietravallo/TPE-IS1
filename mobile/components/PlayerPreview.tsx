import React from "react";
import { Text, View, Image } from "react-native";

function PlayerPreview() {
	return (
		<View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
			<Image source={require("@/assets/images/herramienta.png")} />
			<Text style={{ fontSize: 30, textAlign: "center", marginTop: "20%" }}>Próximamente!</Text>
		</View>
	);
}

export default PlayerPreview;
