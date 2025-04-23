interface infoProps {
	onClose: () => void;

	field_name: string;
	date: string;
	time: string;
	location: string;
}
import { useEffect, useRef, useState } from "react";
import { Alert, Text, View, TouchableOpacity, Image } from "react-native";
import { Button } from "@rneui/themed";

function ReservationInfo({ onClose, field_name, date, time, location }: infoProps) {
	return (
		<View
			style={{
				backgroundColor: "white",
				borderRadius: 20,
				justifyContent: "center",
				margin: 20,
				//color: "#00ff00",
				overflow: "hidden",
				padding: 10,
			}}
		>
			<TouchableOpacity style={{ alignItems: "flex-end" }} onPress={onClose}>
				<Image style={{ width: 20, height: 20, marginTop: 10 }} source={require("@/assets/images/close.png")} />
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
					marginTop: 10,
					padding: 10,
					borderRadius: 15,
					//		backgroundColor: "#CC0000",
					backgroundColor: "#223332",
					justifyContent: "center",
				}}
				title="Cancelar reserva"
				onPress={() => console.log("Reserva cancelada")}
			/>
		</View>
	);
}

export default ReservationInfo;
