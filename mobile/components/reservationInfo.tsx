interface infoProps {
	onClose: () => void;

	field_name: string;
	date: string;
	time: string;
	location: string;
	id: string;
}

import { useEffect, useRef, useState } from "react";
import { Alert, Text, View, TouchableOpacity, Image } from "react-native";
import { Button } from "@rneui/themed";
import { supabase } from "@/lib/supabase";
import { getUserReservations, queries, useDeleteReservation } from "@/lib/autogen/queries";
import Icon from "react-native-vector-icons/FontAwesome6";
import { MODE_BASE_URL } from "@lib/mode";

function ReservationInfo({ onClose, field_name, date, time, location, id }: infoProps) {
	const deleteReservation = useDeleteReservation(supabase);

	const handleCancelation = async () => {
		try {
			const reservation = await queries.getUserReservations(supabase, id).then((res) => res.data?.filter((r) => r.id === id)[0]);
			const owner = await queries.getUserSession(supabase, reservation?.owner_id || "").then((res) => res.data);

			if (!reservation) {
				Alert.alert("Error", "Reserva no encontrada");
				return;
			}

			await deleteReservation.mutateAsync({ id });

			await fetch(new URL("api/v1/send-email", MODE_BASE_URL).toString(), {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					type: "cancelled_reservation",
					player_email: owner?.email || "",
					player_name: owner?.full_name || "",
					payment_id: reservation.payments_ids?.[0] || "",
					field_name: reservation.field.name,
					reservation_date: reservation?.date_time,
				})
			});
			Alert.alert("Cancelación exitosa", "Reserva cancelada con éxito");
			onClose();
		} catch (error) {
			Alert.alert("Error", "No se pudo cancelar la reserva");
			console.error(error);
		}
	};

	return (
		<View
			style={{
				backgroundColor: "white",
				borderRadius: 20,
				justifyContent: "center",
				margin: 20,
				//color: "#00ff00",
				overflow: "hidden",
				padding: 20,
			}}
		>
			<TouchableOpacity style={{ alignItems: "flex-start" }} onPress={onClose}>
				<Icon name="xmark" size={22} color="#333" />
			</TouchableOpacity>

			<View style={{ padding: 20 }}>
				<View
					style={{
						flexDirection: "row",
						paddingBottom: 10,
						alignContent: "center",
						alignItems: "center",
						justifyContent: "center",
					}}
				>
					<Text style={{ fontWeight: "bold", fontSize: 24, paddingBottom: 20 }}>{field_name}</Text>
				</View>
				<View style={{ flexDirection: "row", paddingBottom: 10, alignContent: "center", alignItems: "center" }}>
					<Text style={{ color: "gray" }}>Fecha: </Text>
					<Text style={{ fontSize: 16 }}>{date}</Text>
				</View>
				<View style={{ flexDirection: "row", paddingBottom: 10, alignContent: "center", alignItems: "center" }}>
					<Text style={{ color: "gray" }}>Horario: </Text>
					<Text style={{ fontSize: 16 }}>{time}</Text>
				</View>
				<View
					style={{
						flexDirection: "row",
						paddingBottom: 10,
						alignContent: "center",
						alignItems: "center",
						flexWrap: "wrap",
					}}
				>
					<Text style={{ color: "gray" }}>Dirección: </Text>
					<Text
						style={{
							fontSize: 16,
							flexWrap: "wrap", // Permite que el texto salte a la siguiente línea
						}}
					>
						{location}
					</Text>
				</View>
			</View>

			<Button
				buttonStyle={{
					padding: 10,
					borderRadius: 15,
					alignSelf: "center",
					backgroundColor: "#223332",
					justifyContent: "center",

					marginBottom: 20,
				}}
				titleStyle={{
					fontSize: 16,
				}}
				title="Cancelar reserva"
				onPress={handleCancelation}
			/>
		</View>
	);
}

export default ReservationInfo;
