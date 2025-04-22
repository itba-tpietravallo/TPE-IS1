import { supabase } from "@/lib/supabase";
import { Button, Image } from "@rneui/themed";
import { StyleSheet, Text, TouchableOpacity, View, Modal } from "react-native";
import { useEffect, useState } from "react";
import { Session } from "@supabase/supabase-js";
import ReservationInfo from "@/components/reservationInfo";

type User = {
	id: string;
	full_name: string;
	avatar_url: string;
};

type Reservation = {
	id: string;
	start_time: string;
	date: string;
	field: {
		name: string;
		//location: string;
		street_number: string;
		street: string;
		neighborhood: string;
		city: string;
	};
};

export default function Index() {
	const [user, setUser] = useState<Session>();
	const [reservations, setReservations] = useState<Reservation[]>([]);

	useEffect(() => {
		supabase.auth.getSession().then(({ data: { session } }) => {
			supabase
				.from("users")
				.select("*")
				.eq("id", session?.user.id)
				.single()
				.then(({ data, error }) => {
					if (error) {
						console.error("Error fetching user:", error);
					} else {
						setUser(data);
						console.log("id:", data.id);
						supabase
							.from("reservations")
							.select(
								`*, field: fields (name, street_number, street, neighborhood, city)`, // , location: fields(location)`",
							)
							.eq("owner_id", data.id)
							.order("date", { ascending: true })
							.then(({ data, error }) => {
								if (error) {
									console.error("Error fetching reservations:", error);
								} else {
									setReservations(data || []);
								}
							});
					}
				});
		});
	}, []);

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

	return (
		<View style={styles.containter}>
			<View>
				<View>
					<View style={{ alignItems: "center", padding: 30 }}>
						<Image source={{ uri: user?.avatar_url }} style={{ width: 100, height: 100 }} />
						<Text style={{ fontSize: 30, fontWeight: "bold", paddingTop: 20 }}>{user?.full_name}</Text>
						<Button
							buttonStyle={styles.buttonContainer}
							title="Cerrar sesión"
							onPress={async () => {
								const { error } = await supabase.auth.signOut({ scope: "local" });
								if (error) {
									console.error("Error signing out:", error.message);
								}
								console.log("Signed out successfully");
							}}
						/>
					</View>
				</View>
			</View>

			<View>
				<Text
					style={{
						fontSize: 30,
						fontWeight: "bold",
						color: "gray",
						textAlign: "left",
						paddingBottom: 10,
					}}
				>
					Mis reservas:
				</Text>
				<View style={{ padding: 20, borderWidth: 1, borderColor: "#ccc", borderRadius: 5 }}>
					{reservations.length > 0 ? (
						reservations.map((reservation, i) => (
							<View
								key={reservation.id}
								style={{
									flexDirection: "row",
									justifyContent: "space-between",
									padding: 10,
									borderBottomWidth: 1,
									borderBottomColor: "#ccc",
								}}
							>
								<Text>{reservation.date}</Text>
								<Text style={{ fontWeight: "bold" }}>{reservation.field.name}</Text>
								<TouchableOpacity onPress={() => handleOpenModal(reservation)}>
									<Image
										style={{ width: 20, height: 20 }}
										source={require("@/assets/images/info.png")}
									/>
								</TouchableOpacity>
							</View>
						))
					) : (
						<Text>No tienes reservas.</Text>
					)}
				</View>
			</View>
			<Modal style={styles.modal} visible={isModalVisible} transparent={true} onRequestClose={handleCloseModal}>
				<View style={styles.centeredView}>
					<ReservationInfo
						onClose={handleCloseModal}
						field_name={selectedReservation?.field?.name || ""}
						date={[selectedReservation?.date || ""]}
						time={selectedReservation?.start_time || ""}
						location={`${selectedReservation?.field?.street || ""} ${selectedReservation?.field?.street_number || ""}, ${selectedReservation?.field?.neighborhood || ""}, ${selectedReservation?.field?.city || ""}`}
					/>
				</View>
			</Modal>
		</View>
	);
}

const styles = StyleSheet.create({
	buttonContainer: {
		marginTop: 10,
		padding: 10,
		borderRadius: 15,
		//		backgroundColor: "#CC0000",
		backgroundColor: "#223332",
		justifyContent: "center",
	},
	containter: {
		justifyContent: "space-between",
		padding: 20,
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
		borderRadius: 20,
		overflow: "hidden",
		width: "90%",
		maxWidth: 400,
	},
});
