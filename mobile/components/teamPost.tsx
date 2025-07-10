import { ScreenHeight } from "@rneui/themed/dist/config";
import React, { useState } from "react";
import PopUpTeam from "./PopUpTeam";
import { StyleSheet, Text, View, ImageBackground, TouchableOpacity, Modal } from "react-native";
import { supabase } from "@/lib/supabase";
import { getTeamById } from "@lib/autogen/queries";

type PropsTeam = {
	team_id: string;
};

function TeamPost(props: PropsTeam) {
	const [isModalVisible, setIsModalVisible] = useState(false);
	const handleCloseModal = () => {
		setIsModalVisible(false);
	};

	const { data: team } = getTeamById(supabase, props.team_id);

	return (
		<View style={{ flex: 1 }}>
			<TouchableOpacity onPress={() => setIsModalVisible(true)}>
				<ImageBackground
					style={styles.container}
					imageStyle={{ borderRadius: 15, opacity: 0.9 }}
					source={
						team?.images && team.images.length > 0
							? { uri: team.images[0] }
							: require("@/assets/images/people-logo.jpg")
					} //@TODO: IMAGENES
				>
					<View style={styles.topContent}>
						<Text style={styles.title}>{team?.name}</Text>
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
					<PopUpTeam onClose={handleCloseModal} team_id={props.team_id} />
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
