import React from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome6";
import { router } from "expo-router";
import { supabase } from "@/lib/supabase";
import { getUserSession, getPendingReservationsByUser, getUserAuthSession } from "@/lib/autogen/queries";
import PayPending from "@components/PayPending";

export default function Pendings() {
	const { data: session } = getUserAuthSession(supabase);
	const user = session?.user;
	const { data: pendingReservations } = getPendingReservationsByUser(supabase, user?.id!, { enabled: !!user?.id });

	return (
		<View style={{ flex: 1, backgroundColor: "#f2f4f3", padding: 6 }}>
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
							fontSize: 30,
							fontWeight: "bold",
							color: "#f18f01",
						}}
					>
						Pendientes
					</Text>
				</View>
			</View>

			{pendingReservations?.length === 0 ? (
				<Text style={{ textAlign: "center", marginTop: 40, fontSize: 18, color: "#555" }}>
					No tienes pagos pendientes.
				</Text>
			) : (
				<FlatList
					data={pendingReservations}
					keyExtractor={(item) => item.id?.toString() ?? Math.random().toString()}
					contentContainerStyle={styles.container}
					scrollEnabled={true}
					renderItem={({ item }) => (
						<View style={styles.payment}>
							<View style={styles.rowBetween}>
								<View style={styles.column}>
									<Text style={styles.amount}>
										{(() => {
											const splitPriceNumber =
												Math.round((item.fields.price / item.bookers_count) * 100) / 100;
											return Number.isInteger(splitPriceNumber)
												? `$${splitPriceNumber.toString()}`
												: `$${splitPriceNumber.toFixed(2)}`;
										})()}
									</Text>

									{item.teams && <Text style={styles.teamName}>Equipo: {item.teams.name}</Text>}

									<Text style={styles.fieldName}>Cancha: {item.fields.name}</Text>
								</View>

								<PayPending
									reservationId={item.id}
									fieldId={item.fields.id}
									date_time={item.date_time}
									price={Math.round((item.fields.price / item.bookers_count) * 100) / 100}
								/>
							</View>
						</View>
					)}
				/>
			)}
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		padding: 16,
		paddingBottom: 90,
	},
	payment: {
		backgroundColor: "#1e2c2b",
		padding: 16,
		marginBottom: 16,
		borderRadius: 16,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.05,
		shadowRadius: 4,
		elevation: 2,
	},

	rowBetween: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},

	column: {
		flexDirection: "column",
	},

	amount: {
		fontSize: 20,
		fontWeight: "600",
		color: "#f2f4f3",
		marginBottom: 10,
	},

	fieldName: {
		fontSize: 16,
		color: "#aaa",
	},

	teamName: {
		fontSize: 18,
		color: "#ccc",
		marginBottom: 5,
	},
});
