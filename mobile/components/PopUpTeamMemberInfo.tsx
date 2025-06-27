import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { ScreenWidth } from "@rneui/themed/dist/config";
import Icon from "react-native-vector-icons/FontAwesome6";
import { Image } from "@rneui/themed";
import { supabase } from "@lib/supabase";
import { getUserAuthSession, useUpdateTeam } from "@/lib/autogen/queries";

type PropsPopUpTeamMemberInfo = {
	onClose: () => void;
	id: string;
	full_name: string;
	username: string;
	avatar: string;
	players: string[];
	setPlayers: React.Dispatch<React.SetStateAction<string[]>>;
	admins: string[];
	setAdmins: React.Dispatch<React.SetStateAction<string[]>>;
	team_id: string;
};

function PopUpTeamMemberInfo(props: PropsPopUpTeamMemberInfo) {
	const { data: session } = getUserAuthSession(supabase);
	const user = session?.user;
	const updateTeamMutation = useUpdateTeam(supabase);

	const handleDeletePlayer = async (player: string) => {
		const updatedPlayers = props.players.filter((member) => member !== player);
		var updatedAdmins = props.admins.filter((member) => member !== player);

		if (updatedAdmins.length == 0) {
			updatedAdmins = [...updatedAdmins, props.players[0]];
		}

		try {
			await updateTeamMutation.mutateAsync({
				team_id: props.team_id,
				players: updatedPlayers,
				admins: updatedAdmins,
			});

			props.setPlayers(updatedPlayers);
			props.setAdmins(updatedAdmins);
			props.onClose();
			console.log("deleted");
		} catch (error) {
			console.error("Error leaving team:", error);
		}
	};

	const handleManageAdmin = async (player: string) => {
		var updatedAdmins;
		if (!userIsAdmin(player)) {
			updatedAdmins = [...(props.admins || []), player];
		} else {
			updatedAdmins = props.admins.filter((admin) => admin !== player);
		}

		try {
			await updateTeamMutation.mutateAsync({
				team_id: props.team_id,
				admins: updatedAdmins,
			});

			props.setAdmins(updatedAdmins);
		} catch (error) {
			console.error("Error managing admin:", error);
		}
	};

	function userIsAdmin(userId: string) {
		if (props.admins?.includes(userId)) {
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
					<Icon name="user" size={35} color="black" />
				)}

				{/* full_name y username */}
				<View style={styles.topInfo}>
					<Text style={styles.name}>{props.full_name}</Text>
					{props.username && (
						<Text style={{ fontSize: 16, color: "gray", marginBottom: 10 }}>{props.username}</Text>
					)}
				</View>

				{userIsAdmin(props.id) && (
					<View style={styles.topInfo}>
						<Text style={{ fontSize: 16, color: "gray" }}>Admin</Text>
					</View>
				)}
			</View>

			{userIsAdmin(user?.id!) && (
				<View style={styles.buttonsContainer}>
					{!userIsAdmin(props.id) && (
						<TouchableOpacity style={styles.button} onPress={() => handleManageAdmin(props.id)}>
							<Icon name="user-check" size={18} color="black" style={{ marginRight: 10 }} />
							<Text style={styles.buttonText}>Hacer admin del equipo</Text>
						</TouchableOpacity>
					)}
					{userIsAdmin(props.id) && (
						<TouchableOpacity style={styles.button} onPress={() => handleManageAdmin(props.id)}>
							<Icon name="user-minus" size={18} color="black" style={{ marginRight: 10 }} />
							<Text style={styles.buttonText}>
								{userIsAdmin(props.id) ? "Sacar como admin del equipo" : "Hacer admin del equipo"}
							</Text>
						</TouchableOpacity>
					)}
					<TouchableOpacity style={styles.button} onPress={() => handleDeletePlayer(props.id)}>
						<Icon name="user-xmark" size={18} color="black" style={{ marginRight: 10 }} />
						<Text style={styles.buttonText}>Eliminar del equipo</Text>
					</TouchableOpacity>
				</View>
			)}
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
		marginBottom: 20,
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
});

export default PopUpTeamMemberInfo;
