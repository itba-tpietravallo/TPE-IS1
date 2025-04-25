import React, { useState, useEffect, useRef } from "react";
import { View, Text, Button, StyleSheet, Image, TouchableOpacity, Modal, Alert, ScrollView } from "react-native";
import { ScreenHeight, ScreenWidth } from "@rneui/themed/dist/config";

// type User = {
// 	id: string;
// 	full_name: string;
// 	avatar_url: string;
// };

type Player = {
    id: string
    name: string
    number: number
    photo: string
  }
  
  type PropsPopUpTeam = {
    onClose: () => void;
    name: string;
    sport: string;
    description: string;
    players: Player[];
  };

function PopUpTeam(props: PropsPopUpTeam) {
    const {onClose, name, sport, description, players} = props;

	const handlePostTeam = () => {
		console.log("Me uni al equipo")
		//insert en la base de datos un nuevo team player
	};

	return (
		<View style={styles.modalView}>

            {/* Boton cerrar PopUp */}
			<TouchableOpacity style={{ padding: 10, alignItems: "flex-end" }} onPress={onClose}>
				<Image style={{ width: 20, height: 20, marginTop: 10 }} source={require("@/assets/images/close.png")} />
			</TouchableOpacity>

			<View style={styles.mainInfo}>

                {/* Nombre del equipo y deporte */}
				<View style={styles.topInfo}>
					<View style={{ flex: 1, paddingRight: 10, alignItems: "center" }}>
						<Text
							style={{
								fontSize: 32,
								fontWeight: "bold",
								justifyContent: "center",
                                color: "#f18f01",
							}}
						>
							{name}
						</Text>
						<Text style={{ fontSize: 16, color: "gray", marginBottom: 10 }}>{sport}</Text>
					</View>
				
				</View>

                {/* Miembros del Equipo */}
				<ScrollView style={styles.scrollArea}>
					<View style={{ width: "100%" }}>
					{players.map((member) => {
						return (
						<View key={member.id} style={styles.row}>
							<Image source={{ uri: member.photo }} style={styles.avatar} />
							<View style={styles.info}>
								<Text style={styles.name}>{member.name}</Text>
							</View>
							<Text style={styles.number}>{member.number}</Text>
						</View>
						);
					})}
					</View>
				</ScrollView>

				{/* Descripcion del equipo */}
				<Text style={styles.description}>
					{description}
				</Text>

            </View>    

			{/* Unirse a un equipo */}
			<TouchableOpacity
                    style={[
                      styles.joinTeamButton
                    ]}
                    onPress={handlePostTeam}
                  >
                    <Text style={styles.buttonText}>Join Team</Text>
        	</TouchableOpacity>

		</View>
	);
}

const styles = StyleSheet.create({
    description: {
        paddingTop: 20,
        paddingBottom: 10, 
        fontSize: 18
    },
	modalView: {
		backgroundColor: "white",
		borderRadius: 20,
		color: "#00ff00",
		overflow: "hidden",
		width: ScreenWidth * 0.9,
	},
    scrollContainer: {
        flexGrow: 1,
        paddingBottom: 20,
    },
	scrollArea: {
		height: 320, // ← Largo fijo del ScrollView
		backgroundColor: '#f0f0f0',
		marginBottom: 10,
	},
	mainInfo: {
		marginLeft: 10,
	},
	topInfo: {
		paddingTop: 5,
		padding: 20,
		flexDirection: "row",
		justifyContent: "center",
		alignItems: "center",
	},
	selection: {
		padding: 20,
		gap: 30,
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
	select: {
		fontWeight: "bold",
		fontSize: 16,
		marginBottom: 10,
	},
	selected: {
		backgroundColor: "white",
		borderWidth: 1,
		borderColor: "#747775",
		borderRadius: 20,
		paddingHorizontal: 12,
		height: 20,
		flexDirection: "row",
	},
    row:{
        flexDirection: "row",
        alignItems: "center",
        padding: 0,
        borderBottomWidth: 1,
        borderColor: "#ccc",
        backgroundColor: "white",
        width: "100%",
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
    },
      info: {
        flex: 1,
        marginLeft: 12,
    },
    name: {
        fontSize: 16,
        fontWeight: "bold",
    },
    number: {
        fontSize: 18,
        fontWeight: "bold",
        padding: 20,
    },
	joinTeamButton: {
		backgroundColor: "#f18f04",
		width: "100%",
		padding: 17,
		alignItems: "center",
		justifyContent: "center",
		marginTop: 10,
	
	  },
	  buttonText: {
		color: "#fff",
		fontSize: 16,
		fontWeight: "bold",
	  },
});

export default PopUpTeam;
