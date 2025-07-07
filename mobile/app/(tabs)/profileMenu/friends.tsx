import { supabase } from "@/lib/supabase";
import { Image } from "@rneui/themed";
import {
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
	FlatList,
	Modal,
	ScrollView,
	KeyboardAvoidingView,
	Platform,
} from "react-native";
import { useState } from "react";
import { router } from "expo-router";
import Icon from "react-native-vector-icons/FontAwesome6";
import PopUpFriend from "@/components/PopUpFriend";
import { getUserAuthSession } from "@/lib/autogen/queries";
import { ScreenHeight } from "@rneui/themed/dist/config";

function myFriends() {
	const { data: session } = getUserAuthSession(supabase);
	const user = session?.user;

	const [selectedMember, setSelectedMember] = useState<string | null>(null);

	const myFriends = [
		{
			id: "10",
			full_name: "Lionel Messi",
			username: "La Pulga",
			avatar_url: "",
		},
		{
			id: "11",
			full_name: "Neymar Jr",
			username: "El principe",
			avatar_url: "",
		},
		{
			id: "9",
			full_name: "Luis Suarez",
			username: "El pistolero",
			avatar_url: "",
		},
		{
			id: "8",
			full_name: "Iniesta",
			username: "Peladoo",
			avatar_url: "",
		},
		{
			id: "99",
			full_name: "Ronaldo",
			username: "El fenomeno",
			avatar_url: "",
		},
	];

	return (
		<View style={styles.background}>
			{/* Boton Atras */}
			<TouchableOpacity style={styles.goBackButton} onPress={() => router.push("/(tabs)/profile")}>
				<Icon name="arrow-left" size={14} color="#262626" style={{ marginRight: 8 }} />
				<Text style={{ fontSize: 14, color: "#262626" }}>Atrás</Text>
			</TouchableOpacity>

			<Text style={styles.title}>Mis Favoritos</Text>

			{/* Amigos */}
			<View style={styles.dataContainer}>
				{myFriends.length > 0 ? (
					<View style={styles.row}>
						<FlatList
							data={myFriends}
							keyExtractor={(item) => item.id}
							scrollEnabled={true}
							renderItem={({ item }) => (
								<View style={styles.row}>
									<Text style={{ fontWeight: "bold" }}>{item.full_name}</Text>
									<TouchableOpacity
										onPress={() => {
											setSelectedMember(item.id);
										}}
									>
										<Image
											style={{ width: 20, height: 20 }}
											source={require("@/assets/images/info.png")}
										/>
									</TouchableOpacity>
								</View>
							)}
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
										const memberData = myFriends.find((user) => user.id === selectedMember)!;
										return user ? (
											<PopUpFriend
												onClose={() => setSelectedMember(null)}
												id={memberData.id}
												full_name={memberData.full_name}
												username={memberData.username} //TODO: FIX
												avatar={memberData.avatar_url!}
											/>
										) : null;
									})()}
							</View>
						</Modal>
					</View>
				) : (
					<Text style={{ color: "gray", padding: 20 }}>Aún no tienes amigos.</Text>
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
