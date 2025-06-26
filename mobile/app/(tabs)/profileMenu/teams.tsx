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
	description: string;
	images: string[];
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
			<TouchableOpacity
				style={{ flexDirection: "row", alignItems: "flex-start", paddingVertical: 15, paddingHorizontal: 10 }}
				onPress={() => router.push("/(tabs)/profile")}
			>
				<Icon name="arrow-left" size={14} color="#262626" style={{ marginRight: 8 }} />
				<Text style={{ fontSize: 14, color: "#262626" }}>Atrás</Text>
			</TouchableOpacity>
			<Text
				style={{
					fontSize: 30,
					fontWeight: "bold",
					color: "#f18f01",
					textAlign: "left",
					padding: 10,
				}}
			>
				Mis equipos
			</Text>
			{/* {myTeams?.map((team, index) => (
				<Text key={index}>
					<Text style={{ fontSize: 18, marginLeft: 10 }}>{team.name}</Text>
				</Text>
			))} */}
			<View style={{ padding: 5, borderWidth: 1, borderColor: "#ccc", borderRadius: 5, margin: 10 }}>
				{myTeams?.length > 0 ? (
					<View
						style={{
							flexDirection: "row",
							justifyContent: "space-between",
							padding: 15,
						}}
					>
						<FlatList
							data={myTeams}
							keyExtractor={(item) => item.team_id.toString()}
							scrollEnabled={true}
							renderItem={({ item }) => (
								<View
									style={{
										flexDirection: "row",
										justifyContent: "space-between",
										padding: 15,
									}}
								>
									<Text style={{ fontWeight: "bold" }}>{item.name}</Text>
									<TouchableOpacity
										onPress={() => {
											setIsModalVisible(true);
											setSelectedTeam(item);
										}}
									>
										<Image
											style={{ width: 20, height: 20 }}
											source={require("@/assets/images/info.png")}
										/>
									</TouchableOpacity>
								</View>
							)}
							ItemSeparatorComponent={() => (
								<View style={{ height: 1, backgroundColor: "#ccc", marginHorizontal: 10 }} />
							)}
						/>
					</View>
				) : (
					<Text style={{ color: "gray", padding: 20 }}>Aún no tienes equipos asignados.</Text>
				)}
			</View>
			<Modal
				style={styles.modal}
				visible={isModalVisible}
				transparent={true}
				onRequestClose={() => setIsModalVisible(false)}
			>
				<View style={styles.centeredView}>
					{selectedTeam && (
						<PopUpTeam
							onClose={() => setIsModalVisible(false)}
							team_id={selectedTeam.team_id}
							name={selectedTeam.name}
							sport={selectedTeam.sport}
							description={selectedTeam.description || ""}
							players={selectedTeam.players}
						/>
					)}
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

export default myTeams;
