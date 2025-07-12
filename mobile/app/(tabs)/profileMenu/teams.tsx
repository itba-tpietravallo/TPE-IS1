import { supabase } from "@/lib/supabase";
import { Image } from "@rneui/themed";
import { StyleSheet, Text, TouchableOpacity, View, FlatList, Modal } from "react-native";
import { useEffect, useState } from "react";
import { Session } from "@supabase/supabase-js";
import { router } from "expo-router";
import Icon from "react-native-vector-icons/FontAwesome6";
import PopUpTeam from "@/components/PopUpTeam";
import { getUserSession, getAllTeams, getTeamMembers, getFieldById, getUserAuthSession } from "@/lib/autogen/queries";
import { ScreenHeight, ScreenWidth } from "@rneui/themed/dist/config";

type Field = {
	team_id: string;
	name: string;
	sport: string;
	description: string | null;
	images: string[] | null;
	players: string[];
};

function myTeams() {
	const { data: session } = getUserAuthSession(supabase);
	const user = session?.user;
	const { data: teams } = getAllTeams(supabase);
	const myTeams = teams?.filter((team) => team?.players?.some((member) => member === user?.id));
	const [selectedTeam, setSelectedTeam] = useState<Field | null>(null);
	const [isModalVisible, setIsModalVisible] = useState(false);

	return (
		<View
			style={{
				flex: 1,
				alignItems: "stretch",
				backgroundColor: "#f2f4f3",
				padding: 6,
			}}
		>
			<View
				style={{
					flexDirection: "row",
					alignItems: "center",
					justifyContent: "center",
					paddingVertical: 15,
					paddingHorizontal: 10,
					position: "relative",
				}}
			>
				<TouchableOpacity
					onPress={() => router.push("/(tabs)/profile")}
					style={{ position: "absolute", left: 10 }}
				>
					<Icon name="arrow-left" size={18} color="#262626" />
				</TouchableOpacity>

				<View style={{ flex: 1, alignItems: "center" }}>
					<Text
						style={{
							fontSize: 26,
							fontWeight: "bold",
							color: "#f18f01",
						}}
					>
						Equipos
					</Text>
				</View>
			</View>
			{/* {myTeams?.map((team, index) => (
				<Text key={index}>
					<Text style={{ fontSize: 18, marginLeft: 10 }}>{team.name}</Text>
				</Text>
			))} */}

			{(myTeams ?? []).length > 0 ? (
				<FlatList
					data={myTeams}
					keyExtractor={(item) => item.team_id.toString()}
					contentContainerStyle={styles.container}
					scrollEnabled={true}
					renderItem={({ item }) => (
						<View style={styles.card}>
							<View
								style={{
									flexDirection: "row",
									justifyContent: "space-between",
									alignItems: "center",
								}}
							>
								<Text style={styles.teamName}>{item.name}</Text>
								<TouchableOpacity
									onPress={() => {
										setIsModalVisible(true);
										setSelectedTeam(item);
									}}
								>
									<Icon name="circle-info" size={22} color="#223332" />
								</TouchableOpacity>
							</View>
							<Text style={styles.sport}>{item.sport}</Text>
							<Text style={styles.description} numberOfLines={2}>
								{item.description || "Sin descripción."}
							</Text>
						</View>
					)}
				/>
			) : (
				<Text style={{ textAlign: "center", marginTop: 40, fontSize: 18, color: "#555" }}>
					No perteneces a ningún equipo.
				</Text>
			)}

			<Modal
				style={styles.modal}
				visible={isModalVisible}
				transparent={true}
				onRequestClose={() => setIsModalVisible(false)}
			>
				<View style={styles.centeredView}>
					{selectedTeam && (
						<PopUpTeam onClose={() => setIsModalVisible(false)} team_id={selectedTeam.team_id} />
					)}
				</View>
			</Modal>
		</View>
	);
}

const styles = StyleSheet.create({
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
	card: {
		backgroundColor: "#fff",
		borderRadius: 12,
		padding: 24,
		marginBottom: 12,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 3,
	},
	teamName: {
		fontSize: 18,
		fontWeight: "600",
		color: "#262626",
	},
	sport: {
		fontSize: 14,
		color: "#888",
		marginTop: 4,
	},
	description: {
		marginTop: 6,
		fontSize: 13,
		color: "#555",
	},
	container: {
		padding: 16,
		paddingBottom: 100,
	},
});

export default myTeams;
