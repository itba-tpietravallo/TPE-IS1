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
	Image,
	ActivityIndicator,
} from "react-native";

import * as ImagePicker from "expo-image-picker";

import SelectDropdown from "react-native-select-dropdown";

import { supabase } from "@/lib/supabase";
import { router } from "expo-router";
import { getAllSports, getUserSession } from "@lib/autogen/queries";

export default function PostTeam() {
	const [teamName, setTeamName] = useState("");
	const [sport, setSport] = useState("");
	const { data: sports } = getAllSports(supabase);
	const [description, setDescription] = useState("");
	const [members, setMembers] = useState<string[]>([]);
	const [newMember, setNewMember] = useState("");
	const [availability, setAvailability] = useState(0);
	const [isPublic, setIsPublic] = useState(true);
	//const [images, setImages] = useState<string[]>([]); //para array de imagenes. Asi esta definido en la bd pero no se si es necesario tener multiples imagenes de un equipo
	const [image, setImage] = useState<string | null>(null);
	const [uploading, setUploading] = useState(false); //para la subida de la imagen

	const { data: user } = getUserSession(supabase);

	const isFormComplete = teamName.trim() !== "" && sport.length != 0;

	const handlePostTeam = async () => {
		await supabase.from("teams").insert([
			{
				name: teamName,
				sport: sport,
				description: description,
				//images: images, multiples imagenes
				images: image ? [image] : [],
				//availability: availability, // Disponibilidad ingresada
				players: [user?.full_name!], // Cuando crea el equipo automaticamente se une el creador
			},
		]);
		router.push("/(tabs)/teams");
	};

	const handlePickImage = async () => {
		const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
		if (status !== "granted") {
			Alert.alert("Permiso requerido", "Se necesita permiso para acceder a la galería.");
			return;
		}
		let result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: "images",
			quality: 0.7,
			allowsEditing: true,
		});

		if (!result.canceled) {
			const uri = result.assets[0].uri;
			//setImages((prev) => [...prev, uri]); (si quisiese permitir multiples imagenes)
			setImage(uri);
		} else {
			alert("No selecciona");
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
					dropdownStyle={{ backgroundColor: "white", gap: 5, borderRadius: 8 }}
					renderButton={(selectedItem, isOpened) => {
						return (
							<View style={styles.dropdownButtonStyle}>
								{/* {selectedItem && (
							//   <Icon name={selectedItem.icon} style={styles.dropdownButtonIconStyle} />
							)} */}
								<Text style={styles.dropdownButtonTxtStyle}>
									{selectedItem || "Selecciona un deporte"}
								</Text>
								{/* <Icon name={isOpened ? 'chevron-up' : 'chevron-down'} style={styles.dropdownButtonArrowStyle} /> */}
							</View>
						);
					}}
					renderItem={(item, index, isSelected) => {
						return (
							<View
								style={{
									...styles.dropdownItemStyle,
									...(isSelected && { backgroundColor: "#D2D9DF" }),
								}}
							>
								{/* <Icon name={item.icon} style={styles.dropdownItemIconStyle} /> */}
								<Text style={styles.dropdownItemTxtStyle}>{item}</Text>
							</View>
						);
					}}
					// renderItem={}
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
					onSelect={(itemValue, index) => setIsPublic(itemValue)}
					data={[true, false]?.map((e) => (e == true ? "Público" : "Privado")) || []}
					dropdownStyle={{ backgroundColor: "white", gap: 5, borderRadius: 8 }}
					renderButton={(selectedItem, isOpened) => {
						return (
							<View style={styles.dropdownButtonStyle}>
								<Text style={styles.dropdownButtonTxtStyle}>{selectedItem || "Público"}</Text>
							</View>
						);
					}}
					renderItem={(item, index, isSelected) => {
						return (
							<View
								style={{
									...styles.dropdownItemStyle,
									...(isSelected && { backgroundColor: "#D2D9DF" }),
								}}
							>
								<Text style={styles.dropdownItemTxtStyle}>{item}</Text>
							</View>
						);
					}}
				/>

				{/* Imagenes */}
				<Text style={styles.label}>Imágen del equipo</Text>
				<TouchableOpacity style={styles.addButton} onPress={handlePickImage}>
					<Text style={styles.addButtonText}>Seleccionar imágen</Text>
				</TouchableOpacity>
				{uploading && <ActivityIndicator size="small" color="#f18f01" />}
				<View style={{ flexDirection: "row", flexWrap: "wrap", marginVertical: 10 }}>
					{/* {images.map((img, idx) => (
						<Image
							key={idx}
							source={{ uri: img }}
							style={{ width: 80, height: 80, borderRadius: 8, marginRight: 8, marginBottom: 8 }}
						/>
					))} Si quisiese multiples imagenes esto te arma el ""carusel"" */}
					{image && (
						<Image
							source={{ uri: image }}
							style={{ width: 120, height: 120, borderRadius: 8, marginVertical: 10 }}
						/>
					)}
				</View>

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
	// HOTFIX:
	dropdownButtonStyle: {
		width: 200,
		height: 40,
		backgroundColor: "#223332",
		borderRadius: 12,
		flexDirection: "row",
		justifyContent: "center",
		textAlignVertical: "center",
		verticalAlign: "middle",
		alignItems: "center",
		paddingHorizontal: 12,
		marginTop: 8,
		marginBottom: 16,
	},
	dropdownButtonTxtStyle: {
		flex: 1,
		fontSize: 16,
		fontWeight: "500",
		color: "#FFFFFF",
	},
	dropdownButtonArrowStyle: {
		fontSize: 28,
	},
	dropdownButtonIconStyle: {
		fontSize: 28,
		marginRight: 8,
	},
	dropdownMenuStyle: {
		backgroundColor: "#E9ECEF",
		borderRadius: 8,
	},
	dropdownItemStyle: {
		width: "100%",
		backgroundColor: "#F9FCFF",
		flexDirection: "row",
		paddingHorizontal: 12,
		justifyContent: "center",
		alignItems: "center",
		paddingVertical: 8,
		borderRadius: 8,
		borderBottomWidth: 1,
		borderColor: "#000000",
	},
	dropdownItemTxtStyle: {
		flex: 1,
		fontSize: 18,
		fontWeight: "500",
		color: "#151E26",
	},
	dropdownItemIconStyle: {
		fontSize: 28,
		marginRight: 8,
	},
});
