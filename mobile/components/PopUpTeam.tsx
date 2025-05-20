import React, { useState, useEffect, useRef } from "react";
import { View, Text, Button, StyleSheet, Image, TouchableOpacity, Modal, Alert, ScrollView } from "react-native";
import { ScreenHeight, ScreenWidth } from "@rneui/themed/dist/config";
import { supabase } from "@/lib/supabase";
import { Session } from "@supabase/supabase-js";
import Icon from "react-native-vector-icons/FontAwesome6";
import { Player } from "../app/(tabs)/teams.tsx";
import PlayerPreview from "./PlayerPreview.tsx";
import { getUsername, getAllUsers } from "@lib/autogen/queries.ts";
import { getUserSession } from "@/lib/autogen/queries";
import { router } from "expo-router";

type PropsPopUpTeam = {
	onClose: () => void;
	team_id: string;
	name: string;
	sport: string;
	description: string;
	players: string[]; //solucion provisoria
	//players: Player[];
};

function PopUpTeam(props: PropsPopUpTeam) {
	const { data: user } = getUserSession(supabase);
	const usersData = getAllUsers(supabase);

	const [players, setPlayers] = useState<string[]>(props.players);

	function userAlreadyOnTeam(userId: string) {
		if (players?.includes(userId)) {
			return true;
		}
		return false;
	}

	const handleJoinTeam = async () => {
		//@TODO: AVECES EN TEAMS TIRA UN ERROR (update creo que ya se arreglo pero dejo esto aca por las dudas)
		const updatedMembers = [...(players || []), user?.id!];

		const { data, error } = await supabase
			.from("teams")
			.update({ players: updatedMembers })
			.eq("team_id", props.team_id)
			.throwOnError();

		setPlayers(updatedMembers);
	};

	const handleLeaveTeam = async () => {
		//@TODO: AVECES EN TEAMS TIRA UN ERROR
		const updatedMembers = players?.filter((player) => player !== user?.id);

		const { data, error } = await supabase
			.from("teams")
			.update({ players: updatedMembers })
			.eq("team_id", props.team_id);

		setPlayers(updatedMembers);
	};

	useEffect(() => {
		const deleteTeamIfEmpty = async () => {
			if (players.length === 0) {
				const { error } = await supabase.from("teams").delete().eq("team_id", props.team_id);

				if (error) {
					console.error("Error al eliminar:", error.message);
				} else {
					router.push("/(tabs)/teams");
					Alert.alert("Equipo eliminado", "Equipo eliminado con éxito");
				}
			}
		};

		deleteTeamIfEmpty();
	}, [players]);

	return (
		<View style={styles.modalView}>
			{/* Boton cerrar PopUp */}
			<TouchableOpacity style={{ padding: 10, alignItems: "flex-start", marginLeft: 10 }} onPress={props.onClose}>
				<Icon name="xmark" size={24} color="black" style={{ marginTop: 10 }} />
			</TouchableOpacity>

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

			{/* Boton Join team */}
			{!userAlreadyOnTeam(user?.id!) && (
				<TouchableOpacity
					style={[styles.joinTeamButton]}
					onPress={() =>
						handleJoinTeam()
							.then(() => console.log("Joined team"))
							.catch((e) => console.log("Error joining team", e))
					}
				>
					<Text style={styles.buttonText}>Join Team</Text>
				</TouchableOpacity>
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
});

export default PopUpTeam;
