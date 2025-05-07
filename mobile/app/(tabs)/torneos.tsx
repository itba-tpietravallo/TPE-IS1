import { supabase } from "@lib/supabase";
import React, { useState } from "react";
import {
	StyleSheet,
	Text,
	Touchable,
	TouchableOpacity,
	View,
	Modal,
	ScrollView,
	Image,
	ImageBackground,
} from "react-native";
import { ScreenHeight, ScreenWidth } from "@rneui/themed/dist/config";
import PopUpTorneo from "@components/PopUpTorneo";
import { getAllFields, getAllSports } from "@lib/autogen/queries"; // Database Queries

type Torneo = {
	name: string;
	location: string;
	date: Date;
	description: string;
	price: string;
	deadline: Date;
	cantPlayers: number;
};

const mockTorneos: Torneo[] = [
	{
		name: "Torneo 1",
		location: "Las Heras 1946",
		date: new Date("2025-05-10"),
		description: "Torneo de fútbol",
		price: "1234",
		deadline: new Date("2025-05-08"),
		cantPlayers: 5,
	},
	{
		name: "Torneo 2",
		location: "Av. Corrientes 1234",
		date: new Date("2025-05-15"),
		description: "Torneo de tenis",
		price: "1500",
		deadline: new Date("2025-05-12"),
		cantPlayers: 2,
	},
];

function TorneosFeed() {
	const [isModalVisible, setIsModalVisible] = useState(false);
	const [selectedTorneo, setSelectedTorneo] = useState<Torneo | null>(null);

	const handleTorneoPress = (torneo: Torneo) => {
		setSelectedTorneo(torneo);
		setIsModalVisible(true);
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
			<ScrollView
				horizontal={false}
				contentContainerStyle={{ flexDirection: "column", paddingBottom: 100 }}
				showsHorizontalScrollIndicator={false}
				showsVerticalScrollIndicator={false}
			>
				{mockTorneos.map((torneo, index) => (
					<TouchableOpacity key={index} onPress={() => handleTorneoPress(torneo)}>
						<ImageBackground
							style={styles.container}
							imageStyle={{ borderRadius: 15, opacity: 0.9 }}
							source={require("@/assets/images/no-imagen.jpeg")}
						>
							<View style={styles.topContent}>
								<Text style={styles.title}>{torneo.name}</Text>
								<Text style={styles.text}>{torneo.location}</Text>
							</View>
						</ImageBackground>
					</TouchableOpacity>
				))}
			</ScrollView>
			{selectedTorneo && (
				<Modal
					style={{ justifyContent: "center", alignItems: "center" }}
					visible={isModalVisible}
					transparent={true}
					onRequestClose={() => setIsModalVisible(false)}
				>
					<PopUpTorneo
						onClose={() => setIsModalVisible(false)}
						name={selectedTorneo.name}
						location={selectedTorneo.location}
						date={selectedTorneo.date}
						description={selectedTorneo.description}
						price={selectedTorneo.price}
						deadline={selectedTorneo.deadline}
						cantPlayers={selectedTorneo.cantPlayers}
					/>
				</Modal>
			)}
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
