import React, { useState, useEffect, useRef } from "react";
import { View, Text, Button, StyleSheet, Image, TouchableOpacity, Modal, Alert } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { ScreenWidth } from "@rneui/themed/dist/config";
import { supabase } from "@/lib/supabase";
import { Session } from "@supabase/supabase-js";
import CheckoutButton from "./CheckoutButton";

import { getAllReservationTimeSlots, getUserSession } from "@/lib/autogen/queries";

type User = {
	id: string;
	full_name: string;
	avatar_url: string;
};

interface PopUpReservaProps {
	onClose: () => void;

	name: string;
	fieldId: string;
	sport: string[];
	location: string;
	images: string[];
	description: string;
	price: number;
}

function PopUpReserva({ onClose, name, fieldId, sport, location, images, description, price }: PopUpReservaProps) {
	const { data: user } = getUserSession(supabase);
	const [isModalVisible, setIsModalVisible] = useState(false);
	const [selectedDateTime, setSelectedDateTime] = useState<Date>(new Date());
	const [unavailable, setUnavailability] = useState<boolean | null>(null);

	const handleDateTimeChange = async (event: any, date?: Date) => {
		if (date) {
			setSelectedDateTime(date);

			const taken = await isSlotUnavailable(fieldId, date);

			setUnavailability(taken);
			console.log(new Date().getTime());
		}
	};

	return (
		<View style={styles.modalView}>
			<TouchableOpacity style={{ padding: 10, alignItems: "flex-end" }} onPress={onClose}>
				<Image style={{ width: 20, height: 20, marginTop: 10 }} source={require("@/assets/images/close.png")} />
			</TouchableOpacity>

			<View style={styles.mainInfo}>
				<View style={styles.topInfo}>
					<View style={{ flex: 1, paddingRight: 10, alignItems: "center" }}>
						<Text
							style={{
								fontSize: 32,
								fontWeight: "bold",
								justifyContent: "center",
							}}
						>
							{name}
						</Text>
						<Text style={{ fontSize: 16, color: "gray", marginBottom: 10 }}>{sport.join(", ")} </Text>
					</View>
					<TouchableOpacity onPress={() => setIsModalVisible(true)}>
						<Image
							style={{
								width: 120,
								height: 120,
								marginTop: 10,
								marginRight: 10,
								borderRadius: 15,
							}}
							source={{ uri: images[0] }}
						/>
						<Modal
							style={{
								backgroundColor: "white",
								borderRadius: 20,
								justifyContent: "center",
								margin: 20,
								overflow: "hidden",
								flex: 1,
							}}
							visible={isModalVisible}
							transparent={true}
							onRequestClose={() => setIsModalVisible(false)}
						>
							{/* <View
              style={{
                fontSize: 32,
                fontWeight: "bold",
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "white",
                flexDirection: "column",
                margin: 10,
                }}
                ></View> */}
							<View
								style={{
									flex: 1,
									justifyContent: "center",
									alignItems: "center",
									backgroundColor: "rgba(0,0,0,0.8)", // Semi-transparent background
									padding: 20,
								}}
							>
								<View>
									<TouchableOpacity style={{ alignItems: "flex-end" }} onPress={onClose}>
										<Image
											style={{ width: 20, height: 20, marginTop: 10 }}
											source={require("@/assets/images/close_white.png")}
										/>
									</TouchableOpacity>
									{images.map((uri, index) => (
										<Image
											key={index}
											style={{
												width: ScreenWidth * 0.8,
												height: ScreenWidth * 0.8,
												borderRadius: 10,
												marginBottom: 20,
											}}
											source={{ uri: uri }}
											resizeMode="contain"
										/>
									))}
								</View>
							</View>
						</Modal>
					</TouchableOpacity>
				</View>
				<View style={{ flexDirection: "row", alignItems: "center" }}>
					<Image style={{ width: 25, height: 25 }} source={require("@/assets/images/cancha.png")} />
					<Text style={{ fontSize: 16, fontStyle: "italic" }}>{location}</Text>
				</View>
			</View>
			<Text style={{ padding: 20, paddingBottom: 0, fontSize: 18 }}>Descripción:</Text>
			<Text
				style={{
					fontSize: 16,
					color: "gray",
					flexWrap: "wrap",
					padding: 20,
					paddingTop: 0,
				}}
			>
				{description}
			</Text>
			<Text style={{ padding: 20, fontSize: 18 }}>Precio: ${price}</Text>

			{/* ---------------------------------- Funciona en IOS??????? -------------------------------- */}
			<View style={styles.selection}>
				<View>
					<Text style={styles.select}>Seleccionar fecha:</Text>
					<DateTimePicker value={selectedDateTime} mode="date" onChange={handleDateTimeChange} />
				</View>

				<View>
					<Text style={styles.select}>Seleccionar hora:</Text>
					<DateTimePicker
						value={selectedDateTime}
						mode="time"
						minuteInterval={30}
						onChange={handleDateTimeChange}
					/>
				</View>
			</View>

			{unavailable && (
				<Text style={{ marginLeft: 20, marginBottom: 10, marginTop: 8, color: "red" }}>
					Fecha y horario no disponibles.
				</Text>
			)}

			{!unavailable && (
				<Text style={{ marginLeft: 20, marginBottom: 10, marginTop: 8, color: "green" }}>
					Fecha y horario disponibles.
				</Text>
			)}

			{/* ---------------------------------- Funciona(ish) en Android --------------------------------*/}
			{/* ... */}
			{/* ---------------------------------- ------------------------ --------------------------------*/}

			<CheckoutButton fieldId={fieldId} date_time={selectedDateTime.toISOString()} />
		</View>
	);
}

async function isSlotUnavailable(fieldId: string, selectedDateTime: Date): Promise<boolean> {
	const { data, error } = await getAllReservationTimeSlots(supabase, fieldId);

	if (error) {
		console.error("Error checking availability:", error);
		return false;
	}

	const isTaken = data?.some((reservation) => {
		const reservationDate = new Date(reservation.date_time);
		reservationDate.setUTCHours(reservationDate.getUTCHours() + reservationDate.getTimezoneOffset() / 60);

		return reservationDate.getTime() === selectedDateTime.getTime();
	});

	return !!isTaken;
}

const styles = StyleSheet.create({
	modalView: {
		backgroundColor: "white",
		borderRadius: 20,
		justifyContent: "center",
		margin: 20,
		color: "#00ff00",
		overflow: "hidden",
		width: ScreenWidth * 0.9,
	},
	mainInfo: {
		justifyContent: "center",
		alignItems: "center",
		paddingBottom: 20,
	},
	topInfo: {
		paddingTop: 5,
		padding: 20,
		flexDirection: "row",
		justifyContent: "center",
		alignItems: "center",
	},
	selection: {
		padding: 20,
		gap: 30,
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
	select: {
		fontWeight: "bold",
		fontSize: 16,
		marginBottom: 10,
	},
	selected: {
		backgroundColor: "white",
		borderWidth: 1,
		borderColor: "#747775",
		borderRadius: 20,
		paddingHorizontal: 12,
		height: 20,
		flexDirection: "row",
	},
});

export default PopUpReserva;
