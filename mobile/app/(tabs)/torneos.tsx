import { supabase } from "@lib/supabase";
import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View, Modal, ScrollView, Image, ImageBackground } from "react-native";
import { ScreenHeight, ScreenWidth } from "@rneui/themed/dist/config";
import { getAllTournaments, getFieldById, getAllSports } from "@lib/autogen/queries"; // Database Queries
import TournamentPost from "@components/tournamentPost";

const normalizeString = (str: string) => {
	return str
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.toLowerCase();
};

function TorneosFeed() {
	const [isModalVisible, setIsModalVisible] = useState(false);
	const [selectedTorneo, setSelectedTorneo] = useState<string>("");

	const [selectedSport, setSelectedSport] = useState<string>("");

	const { data: sports } = getAllSports(supabase);
	const { data: torneos } = getAllTournaments(supabase);

	const handleSportPress = (sportName: string) => {
		if (selectedSport === sportName) {
			setSelectedSport("");
			return;
		}
		setSelectedSport(sportName);
	};

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
					}}
				>
					{sports?.map((sport) => (
						<View key={sport.name} style={{ padding: 10 }}>
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
				{torneos
					?.filter((torneo) => {
						if (selectedSport === "") return true;
						const normalizedSelectedSport = normalizeString(selectedSport);
						const normalizedTorneoSport = normalizeString(torneo.sport);
						return normalizedTorneoSport.includes(normalizedSelectedSport);
					})
					.map((torneo, index) => (
						<TournamentPost
							tournamentId={torneo.id}
							key={index}
							name={torneo.name}
							fieldId={torneo.fieldId}
							sport={torneo.sport}
							startDate={new Date(torneo.startDate)}
							description={torneo.description || ""}
							price={torneo.price}
							deadline={new Date(torneo.deadline)}
							cantPlayers={torneo.cantPlayers}
						/>
					))}
			</ScrollView>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		backgroundColor: "#f8f8f8",
		justifyContent: "space-between",
		flexDirection: "column",
		margin: 10,
		width: ScreenHeight * 0.4,
		height: ScreenHeight * 0.4,
	},
	sportsContainer: {
		// Puedes ajustar esta altura según lo que necesites
		height: 40,
		marginTop: 0,
		flexDirection: "row",
		alignContent: "center",
		justifyContent: "center",
		alignItems: "center",
	},
	topContent: {
		flexDirection: "column",
		alignItems: "center",
		marginTop: 40,
	},
	title: {
		fontSize: 28,
		fontWeight: "bold",
		color: "#fff",
		marginBottom: 10,
	},
	text: {
		fontSize: 16,
		color: "#fff",
		marginTop: 1,
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
export default TorneosFeed;
