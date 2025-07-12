import { supabase } from "@/lib/supabase";
import { StyleSheet, Text, TouchableOpacity, View, FlatList, Modal } from "react-native";
import { useState } from "react";
import { router } from "expo-router";
import Icon from "react-native-vector-icons/FontAwesome6";
import {
	getUserAuthSession,
	getUserPreferencesByUserId,
	useUpdateUserPreferences,
	useUpdateTeam,
	getAllTeams,
} from "@/lib/autogen/queries";
import PopUpTeam from "@components/PopUpTeam";

function myTeamInvites() {
	const { data: session } = getUserAuthSession(supabase);
	const user = session?.user;
	const { data: userPreferences } = getUserPreferencesByUserId(supabase, user?.id!);
	const updateUserPreferences = useUpdateUserPreferences(supabase);
	const { data: teams } = getAllTeams(supabase);

	const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);

	const handleDeleteTeamInvite = async (teamId: string) => {
		const updatedInvitations = userPreferences?.team_invites.filter((team) => team !== teamId);
		try {
			await updateUserPreferences.mutateAsync({
				user_id: user?.id!,
				team_invites: updatedInvitations,
			});

			console.log("invitation deleted");
		} catch (error) {
			console.error("Error updating user preferences:", error);
		}
	};

	return (
		<View style={styles.background}>
			<View
				style={{
					flexDirection: "row",
					alignItems: "center",
					justifyContent: "center",
					paddingVertical: 15,
					paddingHorizontal: 10,
					position: "relative",
				}}
			>
				<TouchableOpacity
					onPress={() => router.push("/(tabs)/profile")}
					style={{ position: "absolute", left: 10 }}
				>
					<Icon name="arrow-left" size={18} color="#262626" />
				</TouchableOpacity>

				<View style={{ flex: 1, alignItems: "center" }}>
					<Text
						style={{
							fontSize: 26,
							fontWeight: "bold",
							color: "#f18f01",
						}}
					>
						Invitaciones a equipos
					</Text>
				</View>
			</View>

			{/* Invitaciones a Equipos */}
			<View style={styles.dataContainer}>
				{userPreferences?.team_invites.length! > 0 ? (
					<View style={styles.row}>
						<FlatList
							data={userPreferences?.team_invites}
							keyExtractor={(item) => item}
							scrollEnabled={true}
							contentContainerStyle={{ paddingBottom: 80 }}
							renderItem={({ item }) => {
								const team = teams?.find((team) => team.team_id === item);
								if (!team) return null;
								return (
									<View style={styles.card}>
										<View
											style={{
												flexDirection: "row",
												justifyContent: "space-between",
												alignItems: "center",
											}}
										>
											{/* Nombre del equipo */}
											<Text style={styles.teamName}>{team.name}</Text>

											{/* Íconos alineados horizontalmente */}
											<View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
												<TouchableOpacity onPress={() => handleDeleteTeamInvite(team.team_id)}>
													<Icon name="square-xmark" size={22} color="#223332" />
												</TouchableOpacity>

												<TouchableOpacity onPress={() => setSelectedTeamId(team.team_id)}>
													<Icon name="circle-info" size={22} color="#223332" />
												</TouchableOpacity>
											</View>
										</View>
									</View>
								);
							}}
						/>
					</View>
				) : (
					<Text style={{ textAlign: "center", marginTop: 40, fontSize: 18, color: "#555" }}>
						No tienes invitaciones a equipos.
					</Text>
				)}
			</View>

			<Modal
				style={styles.modal}
				visible={selectedTeamId !== null}
				transparent={true}
				onRequestClose={() => setSelectedTeamId(null)}
			>
				<View style={styles.centeredView}>
					{selectedTeamId && <PopUpTeam onClose={() => setSelectedTeamId(null)} team_id={selectedTeamId} />}
				</View>
			</Modal>
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
	card: {
		backgroundColor: "#fff",
		borderRadius: 12,
		padding: 24,
		marginBottom: 12,
		marginHorizontal: 6,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 3,
	},
	teamName: {
		fontSize: 18,
		fontWeight: "600",
		color: "#262626",
		textAlign: "left",
	},
});

export default myTeamInvites;
