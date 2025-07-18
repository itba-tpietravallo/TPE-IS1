import { supabase } from "@/lib/supabase";
import { Image } from "@rneui/themed";
import { StyleSheet, Text, TouchableOpacity, View, FlatList, ScrollView, ActivityIndicator } from "react-native";
import { useEffect, useState } from "react";
import { Session } from "@supabase/supabase-js";
import { router } from "expo-router";
import Icon from "react-native-vector-icons/FontAwesome6";

import { getUserAuthSession, getUserSession, getUsername, getUserAvatar } from "@/lib/autogen/queries";

export default function Index() {
	const [userId, setUserId] = useState<string | null>(null);

	useEffect(() => {
		supabase.auth.getSession().then(({ data: { session } }) => {
			setUserId(session?.user.id!);
		});
	}, []);

	type UserData = { username?: string; full_name?: string } | null;

	const { data } = getUsername(supabase, userId ?? "", {
		enabled: !!userId,
	}) as { data: UserData };

	const username = data?.username;
	const full_name = data?.full_name;

	const { data: avatarData } = getUserAvatar(supabase, full_name ?? "", {
		enabled: !!full_name,
	});

	const avatarUrl = typeof avatarData === "string" ? avatarData : (avatarData?.avatar_url ?? "undefined_image");

	return (
		<ScrollView style={buttonStyles.containter} contentContainerStyle={{ paddingBottom: 100 }}>
			<View style={{ alignItems: "center", paddingVertical: 25 }}>
				{/* @todo undefined_image is a stub that'll hopefully get logged in RN Dev Tools */}
				<Image
					source={{ uri: avatarUrl }}
					style={{ width: 110, height: 110 }}
					borderRadius={100}
					placeholderStyle={{ backgroundColor: "transparent" }}
					PlaceholderContent={<ActivityIndicator />}
				/>
				<Text
					style={{
						fontSize: 16,
						fontWeight: "bold",
						paddingTop: 20,
						paddingBottom: 10,
						textAlign: "center",
						color: "#223332",
					}}
				>
					{String(username)}
				</Text>
			</View>

			<ProfileMenuList />

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
		</ScrollView>
	);
}

const buttonStyles = StyleSheet.create({
	buttonContainer: {
		marginTop: 50,
		padding: 7,
		borderRadius: 15,
		backgroundColor: "#223332",
		justifyContent: "center",
		alignSelf: "center",
	},
	containter: {
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
	{ label: "Reservas", icon: "calendar-check", action: () => router.push("/(tabs)/profileMenu/reservations") },
	{ label: "Actividad", icon: "money-check", action: () => router.push("/(tabs)/profileMenu/paymentActivity") },
	{ label: "Pendientes", icon: "spinner", action: () => router.push("/(tabs)/profileMenu/pendings") },
	{ label: "Equipos", icon: "people-group", action: () => router.push("/(tabs)/profileMenu/teams") },
	{
		label: "Invitaciones a equipos",
		icon: "list-check",
		action: () => router.push("/(tabs)/profileMenu/teamInvites"),
	},
	{ label: "Chats", icon: "comments", action: () => router.push("/(tabs)/profileMenu/chats") },
	{ label: "Usuarios favoritos", icon: "user-group", action: () => router.push("/(tabs)/profileMenu/favUsers") },
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
							<View style={{ width: 30, alignItems: "center" }}>
								<Icon name={item.icon} size={24} color="#f18f01" />
							</View>
							<Text style={{ fontSize: 16, color: "#223332", marginLeft: 12 }}>{item.label}</Text>
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
