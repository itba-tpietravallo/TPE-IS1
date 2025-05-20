import React, { useState } from "react";
import { StyleSheet, Text, View, TouchableOpacity, TextInput, Modal, Image, ScrollView } from "react-native";
import { SearchBar } from "@rneui/themed";
import { ScreenHeight, ScreenWidth } from "@rneui/themed/dist/config";
import { supabase } from "@lib/supabase";
import Search from "./Search";
import { AutocompleteDropdownContextProvider } from "react-native-autocomplete-dropdown";
import { getAllTeams, getAllUsers, getUserSession, queries } from "@lib/autogen/queries";
import { User } from "@supabase/supabase-js";

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
	const [teamName, setTeamName] = useState("");
	const [contactPhone, setContactPhone] = useState("");
	const [contactEmail, setContactEmail] = useState("");
	const [selectedPlayers, setSelectedPlayers] = useState<
		NonNullable<ReturnType<typeof getAllUsers>["data"]>[number] & { id: string }[]
	>();
	const { data: user } = getUserSession(supabase);
	const teamQuery = getAllTeams(supabase);

	const handleSignUp = async (team: string) => {
		// quiero agregar un player a un torneo que esta en el parametro como team
		const updatedPTeams = [...(selectedPlayers?.map((p) => (p || {})?.id) || []), user?.id!].filter((id) => !!id);

		const teamSignUp = await supabase
			.from("teams")
			.insert({
				name: teamName,
				players: updatedPTeams,
				sport,
				contactPhone,
				contactEmail,
			})
			.select()
			.single();

		const inscriptionData = await supabase
			.from("inscriptions")
			.insert({
				tournamentId: tournamentId,
				teamId: teamSignUp.data?.id,
			})
			.select()
			.throwOnError();

		teamQuery.refetch();
	};

	// const { data: initialPlayers } = getAllUsers(supabase);

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
				<TouchableOpacity style={styles.button} onPress={() => setIsModalVisible(true)}>
					<Text style={styles.buttonText}>Inscribirse</Text>
				</TouchableOpacity>

				<Modal visible={isModalVisible} transparent={true} onRequestClose={() => setIsModalVisible(false)}>
					<AutocompleteDropdownContextProvider>
						<View style={styles.modalContainer}>
							<View style={styles.modal}>
								<TouchableOpacity style={styles.closeButton} onPress={() => setIsModalVisible(false)}>
									<Image style={styles.closeIcon} source={require("@/assets/images/close.png")} />
								</TouchableOpacity>
								<View style={styles.infoContainer}>
									<Text style={styles.modalTitle}>Inscripción</Text>
									<TextInput
										style={styles.input}
										placeholder="Nombre del equipo"
										onChangeText={(text) => setTeamName(text)}
									/>
									<TextInput
										style={styles.input}
										placeholder="Teléfono de contacto"
										keyboardType="phone-pad"
										onChangeText={(text) => setContactPhone(text)}
									/>
									<TextInput
										style={styles.input}
										placeholder="Mail de contacto"
										keyboardType="email-address"
										onChangeText={(text) => setContactEmail(text)}
									/>
									<Text style={styles.label}>Jugadores:</Text>
									<ScrollView
										style={{ maxHeight: ScreenHeight * 0.4, width: "100%" }}
										horizontal={false}
										contentContainerStyle={{ flexDirection: "column" }}
										showsHorizontalScrollIndicator={false}
										showsVerticalScrollIndicator={false}
									>
										{Array.from({ length: cantPlayers }).map((_, index) => (
											<Search<
												NonNullable<ReturnType<typeof getAllUsers>["data"]>[number] & {
													id: string;
												}
											>
												key={index}
												placeholder={`Ingrese jugador ${index + 1}...`}
												initialData={[]}
												renderItem={(p) => getPlayerListItem(p)}
												fetchData={() => queries.getAllUsers(supabase)}
												searchField="full_name"
												setSelectedItem={(item) => {
													// @ts-ignore
													setSelectedPlayers([...(selectedPlayers || []), item]);
												}}
											/>
										))}
									</ScrollView>
								</View>
								<TouchableOpacity
									style={styles.button}
									onPress={() => {
										// Aquí podrías agregar la lógica para enviar la inscripción
										setIsModalVisible(false);
										handleSignUp(teamName)
											.then(() => console.log("Inscription sent"))
											.catch((e) => console.log("Error sending inscription", e));
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
