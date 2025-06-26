import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from "react-native";
import { ScreenWidth } from "@rneui/themed/dist/config";
import { supabase } from "@/lib/supabase";
import Icon from "react-native-vector-icons/FontAwesome6";
import { getAllUsers, useUpdateTeam, getUserSession } from "@lib/autogen/queries";

type PropsPopUpJoinRequests = {
	onClose: () => void;
	team_id: string;
	name: string;
	players: string[];
	setPlayers: React.Dispatch<React.SetStateAction<string[]>>;
	playerRequests: string[];
	setRequests: React.Dispatch<React.SetStateAction<string[]>>;
};

function PopUpJoinRequests(props: PropsPopUpJoinRequests) {
	const usersData = getAllUsers(supabase);
	const updateTeamMutation = useUpdateTeam(supabase);

	const handleAcceptPlayer = async (player: string) => {
		const updatedMembers = [...(props.players || []), player];

		try {
			await updateTeamMutation.mutateAsync({
				team_id: props.team_id,
				players: updatedMembers,
			});

			props.setPlayers(updatedMembers);

			handleDeleteRequest(player);
		} catch (error) {
			console.error("Error accepting player:", error);
			Alert.alert("Error", "No se pudo aceptar al jugador");
		}
	};

	const handleDeleteRequest = async (player: string) => {
		const updatedRequests = props.playerRequests.filter((member) => member !== player);

		try {
			await updateTeamMutation.mutateAsync({
				team_id: props.team_id,
				playerRequests: updatedRequests,
			});

			props.setRequests(updatedRequests);
			console.log("deleted");
			console.log(updatedRequests);
		} catch (error) {
			console.error("Error updating player requests:", error);
			Alert.alert("Error", "No se pudo actualizar la solicitud");
		}
	};

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
				{/* Nombre del equipo */}
				<View style={styles.topInfo}>
					{/* <Text style={styles.teamName}>{props.name}</Text> */}
					<Text style={{ fontSize: 16, color: "gray", marginBottom: 10 }}>Join Requests</Text>
				</View>

				{/* Solicitudes de Union al Equipo */}
				{props.playerRequests?.length != 0 && (
					<ScrollView style={styles.scrollArea}>
						<View style={{ width: "100%" }}>
							{props.playerRequests?.map((member) => (
								<View key={member} style={styles.row}>
									<View style={{ height: 60, width: 30 }}></View>
									<Icon name="user" size={24} color="black">
										{" "}
									</Icon>
									<View style={styles.info}>
										<Text style={styles.name}>
											{usersData.data?.find((user) => user.id === member)?.full_name}
										</Text>
									</View>
									<TouchableOpacity
										style={{ padding: 3, alignItems: "flex-start", marginLeft: 10 }}
										onPress={() => handleAcceptPlayer(member)}
									>
										<Icon name="check-square" size={24} color="#f18f01" style={{ marginTop: 10 }} />
									</TouchableOpacity>
									<TouchableOpacity
										style={{ padding: 3, alignItems: "flex-start", marginLeft: 10 }}
										onPress={() => handleDeleteRequest(member)}
									>
										<Icon name="square-xmark" size={24} color="black" style={{ marginTop: 10 }} />
									</TouchableOpacity>
								</View>
							))}
						</View>
					</ScrollView>
				)}
				{props.playerRequests?.length == 0 && (
					<View style={styles.topInfo}>
						<Text style={styles.name}>No hay solicitdes para unirse al equipo!</Text>
						<Text />
					</View>
				)}
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	teamName: {
		fontSize: 32,
		fontWeight: "bold",
		justifyContent: "center",
		color: "#f18f01",
	},
	modalView: {
		backgroundColor: "white",
		borderRadius: 20,
		color: "#00ff00",
		overflow: "hidden",
		width: ScreenWidth * 0.9,
	},
	scrollArea: {
		backgroundColor: "#f0f0f0",
		marginBottom: 20,
		flexGrow: 0,
		maxHeight: 320,
	},
	mainInfo: {
		padding: 15,
	},
	topInfo: {
		flexDirection: "column",
		justifyContent: "space-between",
		alignItems: "center",
		gap: 15,
	},
	row: {
		flexDirection: "row",
		alignItems: "center",
		borderBottomWidth: 1,
		borderColor: "#ccc",
		backgroundColor: "white",
		width: "100%",
	},
	info: {
		flex: 1,
		marginLeft: 12,
	},
	name: {
		fontSize: 16,
		fontWeight: "bold",
	},
	modal: {
		justifyContent: "center",
		alignItems: "center",
	},
	button: {
		flex: 1,
		padding: 10,
		borderRadius: 5,
		alignItems: "center",
		justifyContent: "center",
	},
});

export default PopUpJoinRequests;
