import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, TouchableOpacity, TextInput, Modal, Image, ScrollView } from "react-native";
import { Input, SearchBar } from "@rneui/themed";
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
import Icon from "react-native-vector-icons/FontAwesome6";

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
	const [submitted, setSubmitted] = useState(false);
	const [selectedPlayers, setSelectedPlayers] = useState<
		NonNullable<ReturnType<typeof getAllUsers>["data"]>[number] & { id: string }[]
	>();

	const handleCloseInscriptionModal = () => {
		setIsModalVisible(false);
		if (!submitted) {
			setSelectedTeam("");
			setTeam("");
			setTeamMembers([]);
			setContactPhone("");
			setContactEmail("");
			setCanJoin(false);
		}
	};

	const handleSignTeam = async () => {
		if (!canJoin || submitted) return;
		if (selectedTeam == "") {
			alert("Por favor, selecciona un equipo");
			return;
		}

		try {
			await insertInscriptionMutation.mutateAsync([
				{
					tournamentId: tournamentId,
					teamId: selectedTeam,
					contactEmail: contactEmail,
					contactPhone: contactPhone,
				},
			]);
			console.log("Team successfully registered for tournament");
			setSubmitted(true);
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
			setContactPhone(teamData.contactPhone ?? "");
			setContactEmail(teamData.contactEmail ?? "");
			setTeamMembers(teamData.players || []);

			const players = teamData.players || [];
			setCanJoin(players.length >= cantPlayers);
		}
	};

	useEffect(() => {
		if (!selectedTeam) return;

		fetchTeam();
	}, [selectedTeam]);

	useEffect(() => {
		if (!isModalVisible && submitted) {
			onClose();
		}
	}, [isModalVisible, submitted]);

	const getUserById = async (userId: string) => {
		return getUsername(supabase, userId);
	};

	return (
		<View style={styles.modalContainer}>
			<View style={styles.modal}>
				<View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
					{/* Boton cerrar PopUp */}
					<TouchableOpacity
						style={{ padding: 10, alignItems: "flex-start", marginLeft: 10 }}
						onPress={onClose}
					>
						<Icon name="xmark" size={24} color="black" style={{ marginTop: 10 }} />
					</TouchableOpacity>
				</View>
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
					{description && (
						<View style={styles.descriptionContainer}>
							<Text style={styles.label}>Descripción:</Text>
							<Text style={styles.descriptionText}>{description}</Text>
						</View>
					)}
					{/* <View style={{ flexDirection: "row" }}>
						<Text style={styles.label}>Precio: </Text>
						<Text style={styles.value}>${price}</Text>
					</View> */}
					<View style={{ flexDirection: "row" }}>
						<Text style={styles.label}>Fecha límite de inscripción: </Text>
						<Text style={styles.value}>{deadline.toLocaleDateString()}</Text>
					</View>
				</View>
				<TouchableOpacity style={styles.button} onPress={() => setIsModalVisible(true)}>
					<Text style={styles.buttonText}>Inscribirse</Text>
				</TouchableOpacity>

				<Modal visible={isModalVisible} transparent={true} onRequestClose={handleCloseInscriptionModal}>
					<AutocompleteDropdownContextProvider>
						<View style={styles.modalContainer}>
							<View style={styles.modal}>
								<TouchableOpacity style={styles.closeButton} onPress={handleCloseInscriptionModal}>
									<Icon name="xmark" size={22} color="#333" />
								</TouchableOpacity>
								<ScrollView contentContainerStyle={{ flexGrow: 1 }}>
									<View style={styles.infoContainer}>
										<Text style={styles.modalTitle}>Inscripción</Text>
										<Text style={styles.label}>Elegir equipo</Text>
										<SelectDropdown
											data={
												myTeams?.length! > 0
													? myTeams?.map((team) => ({
															label: team.name,
															value: team.team_id,
														})) || []
													: [{ label: "No tienes equipos", value: null }]
											}
											onSelect={(itemValue, index) => {
												if (itemValue.value === null) return;
												setSelectedTeam(itemValue.value);
											}}
											dropdownStyle={styles.dropdownMenuStyle}
											renderButton={(selectedItem, isOpened) => {
												const noTeams = myTeams?.length === 0;
												return (
													<View
														style={[
															styles.dropdownButtonStyle,
															noTeams && { opacity: 0.6 },
														]}
													>
														<Text style={styles.dropdownButtonTxtStyle}>
															{noTeams
																? "No tienes equipos"
																: selectedItem?.label || "Selecciona un equipo"}
														</Text>
													</View>
												);
											}}
											renderItem={(item, index, isSelected) => {
												const isMessage = item.value === null;
												return (
													<View
														style={[
															styles.dropdownItemStyle,
															isSelected && styles.dropdownItemSelected,
															index !== (myTeams?.length ?? 0) - 1 &&
																styles.dropdownItemBorder,
															isMessage && { backgroundColor: "#f0f0f0" },
														]}
													>
														<Text
															style={[
																styles.dropdownItemTxtStyle,
																isMessage && { color: "gray", fontStyle: "italic" },
															]}
														>
															{item.label}
														</Text>
													</View>
												);
											}}
										/>

										<Text style={styles.label}>Telefono de contacto</Text>
										{/* <Text style={styles.input}>{contactPhone}</Text> */}
										<Input
											keyboardType="numeric"
											value={contactPhone}
											onChangeText={setContactPhone}
										/>
										<Text style={styles.label}>Mail de contacto</Text>
										{/* <Text style={styles.input}>{contactEmail}</Text> */}
										<Input value={contactEmail} onChangeText={setContactEmail} />
										<View style={{ flexDirection: "column" }}>
											<Text style={styles.label}>Jugadores</Text>
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
										<View style={styles.playersContainer}>
											{teamMembers.map((member, index) => (
												<Text key={index} style={{ fontSize: 16 }}>
													{usersData.data?.find((user) => user.id === member)?.full_name}
												</Text>
											))}
										</View>
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
									</View>
								</ScrollView>
								<TouchableOpacity
									style={[
										styles.button,
										{
											backgroundColor: submitted ? "#5fd700" : canJoin ? "#f18f04" : "#ccc",
										},
									]}
									onPress={handleSignTeam}
									disabled={submitted}
								>
									<Text style={styles.submitButtonText}>
										{submitted ? "Inscripción enviada" : "Enviar"}
									</Text>
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
		maxHeight: ScreenHeight * 0.6,
		backgroundColor: "white",
		borderRadius: 20,
		justifyContent: "center",
		margin: 20,
		color: "#00ff00",
		overflow: "hidden",
	},
	closeButton: {
		paddingTop: 20,
		paddingLeft: 20,
		alignItems: "flex-start",
	},
	closeIcon: {
		width: 20,
		height: 20,
		paddingBottom: 5,
	},
	infoContainer: {
		width: "100%",
		padding: 20,
		paddingTop: 0,
	},
	title: {
		fontSize: 22,
		fontWeight: "bold",
		paddingBottom: 20,
		textAlign: "center",
		color: "#333",
	},
	label: {
		fontSize: 15,
		fontWeight: "bold",
		color: "#555",
		marginRight: 5,
		paddingBottom: 5,
	},
	value: {
		fontSize: 15,
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
	playersContainer: {
		maxHeight: ScreenHeight * 0.2,
		width: "100%",
		marginBottom: 10,
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

	dropdownButtonText: {
		fontSize: 16,
		color: "#223332",
	},
	dropdownItem: {
		paddingVertical: 10,
		paddingHorizontal: 16,
		backgroundColor: "#fff",
	},
	dropdownItemSelected: {
		backgroundColor: "#f0f0f0",
	},
	dropdownItemText: {
		fontSize: 16,
		color: "#223332",
	},
	dropdownButtonStyle: {
		width: "100%",
		padding: 12,
		borderWidth: 1,
		borderColor: "#ccc",
		borderRadius: 8,
		backgroundColor: "#fff",
		justifyContent: "center",
		alignItems: "flex-start",
		marginBottom: 15,
	},
	dropdownButtonTxtStyle: {
		fontSize: 16,
		color: "#223332",
	},
	dropdownMenuStyle: {
		backgroundColor: "#fff",
		borderRadius: 8,
		paddingVertical: 4,
	},
	dropdownItemStyle: {
		paddingVertical: 10,
		paddingHorizontal: 16,
		backgroundColor: "#fff",
	},
	dropdownItemTxtStyle: {
		fontSize: 16,
		color: "#223332",
	},
	dropdownItemBorder: {
		borderBottomWidth: 1,
		borderBottomColor: "#eee",
	},
});

export default PopUpTorneo;
