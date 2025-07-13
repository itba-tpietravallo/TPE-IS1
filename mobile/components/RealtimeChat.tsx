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
import { supabase } from "../lib/supabase";
import { useChatMessages, useInsertMessage } from "@/lib/autogen/queries";
import Icon from "react-native-vector-icons/FontAwesome6";
import { useRouter } from "expo-router";
import { useChatScroll } from "@/hooks/UseChatScroll";

type MessageWithDate = Message | { type: "date"; date: string; id: string };

export function RealtimeChat({ roomId, roomName, userId }: { roomId: string; roomName: string; userId: string }) {
	const router = useRouter();
	const { data: messages, isLoading, error } = useChatMessages(supabase, roomId);
	const insertMessageMutation = useInsertMessage(supabase);

	const [newMessage, setNewMessage] = useState("");
	const flatListRef = useRef<FlatList<MessageWithDate>>(null);
	const [localMessages, setLocalMessages] = useState<Message[]>([]);
	const [messageCount, setMessageCount] = useState(0);

	const { handleScroll } = useChatScroll(flatListRef, messageCount);

	useEffect(() => {
		if (!messages) return;

		setLocalMessages((currentLocal) => {
			const serverMessages = messages || [];

			const filteredLocal = currentLocal.filter((localMsg) => {
				const isOptimistic = localMsg.id.toString().includes("-");
				if (!isOptimistic) return true;

				const correspondingServerMessage = serverMessages.find(
					(serverMsg) =>
						serverMsg.user_id === localMsg.user_id &&
						serverMsg.content === localMsg.content &&
						Math.abs(new Date(serverMsg.created_at).getTime() - new Date(localMsg.created_at).getTime()) <
							10000,
				);
				return !correspondingServerMessage;
			});

			return [...serverMessages, ...filteredLocal].sort(
				(a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
			);
		});
	}, [messages]);

	const getFormattedDate = (date: Date) => {
		const today = new Date();
		const yesterday = new Date(today);
		yesterday.setDate(yesterday.getDate() - 1);

		if (date.toDateString() === today.toDateString()) {
			return "Hoy";
		}
		if (date.toDateString() === yesterday.toDateString()) {
			return "Ayer";
		}
		return date.toLocaleDateString("es-ES", {
			year: "numeric",
			month: "long",
			day: "numeric",
		});
	};

	const handleSendMessage = async () => {
		if (newMessage.trim() === "" || !userId || !supabase) return;

		const tempId = `${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
		const optimisticMessage: Message = {
			id: tempId,
			user_id: userId,
			content: newMessage.trim(),
			created_at: new Date().toISOString(),
			users: {
				username: null,
				avatar_url: null,
			},
		};

		setLocalMessages((prev) => [optimisticMessage, ...prev]);
		setMessageCount((count) => count + 1);

		setNewMessage("");

		try {
			await insertMessageMutation.mutateAsync([
				{
					room_id: roomId,
					user_id: userId,
					content: optimisticMessage.content,
				},
			]);
		} catch (error) {
			console.error("Error sending message:", error);
			alert("Error al enviar el mensaje. Por favor, intenta de nuevo.");
			setLocalMessages((prev) => prev.filter((m) => m.id !== tempId));
		}
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

	const messagesWithDates: MessageWithDate[] = [];
	if (localMessages.length > 0) {
		let lastDate: string | null = null;
		[...localMessages]
			.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
			.forEach((message) => {
				const messageDate = new Date(message.created_at);
				const formattedDate = getFormattedDate(messageDate);
				if (formattedDate !== lastDate) {
					messagesWithDates.push({
						type: "date",
						date: formattedDate,
						id: formattedDate,
					});
					lastDate = formattedDate;
				}
				messagesWithDates.push(message);
			});
		messagesWithDates.reverse();
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
						<TouchableOpacity onPress={() => router.back()} style={{ zIndex: 2, padding: 2 }}>
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
						inverted
						ref={flatListRef}
						onScroll={handleScroll}
						data={messagesWithDates}
						renderItem={({ item }) => {
							if ("type" in item && item.type === "date") {
								return (
									<View style={styles.dateSeparatorContainer}>
										<Text style={styles.dateSeparatorText}>{item.date}</Text>
									</View>
								);
							}
							return <ChatMessage message={item as Message} currentUserId={userId} />;
						}}
						keyExtractor={(item) => item.id.toString()}
						style={styles.messageList}
						scrollEventThrottle={16}
						contentContainerStyle={{
							paddingBottom: 10,
							flexGrow: 1,
							justifyContent: "flex-end",
						}}
						ListEmptyComponent={
							<View style={styles.emptyChatContainer}>
								<Text style={styles.emptyChatMessage}>Comenzá la conversación, decí hola!</Text>
							</View>
						}
					/>

					<View style={styles.inputContainer}>
						<TextInput
							value={newMessage}
							onChangeText={setNewMessage}
							placeholder="Escriba un mensaje..."
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
	emptyChatContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		transform: [{ scaleY: -1 }],
	},
	emptyChatMessage: {
		fontSize: 16,
		color: "#666",
	},
	dateSeparatorContainer: {
		alignSelf: "center",
		borderRadius: 12,
		paddingVertical: 4,
		paddingHorizontal: 12,
		marginVertical: 10,
	},
	dateSeparatorText: {
		fontSize: 12,
		color: "#444",
		fontWeight: "bold",
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
