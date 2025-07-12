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
			{/* Boton Atras */}
			<TouchableOpacity style={styles.goBackButton} onPress={() => router.push("/(tabs)/profile")}>
				<Icon name="arrow-left" size={14} color="#262626" style={{ marginRight: 8 }} />
				<Text style={{ fontSize: 14, color: "#262626" }}>Atrás</Text>
			</TouchableOpacity>

			<Text style={styles.title}>Usuarios Favoritos</Text>

			{/* Amigos */}
			<View style={styles.dataContainer}>
				{userPreferences?.fav_users.length! > 0 ? (
					<View style={styles.row}>
						<FlatList
							data={userPreferences?.fav_users}
							keyExtractor={(item) => item}
							scrollEnabled={true}
							renderItem={({ item }) => {
								const member = usersData.data?.find((user) => user.id === item);
								if (!member) return null;
								return (
									<View style={styles.row}>
										<Text style={{ fontWeight: "bold" }}>{member.full_name}</Text>
										<TouchableOpacity
											onPress={() => {
												setSelectedMember(member.id);
											}}
										>
											<Image
												style={{ width: 20, height: 20 }}
												source={require("@/assets/images/info.png")}
											/>
										</TouchableOpacity>
									</View>
								);
							}}
							ItemSeparatorComponent={() => (
								<View style={{ height: 1, backgroundColor: "#ccc", marginHorizontal: 10 }} />
							)}
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
					</View>
				) : (
					<Text style={{ color: "gray", padding: 20 }}>No tienes usuarios favoritos</Text>
				)}
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
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
		padding: 5,
		borderWidth: 1,
		borderColor: "#ccc",
		borderRadius: 5,
		margin: 10,
		marginBottom: 200,
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
