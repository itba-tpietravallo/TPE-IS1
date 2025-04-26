/*  lo que tengo que hacer aca es diseniar un feed en el que van a aparecer (listados y scrolleables) los distintas instancias del
modulo que esta implementando feli. Feli disenia el modulo "equipos" , y luego a medida que los usuarios creen y carguen equipos, se van a ir posteando modulos "equipos" con los datos de 
cada equipo A,B,C a MI tab "teamsFeed.tsx"

yo implemento la tab, feli implementa los modulos que se van a ver desde mi tab*/

const players = [
	{
		id: "1",
		name: "Feli B",
		number: 11,
		photo: "https://cdn-icons-png.flaticon.com/512/1144/1144760.png",
	},
	{
		id: "2",
		name: "Tomi P",
		number: 10,
		photo: "https://cdn-icons-png.flaticon.com/512/1144/1144760.png",
	},
	{
		id: "3",
		name: "Maxi W",
		number: 7,
		photo: "https://cdn-icons-png.flaticon.com/512/1144/1144760.png",
	},
	{
		id: "4",
		name: "Lola DV",
		number: 8,
		photo: "https://cdn-icons-png.flaticon.com/512/1144/1144760.png",
	},
	{
		id: "5",
		name: "Lu O",
		number: 9,
		photo: "https://cdn-icons-png.flaticon.com/512/1144/1144760.png",
	},
	{
		id: "6",
		name: "Jose M",
		number: 6,
		photo: "https://cdn-icons-png.flaticon.com/512/1144/1144760.png",
	},
];

import React, { useEffect, useState } from "react";
import { ScrollView, Text, View, StyleSheet, TouchableOpacity } from "react-native";
import TeamPost from "../../components/teamPost"; // Importamos el módulo de Feli
import { supabase } from "@/lib/supabase";

type Team = {
	id: string;
	name: string;
	sport: string;
	members: number;
	description: string;
	//players: string[];
};

function TeamsFeed() {
	const [teams, setTeams] = useState<Team[]>([]);
	const [selectedSport, setSelectedSport] = useState<string>("");

	// Placeholder para los equipos ACA ES DONDE EN REALIDAD VA A HABER UNA LLAMADA A LA BDD O API (igual que en canchas.tsx)
	// useEffect(() => {
	// 	const placeholderTeams = [
	// 		{ id: "1", name: "Equipo A", sport: "Fútbol", members: 5, description: "Equipo de fútbol local" },
	// 		{
	// 			id: "2",
	// 			name: "Equipo B",
	// 			sport: "Básquetbol",
	// 			members: 8,
	// 			description: "Equipo de básquet competitivo",
	// 		},
	// 		{ id: "3", name: "Equipo C", sport: "Tenis", members: 2, description: "Dúo de tenis profesional" },
	// 	];
	// 	setTeams(placeholderTeams);
	// }, []);

	useEffect(() => {
		supabase
			.from("teams")
			.select("*")
			.then(({ data, error }) => {
				if (error) {
					console.error("Error fetching fields:", error);
				} else {
					setTeams(data);
				}
			});
	}, []);

	const handleSportPress = (sportName: string) => {
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
					{["Fútbol", "Básquetbol", "Tenis", "Hockey", "Volley"].map((sport) => (
						<View key={sport} style={{ padding: 10 }}>
							<TouchableOpacity
								style={[styles.sportButton, selectedSport === sport ? styles.selectedSportButton : {}]}
								onPress={() => handleSportPress(sport)}
							>
								<Text>{sport}</Text>
							</TouchableOpacity>
						</View>
					))}
					<TouchableOpacity style={{ padding: 10 }} onPress={() => handleSportPress("")}>
						<Text>X</Text>
					</TouchableOpacity>
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
					.filter((team) => {
						if (selectedSport === "") return true;
						return team.sport === selectedSport;
					})
					.map((team) => (
						<TeamPost
							key={team.id || `player-${team.id}`}   //lo que esta despues del || no se porque lo tuve que poner pero sino me tira error each child should have a unique key ... 
							name={team.name}
							sport={team.sport}
							players={players}
							description={team.description}
						/>
					))}
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
