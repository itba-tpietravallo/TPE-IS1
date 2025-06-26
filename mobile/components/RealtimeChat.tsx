import React, { useState, useRef, useEffect } from "react";
import {
	View,
	FlatList,
	TextInput,
	StyleSheet,
	KeyboardAvoidingView,
	Platform,
	SafeAreaView,
	ActivityIndicator,
	Text,
	TouchableOpacity,
} from "react-native";
import { ChatMessage, Message } from "./ChatMessage";
import { useChatScroll } from "../hooks/UseChatScroll";
import { supabase } from "../lib/supabase";
import { useChatMessages, useSendChatMessage } from "@/lib/autogen/queries";
import Icon from "react-native-vector-icons/FontAwesome6";
import { useRouter } from "expo-router";

export function RealtimeChat({ roomId, roomName, userId }: { roomId: string; roomName: string; userId: string }) {
	const router = useRouter();
	// 1. Fetch messages and listen for real-time updates with a single hook.
	const { data: messages, isLoading, error } = useChatMessages(supabase, roomId);
	// 2. Get the mutation function for sending messages
	const { mutate: sendMessage } = useSendChatMessage();

	const [newMessage, setNewMessage] = useState("");
	const flatListRef = useRef<FlatList<Message>>(null);
	const { handleScroll } = useChatScroll(flatListRef, messages);

	useEffect(() => {
		if (messages && messages.length > 0) {
			// Give the FlatList time to finish rendering
			setTimeout(() => {
				flatListRef.current?.scrollToEnd({ animated: false });
			}, 100);
		}
		console.log(roomName);
	}, [messages]);

	const handleSendMessage = () => {
		if (newMessage.trim() === "" || !userId || !supabase) return;

		sendMessage({
			supabase,
			content: newMessage.trim(),
			room_id: roomId,
			user_id: userId,
		});

		setNewMessage("");

		setTimeout(() => {
			flatListRef.current?.scrollToEnd({ animated: true });
		}, 100);
	};

	if (!userId) {
		return (
			<View style={styles.centered}>
				<Text>Necesitas haber iniciado sesión para ver los chats.</Text>
			</View>
		);
	}

	if (isLoading) {
		return <ActivityIndicator style={styles.centered} />;
	}

	if (error) {
		return (
			<View style={styles.centered}>
				<Text>Error al cargar los mensajes: {error.message}</Text>
			</View>
		);
	}

	return (
		<SafeAreaView style={styles.container}>
			<KeyboardAvoidingView
				style={{ flex: 1 }}
				behavior={Platform.OS === "ios" ? "padding" : "height"}
				keyboardVerticalOffset={65}
			>
				<View style={{ flex: 1 }}>
					<View
						style={{
							flexDirection: "row",
							alignItems: "center",
							justifyContent: "space-between",
							paddingVertical: 15,
							paddingHorizontal: 20,
							backgroundColor: "#f2f4f3",
							position: "relative",
						}}
					>
						<TouchableOpacity
							onPress={() => router.push("/(tabs)/profileMenu/chats")}
							style={{ zIndex: 2 }}
						>
							<Icon name="arrow-left" size={18} color="#223332" />
						</TouchableOpacity>

						<View
							style={{
								position: "absolute",
								left: 0,
								right: 0,
								alignItems: "center",
								justifyContent: "center",
								pointerEvents: "none",
							}}
						>
							<Text
								style={{
									fontSize: 18,
									fontWeight: "bold",
									color: "#223332",
								}}
								numberOfLines={1}
							>
								{roomName}
							</Text>
						</View>
					</View>

					<FlatList
						ref={flatListRef}
						data={(messages as unknown as Message[]) || []}
						renderItem={({ item }) => <ChatMessage message={item} currentUserId={userId} />}
						keyExtractor={(item) => item.id.toString()}
						style={styles.messageList}
						onScroll={handleScroll}
						scrollEventThrottle={16}
						ListEmptyComponent={
							<View style={styles.centered}>
								<Text>No hay mensajes aún. ¡Comienza la conversación!</Text>
							</View>
						}
						contentContainerStyle={
							messages?.length === 0
								? { flex: 1, justifyContent: "center", alignItems: "center", padding: 16 }
								: { paddingBottom: 80 }
						}
					/>

					<View style={styles.inputContainer}>
						<TextInput
							value={newMessage}
							onChangeText={setNewMessage}
							placeholder="Type a message..."
							placeholderTextColor="#999"
							style={styles.input}
							onSubmitEditing={handleSendMessage}
							returnKeyType="send"
						/>
						<TouchableOpacity
							onPress={handleSendMessage}
							disabled={newMessage.trim() === ""}
							style={{
								backgroundColor: newMessage.trim() !== "" ? "#f18f01" : "#ccc",
								padding: 10,
								borderRadius: 50,
								justifyContent: "center",
								alignItems: "center",
								marginLeft: 8,
							}}
						>
							<Icon name="paper-plane" size={18} color="#fff" solid />
						</TouchableOpacity>
					</View>
				</View>
			</KeyboardAvoidingView>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		marginBottom: 45,
	},
	centered: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	messageList: {
		flex: 1,
		backgroundColor: "#E0E0E0",
	},
	inputContainer: {
		flexDirection: "row",
		padding: 8,
		borderTopWidth: 1,
		borderTopColor: "#ccc",
		backgroundColor: "#f2f4f3",
		marginBottom: 45,
	},
	input: {
		flex: 1,
		borderWidth: 1,
		borderColor: "#ccc",
		borderRadius: 20,
		paddingHorizontal: 12,
		paddingVertical: 8,
		marginRight: 8,
		backgroundColor: "white",
	},
});
