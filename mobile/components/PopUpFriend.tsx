import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { ScreenWidth } from "@rneui/themed/dist/config";
import Icon from "react-native-vector-icons/FontAwesome6";
import { Image } from "@rneui/themed";
import { supabase } from "@lib/supabase";
import { getUserAuthSession, getAllTeamsByAdminUser } from "@/lib/autogen/queries";
import { useState } from "react";
import SelectDropdown from "react-native-select-dropdown";

type PropsPopUpFriend = {
	onClose: () => void;
	id: string;
	full_name: string;
	username: string;
	avatar: string;
};

function PopUpFriend(props: PropsPopUpFriend) {
	const { data: session } = getUserAuthSession(supabase);
	const user = session?.user;

	const [selectedTeam, setSelectedTeam] = useState<string>();
	const { data: myTeams } = getAllTeamsByAdminUser(supabase, user?.id!);

	const myFriends = [
		{
			id: "10",
			full_name: "Lionel Messi",
			username: "La Pulga",
			avatar_url: "",
		},
	];

	const handleDeleteFriend = async (player: string) => {
		// const updatedPlayers = team!.players.filter((member) => member !== player);
		// var updatedAdmins = team!.admins.filter((member) => member !== player);

		// if (updatedAdmins.length == 0) {
		// 	updatedAdmins = [...updatedAdmins, team!.players[0]];
		// }

		// try {
		// 	await updateTeamMutation.mutateAsync({
		// 		team_id: props.team_id,
		// 		players: updatedPlayers,
		// 		admins: updatedAdmins,
		// 	});

		// 	props.onClose();
		// 	console.log("deleted");
		// } catch (error) {
		// 	console.error("Error leaving team:", error);
		// }
		console.log("todo");
	};

	const handleInviteToTeam = async (friend: string) => {
		console.log("todo");
	};

	function userIsFriend(userId: string) {
		if (myFriends.some((friend) => friend.id === userId)) {
			return true;
		}
		return false;
	}

	return (
		<View style={styles.modalView}>
			<View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
				{/* Boton cerrar PopUp */}
				<TouchableOpacity
					style={{ padding: 10, alignItems: "flex-start", marginLeft: 10 }}
					onPress={props.onClose}
				>
					<Icon name="xmark" size={24} color="black" style={{ marginTop: 10 }} />
				</TouchableOpacity>
			</View>

			<View style={styles.mainInfo}>
				{props.avatar ? (
					<Image source={{ uri: props.avatar || "undefined_image" }} style={styles.avatar} />
				) : (
					<Icon name="user" size={35} style={{ padding: 20 }} color="black" />
				)}

				{/* full_name y username */}
				<View style={styles.topInfo}>
					<Text style={styles.name}>{props.full_name}</Text>
					{props.username && (
						<Text style={{ fontSize: 16, color: "gray", marginBottom: 10 }}>{props.username}</Text>
					)}
				</View>
			</View>

			{userIsFriend(props.id) && (
				<View>
					{/* Invitaciones a equipos */}
					{/* {myTeams?.length! > 0 && (
						<View style={styles.buttonsContainer}>
							<SelectDropdown
								defaultValue={(myTeams ?? [])[0] || ""}
								onSelect={(itemValue, index) => setSelectedTeam(itemValue)}
								data={myTeams?.map((team) => team.name) || []}
								dropdownStyle={{ backgroundColor: "white", gap: 5, borderRadius: 8 }}
								renderButton={(selectedItem) => {
									return (
										<View style={[styles.button, styles.friendRequestButton]}>
											<Icon name="share" size={18} color="black" style={{ marginRight: 10 }} />
											<Text style={styles.buttonText}>
												{selectedItem
													? "Invitar a mi Equipo: " + selectedItem
													: "Invitar a mis equipos"}
											</Text>
										</View>
									);
								}}
								renderItem={(item, isSelected) => {
									return (
										<View
											style={{
												...styles.dropdownItemStyle,
												...(isSelected && { backgroundColor: "#D2D9DF" }),
											}}
										>
											<Text style={styles.dropdownItemTxtStyle}>{item}</Text>
										</View>
									);
								}}
							/>
						</View>
					)}

					{selectedTeam && (
						<View style={styles.buttonsContainer}>
							<TouchableOpacity style={styles.button} onPress={() => handleDeleteFriend(props.id)}>
								<Icon name="user-xmark" size={18} color="black" style={{ marginRight: 10 }} />
								<Text style={styles.buttonText}>Confirmar invitación</Text>
							</TouchableOpacity>
						</View>
					)} */}

					<View style={styles.buttonsContainer}>
						<TouchableOpacity style={styles.button} onPress={() => handleDeleteFriend(props.id)}>
							<Icon name="user-xmark" size={18} color="black" style={{ marginRight: 10 }} />
							<Text style={styles.buttonText}>Eliminar de favoritos</Text>
						</TouchableOpacity>
					</View>
				</View>
			)}
			<View style={{ marginBottom: 10 }} />
		</View>
	);
}

const styles = StyleSheet.create({
	name: {
		fontSize: 22,
		fontWeight: "bold",
		justifyContent: "center",
		color: "#f18f01",
		marginBottom: 10,
	},
	modalView: {
		backgroundColor: "white",
		borderRadius: 20,
		color: "#00ff00",
		overflow: "hidden",
		width: ScreenWidth * 0.9,
	},
	mainInfo: {
		padding: 15,
		alignItems: "center",
	},
	topInfo: {
		flexDirection: "column",
		justifyContent: "space-between",
		alignItems: "center",
	},
	avatar: {
		width: 100,
		height: 100,
		borderRadius: 100,
		marginBottom: 20,
	},
	buttonsContainer: {
		flexDirection: "column",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 10,
	},
	buttonText: {
		color: "#000",
		fontSize: 16,
		fontWeight: "bold",
		textAlign: "center",
	},
	button: {
		flexDirection: "row",
		width: "80%",
		padding: 17,
		justifyContent: "center",
		alignItems: "center",
		borderWidth: 1,
		borderColor: "#ccc",
	},
	friendRequestButton: {
		backgroundColor: "#f18f01",
	},
	friendsButtonText: {
		color: "#fff",
		fontSize: 16,
		fontWeight: "bold",
		textAlign: "center",
	},
	dropdownItemStyle: {
		width: "100%",
		backgroundColor: "#F9FCFF",
		flexDirection: "row",
		paddingHorizontal: 12,
		justifyContent: "center",
		alignItems: "center",
		paddingVertical: 8,
		borderRadius: 8,
		borderBottomWidth: 1,
		borderColor: "#000000",
	},
	dropdownItemTxtStyle: {
		flex: 1,
		fontSize: 18,
		fontWeight: "500",
		color: "#151E26",
	},
});

export default PopUpFriend;
