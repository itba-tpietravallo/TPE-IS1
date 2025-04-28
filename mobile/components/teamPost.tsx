import { ScreenHeight } from "@rneui/themed/dist/config";
import React, { useState } from "react";
import PopUpTeam from "./PopUpTeam";
import { StyleSheet, Text, View, ImageBackground, Image, TouchableOpacity, Modal } from "react-native";
import { Player } from "../app/(tabs)/teams.tsx";

type PropsTeam = {
	team_id: string;
	name: string;
	sport: string;
	description: string;
	players: string[]; //solucion provisoria
	//players: Player[];
};

function TeamPost(props: PropsTeam) {
	const [isModalVisible, setIsModalVisible] = useState(false);
	const handleCloseModal = () => {
		setIsModalVisible(false);
	};

	const backgroundImageSource = require("@/assets/images/people-logo.jpg");

	return (
		<View style={{ flex: 1 }}>
			<TouchableOpacity onPress={() => setIsModalVisible(true)}>
				<ImageBackground
					style={styles.container}
					imageStyle={{ borderRadius: 15, opacity: 0.9 }}
					source={backgroundImageSource}
				>
					<View style={styles.topContent}>
						<Text style={styles.title}>{props.name}</Text>
					</View>
				</ImageBackground>
			</TouchableOpacity>
			<Modal
				style={styles.modal}
				visible={isModalVisible}
				transparent={true}
				onRequestClose={() => setIsModalVisible(false)}
			>
				<View style={styles.centeredView}>
					<PopUpTeam
						onClose={handleCloseModal}
						team_id={props.team_id}
						name={props.name}
						sport={props.sport}
						description={props.description}
						players={props.players}
					/>
				</View>
			</Modal>
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
	bottomContent: {
		backgroundColor: "black",
		borderColor: "#747775",
		paddingHorizontal: 12,
		height: 30,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		opacity: 0.6,
		borderBottomEndRadius: 15,
		borderBottomStartRadius: 15,
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
	sport: {
		fontSize: 16,
		color: "#fff",
		marginTop: 1,
		fontWeight: "bold",
	},
	icon: {
		width: 25,
		height: 25,
		borderRadius: 25,
	},
	centeredView: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "rgba(0, 0, 0, 0.5)",
	},
	modal: {
		justifyContent: "center",
		alignItems: "center",
	},
});

export default TeamPost;
