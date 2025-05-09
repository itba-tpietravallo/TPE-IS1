import React, { useState } from "react";
import { StyleSheet, Text, View, TouchableOpacity, TextInput, Modal, Image, ScrollView } from "react-native";
import { ScreenHeight, ScreenWidth } from "@rneui/themed/dist/config";

interface PopUpReservaProps {
	onClose: () => void;
	name: string;
	sport: string;
	location: string;
	date: Date;
	description: string;
	price: string;
	deadline: Date;
	cantPlayers: Number;
}

function PopUpTorneo({ onClose, name, location, date, description, price, deadline, cantPlayers }: PopUpReservaProps) {
	const [isModalVisible, setIsModalVisible] = useState(false);
	return (
		<View style={styles.modalContainer}>
			<View style={styles.modal}>
				<TouchableOpacity style={styles.closeButton} onPress={onClose}>
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
					<View style={styles.modalContainer}>
						<View style={styles.modal}>
							<TouchableOpacity style={styles.closeButton} onPress={() => setIsModalVisible(false)}>
								<Image style={styles.closeIcon} source={require("@/assets/images/close.png")} />
							</TouchableOpacity>
							<View style={styles.infoContainer}>
								<Text style={styles.modalTitle}>Inscripción</Text>
								<TextInput style={styles.input} placeholder="Nombre del equipo" />
								<TextInput
									style={styles.input}
									placeholder="Teléfono de contacto"
									keyboardType="phone-pad"
								/>
								<TextInput
									style={styles.input}
									placeholder="Mail de contacto"
									keyboardType="email-address"
								/>
								<Text style={styles.label}>Jugadores:</Text>
								<ScrollView
									style={{ maxHeight: ScreenHeight * 0.4 }}
									horizontal={false}
									contentContainerStyle={{ flexDirection: "column" }}
									showsHorizontalScrollIndicator={false}
									showsVerticalScrollIndicator={false}
								>
									{Array.from({ length: cantPlayers }).map((_, index) => (
										<TextInput
											key={index}
											style={styles.input}
											placeholder={"Usuario jugador " + (index + 1)}
										/>
									))}
								</ScrollView>
							</View>
							<TouchableOpacity
								style={styles.button}
								onPress={() => {
									// Aquí podrías agregar la lógica para enviar la inscripción
									setIsModalVisible(false);
									alert("Inscripción enviada");
								}}
							>
								<Text style={styles.submitButtonText}>Enviar</Text>
							</TouchableOpacity>
						</View>
					</View>
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
