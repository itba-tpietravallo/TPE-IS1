import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, TouchableOpacity, TextInput, Modal, Image, ScrollView } from "react-native";
import { SearchBar } from "@rneui/themed";
import { ScreenHeight, ScreenWidth } from "@rneui/themed/dist/config";
import { supabase } from "@lib/supabase";
import Search from "./Search";
import { AutocompleteDropdownContextProvider } from "react-native-autocomplete-dropdown";
import SelectDropdown from "react-native-select-dropdown";
import {
	getUserSession,
	getAllTeams,
	getTeamById,
	getUsername,
	getAllUsers,
	queries,
	useInsertInscription,
	getUserAuthSession,
} from "@lib/autogen/queries";
import { User } from "@supabase/supabase-js";
import { get } from "http";
import PopUpReserva from "./PopUpReserva";
import { getUserSessionById } from "@db/queries";

interface PopUpReservaProps {
	onClose: () => void;
	name: string;
	sport: string;
	location: string;
	date: Date;
	description: string;
	price: string;
	deadline: Date;
	cantPlayers: number;
	tournamentId: string;
	alreadyJoined?: boolean;
}

function getPlayerListItem(player: NonNullable<ReturnType<typeof getAllUsers>["data"]>[number] & { id: string }) {
	return (
		<View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginLeft: 10 }}>
			<Image source={{ uri: player.avatar_url! }} style={{ width: 30, height: 30, borderRadius: 15 }} />
			<Text style={{ color: "#000000", padding: 15, width: "100%" }}>{player.full_name}</Text>
		</View>
	);
}

function getTeamMembers() {
	const { data, error } = getAllUsers(supabase);

	return data as NonNullable<ReturnType<typeof getAllUsers>["data"]>;
}
function PopUpTorneo({
	tournamentId,
	onClose,
	name,
	location,
	sport,
	date,
	description,
	price,
	deadline,
	cantPlayers,
	alreadyJoined,
}: PopUpReservaProps) {
	const [isModalVisible, setIsModalVisible] = useState(false);
	const usersData = getAllUsers(supabase);
	const { data: session } = getUserAuthSession(supabase);
	const user = session?.user;
	const { data: teams } = getAllTeams(supabase);
	const insertInscriptionMutation = useInsertInscription(supabase);
	const myTeams = teams?.filter((team) => team.players.some((member) => member === user?.id));

	const [selectedTeam, setSelectedTeam] = useState<string>("");
	const [team, setTeam] = useState<string>("");
	const [teamMembers, setTeamMembers] = useState<string[]>([]);
	const [contactPhone, setContactPhone] = useState<string>("");
	const [contactEmail, setContactEmail] = useState<string>("");

	const [canJoin, setCanJoin] = useState<boolean>(false);
	const [selectedPlayers, setSelectedPlayers] = useState<
		NonNullable<ReturnType<typeof getAllUsers>["data"]>[number] & { id: string }[]
	>();

	const handleSignTeam = async () => {
		if (!canJoin) return;
		if (selectedTeam == "") {
			alert("Por favor, selecciona un equipo");
			return;
		}

		try {
			await insertInscriptionMutation.mutateAsync([
				{
					tournamentId: tournamentId,
					teamId: selectedTeam,
				},
			]);
			console.log("Team successfully registered for tournament");
			onClose();
		} catch (error) {
			console.error("Error registering for tournament:", error);
			alert("Error al inscribir el equipo al torneo. Por favor, intenta de nuevo.");
		}
	};

	const fetchTeam = async () => {
		// Use queries.getTeamById directly since useQuerySupabase is meant for hooks
		const { data: teamData, error } = await queries.getTeamById(supabase, selectedTeam);

		if (error) {
			console.error("Error fetching team:", error);
			return;
		}

		if (teamData) {
			setTeam(teamData.name);
			setContactPhone(teamData.contactPhone);
			setContactEmail(teamData.contactEmail);
			setTeamMembers(teamData.players || []);

			const players = teamData.players || [];
			setCanJoin(players.length >= cantPlayers);
		}
	};

	useEffect(() => {
		if (!selectedTeam) return;

		fetchTeam();
	}, [selectedTeam]);

	const getUserById = async (userId: string) => {
		return getUsername(supabase, userId);
	};

	return (
		<View style={styles.modalContainer}>
			<View style={styles.modal}>
				<TouchableOpacity style={styles.closeButton} onPress={() => onClose()}>
					<Image style={styles.closeIcon} source={require("@/assets/images/close.png")} />
				</TouchableOpacity>
				<View style={styles.infoContainer}>
					<Text style={styles.title}>{name}</Text>
					<View style={{ flexDirection: "row" }}>
						<Text style={styles.label}>Fecha: </Text>
						<Text style={styles.value}>{date.toLocaleDateString()}</Text>
					</View>
					<View style={{ flexDirection: "row" }}>
						<Text style={styles.label}>Lugar: </Text>
						<Text style={styles.value}>{location}</Text>
					</View>
					<View style={styles.descriptionContainer}>
						<Text style={styles.label}>Descripción:</Text>
						<Text style={styles.descriptionText}>{description}</Text>
					</View>
					<View style={{ flexDirection: "row" }}>
						<Text style={styles.label}>Precio: </Text>
						<Text style={styles.value}>${price}</Text>
					</View>
					<View style={{ flexDirection: "row" }}>
						<Text style={styles.label}>Fecha límite de inscripción: </Text>
						<Text style={styles.value}>{deadline.toLocaleDateString()}</Text>
					</View>
				</View>
				{alreadyJoined ? (
					<View style={[styles.button, { backgroundColor: "#ccc" }]}>
						<Text style={styles.buttonText}>Ya estás inscripto</Text>
					</View>
				) : (
					<TouchableOpacity style={styles.button} onPress={() => setIsModalVisible(true)}>
						<Text style={styles.buttonText}>Inscribirse</Text>
					</TouchableOpacity>
				)}

				<Modal visible={isModalVisible} transparent={true} onRequestClose={() => setIsModalVisible(false)}>
					<AutocompleteDropdownContextProvider>
						<View style={styles.modalContainer}>
							<View style={styles.modal}>
								<TouchableOpacity style={styles.closeButton} onPress={() => setIsModalVisible(false)}>
									<Image style={styles.closeIcon} source={require("@/assets/images/close.png")} />
								</TouchableOpacity>
								<View style={styles.infoContainer}>
									<Text style={styles.modalTitle}>Inscripción</Text>
									<Text style={styles.label}>Elegir equipo</Text>
									<SelectDropdown
										data={
											myTeams?.map((team) => ({
												label: team.name,
												value: team.team_id,
											})) || []
										}
										onSelect={(itemValue, index) => setSelectedTeam(itemValue.value)}
										renderButton={(selectedItem, isOpened) => {
											return (
												<View>
													{myTeams && myTeams.length > 0 ? (
														<Text style={styles.input}>
															{selectedItem?.label || "Selecciona un equipo"}
														</Text>
													) : (
														<Text style={styles.input}>No tienes equipos</Text>
													)}
												</View>
											);
										}}
										renderItem={(item, index, isSelected) => {
											return (
												<View>
													<Text style={styles.input}>{item.label}</Text>
												</View>
											);
										}}
									/>

									<Text style={styles.label}>Telefono de contacto: </Text>
									<Text style={styles.input}>{contactPhone}</Text>
									<Text style={styles.label}>Mail de contacto: </Text>
									<Text style={styles.input}>{contactEmail}</Text>
									<View style={{ flexDirection: "column" }}>
										<Text style={styles.label}>Jugadores:</Text>
										<Text
											style={{
												color: "red",
											}}
										>
											{teamMembers.length < cantPlayers
												? `Cantidad minima de jugadores por equipo: ${cantPlayers}`
												: ""}
										</Text>
									</View>
									<ScrollView
										style={{ maxHeight: ScreenHeight * 0.4, width: "100%" }}
										horizontal={false}
										contentContainerStyle={{ flexDirection: "column" }}
										showsHorizontalScrollIndicator={false}
										showsVerticalScrollIndicator={false}
									>
										{teamMembers.map((member, index) => (
											<Text key={index} style={{ fontSize: 16, fontWeight: "bold" }}>
												{usersData.data?.find((user) => user.id === member)?.full_name}
											</Text>
										))}
										{/* {Array.from({ length: cantPlayers }).map((_, index) => (
											<Search<
												NonNullable<ReturnType<typeof getAllUsers>["data"]>[number] & {
													id: string;
												}
											>
												key={index}
												placeholder={`Ingrese jugador ${index + 1}...`}
												initialData={[]}
												renderItem={(p) => getPlayerListItem(p)}
												fetchData={(q) => teamMembers}
												searchField="full_name"
												setSelectedItem={(item) => {
													// @ts-ignore
													setSelectedPlayers([...(selectedPlayers || []), item]);
												}}
											/>
										))} */}
									</ScrollView>
								</View>
								<TouchableOpacity
									style={[styles.button, { backgroundColor: canJoin ? "#f18f04" : "#ccc" }]}
									onPress={() => {
										handleSignTeam();
									}}
								>
									<Text style={styles.submitButtonText}>Enviar</Text>
								</TouchableOpacity>
							</View>
						</View>
					</AutocompleteDropdownContextProvider>
				</Modal>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	modalContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	modal: {
		width: ScreenWidth * 0.85,
		backgroundColor: "white",
		borderRadius: 20,
		justifyContent: "center",
		margin: 20,
		color: "#00ff00",
		overflow: "hidden",
	},
	closeButton: {
		position: "absolute",
		top: 10,
		right: 10,
		padding: 8,
		zIndex: 100,
	},
	closeIcon: {
		width: 20,
		height: 20,
		paddingBottom: 5,
	},
	infoContainer: {
		width: "100%",
		padding: 20,
	},
	title: {
		fontSize: 22,
		fontWeight: "bold",
		padding: 15,
		textAlign: "center",
		color: "#333",
	},

	label: {
		fontWeight: "bold",
		color: "#555",
		marginRight: 5,
		paddingBottom: 5,
	},
	value: {
		color: "#333",
		flexShrink: 1,
		paddingBottom: 5,
	},
	descriptionContainer: {
		marginBottom: 15,
	},
	descriptionText: {
		color: "#333",
		lineHeight: 20,
	},
	button: {
		backgroundColor: "#f18f04",
		width: "100%",
		padding: 17,
		alignItems: "center",
		justifyContent: "center",
		marginTop: 10,
	},
	buttonText: {
		color: "#fff",
		fontWeight: "bold",
		fontSize: 16,
	},
	modal2: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "rgba(0, 0, 0, 0.5)",
		flexDirection: "column",
	},
	modalContent: {
		backgroundColor: "#fff",
		borderRadius: 15,
		width: ScreenWidth * 0.8,
		alignItems: "flex-start",
	},
	modalTitle: {
		fontSize: 18,
		fontWeight: "bold",
		margin: 15,
		color: "#333",
		alignSelf: "center",
	},
	input: {
		width: "100%",
		padding: 10,
		borderWidth: 1,
		borderColor: "#ccc",
		borderRadius: 5,
		marginBottom: 15,
		backgroundColor: "#fff",
		color: "#223332",
	},
	submitButton: {
		backgroundColor: "#f18f04",
		width: "100%",
		padding: 17,
		alignItems: "center",
		justifyContent: "center",
		marginTop: 10,
	},
	submitButtonText: {
		color: "#fff",
		fontWeight: "bold",
		fontSize: 16,
	},
});

export default PopUpTorneo;
