import React, { useState } from "react";
import { ScrollView, Text, View, StyleSheet, TouchableOpacity, ImageBackground } from "react-native";
import TeamPost from "../../components/teamPost";
import { ScreenHeight } from "@rneui/themed/dist/config";
import { router } from "expo-router";
import { supabase } from "@/lib/supabase";
import { getAllTeams, getAllSports, getUserAuthSession } from "@/lib/autogen/queries";

function TeamsFeed() {
	const { data: teams } = getAllTeams(supabase);
	const { data: sports } = getAllSports(supabase);

	const { data: session } = getUserAuthSession(supabase);
	const user = session?.user;
	const myTeams = teams?.filter((team) => team?.players?.some((member) => member === user?.id));

	const [selectedSport, setSelectedSport] = useState<string>("");
	const [showMyTeams, setShowMyTeams] = useState<boolean>(false);

	const handleSportPress = (sportName: string) => {
		if (selectedSport === sportName) {
			setSelectedSport("");
			return;
		}
		setSelectedSport(sportName);
	};

	const handleAddNewTeam = () => {
		router.push("/(tabs)/newTeam");
	};

	const filteredTeams = teams
		?.filter((team) => {
			if (showMyTeams && user?.id) {
				return team?.players?.some((member) => member === user.id);
			}
			return true;
		})
		.filter((team) => {
			if (selectedSport !== "") {
				return team.sport === selectedSport;
			}
			return true;
		});

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
						paddingLeft: 20,
						overflowY: "hidden",
					}}
				>
					<TouchableOpacity
						style={[styles.sportButton, showMyTeams ? styles.selectedSportButton : {}]}
						onPress={() => {
							setShowMyTeams((prev) => !prev);
						}}
					>
						<Text>Mis equipos</Text>
					</TouchableOpacity>
					{(sports || []).length > 0 &&
						(sports || []).map(
							(sport) =>
								sport &&
								sport.name && (
									<View key={sport.name} style={{ padding: 5 }}>
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
						<TouchableOpacity
							style={{ padding: 10 }}
							onPress={() => {
								handleSportPress("");
								setShowMyTeams(false);
							}}
						>
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
				{filteredTeams?.map((team) => <TeamPost key={team.team_id} team_id={team.team_id} />)}

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
});

export default TeamsFeed;
