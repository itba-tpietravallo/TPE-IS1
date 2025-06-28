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
				Mis reservas
			</Text>
			<View style={{ padding: 5, borderWidth: 1, borderColor: "#ccc", borderRadius: 5, margin: 10 }}>
				{reservations.length > 0 ? (
					<FlatList
						data={reservations}
						scrollEnabled={true}
						style={{ maxHeight: 500 }}
						keyExtractor={(item) => item.id.toString()}
						renderItem={({ item }) => (
							<View
								style={{
									flexDirection: "row",
									justifyContent: "space-between",
									padding: 20,
								}}
							>
								<Text>
									{new Date(item.date_time).toLocaleDateString("es-ES", {
										year: "numeric",
										month: "2-digit",
										day: "2-digit",
									})}
								</Text>
								<Text style={{ fontWeight: "bold" }}>{item.field.name}</Text>
								<TouchableOpacity onPress={() => handleOpenModal(item)}>
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
				) : (
					<Text style={{ color: "gray", padding: 20 }}>No tienes reservas.</Text>
				)}
			</View>
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
});
