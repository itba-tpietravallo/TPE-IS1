import React from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome6";
import { router } from "expo-router";
import { supabase } from "@/lib/supabase";
import { getUserAuthSession, getPendingReservationsByUser } from "@/lib/autogen/queries";
import PayPending from "@components/PayPending";

export default function Pendings() {
	const { data: session } = getUserAuthSession(supabase);
	const user = session?.user;
	const { data: pendingReservations } = getPendingReservationsByUser(supabase, user?.id!, {
		enabled: !!user?.id,
	});

	return (
		<View style={styles.page}>
			{/* Header */}
			<View style={styles.header}>
				<TouchableOpacity onPress={() => router.push("/(tabs)/profile")} style={styles.backButton}>
					<Icon name="arrow-left" size={18} color="#262626" />
				</TouchableOpacity>

				<Text style={styles.title}>Pendientes</Text>
			</View>

			{/* Content */}
			{pendingReservations?.length === 0 ? (
				<Text style={styles.emptyText}>No tienes pagos pendientes.</Text>
			) : (
				<FlatList
					data={pendingReservations}
					keyExtractor={(item) => item.id?.toString() ?? Math.random().toString()}
					contentContainerStyle={styles.container}
					renderItem={({ item }) => {
						const splitPrice = Math.round((item.fields.price / item.bookers_count) * 100) / 100;
						const formattedPrice = Number.isInteger(splitPrice)
							? `$${splitPrice}`
							: `$${splitPrice.toFixed(2)}`;

						return (
							<View style={styles.card}>
								<View style={styles.row}>
									<View style={styles.cardContent}>
										<Text style={styles.amount}>{formattedPrice}</Text>
										{item.teams && <Text style={styles.teamName}>Equipo: {item.teams.name}</Text>}
										<Text style={styles.fieldName}>Cancha: {item.fields.name}</Text>
									</View>

									<View style={styles.buttonWrapper}>
										<PayPending
											reservationId={item.id}
											fieldId={item.fields.id}
											date_time={item.date_time}
											price={splitPrice}
										/>
									</View>
								</View>
							</View>
						);
					}}
				/>
			)}
		</View>
	);
}

const styles = StyleSheet.create({
	page: {
		flex: 1,
		backgroundColor: "#f2f4f3",
		padding: 6,
	},
	header: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		paddingVertical: 15,
		paddingHorizontal: 10,
		position: "relative",
	},
	backButton: {
		position: "absolute",
		left: 10,
		padding: 10,
	},
	title: {
		fontSize: 26,
		fontWeight: "bold",
		color: "#f18f01",
	},
	container: {
		padding: 16,
		paddingBottom: 100,
	},
	emptyText: {
		textAlign: "center",
		marginTop: 40,
		fontSize: 18,
		color: "#555",
	},
	card: {
		backgroundColor: "#fff",
		borderRadius: 12,
		padding: 20,
		marginBottom: 16,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 3,
	},
	cardHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 10,
	},
	amount: {
		fontSize: 20,
		fontWeight: "600",
		color: "#223332",
		marginBottom: 10,
	},
	teamName: {
		fontSize: 16,
		color: "#444",
		marginBottom: 4,
	},
	fieldName: {
		fontSize: 15,
		color: "#777",
	},
	row: {
		flexDirection: "row",
		alignItems: "center", // <-- key to vertical centering
		justifyContent: "space-between",
	},

	cardContent: {
		flex: 1,
		paddingRight: 12,
	},

	buttonWrapper: {
		justifyContent: "center",
		alignItems: "center",
	},
});
