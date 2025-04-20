import { supabase } from "@/lib/supabase";
import { Button, Image } from "@rneui/themed";
import { StyleSheet, Text, View } from "react-native";
import { useEffect, useState } from "react";
import { Session } from "@supabase/supabase-js";

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
		location: string;
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
					}
				});
		});
		if (user?.user.id) {
			// supabase
			// 	.from("users")
			// 	.select("*")
			// 	.eq("id", userId)
			// 	.single()
			// 	.then(({ data, error }) => {
			// 		if (error) {
			// 			console.error("Error fetching user:", error);
			// 		} else {
			// 			setUser(data);
			// 		}
			// 	});
			supabase
				.from("reservations")
				.select("*, field(*)")
				.eq("owner_id", userId)
				.order("date", { ascending: false })
				.then(({ data, error }) => {
					if (error) {
						console.error("Error fetching reservations:", error);
					} else {
						setReservations(data || []);
					}
				});
		}
	}, []);

	return (
		<View
			style={{
				flex: 1,
				justifyContent: "center",
				alignItems: "center",
			}}
		>
			<View
				style={{
					marginBottom: 20,
					justifyContent: "space-between",
					alignContent: "center",
				}}
			>
				<View style={{ padding: 20, alignContent: "center" }}>
					<Text
						style={{
							fontSize: 30,
							fontWeight: "bold",
							color: "gray",
							paddingBottom: 20,
						}}
					>
						Usuario:
					</Text>
					<View style={{ alignItems: "center" }}>
						<Image source={{ uri: user?.avatar_url }} style={{ width: 100, height: 100 }} />
						<Text style={{ fontSize: 30, fontWeight: "bold", paddingTop: 20 }}>{user?.full_name}</Text>
					</View>
				</View>
			</View>

			<View style={{ padding: 20, alignContent: "center" }}>
				<Text
					style={{
						fontSize: 30,
						fontWeight: "bold",
						color: "gray",
						paddingBottom: 20,
						textAlign: "left",
					}}
				>
					Mis reservas:
				</Text>
				{reservations.length > 0 ? (
					reservations.map((reservation) => (
						<View
							key={reservation.id}
							style={{
								marginBottom: 10,
								borderWidth: 1,
								borderColor: "#ccc",
								padding: 10,
								borderRadius: 5,
							}}
						>
							<Text style={{ fontWeight: "bold" }}>Cancha: {reservation.field?.name}</Text>
							<Text>Ubicación: {reservation.field?.location}</Text>
							<Text>Fecha: {reservation.date}</Text>
							<Text>Hora: {reservation.start_time}</Text>
						</View>
					))
				) : (
					<Text>No tienes reservas.</Text>
				)}
			</View>
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
	);
}

const styles = StyleSheet.create({
	buttonContainer: {
		marginTop: 10,
		padding: 10,
		borderRadius: 15,
		backgroundColor: "#CC0000",
	},
});
