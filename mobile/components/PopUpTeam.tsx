import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Modal, Alert, ScrollView } from "react-native";
import { ScreenWidth } from "@rneui/themed/dist/config";
import { supabase } from "@/lib/supabase";
import Icon from "react-native-vector-icons/FontAwesome6";
import { getAllUsers, useUpdateTeam, useDeleteTeam, getUserAuthSession } from "@lib/autogen/queries.ts";
import { router } from "expo-router";
import PopUpJoinRequests from "./PopUpJoinRequests.tsx";
import { Image } from "@rneui/themed";
import PopUpTeamMemberInfo from "./PopUpTeamMemberInfo.tsx";

type PropsPopUpTeam = {
	onClose: () => void;
	team_id: string;
	name: string;
	sport: string;
	description: string;
	players: string[];
	setPlayers: React.Dispatch<React.SetStateAction<string[]>>;
	playerRequests: string[];
	setRequests: React.Dispatch<React.SetStateAction<string[]>>;
	admins: string[];
	setAdmins: React.Dispatch<React.SetStateAction<string[]>>;
	public: boolean;
};

function PopUpTeam(props: PropsPopUpTeam) {
	const { data: session } = getUserAuthSession(supabase);
	const user = session?.user;
	const usersData = getAllUsers(supabase);
	const updateTeamMutation = useUpdateTeam(supabase);
	const deleteTeamMutation = useDeleteTeam(supabase);

	const [isModalVisibleJoinRequests, setIsModalVisibleJoinRequests] = useState(false); //PopUpJoinRequests
	const [selectedMember, setSelectedMember] = useState<string | null>(null);

	const handleCloseModalJoinRequest = () => {
		setIsModalVisibleJoinRequests(false);
	};

	function userAlreadyOnTeam(userId: string) {
		if (props.players?.includes(userId)) {
			return true;
		}
		return false;
	}

	function joinRequested(userId: string) {
		if (props.playerRequests?.includes(userId)) {
			return true;
		}
		return false;
	}

	const handleJoinTeam = async () => {
		if (props.public) {
			const updatedMembers = [...(props.players || []), user?.id!];

			try {
				await updateTeamMutation.mutateAsync({
					team_id: props.team_id,
					players: updatedMembers,
				});

				props.setPlayers(updatedMembers);
			} catch (error) {
				console.error("Error joining team:", error);
			}
		} else {
			const updatedRequests = [...(props.playerRequests || []), user?.id!];

			try {
				await updateTeamMutation.mutateAsync({
					team_id: props.team_id,
					playerRequests: updatedRequests,
				});

				props.setRequests(updatedRequests);
			} catch (error) {
				console.error("Error requesting to join team:", error);
			}
		}
	};

	const handleLeaveTeam = async () => {
		const updatedMembers = props.players?.filter((player) => player !== user?.id);
		var updatedAdmins = props.admins?.filter((player) => player !== user?.id);

		if (updatedAdmins.length == 0) {
			updatedAdmins = [...updatedAdmins, props.players[0]];
		}

		try {
			await updateTeamMutation.mutateAsync({
				team_id: props.team_id,
				players: updatedMembers,
			});

			props.setPlayers(updatedMembers);
			props.setAdmins(updatedAdmins); //checkear
		} catch (error) {
			console.error("Error leaving team:", error);
		}
	};

	useEffect(() => {
		const deleteTeamIfEmpty = async () => {
			if (props.players.length === 0) {
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
	}, [props.players]);

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
							setIsModalVisibleJoinRequests(true);
						}}
					>
						<Icon name="users" size={24} color="black" style={{ marginTop: 10 }} />
					</TouchableOpacity>
				)}

				{/* PopUpJoinRequests */}
				<Modal
					style={styles.modal}
					visible={isModalVisibleJoinRequests}
					transparent={true}
					onRequestClose={() => setIsModalVisibleJoinRequests(false)}
				>
					<View style={styles.centeredView}>
						<PopUpJoinRequests
							onClose={handleCloseModalJoinRequest}
							team_id={props.team_id}
							name={props.name}
							players={props.players}
							setPlayers={props.setPlayers}
							playerRequests={props.playerRequests}
							setRequests={props.setRequests}
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
						{props.players?.map((member) => (
							<View key={member} style={styles.row}>
								<View style={{ height: 60, width: 15 }}></View>

								{usersData.data?.find((user) => user.id === member)?.avatar_url ? (
									<Image
										source={{
											uri:
												usersData.data?.find((user) => user.id === member)?.avatar_url ||
												"undefined_image",
										}}
										style={{ width: 35, height: 35, borderRadius: 100 }}
									/>
								) : (
									<Icon name="user" size={35} color="black" />
								)}

								<View style={styles.info}>
									<Text style={styles.name}>
										{usersData.data?.find((user) => user.id === member)?.full_name}
									</Text>
								</View>

								{/* PopUpTeamMemberInfo */}
								{user?.id != member && (
									<TouchableOpacity onPress={() => setSelectedMember(member)}>
										<Icon name="circle-info" size={24} color="black" />
									</TouchableOpacity>
								)}

								<Modal
									style={styles.modal}
									visible={selectedMember !== null}
									transparent={true}
									onRequestClose={() => setSelectedMember(null)}
								>
									<View style={styles.centeredView}>
										{selectedMember &&
											(() => {
												const memberData = usersData.data?.find(
													(user) => user.id === selectedMember,
												)!;
												return user ? (
													<PopUpTeamMemberInfo
														onClose={() => setSelectedMember(null)}
														id={memberData.id}
														full_name={memberData.full_name}
														username={""} //TODO: FIX
														avatar={memberData.avatar_url!}
														players={props.players}
														setPlayers={props.setPlayers}
														admins={props.admins}
														setAdmins={props.setAdmins}
														team_id={props.team_id}
													/>
												) : null;
											})()}
									</View>
								</Modal>

								{/* <Text style={styles.number}/>FEAT: NUMEROS DE JUGADORES */}
							</View>
						))}
					</View>
				</ScrollView>

				{/* Descripcion del equipo */}
				{props.description && <Text style={styles.description}>{props.description}</Text>}
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
				<View style={[styles.joinRequestSentLabel]}>
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
	joinRequestSentLabel: {
		backgroundColor: "#5fd700",
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
