import { supabase } from "@/lib/supabase";
import React, { useMemo } from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome6";
import { useEffect, useState } from "react";
import { Session } from "@supabase/supabase-js";
import { router } from "expo-router";
import { getLastUserPayments, getUserSession } from "@lib/autogen/queries";

// const hardcodedPayments = [
// 	{ payment_id: "1", last_updated: "17/04/2025 18:21", status: "Pendiente", transaction_amount: "$9500" },
// 	{ payment_id: "2", last_updated: "09/04/2025 11:43", status: "Completado", transaction_amount: "$25000" },
// 	{ payment_id: "3", last_updated: "01/04/2025 18:21", status: "Pendiente", transaction_amount: "$10700" },
// 	{ payment_id: "4", last_updated: "28/03/2025 23:01", status: "Completado", transaction_amount: "$31200" },
// 	{ payment_id: "5", last_updated: "21/03/2025 15:41", status: "Completado", transaction_amount: "$18000" },
// 	{ payment_id: "6", last_updated: "12/03/2025 00:12", status: "Pendiente", transaction_amount: "$7450" },
// ];

export default function CardList() {
	const { data: user } = getUserSession(supabase);
	const { data: payments } = getLastUserPayments(supabase, user?.id!, { enabled: !!user?.id });
	let date: Date | undefined = undefined;
	let day: number | undefined = undefined;
	let month: number | undefined = undefined;
	let year: number | undefined = undefined;
	let hours: number | undefined = undefined;
	let minutes: number | undefined = undefined;

	const memoPayments = useMemo(() => {
		return (
			payments?.map((payment) => {
				date = new Date(payment.last_updated);
				day = date.getDay();
				month = date.getMonth() + 1;
				year = date.getFullYear();
				hours = date.getHours();
				minutes = date.getMinutes();
				payment.last_updated = `${day.toString().padStart(2, "0")}/${month.toString().padStart(2, "0")}/${year} a las ${hours}:${minutes.toString().padStart(2, "0")}`;

				if (payment.status == "payment.created") {
					payment.status = "Completado";
				}
				return payment;
			}) ?? []
		);
	}, [payments]);

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
							fontSize: 30,
							fontWeight: "bold",
							color: "#f18f01",
						}}
					>
						Actividad
					</Text>
				</View>
			</View>

			{memoPayments?.length === 0 ? (
				<Text style={{ textAlign: "center", marginTop: 40, fontSize: 18, color: "#555" }}>
					No has tenido actividad.
				</Text>
			) : (
				<FlatList
					data={memoPayments}
					keyExtractor={(item) => item.payment_id.toString()}
					contentContainerStyle={styles.container}
					scrollEnabled={true}
					renderItem={({ item }) => (
						<View style={styles.payment}>
							<Text style={styles.last_updated}>{item.last_updated}</Text>
							<View style={{ flexDirection: "row", justifyContent: "space-between" }}>
								<Text style={styles.transaction_amount}>{item.transaction_amount}</Text>
								<Text
									style={{
										fontWeight: "bold",
										fontSize: 18,
										color: item.status === "Completado" ? "#5fd700" : "#ff5e00",
									}}
								>
									{item.status}
								</Text>
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
		backgroundColor: "#223332",
		padding: 16,
		marginBottom: 16,
		borderRadius: 12,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 3, // for Android
	},
	transaction_amount: {
		fontSize: 22,
		fontWeight: "bold",
		color: "#f2f4f3",
		marginBottom: 4,
	},
	last_updated: {
		fontSize: 14,
		color: "#d9dcdb",
		marginBottom: 20,
	},
});
