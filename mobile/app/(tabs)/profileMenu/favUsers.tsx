import { supabase } from "@/lib/supabase";
import { Image } from "@rneui/themed";
import { StyleSheet, Text, TouchableOpacity, View, FlatList, Modal } from "react-native";
import { useState } from "react";
import { router } from "expo-router";
import Icon from "react-native-vector-icons/FontAwesome6";
import PopUpFriend from "@/components/PopUpFriend";
import { getUserAuthSession, getUserPreferencesByUserId, getAllUsers } from "@/lib/autogen/queries";

function myFriends() {
	const { data: session } = getUserAuthSession(supabase);
	const user = session?.user;
	const usersData = getAllUsers(supabase);
	const { data: userPreferences } = getUserPreferencesByUserId(supabase, user?.id!);

	const [selectedMember, setSelectedMember] = useState<string | null>(null);

	return (
		<View style={styles.background}>
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
						Usuarios favoritos
					</Text>
				</View>
			</View>

			{/* Amigos */}
			<View style={styles.dataContainer}>
				{userPreferences?.fav_users.length! > 0 ? (
					<>
						<FlatList
							data={userPreferences?.fav_users}
							keyExtractor={(item) => item}
							scrollEnabled={true}
							contentContainerStyle={styles.container}
							renderItem={({ item }) => {
								const member = usersData.data?.find((user) => user.id === item);
								if (!member) return null;
								return (
									<View style={styles.card}>
										<View
											style={{
												flexDirection: "row",
												justifyContent: "space-between",
												alignItems: "center",
											}}
										>
											<View style={{ flexDirection: "row", gap: 10, alignItems: "center" }}>
												{member.avatar_url ? (
													<Image
														source={{ uri: member.avatar_url || "undefined_image" }}
														style={styles.avatar}
													/>
												) : (
													<Icon name="user" size={35} style={{ padding: 20 }} color="black" />
												)}
												<Text style={styles.teamName}>{member.full_name}</Text>
											</View>
											<TouchableOpacity
												style={{ padding: 10 }}
												onPress={() => {
													setSelectedMember(member.id);
												}}
											>
												<Icon name="ellipsis-vertical" size={20} color="#223332" />
											</TouchableOpacity>
										</View>
									</View>
								);
							}}
						/>

						<Modal
							style={styles.modal}
							visible={selectedMember !== null}
							transparent={true}
							onRequestClose={() => setSelectedMember(null)}
						>
							<View style={styles.centeredView}>
								{selectedMember &&
									(() => {
										const memberData = usersData.data?.find((user) => user.id === selectedMember)!;
										return user ? (
											<PopUpFriend
												onClose={() => setSelectedMember(null)}
												id={memberData.id}
												full_name={memberData.full_name}
												username={""} //TODO: FIX
												avatar={memberData.avatar_url!}
											/>
										) : null;
									})()}
							</View>
						</Modal>
					</>
				) : (
					<Text style={{ textAlign: "center", marginTop: 40, fontSize: 18, color: "#555" }}>
						No tienes usuarios favoritos.
					</Text>
				)}
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	avatar: {
		width: 30,
		height: 30,
		borderRadius: 100,
	},
	container: {
		padding: 16,
		paddingBottom: 90,
	},
	card: {
		backgroundColor: "#fff",
		borderRadius: 12,
		padding: 24,
		marginBottom: 12,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 3,
	},
	teamName: {
		fontSize: 16,
		fontWeight: "600",
		color: "#262626",
		textAlign: "left",
	},
	sport: {
		fontSize: 14,
		color: "#888",
		marginTop: 4,
	},
	description: {
		marginTop: 6,
		fontSize: 13,
		color: "#555",
	},
	background: {
		flex: 1,
		alignItems: "stretch",
		backgroundColor: "#f2f4f3",
		padding: 6,
	},
	goBackButton: {
		flexDirection: "row",
		alignItems: "flex-start",
		paddingVertical: 15,
		paddingHorizontal: 10,
	},
	title: {
		fontSize: 30,
		fontWeight: "bold",
		color: "#f18f01",
		textAlign: "left",
		padding: 10,
	},
	dataContainer: {
		flex: 1,
	},
	row: {
		flexDirection: "row",
		justifyContent: "space-between",
		padding: 15,
		alignItems: "center",
	},
	list: {},
	centeredView: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "rgba(0, 0, 0, 0.5)",
	},
	modal: {
		justifyContent: "center",
		alignItems: "center",
	},
	info: {
		flex: 1,
		marginLeft: 12,
	},
});

export default myFriends;
