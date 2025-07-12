import { getUserAuthSession } from "@/lib/autogen/queries";
import { getAllTeamsByUser } from "@/lib/autogen/queries";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { FlatList, TouchableOpacity, Text, View, Image } from "react-native";
import { useRouter } from "expo-router";
import Icon from "react-native-vector-icons/FontAwesome6";

type ChatRoom = {
	room_id: string;
	room_name: string | null;
	room_image: string | null;
};

export default function Chats() {
	const router = useRouter();
	const { data: session } = getUserAuthSession(supabase);
	const user = session?.user;
	const [chats, setChats] = useState<ChatRoom[]>([]);

	const { data, error } = getAllTeamsByUser(supabase, user?.id!, { enabled: !!user?.id });

	useEffect(() => {
		if (data) {
			setChats(
				data.map((team) => ({
					room_id: team.team_id,
					room_name: team.name || null,
					room_image: team.images?.[0] || null,
				})) as ChatRoom[],
			);
		} else if (error) {
			console.error("Error fetching chats:", error);
		}
	}, [data, error]);

	return (
		<View style={{ flex: 1, backgroundColor: "#f2f4f3", padding: 6 }}>
			<View
				style={{
					flexDirection: "row",
					alignItems: "center",
					justifyContent: "center",
					paddingVertical: 15,
					paddingHorizontal: 10,
					position: "relative",
				}}
			>
				<TouchableOpacity
					onPress={() => router.push("/(tabs)/profile")}
					style={{ position: "absolute", left: 10 }}
				>
					<Icon name="arrow-left" size={18} color="#262626" />
				</TouchableOpacity>

				<View style={{ flex: 1, alignItems: "center" }}>
					<Text
						style={{
							fontSize: 26,
							fontWeight: "bold",
							color: "#f18f01",
						}}
					>
						Chats
					</Text>
				</View>
			</View>

			{chats.length == 0 ? (
				<Text style={{ textAlign: "center", marginTop: 40, fontSize: 18, color: "#555" }}>
					No tienes chats de equipos.
				</Text>
			) : (
				<FlatList
					data={chats}
					keyExtractor={(chat) => chat.room_id}
					contentContainerStyle={{ paddingVertical: 8 }}
					renderItem={({ item }) => (
						<TouchableOpacity
							onPress={() =>
								user?.id &&
								router.push({
									pathname: "./chatScreen",
									params: { roomId: item.room_id, roomName: item.room_name, userId: user.id },
								})
							}
							style={{
								flexDirection: "row",
								alignItems: "center",
								paddingVertical: 20,
								paddingHorizontal: 20,
								marginHorizontal: 12,
								marginVertical: 6,
								backgroundColor: "#fff",
								borderRadius: 12,
								shadowColor: "#000",
								shadowOpacity: 0.05,
								shadowOffset: { width: 0, height: 2 },
								shadowRadius: 4,
								elevation: 2,
							}}
						>
							<View
								style={{
									flexDirection: "row",
									justifyContent: "space-between",
									alignItems: "center",
									flex: 1,
								}}
							>
								<View style={{ flexDirection: "row", alignItems: "center" }}>
									<Image
										source={
											item.room_image
												? { uri: item.room_image }
												: require("@/assets/images/people-logo.jpg")
										}
										style={{ width: 50, height: 50, borderRadius: 10, marginRight: 12 }}
									/>
									<Text style={{ fontSize: 16, fontWeight: "600", color: "#223332" }}>
										{item.room_name ?? "Chat sin nombre"}
									</Text>
								</View>
								<Icon name="angle-right" size={24} color="#223332" />
							</View>
						</TouchableOpacity>
					)}
				/>
			)}
		</View>
	);
}
