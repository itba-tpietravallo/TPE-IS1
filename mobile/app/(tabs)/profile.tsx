import { supabase } from "@/lib/supabase";
import { Image } from "@rneui/themed";
import { StyleSheet, Text, TouchableOpacity, View, FlatList } from "react-native";
import { useEffect, useState } from "react";
import { Session } from "@supabase/supabase-js";
import { router } from "expo-router";
import Icon from "react-native-vector-icons/FontAwesome6";

import { getUserSession } from "@/lib/autogen/queries";

export default function Index() {
	const [userId, setUserId] = useState<string | null>(null);

	useEffect(() => {
		supabase.auth.getSession().then(({ data: { session } }) => {
			setUserId(session?.user.id!);
		});
	}, []);

	const { data: user } = getUserSession(supabase);

	return (
		<View style={buttonStyles.containter}>
			<View style={{ alignItems: "center", padding: 30 }}>
				{/* @todo undefined_image is a stub that'll hopefully get logged in RN Dev Tools */}
				<Image
					source={{ uri: user?.avatar_url || "undefined_image" }}
					style={{ width: 100, height: 100 }}
					borderRadius={100}
				/>
				<Text
					style={{ fontSize: 25, fontWeight: "bold", paddingTop: 20, textAlign: "center", color: "#223332" }}
				>
					{user?.full_name}
				</Text>
				<Text
					style={{ fontSize: 16, fontWeight: "bold", paddingTop: 20, textAlign: "center", color: "#223332" }}
				>
					USUARIO: {user?.username}
				</Text>
			</View>

			<ProfileMenuList />

			<View style={{ flex: 1 }} />
			<TouchableOpacity
				style={{ alignItems: "center", padding: 30 }}
				onPress={async () => {
					const { error } = await supabase.auth.signOut({ scope: "local" });
					if (error) {
						console.error("Error signing out:", error.message);
					}
					console.log("Signed out successfully");
				}}
			>
				<Text style={{ color: "red", fontSize: 16 }}>Cerrar sesión</Text>
			</TouchableOpacity>
		</View>
	);
}

const buttonStyles = StyleSheet.create({
	buttonContainer: {
		marginTop: 50,
		padding: 7,
		borderRadius: 15,
		//		backgroundColor: "#CC0000",
		backgroundColor: "#223332",
		justifyContent: "center",
		alignSelf: "center",
	},
	containter: {
		justifyContent: "space-between",
		backgroundColor: "#f2f4f3",
		padding: 20,
	},
	centeredView: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "rgba(0, 0, 0, 0.5)",
	},
	modal: {
		justifyContent: "center",
		alignItems: "center",
		borderRadius: 20,
		overflow: "hidden",
		width: "90%",
		maxWidth: 400,
	},
});

const itemStyles = StyleSheet.create({
	item: {
		flexDirection: "row",
		alignItems: "center",
		paddingVertical: 15,
		paddingHorizontal: 20,
	},
	icon: {
		marginRight: 15,
	},
	label: {
		fontSize: 16,
	},
});

const menuItems = [
	{ label: "Mi actividad", icon: "money-check", action: () => router.push("/(tabs)/profileMenu/paymentActivity") },
	{ label: "Mis reservas", icon: "calendar-check", action: () => router.push("/(tabs)/profileMenu/reservations") },
	{ label: "Mis equipos", icon: "user-group", action: () => router.push("/(tabs)/profileMenu/teams") },
	// { label: "Mis torneos", icon: "medal", action: () => router.push("/(tabs)/profileMenu/teams") },
];

export function ProfileMenuList() {
	return (
		<View style={{ borderWidth: 1, borderColor: "#ccc", borderRadius: 10, overflow: "hidden" }}>
			<FlatList
				data={menuItems}
				scrollEnabled={false}
				keyExtractor={(item) => item.label}
				renderItem={({ item }) => (
					<TouchableOpacity style={itemStyles.item} onPress={item.action}>
						<View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
							<Icon name={item.icon} size={24} color="#f18f01" style={itemStyles.icon} />
							<Text style={itemStyles.label}>{item.label}</Text>
						</View>
						<Icon name="angle-right" size={24} color="#f18f01" />
					</TouchableOpacity>
				)}
				ItemSeparatorComponent={() => (
					<View style={{ height: 1, backgroundColor: "#ccc", marginHorizontal: 10 }} />
				)}
			/>
		</View>
	);
}
