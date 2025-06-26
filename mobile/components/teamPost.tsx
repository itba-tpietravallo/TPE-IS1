import { ScreenHeight } from "@rneui/themed/dist/config";
import React, { useState } from "react";
import PopUpTeam from "./PopUpTeam";
import { StyleSheet, Text, View, ImageBackground, TouchableOpacity, Modal } from "react-native";

type PropsTeam = {
	team_id: string;
	name: string;
	sport: string;
	description: string;
	players: string[];
	playerRequests: string[];
	images: string[];
	isPublic: boolean;
	admins: string[];
};

function TeamPost(props: PropsTeam) {
	const [isModalVisible, setIsModalVisible] = useState(false);
	const handleCloseModal = () => {
		setIsModalVisible(false);
	};

	const [players, setPlayers] = useState<string[]>(props.players);
	const [requests, setRequests] = useState<string[]>(props.playerRequests);
	const [admins, setAdmins] = useState<string[]>(props.admins);

	return (
		<View style={{ flex: 1 }}>
			<TouchableOpacity onPress={() => setIsModalVisible(true)}>
				<ImageBackground
					style={styles.container}
					imageStyle={{ borderRadius: 15, opacity: 0.9 }}
					source={props.images.length == 0 ? require("@/assets/images/people-logo.jpg") : props.images[0]} //@TODO: IMAGENES
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
						players={players}
						setPlayers={setPlayers}
						playerRequests={requests}
						setRequests={setRequests}
						admins={admins}
						setAdmins={setAdmins}
						public={props.isPublic}
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
