import React, { useState, useEffect, useRef } from "react";
import { View, Text, Button, StyleSheet, Image, TouchableOpacity, Modal, Alert, ScrollView } from "react-native";
import { ScreenWidth } from "@rneui/themed/dist/config";
import { supabase } from "@/lib/supabase";
import Icon from "react-native-vector-icons/FontAwesome6";
import { getAllUsers } from "@lib/autogen/queries.ts";
import { getUserSession } from "@/lib/autogen/queries";
import { router } from "expo-router";

type PropsPopUpJoinRequests = {
	onClose: () => void;
	team_id: string;
	name: string;
	players: string[]; 
	playerRequests: string[];
};

function PopUpJoinRequests(props: PropsPopUpJoinRequests) {
	const { data: user } = getUserSession(supabase);
	const usersData = getAllUsers(supabase);

	const [players, setPlayers] = useState<string[]>(props.players);
	const [requests, setRequests] = useState<string[]>(props.playerRequests); 

	const handleAcceptPlayer = async (player: string) => {
			const updatedMembers = [...(players || []), player];
	
			const { data, error } = await supabase
				.from("teams")
				.update({ players: updatedMembers })
				.eq("team_id", props.team_id)
				.throwOnError();
	
			setPlayers(updatedMembers);
			console.log("accept")

			handleDeleteRequest(player);
		};

	
	const handleDeleteRequest = async (player: string) => {
			const updatedRequests = requests.filter(member => member !== player);
	
			const { data, error } = await supabase
				.from("teams")
				.update({ playerRequests: updatedRequests })
				.eq("team_id", props.team_id)
				.throwOnError();
	
			setRequests(updatedRequests);
			console.log("deleted")
			console.log(updatedRequests)
		};

	return (
		<View style={styles.modalView}>

			<View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
				{/* Boton cerrar PopUp */}
				<TouchableOpacity style={{ padding: 10, alignItems: "flex-start", marginLeft: 10 }} onPress={props.onClose}>
					<Icon name="xmark" size={24} color="black" style={{ marginTop: 10 }} />
				</TouchableOpacity>
			</View>	

			<View style={styles.mainInfo}>
				{/* Nombre del equipo */}
				<View style={styles.topInfo}>
					{/* <Text style={styles.teamName}>{props.name}</Text> */}
					<Text style={{ fontSize: 16, color: "gray", marginBottom: 10 }}>Join Requests</Text>
				</View>

				{/* Miembros del Equipo */}
				{props.playerRequests?.length != 0 &&
					<ScrollView style={styles.scrollArea}>
						<View style={{ width: "100%" }}>
							{props.playerRequests?.map((member) => (
								<View key={member} style={styles.row}>
									<View style={{ height: 60, width: 30 }}></View>
									<Icon name="user" size={24} color="black">
										{" "}
									</Icon>
									<View style={styles.info}>
										<Text style={styles.name}>
											{usersData.data?.find((user) => user.id === member)?.full_name}
										</Text>
									</View>
									<TouchableOpacity style={{ padding: 3, alignItems: "flex-start", marginLeft: 10 }} onPress={()=>handleAcceptPlayer(usersData.data?.find((user) => user.id === member)?.id!)}>
										<Icon name="check-square" size={24} color="#f18f01" style={{ marginTop: 10 }} />
									</TouchableOpacity>
									<TouchableOpacity style={{ padding: 3, alignItems: "flex-start", marginLeft: 10 }} onPress={()=>handleDeleteRequest(usersData.data?.find((user) => user.id === member)?.id!)}>
										<Icon name="square-xmark" size={24} color="black" style={{ marginTop: 10 }} />
									</TouchableOpacity>
									
								</View>
							))}
						</View>
					</ScrollView>
				}
				{props.playerRequests?.length == 0 &&
					<View style={styles.topInfo}>
						<Text style={styles.name}>
							No hay solicitdes para unirse al equipo!
						</Text>
					</View>
				}
			</View>
            
		</View>
	);
}

const styles = StyleSheet.create({
	teamName: {
		fontSize: 32,
		fontWeight: "bold",
		justifyContent: "center",
		color: "#f18f01",
	},
	description: {
		paddingTop: 20,
		paddingBottom: 10,
		fontSize: 18,
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
		backgroundColor: "#f0f0f0",
		marginBottom: 20,
		flexGrow: 0,
		maxHeight: 320,
	},
	mainInfo: {
		padding: 15,
	},
	topInfo: {
		flexDirection: "column",
		justifyContent: "space-between",
		alignItems: "center",
		gap: 15,
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
	row: {
		flexDirection: "row",
		alignItems: "center",
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
	leaveTeamButton: {
		backgroundColor: "#c7c7c7",
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
	modal: {
		justifyContent: "center",
		alignItems: "center",
	},
	centeredView: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "rgba(0, 0, 0, 0.5)",
	},
    button: {
		flex: 1,
		padding: 10,
		borderRadius: 5,
		alignItems: "center",
		justifyContent: "center",
	},
    acceptButton: {
        backgroundColor: "#f18f01",
    },
    declineButton: {
        backgroundColor: "black",
    }
});

export default PopUpJoinRequests;