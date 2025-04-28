import React, { useEffect, useState } from "react";
import {
	View,
	Text,
	TextInput,
	StyleSheet,
	Alert,
	FlatList,
	TouchableOpacity,
	ScrollView,
	KeyboardAvoidingView,
	Platform,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { createClient } from "@supabase/supabase-js";

import { supabase } from "@/lib/supabase";
import { router } from "expo-router";

export default function PostTeam() {
	const [teamName, setTeamName] = useState("");
	const [sport, setSport] = useState("Fútbol");
	const [description, setDescription] = useState("");
	const [members, setMembers] = useState<string[]>([]);
	const [newMember, setNewMember] = useState("");
	const [availability, setAvailability] = useState(0);
	const [isPublishing, setIsPublishing] = useState(false); // Estado para controlar el color del botón "Publicar"

	const handlePostTeam = async () => {
		await supabase.from("teams").insert([
			{
				name: teamName,
				sport: sport,
				description: description,
				images: null,
				//availability: availability, // Disponibilidad ingresada
				players: members, // Miembros como una lista separada por comas
			},
		]);
		router.push("/(tabs)/teamsFeed");
	};

	const handleCancel = () => {
		setTeamName("");
		setSport("Fútbol");
		setDescription("");
		setMembers([]);
		setNewMember("");
		setAvailability(0);
	};

	const addMember = () => {
		if (newMember.trim() === "") {
			Alert.alert("Error", "Por favor ingresa un nombre válido.");
			return;
		}
		setMembers([...members, newMember]);
		setNewMember("");
	};

	const removeMember = (index: number): void => {
		const updatedMembers: string[] = members.filter((_, i: number) => i !== index);
		setMembers(updatedMembers);
	};

	return (
		<KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : undefined}>
			<ScrollView contentContainerStyle={styles.scrollContainer}>
				<Text style={styles.title}>Publicar un Equipo</Text>

				{/* Nombre del Equipo */}
				<TextInput
					style={styles.input}
					placeholder="Nombre del Equipo (obligatorio)"
					value={teamName}
					onChangeText={setTeamName}
				/>

				{/* Deporte */}
				<Text style={styles.label}>Deporte:</Text>
				<Picker selectedValue={sport} style={styles.picker} onValueChange={(itemValue) => setSport(itemValue)}>
					<Picker.Item label="Fútbol" value="Fútbol" />
					<Picker.Item label="Básquetbol" value="Básquetbol" />
					<Picker.Item label="Tenis" value="Tenis" />
					<Picker.Item label="Volley" value="Volley" />
					<Picker.Item label="Hockey" value="Hockey" />
				</Picker>

				{/* Miembros del Equipo */}
				{/* Habria que cambiar esto para invitar usuarios a unirse en vez de meterlos al equipo */}
				<Text style={styles.label}>Miembros Iniciales (opcional):</Text>
				<View style={styles.memberInputContainer}>
					<TextInput
						style={[styles.input, styles.memberInput]}
						placeholder="Nombre del miembro"
						value={newMember}
						onChangeText={setNewMember}
					/>
					<TouchableOpacity style={styles.addButton} onPress={addMember}>
						<Text style={styles.addButtonText}>Agregar</Text>
					</TouchableOpacity>
				</View>

				{/* Disponibilidad */}
				<Text style={[styles.label, styles.spacing]}>¿Cuántas personas estás buscando? (obligatorio)</Text>
				<TextInput
					style={styles.input}
					placeholder="Número de personas"
					value={availability.toString()}
					onChangeText={(text) => setAvailability(parseInt(text) || 0)}
					keyboardType="numeric"
				/>

				{/* Descripción */}
				<TextInput
					style={[styles.input, styles.textArea]}
					placeholder="Descripción del Equipo (opcional)"
					value={description}
					onChangeText={setDescription}
					multiline
					numberOfLines={4}
				/>

				{/* Botones */}
				<View style={styles.buttonContainer}>
					<TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={handleCancel}>
						<Text style={styles.buttonText}>Cancelar</Text>
					</TouchableOpacity>
					<TouchableOpacity
						style={[styles.button, isPublishing ? styles.publishingButton : styles.publishButton]}
						onPress={handlePostTeam}
					>
						<Text style={styles.buttonText}>Publicar</Text>
					</TouchableOpacity>
				</View>
			</ScrollView>
		</KeyboardAvoidingView>
	);
}

const styles = StyleSheet.create({
	scrollContainer: {
		flexGrow: 1,
		paddingBottom: 20,
	},
	container: {
		flex: 1,
		padding: 20,
		backgroundColor: "#f2f4f3",
	},
	title: {
		fontSize: 24,
		fontWeight: "bold",
		marginBottom: 20,
		textAlign: "center",
		color: "#f18f01",
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
	textArea: {
		height: 100,
		textAlignVertical: "top",
		color: "#223332",
	},
	label: {
		fontSize: 16,
		fontWeight: "bold",
		marginBottom: 5,
		color: "#223332",
	},
	picker: {
		height: 150,
		width: "100%",
		marginBottom: 15,
		color: "#223332",
	},
	memberInputContainer: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: 10,
	},
	memberInput: {
		flex: 1,
		marginRight: 10,
		color: "#223332",
	},
	memberItem: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 5,
	},
	memberText: {
		fontSize: 16,
		color: "#223332",
	},
	removeText: {
		color: "red",
		fontSize: 14,
	},
	memberList: {
		maxHeight: 100,
		marginBottom: 15,
	},
	spacing: {
		marginTop: 10,
	},
	buttonContainer: {
		flexDirection: "row",
		justifyContent: "space-between",
		marginTop: 20,
	},
	button: {
		flex: 1,
		padding: 10,
		borderRadius: 5,
		alignItems: "center",
		justifyContent: "center",
		marginHorizontal: 5,
	},
	cancelButton: {
		backgroundColor: "black",
	},
	publishButton: {
		backgroundColor: "black",
	},
	publishingButton: {
		backgroundColor: "#f18f01", // Cambia a naranja cuando se presiona
	},
	buttonText: {
		color: "#fff",
		fontSize: 16,
		fontWeight: "bold",
	},
	addButton: {
		backgroundColor: "black",
		padding: 10,
		borderRadius: 5,
		alignItems: "center",
		justifyContent: "center",
		marginTop: 10,
	},
	addButtonText: {
		color: "#fff",
		fontSize: 16,
		fontWeight: "bold",
	},
});
