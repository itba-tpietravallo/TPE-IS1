import React from "react";
import { StyleSheet, SafeAreaView, Image, View, Text, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { Session } from "@supabase/supabase-js";

import { getUserAuthSession, getUserAvatar, getUsername, getUserSession } from "@/lib/autogen/queries";

type User = {
	id: string;
	full_name: string;
	avatar_url: string;
};

function TopBar() {
	const { data: session } = getUserAuthSession(supabase);
	const user = session?.user;

	type UserData = { username?: string; full_name?: string } | null;

	const { data } = getUsername(supabase, user?.id ?? "", {
		enabled: !!user?.id,
	}) as { data: UserData };

	const username = data?.username;
	const full_name = data?.full_name;

	const { data: avatarData } = getUserAvatar(supabase, full_name ?? "", {
		enabled: !!full_name,
	});

	const avatarUrl = typeof avatarData === "string" ? avatarData : (avatarData?.avatar_url ?? "undefined_image");

	return (
		<SafeAreaView style={styles.container}>
			<View style={styles.innerContainer}>
				<View style={{ flexDirection: "row", alignItems: "center" }}>
					<Image
						source={require("@/assets/images/logo.png")}
						style={{ width: 30, height: 30, resizeMode: "contain" }}
					/>
					<Text style={styles.title}> Match</Text>
					<Text
						style={{
							fontSize: 24,
							fontFamily: "Poppins",
							fontWeight: "bold",
							color: "#223332",
							marginLeft: 0,
							paddingLeft: 0,
						}}
					>
						Point
					</Text>
				</View>
				<TouchableOpacity onPress={() => router.push("/(tabs)/profile")}>
					{/* @todo undefined_image is a stub that'll hopefully get logged in RN Dev Tools */}
					<Image style={styles.image} source={{ uri: avatarUrl || "undefined_image" }} />
				</TouchableOpacity>
			</View>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		backgroundColor: "#f8f8f8",
		paddingTop: 30,
		borderBottomWidth: 1,
		borderBottomColor: "#ccc",
	},
	innerContainer: {
		flexDirection: "row",
		justifyContent: "space-between",
		padding: 10,
	},
	image: {
		width: 30,
		height: 30,
		resizeMode: "contain",
		borderRadius: 15,
	},
	title: {
		fontSize: 24,
		fontFamily: "Poppins",
		fontWeight: "bold",
		color: "#f18f04",
		marginRight: 0,
		paddingRight: 0,
	},
});

export default TopBar;
