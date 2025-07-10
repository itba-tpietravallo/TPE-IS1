import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Modal, Alert, ScrollView } from "react-native";
import { ScreenWidth } from "@rneui/themed/dist/config";
import { supabase } from "@/lib/supabase";
import Icon from "react-native-vector-icons/FontAwesome6";
import { getAllUsers, useUpdateTeam, useDeleteTeam, getUserAuthSession, getTeamById } from "@lib/autogen/queries.ts";
import { router } from "expo-router";
import PopUpJoinRequests from "./PopUpJoinRequests.tsx";
import { Image } from "@rneui/themed";
import PopUpTeamMemberInfo from "./PopUpTeamMemberInfo.tsx";

type PropsPopUpTeam = {
	onClose: () => void;
	team_id: string;
};

function PopUpTeam(props: PropsPopUpTeam) {
	const { data: session } = getUserAuthSession(supabase);
	const user = session?.user;
	const usersData = getAllUsers(supabase);
	const updateTeamMutation = useUpdateTeam(supabase);
	const deleteTeamMutation = useDeleteTeam(supabase);

	const { data: team } = getTeamById(supabase, props.team_id);

	const [isModalVisibleJoinRequests, setIsModalVisibleJoinRequests] = useState(false); //PopUpJoinRequests
	const [selectedMember, setSelectedMember] = useState<string | null>(null);

	const handleCloseModalJoinRequest = () => {
		setIsModalVisibleJoinRequests(false);
	};

	function userAlreadyOnTeam(userId: string) {
		if (team?.players?.includes(userId)) {
			return true;
		}
		return false;
	}

	function joinRequested(userId: string) {
		if (team?.playerRequests?.includes(userId)) {
			return true;
		}
		return false;
	}

	const handleJoinTeam = async () => {
		if (team?.isPublic) {
			const updatedMembers = [...(team?.players || []), user?.id!];

			try {
				await updateTeamMutation.mutateAsync({
					team_id: props.team_id,
					players: updatedMembers,
				});
			} catch (error) {
				console.error("Error joining team:", error);
			}
		} else {
			const updatedRequests = [...(team?.playerRequests || []), user?.id!];

			try {
				await updateTeamMutation.mutateAsync({
					team_id: props.team_id,
					playerRequests: updatedRequests,
				});
			} catch (error) {
				console.error("Error requesting to join team:", error);
			}
		}
	};

	const handleLeaveTeam = async () => {
		const updatedMembers = team!.players?.filter((player) => player !== user?.id);
		var updatedAdmins = team!.admins?.filter((player) => player !== user?.id);

		if (updatedAdmins.length == 0) {
			updatedAdmins = [...updatedAdmins, team!.players[0]];
		}

		try {
			await updateTeamMutation.mutateAsync({
				team_id: props.team_id,
				players: updatedMembers,
				admins: updatedAdmins,
			});
		} catch (error) {
			console.error("Error leaving team:", error);
		}
	};

	useEffect(() => {
		const deleteTeamIfEmpty = async () => {
			if (team?.players.length === 0) {
				try {
					await deleteTeamMutation.mutateAsync({ team_id: props.team_id });
					router.push("/(tabs)/teams");
					Alert.alert("Equipo eliminado", "Equipo eliminado con éxito");
				} catch (error) {
					console.error("Error al eliminar:", error);
				}
			}
		};

		const cleanPlayersArray = async () => {
			const updatedMembers = (team?.players || []).filter((player): player is string => player !== null);

			try {
				await updateTeamMutation.mutateAsync({
					team_id: props.team_id,
					players: updatedMembers,
				});
			} catch (error) {
				console.error("Error cleaning team:", error);
			}
		};

		if (team?.players.some((p) => p === null)) {
			cleanPlayersArray();
		}
		deleteTeamIfEmpty();
	}, [team?.players]);

	function userIsAdmin(userId: string) {
		if (team?.admins?.includes(userId)) {
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

				{/* Boton join requests (arriba a la derecha) (si es publico no aparece) */}
				{userAlreadyOnTeam(user?.id!) && !team?.isPublic && userIsAdmin(user!.id) && (
					<TouchableOpacity
						style={{ padding: 10, alignItems: "flex-start" }}
						onPress={() => {
							setIsModalVisibleJoinRequests(true);
						}}
					>
						<Icon name="users" size={24} color="black" style={{ marginTop: 10 }} />
					</TouchableOpacity>
				)}

				{/* Public team icon */}
				{team?.isPublic && (
					<View style={{ padding: 10, alignItems: "flex-start" }}>
						<Icon name="globe" size={24} color="black" style={{ marginTop: 10 }} />
					</View>
				)}

				{/* PopUpJoinRequests */}
				<Modal
					style={styles.modal}
					visible={isModalVisibleJoinRequests}
					transparent={true}
					onRequestClose={() => setIsModalVisibleJoinRequests(false)}
				>
					<View style={styles.centeredView}>
						<PopUpJoinRequests onClose={handleCloseModalJoinRequest} team_id={props.team_id} />
					</View>
				</Modal>
			</View>

			<View style={styles.mainInfo}>
				{/* Nombre del equipo y deporte */}
				<View style={styles.topInfo}>
					<Text style={styles.teamName}>{team?.name}</Text>
					<Text style={{ fontSize: 16, color: "gray", marginBottom: 10 }}>{team?.sport}</Text>
				</View>

				{/* Miembros del Equipo */}
				<ScrollView style={styles.scrollArea}>
					<View style={{ width: "100%" }}>
						{team?.players?.map((member) => (
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
				{team?.description && <Text style={styles.description}>{team?.description}</Text>}
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
					<Text style={styles.buttonText}>{team?.isPublic ? "Join Team" : "Request to Join Team"}</Text>
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
