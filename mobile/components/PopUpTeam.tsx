import React, { useState, useEffect, useRef } from "react";
import { View, Text, Button, StyleSheet, Image, TouchableOpacity, Modal, Alert, ScrollView } from "react-native";
import { ScreenHeight, ScreenWidth } from "@rneui/themed/dist/config";
import { supabase } from "@/lib/supabase";
import { Session } from "@supabase/supabase-js";
import Icon from "react-native-vector-icons/FontAwesome6";
import { Player } from "../app/(tabs)/teams.tsx";
import PlayerPreview from "./PlayerPreview.tsx";
import { getUsername, getAllUsers, useUpdateTeam, useDeleteTeam } from "@lib/autogen/queries.ts";
import { getUserSession } from "@/lib/autogen/queries";
import { router } from "expo-router";
import PopUpJoinRequests from "./PopUpJoinRequests.tsx";
import { join } from "path";

type PropsPopUpTeam = {
	onClose: () => void;
	team_id: string;
	name: string;
	sport: string;
	description: string;
	players: string[];
	playerRequests: string[];
	public: boolean;
};

function PopUpTeam(props: PropsPopUpTeam) {
	const { data: user } = getUserSession(supabase);
	const usersData = getAllUsers(supabase);
	const updateTeamMutation = useUpdateTeam(supabase);
	const deleteTeamMutation = useDeleteTeam(supabase);

	const [players, setPlayers] = useState<string[]>(props.players);
	const [requests, setRequests] = useState<string[]>(props.playerRequests);

	const [isModalVisible, setIsModalVisible] = useState(false); //PopUpJoinRequests
	const handleCloseModal = () => {
		setIsModalVisible(false);
	};

	function userAlreadyOnTeam(userId: string) {
		if (players?.includes(userId)) {
			return true;
		}
		return false;
	}

	function joinRequested(userId: string) {
		if (requests?.includes(userId)) {
			return true;
		}
		return false;
	}

	const handleJoinTeam = async () => {
		if (props.public) {
			const updatedMembers = [...(players || []), user?.id!];

			try {
				await updateTeamMutation.mutateAsync({
					team_id: props.team_id,
					players: updatedMembers,
				});

				setPlayers(updatedMembers);
			} catch (error) {
				console.error("Error joining team:", error);
			}
		} else {
			const updatedRequests = [...(requests || []), user?.id!];

			try {
				await updateTeamMutation.mutateAsync({
					team_id: props.team_id,
					playerRequests: updatedRequests,
				});

				setRequests(updatedRequests);
			} catch (error) {
				console.error("Error requesting to join team:", error);
			}
		}
	};

	const handleLeaveTeam = async () => {
		const updatedMembers = players?.filter((player) => player !== user?.id);

		try {
			await updateTeamMutation.mutateAsync({
				team_id: props.team_id,
				players: updatedMembers,
			});

			setPlayers(updatedMembers);
		} catch (error) {
			console.error("Error leaving team:", error);
		}
	};

	useEffect(() => {
		const deleteTeamIfEmpty = async () => {
			if (players.length === 0) {
				try {
					await deleteTeamMutation.mutateAsync({ team_id: props.team_id });
					router.push("/(tabs)/teams");
					Alert.alert("Equipo eliminado", "Equipo eliminado con éxito");
				} catch (error) {
					console.error("Error al eliminar:", error);
				}
			}
		};

		deleteTeamIfEmpty();
	}, [players]);

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

				{/* Boton join requests (arriba a la derecha) (si es publico no aparece) */}
				{userAlreadyOnTeam(user?.id!) && !props.public && (
					<TouchableOpacity
						style={{ padding: 10, alignItems: "flex-start" }}
						onPress={() => {
							setIsModalVisible(true);
						}}
					>
						<Icon name="users" size={24} color="black" style={{ marginTop: 10 }} />
					</TouchableOpacity>
				)}

				{/* PopUpJoinRequests */}
				<Modal
					style={styles.modal}
					visible={isModalVisible}
					transparent={true}
					onRequestClose={() => setIsModalVisible(false)}
				>
					<View style={styles.centeredView}>
						<PopUpJoinRequests
							onClose={handleCloseModal}
							team_id={props.team_id}
							name={props.name}
							players={props.players}
							playerRequests={props.playerRequests}
						/>
					</View>
				</Modal>
			</View>

			<View style={styles.mainInfo}>
				{/* Nombre del equipo y deporte */}
				<View style={styles.topInfo}>
					<Text style={styles.teamName}>{props.name}</Text>
					<Text style={{ fontSize: 16, color: "gray", marginBottom: 10 }}>{props.sport}</Text>
				</View>

				{/* Miembros del Equipo */}
				<ScrollView style={styles.scrollArea}>
					<View style={{ width: "100%" }}>
						{players?.map((member) => (
							<View key={member} style={styles.row}>
								<View style={{ height: 60, width: 30 }}></View>
								{/* <Image
									source={{ uri: "https://github.com/tomaspietravallo.png" }}
									style={styles.avatar}
								/> */}
								<Icon name="user" size={24} color="black">
									{" "}
								</Icon>
								<View style={styles.info}>
									<Text style={styles.name}>
										{usersData.data?.find((user) => user.id === member)?.full_name}
									</Text>
								</View>
								{/* <Text style={styles.number}/>FEAT: NUMEROS DE JUGADORES */}
								{/* <PlayerPreview key={member} player_name={member}></PlayerPreview> */}
							</View>
						))}
					</View>
				</ScrollView>

				{/* Descripcion del equipo */}
				<Text style={styles.description}>{props.description}</Text>
			</View>

			{/* Boton Join team - request to join team */}
			{!userAlreadyOnTeam(user?.id!) && !joinRequested(user?.id!) && (
				<TouchableOpacity
					style={[styles.joinTeamButton]}
					onPress={() =>
						handleJoinTeam()
							.then(() => console.log("Joined team"))
							.catch((e) => console.log("Error joining team", e))
					}
				>
					<Text style={styles.buttonText}>{props.public ? "Join Team" : "Request to Join Team"}</Text>
				</TouchableOpacity>
			)}

			{/* Boton request to join sent */}
			{!userAlreadyOnTeam(user?.id!) && joinRequested(user?.id!) && (
				<View style={[styles.joinTeamButton]}>
					<Text style={styles.buttonText}>{"Request sent!"}</Text>
				</View>
			)}

			{/* Boton leave team */}
			{userAlreadyOnTeam(user?.id!) && (
				<TouchableOpacity
					style={[styles.leaveTeamButton]}
					onPress={() =>
						handleLeaveTeam()
							.then(() => console.log("Left team"))
							.catch((e) => console.log("Error leaving team", e))
					}
				>
					<Text style={styles.buttonText}>Leave Team</Text>
				</TouchableOpacity>
			)}
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
	description: {
		paddingTop: 20,
		paddingBottom: 10,
		fontSize: 18,
	},
	modalView: {
		backgroundColor: "white",
		borderRadius: 20,
		color: "#00ff00",
		overflow: "hidden",
		width: ScreenWidth * 0.9,
	},
	scrollContainer: {
		flexGrow: 1,
		paddingBottom: 20,
	},
	scrollArea: {
		backgroundColor: "#f0f0f0",
		marginBottom: 10,
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
	selection: {
		padding: 20,
		gap: 30,
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
	select: {
		fontWeight: "bold",
		fontSize: 16,
		marginBottom: 10,
	},
	selected: {
		backgroundColor: "white",
		borderWidth: 1,
		borderColor: "#747775",
		borderRadius: 20,
		paddingHorizontal: 12,
		height: 20,
		flexDirection: "row",
	},
	row: {
		flexDirection: "row",
		alignItems: "center",
		borderBottomWidth: 1,
		borderColor: "#ccc",
		backgroundColor: "white",
		width: "100%",
	},
	avatar: {
		width: 48,
		height: 48,
		borderRadius: 24,
	},
	info: {
		flex: 1,
		marginLeft: 12,
	},
	name: {
		fontSize: 16,
		fontWeight: "bold",
	},
	number: {
		fontSize: 18,
		fontWeight: "bold",
		padding: 20,
	},
	joinTeamButton: {
		backgroundColor: "#f18f04",
		width: "100%",
		padding: 17,
		alignItems: "center",
		justifyContent: "center",
		marginTop: 10,
	},
	leaveTeamButton: {
		backgroundColor: "#c7c7c7",
		width: "100%",
		padding: 17,
		alignItems: "center",
		justifyContent: "center",
		marginTop: 10,
	},
	buttonText: {
		color: "#fff",
		fontSize: 16,
		fontWeight: "bold",
	},
	modal: {
		justifyContent: "center",
		alignItems: "center",
	},
	centeredView: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "rgba(0, 0, 0, 0.5)",
	},
});

export default PopUpTeam;
