/*  lo que tengo que hacer aca es diseniar un feed en el que van a aparecer (listados y scrolleables) los distintas instancias del
modulo que esta implementando feli. Feli disenia el modulo "equipos" , y luego a medida que los usuarios creen y carguen equipos, se van a ir posteando modulos "equipos" con los datos de 
cada equipo A,B,C a MI tab "teams.tsx"

yo implemento la tab, feli implementa los modulos que se van a ver desde mi tab*/

import React, { useEffect, useState } from "react";
import { ScrollView, Text, View, StyleSheet, TouchableOpacity, ImageBackground } from "react-native";
import TeamPost from "../../components/teamPost"; // Importamos el módulo de Feli

import { ScreenHeight } from "@rneui/themed/dist/config";
import { router } from "expo-router";

import { supabase } from "@/lib/supabase";

import { getAllTeams, getAllSports } from "@/lib/autogen/queries";

export type Player = {
	id: string;
	name: string;
	number: number;
	photo: string;
};

// type Team = {
// 	team_id: string;
// 	name: string;
// 	sport: string;
// 	members: number;
// 	description: string;
// 	players: Player[];
// };

function TeamsFeed() {
	const { data: teams } = getAllTeams(supabase);
	const { data: sports } = getAllSports(supabase);
	const [selectedSport, setSelectedSport] = useState<string>("");

	const handleSportPress = (sportName: string) => {
		setSelectedSport(sportName);
	};

	const handleAddNewTeam = () => {
		router.push("/(tabs)/newTeam");
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
			{/* Filtro por deporte */}
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
					{(sports || []).length > 0 &&
						(sports || []).map(
							(sport) =>
								sport &&
								sport.name && (
									<View key={sport.name} style={{ padding: 10 }}>
										<TouchableOpacity
											style={[
												styles.sportButton,
												selectedSport === sport.name ? styles.selectedSportButton : {},
											]}
											onPress={() => handleSportPress(sport.name)}
										>
											<Text>{sport.name}</Text>
										</TouchableOpacity>
									</View>
								),
						)}
					{(sports || []).length > 0 && (
						<TouchableOpacity style={{ padding: 10 }} onPress={() => handleSportPress("")}>
							<Text>X</Text>
						</TouchableOpacity>
					)}
				</ScrollView>
			</View>

			{/* Lista de equipos */}
			<ScrollView
				horizontal={false}
				contentContainerStyle={{ flexDirection: "column", paddingBottom: 100 }}
				showsHorizontalScrollIndicator={false}
				showsVerticalScrollIndicator={false}
			>
				{teams
					?.filter((team) => {
						if (selectedSport === "") return true;
						return team.sport === selectedSport;
					})
					.map((team, i) => (
						<TeamPost
							key={team.team_id}
							team_id={team.team_id}
							name={team.name}
							sport={team.sport}
							players={team.players}
							description={team.description || ""}
						/>
					))}

				{/* Boton para agregar un equipo */}
				<TouchableOpacity onPress={() => handleAddNewTeam()}>
					<ImageBackground
						style={styles.container}
						imageStyle={{ borderRadius: 15, opacity: 0.9 }}
						source={require("@/assets/images/add-logo.jpg")}
					></ImageBackground>
				</TouchableOpacity>
			</ScrollView>
		</View>
	);
}

const styles = StyleSheet.create({
	sportsContainer: {
		height: 40,
		marginTop: 0,
		flexDirection: "row",
		alignContent: "center",
		justifyContent: "center",
		alignItems: "center",
	},
	container: {
		backgroundColor: "#f8f8f8",
		justifyContent: "space-between",
		flexDirection: "column",
		margin: 10,
		width: ScreenHeight * 0.4,
		height: ScreenHeight * 0.4,
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
		backgroundColor: "#f18f04",
		borderColor: "#223332",
	},
	teamCard: {
		backgroundColor: "#fff",
		padding: 15,
		borderRadius: 10,
		marginBottom: 10,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 5,
		elevation: 3,
	},
	teamName: {
		fontSize: 18,
		fontWeight: "bold",
		color: "#223332",
	},
	teamSport: {
		fontSize: 16,
		color: "#555",
	},
	teamMembers: {
		fontSize: 14,
		color: "#777",
	},
	teamDescription: {
		fontSize: 14,
		color: "#999",
	},
});

export default TeamsFeed;
