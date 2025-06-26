import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";

export interface Message {
	id: string;
	content: string;
	created_at: string;
	user_id: string;
	users: {
		username: string | null;
		avatar_url: string | null;
	} | null;
}

interface ChatMessageProps {
	message: Message;
	currentUserId: string;
}

export function ChatMessage({ message, currentUserId }: ChatMessageProps) {
	const isMyMessage = message.user_id === currentUserId;

	if (isMyMessage) {
		return (
			<View style={styles.myMessageContainer}>
				<View style={[styles.bubble, styles.myBubble]}>
					<Text style={styles.myContent}>{message.content}</Text>
					<Text style={[styles.time, styles.myTime]}>
						{new Date(message.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
					</Text>
				</View>
			</View>
		);
	}

	return (
		<View style={styles.otherMessageContainer}>
			<Image
				source={{
					uri: message.users?.avatar_url || require("@/assets/images/profile.png"),
				}}
				style={styles.avatar}
			/>
			<View style={styles.messageContent}>
				<Text style={styles.username}>{`@${message.users?.username}` || "Anonymous"}</Text>
				<View style={[styles.bubble, styles.otherBubble]}>
					<Text style={styles.otherContent}>{message.content}</Text>
					<Text style={[styles.time, styles.otherTime]}>
						{new Date(message.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
					</Text>
				</View>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	myMessageContainer: {
		flexDirection: "row",
		justifyContent: "flex-end",
		marginVertical: 4,
		marginHorizontal: 8,
	},
	otherMessageContainer: {
		flexDirection: "row",
		alignItems: "flex-end",
		marginVertical: 4,
		marginHorizontal: 8,
	},
	avatar: {
		width: 32,
		height: 32,
		borderRadius: 16,
		marginRight: 8,
	},
	messageContent: {
		maxWidth: "80%",
	},
	username: {
		fontSize: 12,
		color: "#888",
		marginBottom: 2,
	},
	bubble: {
		paddingVertical: 8,
		paddingHorizontal: 12,
		borderRadius: 20,
	},
	myBubble: {
		backgroundColor: "#f18f01",
	},
	otherBubble: {
		backgroundColor: "#EEEEEE",
	},
	myContent: {
		color: "white",
	},
	otherContent: {
		color: "black",
	},
	time: {
		fontSize: 10,
		marginTop: 4,
		alignSelf: "flex-end",
	},
	myTime: {
		color: "rgba(255, 255, 255, 0.7)",
	},
	otherTime: {
		color: "rgba(0, 0, 0, 0.5)",
	},
});
