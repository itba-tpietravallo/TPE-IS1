import { supabase } from "@/lib/supabase";
import { StyleSheet, Text, TouchableOpacity, View, Modal, FlatList } from "react-native";
import { Image } from "@rneui/themed";
import { Session } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import ReservationInfo from "@/components/reservationInfo";
import Icon from "react-native-vector-icons/FontAwesome6";
import { router } from "expo-router";
import { getUserSession, getUserReservations, getUserAuthSession } from "@/lib/autogen/queries";

export default function Index() {
	const { data: session } = getUserAuthSession(supabase);
	const user = session?.user;
	const [reservations, setReservations] = useState<Reservation[]>([]);

	// Get reservations for the current user
	const { data: userReservations, error: reservationsError } = getUserReservations(supabase, user?.id!, {
		enabled: !!user && !!user.id,
	});

	useEffect(() => {
		if (userReservations) {
			setReservations(userReservations as Reservation[]);
		}

		if (reservationsError) {
			console.error("Error fetching reservations:", reservationsError);
		}
	}, [userReservations, reservationsError]);

	type Reservation = {
		id: string;
		field_id: string;
		date_time: string;
		owner_id: string;
		field: {
			name: string;
			street_number: string;
			street: string;
			neighborhood: string;
			city: string;
		};
	};

	const [isModalVisible, setIsModalVisible] = useState(false);
	const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);

	const handleOpenModal = (reservation: Reservation) => {
		setSelectedReservation(reservation);
		setIsModalVisible(true);
	};

	const handleCloseModal = () => {
		setIsModalVisible(false);
		setSelectedReservation(null);
	};

	const selectedDate = new Date(selectedReservation?.date_time || "");
	const selectedTime = new Date(selectedReservation?.date_time || "");

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
						Reservas
					</Text>
				</View>
			</View>

			{reservations.length > 0 ? (
				<FlatList
					data={reservations}
					keyExtractor={(item) => item.id.toString()}
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
								<Text style={styles.fieldName}>{item.field.name}</Text>
								<TouchableOpacity onPress={() => handleOpenModal(item)}>
									<Icon name="circle-info" size={22} color="#223332" />
								</TouchableOpacity>
							</View>
							<Text style={styles.date}>
								{new Date(item.date_time).toLocaleDateString("es-ES", {
									year: "numeric",
									month: "short",
									day: "numeric",
								})}
								{" • "}
								{new Date(item.date_time).toLocaleTimeString("es-ES", {
									hour: "2-digit",
									minute: "2-digit",
								})}
							</Text>
						</View>
					)}
				/>
			) : (
				<Text style={{ textAlign: "center", marginTop: 40, fontSize: 18, color: "#555" }}>
					No tienes reservas.
				</Text>
			)}

			<Modal style={styles.modal} visible={isModalVisible} transparent={true} onRequestClose={handleCloseModal}>
				<View style={styles.centeredView}>
					<ReservationInfo
						onClose={handleCloseModal}
						field_name={selectedReservation?.field?.name || ""}
						date={selectedDate.toLocaleDateString("es-ES", {
							year: "numeric",
							month: "2-digit",
							day: "2-digit",
						})}
						time={selectedTime.toLocaleTimeString("es-ES", {
							hour: "2-digit",
							minute: "2-digit",
						})}
						location={`${selectedReservation?.field?.street || ""} ${selectedReservation?.field?.street_number || ""}, ${selectedReservation?.field?.neighborhood || ""}, ${selectedReservation?.field?.city || ""}`}
						id={selectedReservation?.id || ""}
					/>
				</View>
			</Modal>
		</View>
	);
}

const styles = StyleSheet.create({
	centeredView: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "rgba(0, 0, 0, 0.5)",
	},
	modal: {
		justifyContent: "center",
		alignItems: "center",
		borderRadius: 20,
		overflow: "hidden",
		width: "90%",
		maxWidth: 400,
	},
	card: {
		backgroundColor: "#fff",
		borderRadius: 12,
		padding: 24,
		marginBottom: 12,
		marginHorizontal: 6,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 3,
	},
	fieldName: {
		fontSize: 18,
		fontWeight: "600",
		color: "#262626",
	},
	date: {
		marginTop: 8,
		fontSize: 14,
		color: "#555",
	},
	container: {
		padding: 16,
		paddingBottom: 90,
	},
});
