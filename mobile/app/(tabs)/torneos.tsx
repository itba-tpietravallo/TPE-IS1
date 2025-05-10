import { supabase } from "@lib/supabase";
import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View, Modal, ScrollView, Image, ImageBackground } from "react-native";
import { ScreenHeight, ScreenWidth } from "@rneui/themed/dist/config";
import { getAllTournaments, getFieldById } from "@lib/autogen/queries"; // Database Queries
import TournamentPost from "@components/tournamentPost";

function TorneosFeed() {
	const [isModalVisible, setIsModalVisible] = useState(false);
	const [selectedTorneo, setSelectedTorneo] = useState<string>("");

	const { data: torneos } = getAllTournaments(supabase);

	return (
		<View
			style={{
				flex: 1,
				justifyContent: "center",
				alignItems: "center",
				backgroundColor: "#f2f4f3",
			}}
		>
			<ScrollView
				horizontal={false}
				contentContainerStyle={{ flexDirection: "column", paddingBottom: 100 }}
				showsHorizontalScrollIndicator={false}
				showsVerticalScrollIndicator={false}
			>
				{torneos?.map((torneo, index) => (
					<TournamentPost
						key={index}
						name={torneo.name}
						fieldId={torneo.fieldId}
						sport={torneo.sport}
						startDate={new Date(torneo.startDate)}
						description={torneo.description || ""}
						price={torneo.price}
						deadline={new Date(torneo.deadline)}
						cantPlayers={torneo.cantPlayers}
						players={torneo.players || []}
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
});
export default TorneosFeed;
