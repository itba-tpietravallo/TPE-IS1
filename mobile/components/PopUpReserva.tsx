import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity, Modal } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { ScreenWidth } from "@rneui/themed/dist/config";
import { supabase } from "@/lib/supabase";
import CheckoutButton from "./CheckoutButton";
import { Star } from "lucide-react-native";
import PreReserveButton from "./PreReserveButton";

import {
	getAllReservationTimeSlots,
	getUserSession,
	getAllTeamsByUser,
	getUsername,
	getUserAuthSession,
	getFieldReviewsAvg,
	useInsertFieldReview,
	getCurrentUserFieldReview,
} from "@/lib/autogen/queries";
import Selector from "./Selector";
import StarRating from "./StarRating";

export type Renter = {
	id: string;
	name: string;
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
	const { data: session } = getUserAuthSession(supabase);
	const user = session?.user;
	const [isModalVisible, setIsModalVisible] = useState(false);
	const [selectedDateTime, setSelectedDateTime] = useState<Date>(new Date());
	const [unavailable, setUnavailability] = useState<boolean | null>(null);
	const [selectedRenter, setSelectedRenter] = useState<Renter | null>(null);
	const { data: teamData } = getAllTeamsByUser(supabase, user?.id!, { enabled: !!user?.id });
	const normalizedTeams = teamData ? teamData.filter((team) => team.team_id && team.name !== null) : [];
	const [rating, setRating] = useState(0);

	const teams: Renter[] = normalizedTeams.map((team) => ({
		id: team.team_id,
		name: team.name as string,
	}));

	const userName = getUsername(supabase, user?.id!, { enabled: !!user?.id });

	const renters: Renter[] = [
		...(user?.id && typeof userName.data === "string" ? [{ id: user.id, name: userName.data }] : []),
		...teams,
	];

	// const handleDateTimeChange = async (event: any, date?: Date) => {
	// 	if (event.type === "dismissed" || event.type === "set") {
	// 		setShow(false);
	// 	}

	// 	if (date && event.type === "set") {
	// 		setSelectedDateTime(date);

	// 		const taken = await isSlotUnavailable(fieldId, date);

	// 		setUnavailability(taken);
	// 		console.log(new Date().getTime());
	// 	}
	// };

	const handleDateTimeChange = async (event: any, date?: Date) => {
		if (date) {
			setSelectedDateTime(date);

			const taken = await isSlotUnavailable(fieldId, date);

			setUnavailability(taken);
			console.log(new Date().getTime());
		}
	};

	function isTeam(renter: Renter | null): boolean {
		if (!renter) return false;
		return teams.some((team) => team.id === renter.id);
	}

	const { data: currentReview } = getCurrentUserFieldReview(supabase, fieldId, user?.id!, { enabled: !!user?.id });
	const currentRating = currentReview?.rating ?? 0;

	useEffect(() => {
		if (currentReview) {
			setRating(currentRating);
		}
	}, [currentReview]);

	const { data } = getFieldReviewsAvg(supabase, fieldId);
	type Review = { rating: number };
	let average = 0;
	let count = 0;

	if (Array.isArray(data) && data.length > 0) {
		for (const review of data as Review[]) {
			count++;
			average = (average * (count - 1) + review.rating) / count;
		}
	}
	const formattedAverage = average.toFixed(1);

	const insertReviewMutation = useInsertFieldReview(supabase);
	const handleReview = async () => {
		if (rating == currentRating) {
			console.log("No changes in rating, skipping review insertion.");
			return;
		}
		try {
			await insertReviewMutation.mutateAsync([
				{
					field_id: fieldId,
					user_id: user?.id!,
					rating: rating,
				},
			]);
		} catch (error) {
			console.error("Error inserting review", error);
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
					<Star size={25} />
					<Text style={{ fontSize: 16, fontStyle: "italic" }}>{formattedAverage}</Text>
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

			<StarRating value={rating} onRate={(r) => setRating(r)} />
			{rating > 0 && (
				<TouchableOpacity onPress={handleReview} style={styles.submitButton}>
					<Text style={styles.submitReviewButtonText}>Calificar</Text>
				</TouchableOpacity>
			)}

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
			<Selector<Renter>
				title="Reservar como..."
				options={renters}
				onSelect={setSelectedRenter}
				initialLabel="Seleccionar"
				getLabel={(renter) => renter.name}
			/>

			{!selectedRenter && (
				<TouchableOpacity
					disabled
					style={{
						backgroundColor: "#ccc",
						paddingVertical: 14,
						alignItems: "center",
						marginTop: 20,
					}}
				>
					<Text style={{ color: "white", fontWeight: "bold", fontSize: 18 }}>Reservar</Text>
				</TouchableOpacity>
			)}

			{selectedRenter && isTeam(selectedRenter) && user?.id && (
				<PreReserveButton
					userId={user.id}
					fieldId={fieldId}
					fieldName={selectedRenter.name}
					teamId={selectedRenter.id}
					date_time={selectedDateTime.toISOString()}
				/>
			)}

			{selectedRenter && !isTeam(selectedRenter) && user?.id && (
				<CheckoutButton userId={user.id} fieldId={fieldId} date_time={selectedDateTime.toISOString()} />
			)}
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
	submitButton: {
		borderRadius: 25,
		alignSelf: "center",
		shadowColor: "#000",
		elevation: 5,
	},
	submitReviewButtonText: {
		fontWeight: "bold",
		paddingTop: 14,
		fontSize: 18,
		textAlign: "center",
	},
});

export default PopUpReserva;
