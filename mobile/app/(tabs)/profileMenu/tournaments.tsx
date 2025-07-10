import { View, Text, FlatList, StyleSheet, TouchableOpacity, Image, Modal } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome6";
import { router } from "expo-router";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { ScreenHeight, ScreenWidth } from "@rneui/themed/dist/config";

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

	const openModal = (item: any) => {
		setSelectedTournament(item);
		setIsModalVisible(true);
	};

	const closeModal = () => {
		setIsModalVisible(false);
	};

	const TournamentModal = ({ tournament }: { tournament: any }) => {
		const { data: fieldData } = getFieldById(supabase, tournament.tournament.fieldId);

		const location = fieldData
			? `${fieldData?.street} ${fieldData?.street_number}, ${fieldData?.neighborhood}`
			: "Ubicación desconocida";

		return (
			<Modal style={styles.modal} visible={isModalVisible} transparent={true} onRequestClose={closeModal}>
				<View style={styles.centeredView}>
					<PopUpTorneo
						onClose={closeModal}
						tournamentId={tournament.tournament.id}
						name={tournament.tournament.name}
						sport={tournament.tournament.sport}
						location={location}
						date={new Date(tournament.tournament.startDate)}
						description={tournament.tournament.description}
						price={tournament.tournament.price}
						deadline={new Date(tournament.tournament.deadline)}
						cantPlayers={tournament.tournament.players_required}
						alreadyJoined={true}
					/>
				</View>
			</Modal>
		);
	};

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
					//todos los estilos estan copiados de teams.tsx para que el dislpay quede igual en todos los items del menu

					fontSize: 30,
					fontWeight: "bold",
					color: "#f18f01",
					textAlign: "left",
					padding: 10,
				}}
			>
				Mis torneos
			</Text>

			<View style={{ padding: 5, borderWidth: 1, borderColor: "#ccc", borderRadius: 5, margin: 10 }}>
				{!userTournaments || userTournaments.length === 0 ? (
					<Text style={{ color: "gray", padding: 20 }}>No estás participando en ningún torneo.</Text>
				) : (
					<FlatList
						data={userTournaments}
						keyExtractor={(item, index) => `${item.tournament?.id ?? "null"}-${index}`}
						scrollEnabled={true}
						renderItem={({ item }) => (
							<View
								style={{
									flexDirection: "row",
									justifyContent: "space-between",
									padding: 15,
								}}
							>
								<Text style={{ fontWeight: "bold" }}>{item.tournament.name}</Text>
								<TouchableOpacity onPress={() => openModal(item)}>
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
				)}
			</View>

			{selectedTournament && <TournamentModal tournament={selectedTournament} />}
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
