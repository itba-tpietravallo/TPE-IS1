import { ScreenHeight } from "@rneui/themed/dist/config";
import React, { useState } from "react";

import { StyleSheet, Text, View, ImageBackground, Image, TouchableOpacity, Modal } from "react-native";
import PopUpReserva from "./PopUpReserva";
import { router } from "expo-router";

interface props {
	name: string;
	fieldId: string;
	sport: string[];
	location: string;
	images: string[];
	description: string;
	price: number;
}
function FieldPost(props: props) {
	const { name, sport, location, description } = props;
	const [isModalVisible, setIsModalVisible] = useState(false);
	const handleCloseModal = () => {
		setIsModalVisible(false);
	};

	const backgroundImageSource =
		props.images && props.images.length > 0 ? { uri: props.images[0] } : require("@/assets/images/no-imagen.jpeg");

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
						<Text style={styles.sport}>{props.sport.join(", ")}</Text>
					</View>
					<View style={styles.bottomContent}>
						<Image style={styles.icon} source={require("@/assets/images/cancha.png")} />
						<Text style={styles.text}>{props.location}</Text>
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
					<PopUpReserva
						onClose={handleCloseModal}
						name={name}
						fieldId={props.fieldId}
						location={location}
						sport={sport}
						images={props.images}
						description={description}
						price={props.price}
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

export default FieldPost;
