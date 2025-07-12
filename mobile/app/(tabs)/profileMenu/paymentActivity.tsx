import { supabase } from "@/lib/supabase";
import React, { useMemo } from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome6";
import { useEffect, useState } from "react";
import { Session } from "@supabase/supabase-js";
import { router } from "expo-router";
import { getLastUserPayments, getUserSession, getUserAuthSession } from "@lib/autogen/queries";

// const hardcodedPayments = [
// 	{ payment_id: "1", last_updated: "17/04/2025 18:21", status: "Pendiente", transaction_amount: "$9500" },
// 	{ payment_id: "2", last_updated: "09/04/2025 11:43", status: "Completado", transaction_amount: "$25000" },
// 	{ payment_id: "3", last_updated: "01/04/2025 18:21", status: "Pendiente", transaction_amount: "$10700" },
// 	{ payment_id: "4", last_updated: "28/03/2025 23:01", status: "Completado", transaction_amount: "$31200" },
// 	{ payment_id: "5", last_updated: "21/03/2025 15:41", status: "Completado", transaction_amount: "$18000" },
// 	{ payment_id: "6", last_updated: "12/03/2025 00:12", status: "Pendiente", transaction_amount: "$7450" },
// ];

export default function CardList() {
	const { data: session } = getUserAuthSession(supabase);
	const user = session?.user;
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
				return {
					...payment,
					status: payment.status === "payment.created" ? "Completado" : payment.status,
				};
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
							fontSize: 26,
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
						<View style={styles.card}>
							<Text style={styles.last_updated}>
								{new Date(item.last_updated).toLocaleDateString("es-ES", {
									year: "numeric",
									month: "short",
									day: "numeric",
								})}
								{" • "}
								{new Date(item.last_updated).toLocaleTimeString("es-ES", {
									hour: "2-digit",
									minute: "2-digit",
								})}
							</Text>
							<View style={{ flexDirection: "row", justifyContent: "space-between" }}>
								<Text style={styles.transaction_amount}>${item.transaction_amount}</Text>
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
		paddingBottom: 100,
	},
	card: {
		backgroundColor: "#fff",
		borderRadius: 12,
		padding: 24,
		marginBottom: 12,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 3,
	},
	transaction_amount: {
		fontSize: 18,
		fontWeight: "bold",
		color: "#262626",
	},
	last_updated: {
		marginBottom: 8,
		fontSize: 14,
		color: "#555",
	},
});
