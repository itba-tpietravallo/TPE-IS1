import FieldPost from "@components/fieldPost";
import {
	ScrollView,
	Text,
	View,
	SafeAreaView,
	StyleSheet,
	TouchableOpacity,
	Button,
	ActivityIndicator,
} from "react-native";
import { supabase } from "@lib/supabase";
import React, { useEffect, useState } from "react";
import { getAllFields, getAllSports, getUserAuthSession, getUserPreferencesByUserId } from "@lib/autogen/queries"; // Database Queries
import Icon from "react-native-vector-icons/FontAwesome6";

type Field = {
	// lat: number;
	// long: number;
	// dist_meters: number;
	id: string;
	owner: string;
	avatar_url: string;
	// ----------
	name: string;
	images: string[];
	sports: string[];
	street_number: string;
	street: string;
	neighborhood: string;
	description: string;
	price: number;
};

type Sport = {
	name: string;
};

const normalizeString = (str: string) => {
	return str
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.toLowerCase();
};

const favFieldsStr = "FavoriteFields";

function CanchasFeed() {
	const [selectedSport, setSelectedSport] = useState<string>("");

	const { data: session } = getUserAuthSession(supabase);
	const user = session?.user;

	const { data: fields, isLoading: isLoadingFields } = getAllFields(supabase);
	const { data: sports } = getAllSports(supabase);
	const { data: userPreferences } = getUserPreferencesByUserId(supabase, user?.id!);

	const handleSportPress = (sportName: string) => {
		if (selectedSport === sportName) {
			setSelectedSport("");
			return;
		}
		setSelectedSport(sportName);
	};

	const filteredFields = fields?.filter((field) => {
		if (selectedSport === "") return true;
		if (selectedSport === favFieldsStr) {
			return userPreferences?.fav_fields.includes(field.id);
		}
		const normalizedSelectedSport = normalizeString(selectedSport);

		return field.sports.some((fieldSport) => {
			const normalizedFieldSport = normalizeString(fieldSport);
			return normalizedFieldSport.includes(normalizedSelectedSport);
		});
	});

	if (isLoadingFields) {
		return (
			<View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#f2f4f3" }}>
				<ActivityIndicator size="large" color="#555" />
			</View>
		);
	}

	return (
		<View
			style={{
				flex: 1,
				justifyContent: "center",
				alignItems: "center",
				backgroundColor: "#f2f4f3",
			}}
		>
			<View style={styles.sportsContainer}>
				<ScrollView
					horizontal={true}
					showsHorizontalScrollIndicator={false}
					contentContainerStyle={{
						flexDirection: "row",
						alignContent: "center",
						justifyContent: "center",
						alignItems: "center",
						paddingRight: 10,
						paddingLeft: 10,
						overflowY: "hidden",
					}}
				>
					<View style={{ padding: 5 }}>
						<TouchableOpacity
							style={[
								styles.sportButton,
								selectedSport === favFieldsStr ? styles.selectedSportButton : {},
							]}
							onPress={() => handleSportPress(favFieldsStr)}
						>
							<Icon name={"heart"} color="black" />
						</TouchableOpacity>
					</View>

					{sports?.map((sport) => (
						<View key={sport.name} style={{ padding: 5 }}>
							<TouchableOpacity
								key={sport.name}
								style={[
									styles.sportButton,
									selectedSport === sport.name ? styles.selectedSportButton : {},
								]}
								onPress={() => handleSportPress(sport.name)}
							>
								<Text>{sport.name}</Text>
							</TouchableOpacity>
						</View>
					))}
					{(sports || [])?.length > 0 && (
						<TouchableOpacity style={{ padding: 10 }} onPress={() => handleSportPress("")}>
							<Text>X</Text>
						</TouchableOpacity>
					)}
				</ScrollView>
			</View>

			<ScrollView
				horizontal={false}
				contentContainerStyle={{ flexDirection: "column", paddingBottom: 100 }}
				showsHorizontalScrollIndicator={false}
				showsVerticalScrollIndicator={false}
			>
				{filteredFields && filteredFields.length > 0 ? (
					filteredFields.map((field) => (
						<FieldPost
							name={field.name}
							fieldId={field.id}
							sport={field.sports}
							location={`${field.street} ${field.street_number}, ${field.neighborhood}`}
							key={field.id}
							images={field.images || []}
							description={field.description || ""}
							price={field.price}
						/>
					))
				) : (
					<View style={{ flex: 1, justifyContent: "center", alignItems: "center", paddingTop: 50 }}>
						<Text style={{ fontSize: 16, color: "#555" }}>No hay canchas disponibles por el momento.</Text>
					</View>
				)}
			</ScrollView>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		backgroundColor: "#f8f8f8",
		justifyContent: "center",
		alignItems: "center",
		borderColor: "#ccc",
		borderRadius: 10,
		padding: 120,
	},
	buttonContainer: {
		marginTop: 10,
		padding: 10,
		borderRadius: 15,
		backgroundColor: "#CC0000",
	},
	sportsContainer: {
		height: 40,
		marginTop: 0,
		flexDirection: "row",
		alignContent: "center",
		justifyContent: "center",
		alignItems: "center",
	},
	sportButton: {
		backgroundColor: "#f8f9f9",
		borderWidth: 1,
		borderColor: "#223332",
		borderRadius: 20,
		paddingHorizontal: 12,
		height: 25,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
	},
	selectedSportButton: {
		backgroundColor: "#f18f04", // Cambia el color cuando está seleccionado
		borderColor: "#223332",
	},
});

export default CanchasFeed;
