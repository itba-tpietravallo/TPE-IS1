import { useLocalSearchParams, Stack } from "expo-router";
import { RealtimeChat } from "../../../components/RealtimeChat";
import { View, Text } from "react-native";

export default function ChatScreen() {
	const { roomId, roomName, userId } = useLocalSearchParams<{ roomId: string; roomName: string; userId: string }>();

	if (!roomId) {
		return (
			<View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
				<Text>Chat no encontrado.</Text>
			</View>
		);
	}

	if (!userId) {
		return (
			<View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
				<Text>Necesitas haber iniciado sesión para ver los chats.</Text>
			</View>
		);
	}

	return (
		<>
			<Stack.Screen options={{ title: `Chat: ${roomId}` }} />
			<RealtimeChat roomId={roomId} roomName={roomName} userId={userId} />
		</>
	);
}
