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

import SelectDropdown from "react-native-select-dropdown";

import { supabase } from "@/lib/supabase";
import { router } from "expo-router";
import { getAllSports, getUserAuthSession, getUserSession, useInsertTeam } from "@lib/autogen/queries";

export default function PostTeam() {
	const [teamName, setTeamName] = useState("");
	const [sport, setSport] = useState("");
	const { data: sports } = getAllSports(supabase);
	const [description, setDescription] = useState("");
	const [members, setMembers] = useState<string[]>([]);
	const [newMember, setNewMember] = useState("");
	const [availability, setAvailability] = useState(0);
	const [isPublic, setIsPublic] = useState(true);

	const { data: session } = getUserAuthSession(supabase);
	const user = session?.user;
	const insertTeamMutation = useInsertTeam(supabase);

	const isFormComplete = teamName.trim() !== "" && sport.length != 0;

	const handlePostTeam = async () => {
		try {
			await insertTeamMutation.mutateAsync([
				{
					name: teamName,
					sport: sport,
					description: description,
					images: null,
					players: [user?.id!], // Cuando crea el equipo automaticamente se une el creador
					playerRequests: [],
					admins: [user?.id!],
					isPublic: isPublic,
					contactPhone: "",
					contactEmail: "",
				},
			]);

			console.log("Team created successfully");
			router.push("/(tabs)/teams");
		} catch (error) {
			console.error("Error creating team:", error);
			Alert.alert("Error", "No se pudo crear el equipo. Por favor, intenta de nuevo.");
		}
	};

	const handleCancel = () => {
		setTeamName("");
		setSport("");
		setDescription("");
		setMembers([]);
		setNewMember("");
		setAvailability(0);
		router.push("/(tabs)/teams");
	};

	// const addMember = () => {
	// 	if (newMember.trim() === "") {
	// 		Alert.alert("Error", "Por favor ingresa un nombre válido.");
	// 		return;
	// 	}
	// 	setMembers([...members, newMember]);
	// 	setNewMember("");
	// };

	// const removeMember = (index: number): void => {
	// 	const updatedMembers: string[] = members.filter((_, i: number) => i !== index);
	// 	setMembers(updatedMembers);
	// };

	return (
		<KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : undefined}>
			<ScrollView contentContainerStyle={styles.scrollContainer}>
				<Text style={styles.title}>Publicar un equipo</Text>

				{/* Nombre del Equipo */}
				<Text style={styles.label}>Nombre*</Text>
				<TextInput
					style={styles.input}
					placeholder="Nombre del equipo"
					placeholderTextColor="#888"
					value={teamName}
					onChangeText={setTeamName}
				/>

				{/* Deporte */}
				<Text style={styles.label}>Deporte*</Text>
				<SelectDropdown
					defaultValue={(sports ?? [])[0] || ""}
					onSelect={(itemValue, index) => setSport(itemValue)}
					data={sports?.map((sport) => sport.name) || []}
					dropdownStyle={styles.dropdownMenuStyle}
					renderButton={(selectedItem, isOpened) => (
						<View style={styles.dropdownButtonStyle}>
							<Text style={styles.dropdownButtonTxtStyle}>{selectedItem || "Selecciona un deporte"}</Text>
						</View>
					)}
					renderItem={(item, index, isSelected) => (
						<View
							style={[
								styles.dropdownItemStyle,
								isSelected && styles.dropdownItemSelected,
								index !== (sports?.length ?? 0) - 1 && styles.dropdownItemBorder,
							]}
						>
							<Text style={styles.dropdownItemTxtStyle}>{item}</Text>
						</View>
					)}
				/>

				{/* Miembros del Equipo */}
				{/* Habria que cambiar esto para invitar usuarios a unirse en vez de meterlos al equipo */}
				{/* <Text style={styles.label}>Miembros Iniciales (opcional):</Text>
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
				</View> */}

				{/* <View>
					{members.length > 0 && (
						<View style={{ display: "flex", flexDirection: "column", gap: 5 }}>
							{members.map((item, index) => (
								<View
									key={`${item} - ${index}`}
									style={{
										backgroundColor: "#C7CCCC",
										flexDirection: "row",
										justifyContent: "space-between",
										alignItems: "center",
										padding: 10,
										borderRadius: 8,
									}}
								>
									<Text style={styles.memberText}>{item}</Text>
									<TouchableOpacity onPress={() => removeMember(index)}>
										<Text style={styles.removeText}>Eliminar</Text>
									</TouchableOpacity>
								</View>
							))}
						</View>
					)}
				</View> */}

				{/* Disponibilidad */}
				{/* <Text style={[styles.label, styles.spacing]}>¿Cuántas personas estás buscando? (obligatorio)</Text>
				<TextInput
					style={styles.input}
					placeholder="Número de personas"
					value={availability.toString()}
					onChangeText={(text) => setAvailability(parseInt(text) || 0)}
					keyboardType="numeric"
				/> */}

				{/* Descripción */}
				<Text style={styles.label}>Descripción</Text>
				<TextInput
					style={[styles.input, styles.textArea]}
					placeholder="Descripción del equipo"
					placeholderTextColor="#888"
					value={description}
					onChangeText={setDescription}
					multiline
					numberOfLines={4}
				/>

				{/* Privacidad */}
				<Text style={styles.label}>Privacidad</Text>
				<SelectDropdown
					data={["Público", "Privado"]}
					onSelect={(itemValue) => setIsPublic(itemValue === "Público")}
					dropdownStyle={{ backgroundColor: "white", gap: 5, borderRadius: 8 }}
					renderButton={(selectedItem, isOpened) => {
						return (
							<View style={styles.dropdownButtonStyle}>
								<Text style={styles.dropdownButtonTxtStyle}>
									{selectedItem === true ? "Público" : selectedItem === false ? "Privado" : "Público"}
								</Text>
							</View>
						);
					}}
					renderItem={(item, index, isSelected) => (
						<View
							style={[
								styles.dropdownItemStyle,
								isSelected && styles.dropdownItemSelected,
								index !== (sports?.length ?? 0) - 1 && styles.dropdownItemBorder,
							]}
						>
							<Text style={styles.dropdownItemTxtStyle}>{item}</Text>
						</View>
					)}
				/>

				<Text style={{ color: "#464545" }}>* Indica que el campo es obligatorio.</Text>

				{/* Botones */}
				<View style={styles.buttonContainer}>
					<TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={handleCancel}>
						<Text style={styles.buttonText}>Cancelar</Text>
					</TouchableOpacity>
					<TouchableOpacity
						style={[styles.button, styles.publishButton, !isFormComplete && styles.disabledButton]}
						onPress={handlePostTeam}
						disabled={!isFormComplete}
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
		fontSize: 28,
		fontWeight: "bold",
		marginTop: 20,
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
		fontSize: 18,
		fontWeight: "bold",
		marginBottom: 5,
		marginTop: 20,
		color: "#223332",
	},
	picker: {
		height: 150,
		width: "100%",
		color: "#223332",
	},
	memberInputContainer: {
		display: "flex",
		flexDirection: "row",
		alignItems: "flex-start",
		justifyContent: "flex-start",
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
		marginBottom: 120,
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
		backgroundColor: "#f18f01",
	},
	disabledButton: {
		backgroundColor: "#ccc", // Gray background to show it's disabled
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
		// marginTop: 10,
	},
	addButtonText: {
		color: "#fff",
		fontSize: 16,
		fontWeight: "bold",
		margin: 0,
		padding: 0,
	},
	sportDropdownButton: {
		width: "100%",
		padding: 10,
		borderWidth: 1,
		borderColor: "#ccc",
		borderRadius: 5,
		marginBottom: 15,
		backgroundColor: "#fff",
		justifyContent: "flex-start",
	},
	sportDropdownButtonTxt: {
		color: "#223332",
		fontSize: 14,
	},
	// HOTFIX:
	// dropdownButtonStyle: {
	// 	width: 200,
	// 	height: 40,
	// 	backgroundColor: "#223332",
	// 	borderRadius: 12,
	// 	flexDirection: "row",
	// 	justifyContent: "center",
	// 	textAlignVertical: "center",
	// 	verticalAlign: "middle",
	// 	alignItems: "center",
	// 	paddingHorizontal: 12,
	// 	marginTop: 8,
	// 	marginBottom: 16,
	// },
	// dropdownButtonTxtStyle: {
	// 	flex: 1,
	// 	fontSize: 16,
	// 	fontWeight: "500",
	// 	color: "#FFFFFF",
	// },
	dropdownButtonArrowStyle: {
		fontSize: 28,
	},
	dropdownButtonIconStyle: {
		fontSize: 28,
		marginRight: 8,
	},
	// dropdownMenuStyle: {
	// 	backgroundColor: "#E9ECEF",
	// 	borderRadius: 8,
	// },
	// dropdownItemStyle: {
	// 	width: "100%",
	// 	backgroundColor: "#fff",
	// 	flexDirection: "row",
	// 	paddingHorizontal: 12,
	// 	justifyContent: "flex-start",
	// 	alignItems: "center",
	// 	paddingVertical: 12,
	// },
	// dropdownItemTxtStyle: {
	// 	flex: 1,
	// 	fontSize: 16,
	// 	fontWeight: "500",
	// 	color: "#151E26",
	// },
	dropdownItemIconStyle: {
		fontSize: 28,
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
	// dropdownItemStyle: {
	// 	paddingVertical: 10,
	// 	paddingHorizontal: 16,
	// 	borderBottomWidth: 1,
	// 	borderBottomColor: "#eee",
	// },
	// dropdownItemSelected: {
	// 	backgroundColor: "#f0f0f0",
	// },
	dropdownItemTxtStyle: {
		fontSize: 16,
		color: "#223332",
	},
	dropdownItemStyle: {
		paddingVertical: 10,
		paddingHorizontal: 16,
		backgroundColor: "#fff",
	},
	dropdownItemSelected: {
		backgroundColor: "#f0f0f0",
	},
	dropdownItemBorder: {
		borderBottomWidth: 1,
		borderBottomColor: "#eee",
	},
});
