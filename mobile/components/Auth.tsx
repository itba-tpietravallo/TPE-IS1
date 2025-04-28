import React, { useState } from "react";
import { Alert, StyleSheet, View, Text, Image, TouchableOpacity } from "react-native";
import { supabase } from "../lib/supabase";
import { Button, Input } from "@rneui/themed";

import { performOAuth } from "@/lib/auth";

export default function Auth() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);

	async function signInWithEmail() {
		setLoading(true);
		const { error } = await supabase.auth.signInWithPassword({
			email: email,
			password: password,
		});

		if (error) Alert.alert(error.message);
		setLoading(false);
	}

	async function signUpWithEmail() {
		setLoading(true);
		const {
			data: { session },
			error,
		} = await supabase.auth.signUp({
			email: email,
			password: password,
		});

		if (error) Alert.alert(error.message);
		if (!session) Alert.alert("Please check your inbox for email verification!");
		setLoading(false);
	}

	return (
		<View style={styles.container}>
			<View
				style={{
					flexDirection: "column",
					alignItems: "center",
					justifyContent: "center",
				}}
			>
				<Image source={require("@/assets/images/logo.png")} style={{ width: 200, height: 200 }} />
				<View
					style={{
						flexDirection: "row",
						alignItems: "center",
						justifyContent: "center",
					}}
				>
					<Text
						style={{
							fontSize: 60,
							fontFamily: "Poppins",
							fontWeight: "bold",
							color: "#f18f04",
						}}
					>
						{" "}
						Match
					</Text>
					<Text
						style={{
							fontSize: 60,
							fontFamily: "Poppins",
							fontWeight: "bold",
							color: "#223332",
							marginLeft: 0,
							marginRight: 20, // esto esta hardcodeado porque no entiendo cunado se me fue el paddingLeft
							paddingLeft: 0,
						}}
					>
						Point
					</Text>
				</View>
				<Text
					style={{
						fontSize: 25,
						opacity: 0.8,
						fontWeight: "bold",
						color: "#f18f04",
						marginBottom: 50,
						marginTop: 0,
					}}
				>
					No te quedes sin jugar
				</Text>
			</View>

			{/* <View style={[styles.verticallySpaced, styles.mt20]}>
        <Input
          label="Email"
          leftIcon={{ type: "font-awesome", name: "envelope" }}
          onChangeText={(text) => setEmail(text)}
          value={email}
          placeholder="email@address.com"
          autoCapitalize={"none"}
        />
      </View>
      <View style={styles.verticallySpaced}>
        <Input
          label="Password"
          leftIcon={{ type: "font-awesome", name: "lock" }}
          onChangeText={(text) => setPassword(text)}
          value={password}
          secureTextEntry={true}
          placeholder="Password"
          autoCapitalize={"none"}
        />
      </View>
      <View style={[styles.verticallySpaced, styles.mt20]}>
        <Button
          title="Sign in"
          disabled={loading}
          onPress={() => signInWithEmail()}
        />
      </View>
      <View style={styles.verticallySpaced}>
        <Button
          title="Sign up"
          disabled={loading}
          onPress={() => signUpWithEmail()}
        />
      </View> */}

			<View>
				{/* Sign in with Google */}
				<TouchableOpacity
					style={styles.button}
					onPress={() => {
						performOAuth("google");
					}}
				>
					<View style={{ flexDirection: "row", alignItems: "center" }}>
						<Image
							source={require("@/assets/images/google.png")}
							style={{ width: 20, height: 20, marginRight: 12 }}
						/>
						<Text style={styles.button_text}>Accedé con Google</Text>
					</View>
				</TouchableOpacity>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#f8f8f8",
		alignContent: "center",
		justifyContent: "center",
		marginTop: 40,
		padding: 12,
	},
	verticallySpaced: {
		paddingTop: 4,
		paddingBottom: 4,
		alignSelf: "stretch",
	},
	mt20: {
		marginTop: 20,
	},
	button: {
		backgroundColor: "white",
		borderWidth: 1,
		borderColor: "#747775",
		borderRadius: 20,
		paddingHorizontal: 12,
		height: 40,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
	},
	button_text: {
		fontSize: 14,
		color: "#1f1f1f",
		fontFamily: "sans-serif",
		fontWeight: "bold",
	},
});
