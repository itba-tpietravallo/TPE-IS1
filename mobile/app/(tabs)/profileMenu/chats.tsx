import { getUserAuthSession } from "@/lib/autogen/queries";
import { getAllTeamsByUser } from "@/lib/autogen/queries";
import { supabase } from "@lib/supabase";
import { useEffect, useState } from "react";
import { FlatList, TouchableOpacity, Text, View } from "react-native";
import { useRouter } from "expo-router";
import Icon from "react-native-vector-icons/FontAwesome6";

type ChatRoom = {
	room_id: string;
	room_name: string | null;
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
				})) as ChatRoom[],
			);
		} else if (error) {
			console.error("Error fetching chats:", error);
		}
	}, [data, error]);

	return (
		<View style={{ flex: 1, backgroundColor: "#f2f4f3", padding: 6 }}>
			<TouchableOpacity
				style={{ flexDirection: "row", alignItems: "flex-start", paddingVertical: 15, paddingHorizontal: 10 }}
				onPress={() => router.push("/(tabs)/profile")}
			>
				<Icon name="arrow-left" size={14} color="#262626" style={{ marginRight: 8 }} />
				<Text style={{ fontSize: 14, color: "#262626" }}>Atrás</Text>
			</TouchableOpacity>

			<Text
				style={{
					fontSize: 30,
					fontWeight: "bold",
					color: "#f18f01",
					textAlign: "left",
					padding: 10,
				}}
			>
				Chats
			</Text>

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
								paddingVertical: 30,
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
							<Icon name="comments" size={20} color="#f18f01" style={{ marginRight: 15 }} />
							<Text style={{ fontSize: 16, fontWeight: "600", color: "#223332" }}>
								{item.room_name ?? "Chat sin nombre"}
							</Text>
						</TouchableOpacity>
					)}
				/>
			)}
		</View>
	);
}
