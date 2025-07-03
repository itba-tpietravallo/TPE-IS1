import { supabase } from "@/lib/supabase";
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Image, Modal } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome6";
import { router } from "expo-router";
import { useState } from "react";
import { getUserAuthSession, getUserTournaments, getFieldById } from "@/lib/autogen/queries";
import PopUpTorneo from "@/components/PopUpTorneo";

export default function MyTournaments() {
	const { data: session } = getUserAuthSession(supabase);
	const user = session?.user;
	const { data: userTournaments } = getUserTournaments(supabase, user?.id!, {
		enabled: !!user?.id,
	});

	const [selectedTournament, setSelectedTournament] = useState<any>(null);
	const [isModalVisible, setIsModalVisible] = useState(false);
	const [fieldLocation, setFieldLocation] = useState<string>("");

	const handleOpenModal = async (item: any) => {
		setSelectedTournament(item);
		setIsModalVisible(true);

		// Obtener la cancha (field) del torneo
		const { data: field, error } = await getFieldById(supabase, item.tournament.field_id); //tournament no tiene el field id, es undefined x ahora xq la query no lo devuelve. TODO: editar getUserTournaments para que devuelva tmbn el field id
		if (field && !error) {
			setFieldLocation(typeof field.location === "string" ? field.location : "Ubicación desconocida");
		} else {
			setFieldLocation("Ubicación desconocida");
		}
	};

	return (
		<View style={styles.screen}>
			<TouchableOpacity style={styles.backButton} onPress={() => router.push("/(tabs)/profile")}>
				<Icon name="arrow-left" size={14} color="#262626" style={{ marginRight: 8 }} />
				<Text style={styles.backText}>Atrás</Text>
			</TouchableOpacity>

			<Text style={styles.title}>Mis torneos</Text>

			<View style={{ padding: 5, borderWidth: 1, borderColor: "#ccc", borderRadius: 5, margin: 10 }}>
				{!userTournaments || userTournaments.length === 0 ? (
					<Text style={styles.emptyText}>No estás participando en ningún torneo.</Text>
				) : (
					<FlatList
						data={userTournaments}
						keyExtractor={(item, index) => `${item.tournament?.id ?? "null"}-${index}`}
						scrollEnabled={true}
						renderItem={({ item }) => (
							<View style={styles.row}>
								<Text style={styles.tournamentName}>{item.tournament.name}</Text>
								<TouchableOpacity
									onPress={() => {
										setSelectedTournament(item);
										setIsModalVisible(true);
									}}
								>
									<Image style={styles.infoIcon} source={require("@/assets/images/info.png")} />
								</TouchableOpacity>
							</View>
						)}
						ItemSeparatorComponent={() => <View style={styles.separator} />}
					/>
				)}
			</View>

			<Modal
				style={styles.modal}
				visible={isModalVisible}
				transparent={true}
				onRequestClose={() => setIsModalVisible(false)}
			>
				<View style={styles.centeredView}>
					{selectedTournament && (
						<PopUpTorneo
							onClose={() => setIsModalVisible(false)}
							tournamentId={selectedTournament.tournament.id}
							name={selectedTournament.tournament.name}
							sport={selectedTournament.tournament.sport}
							location={fieldLocation}
							date={new Date(selectedTournament.tournament.startDate)}
							description={selectedTournament.tournament.description}
							price={selectedTournament.tournament.price}
							deadline={new Date(selectedTournament.tournament.deadline)}
							cantPlayers={selectedTournament.tournament.players_required}
							alreadyJoined={true}
						/>
					)}
				</View>
			</Modal>
		</View>
	);
}

const styles = StyleSheet.create({
	screen: {
		flex: 1,
		backgroundColor: "#f2f4f3",
	},
	backButton: {
		flexDirection: "row",
		alignItems: "flex-start",
		paddingVertical: 15,
		paddingHorizontal: 10,
	},
	backText: {
		fontSize: 14,
		color: "#262626",
	},
	title: {
		fontSize: 30,
		fontWeight: "bold",
		color: "#f18f01",
		textAlign: "left",
		paddingHorizontal: 16,
		paddingBottom: 12,
	},
	tournamentName: {
		fontWeight: "bold",
		color: "#223332",
		fontSize: 16,
	},
	row: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		padding: 15,
	},
	infoIcon: {
		width: 20,
		height: 20,
	},
	separator: {
		height: 1,
		backgroundColor: "#ccc",
		marginHorizontal: 10,
	},
	emptyText: {
		textAlign: "center",
		marginTop: 40,
		fontSize: 18,
		color: "#555",
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
