import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { ScreenWidth } from "@rneui/themed/dist/config";
import Icon from "react-native-vector-icons/FontAwesome6";
import { Image } from "@rneui/themed";
import { supabase } from "@lib/supabase";
import {
	getUserAuthSession,
	useUpdateUserPreferences,
	getAllTeamsByAdminUser,
	getUserPreferencesByUserId,
	useUpsertUserPreferences,
} from "@/lib/autogen/queries";
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
	const { data: userPreferences } = getUserPreferencesByUserId(supabase, user?.id!);
	const { data: friendUserPreferences } = getUserPreferencesByUserId(supabase, props.id);

	const updateUserPreferences = useUpdateUserPreferences(supabase);
	const upsertUserPreferences = useUpsertUserPreferences(supabase);

	const handleDeleteFavorite = async (player: string) => {
		const updatedFavorites = userPreferences?.fav_users.filter((member) => member !== player);

		try {
			await updateUserPreferences.mutateAsync({
				user_id: user?.id,
				fav_users: updatedFavorites,
			});

			props.onClose();
			console.log("deleted");
		} catch (error) {
			console.error("Error deleting fav user:", error);
		}
	};

	const handleInviteToTeam = async (userId: string, teamId: string) => {
		const updatedInvitations = [...(userPreferences?.team_invites || []), teamId];

		try {
			await upsertUserPreferences.mutateAsync([
				{
					user_id: props.id,
					fav_fields: userPreferences?.fav_fields || [],
					fav_users: userPreferences?.fav_users || [],
					team_invites: updatedInvitations,
				},
			]);

			console.log("invited");
		} catch (error) {
			console.error("Error upserting user preferences:", error);
		}
	};

	function userAlreadyInvited(teamId: string) {
		if (friendUserPreferences?.team_invites.some((invite) => invite === teamId)) {
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

			<View>
				{/* Invitaciones a equipos */}

				<View style={styles.buttonsContainer}>
					<SelectDropdown
						data={myTeams?.length! > 0 ? myTeams || [] : [{ name: "No tienes equipos", team_id: null }]}
						onSelect={(selectedTeamObj) => {
							if (selectedTeamObj.team_id === null) return;
							setSelectedTeam(selectedTeamObj.team_id);
						}}
						dropdownStyle={{
							backgroundColor: "white",
							gap: 5,
							borderRadius: 8,
						}}
						renderButton={(selectedItem) => {
							const noTeams = myTeams?.length === 0;
							return (
								<View style={[styles.button, noTeams && { opacity: 0.6 }]}>
									<Icon name="share" size={18} color="black" style={{ marginRight: 10 }} />
									<Text style={styles.buttonText}>
										{noTeams
											? "No puedes invitar sin equipos"
											: selectedItem
												? "Invitar a mi equipo: " + selectedItem.name
												: "Invitar a mis equipos"}
									</Text>
								</View>
							);
						}}
						renderItem={(item, isSelected) => {
							const isMessage = item.team_id === null;
							return (
								<View
									style={{
										...styles.dropdownItemStyle,
										backgroundColor: isMessage ? "#f0f0f0" : isSelected ? "#D2D9DF" : "white",
									}}
								>
									<Text
										style={{
											...styles.dropdownItemTxtStyle,
											color: isMessage ? "gray" : "black",
											fontStyle: isMessage ? "italic" : "normal",
										}}
									>
										{item.name}
									</Text>
								</View>
							);
						}}
					/>
				</View>

				{selectedTeam && !userAlreadyInvited(selectedTeam) && (
					<View style={styles.buttonsContainer}>
						<TouchableOpacity
							style={styles.button}
							onPress={() => handleInviteToTeam(props.id, selectedTeam)}
						>
							<Icon name="check" size={18} color="black" style={{ marginRight: 10 }} />
							<Text style={styles.buttonText}>Confirmar invitación</Text>
						</TouchableOpacity>
					</View>
				)}

				{selectedTeam && userAlreadyInvited(selectedTeam) && (
					<View style={styles.buttonsContainer}>
						<View style={styles.button}>
							<Icon name="check" size={18} color="black" style={{ marginRight: 10 }} />
							<Text style={styles.buttonText}>El usuario fue invitado al equipo!</Text>
						</View>
					</View>
				)}

				<View style={styles.buttonsContainer}>
					<TouchableOpacity style={styles.button} onPress={() => handleDeleteFavorite(props.id)}>
						<Icon name="user-xmark" size={18} color="black" style={{ marginRight: 10 }} />
						<Text style={styles.buttonText}>Eliminar de favoritos</Text>
					</TouchableOpacity>
				</View>
			</View>

			<View style={{ marginBottom: 10 }} />
		</View>
	);
}

const styles = StyleSheet.create({
	name: {
		fontSize: 20,
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
		width: 90,
		height: 90,
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
		color: "#333",
		fontSize: 16,
		textAlign: "center",
	},
	button: {
		flexDirection: "row",
		width: "85%",
		paddingVertical: 14,
		paddingHorizontal: 20,
		justifyContent: "center",
		alignItems: "center",
		borderWidth: 1,
		borderColor: "#ccc",
		borderRadius: 12,
		backgroundColor: "#fff",
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.1,
		shadowRadius: 2,
		elevation: 2,
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
