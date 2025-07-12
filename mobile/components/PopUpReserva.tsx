import React, { useState } from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity, Modal, Platform, ScrollView } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { ScreenHeight, ScreenWidth } from "@rneui/themed/dist/config";
import { supabase } from "@/lib/supabase";
import CheckoutButton from "./CheckoutButton";
import PreReserveButton from "./PreReserveButton";
import Icon from "react-native-vector-icons/FontAwesome6";

import {
	getAllReservationTimeSlots,
	getAllTeamsByAdminUser,
	getUsername,
	getUserAuthSession,
	getUserPreferencesByUserId,
	getFieldById,
	useUpsertUserPreferences,
} from "@/lib/autogen/queries";
import Selector from "./Selector";

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
	const { data: teamData } = getAllTeamsByAdminUser(supabase, user?.id!, { enabled: !!user?.id });
	const { data: userName } = getUsername(supabase, user?.id!, { enabled: !!user?.id });
	const { data: reservations } = getAllReservationTimeSlots(supabase, fieldId);
	const [isModalVisible, setIsModalVisible] = useState(false);
	const [currentImageIndex, setCurrentImageIndex] = useState(0);
	const [selectedDateTime, setSelectedDateTime] = useState<Date>(new Date());
	const [selectedShiftedDateTime, setSelectedShiftedDateTime] = useState<Date>(new Date());
	const [unavailable, setUnavailability] = useState<boolean | null>(null);
	const [selectedRenter, setSelectedRenter] = useState<Renter | null>(null);
	const normalizedTeams = teamData ? teamData.filter((team) => team.team_id && team.name !== null) : [];
	const { data: fieldData } = getFieldById(supabase, fieldId, { enabled: !!fieldId });

	const timezone = "America/Argentina/Buenos_Aires";

	const { data: userPreferences } = getUserPreferencesByUserId(supabase, user?.id!);
	const upsertUserPreferences = useUpsertUserPreferences(supabase);

	const teams: Renter[] = normalizedTeams.map((team) => ({
		id: team.team_id,
		name: team.name as string,
	}));

	const renters: Renter[] = [
		...(user?.id && userName && typeof userName.username === "string"
			? [{ id: user.id, name: userName.username }]
			: []),
		...teams,
	];

	const minimumDate = new Date(Date.now());
	minimumDate.setHours(Number((fieldData?.opening_hour ?? "09:00").split(":")[0]) || 9, 0, 0, 0);

	const maximumDate = new Date(Date.now());
	maximumDate.setHours(Number((fieldData?.closing_hour ?? "20:00").split(":")[0]) || 20, 0, 0, 0);

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
		if (!date) return;

		date.getHours() < minimumDate.getHours() && date.setHours(minimumDate.getHours(), 0, 0, 0);
		date.getHours() > maximumDate.getHours() && date.setHours(maximumDate.getHours(), 0, 0, 0);
		setSelectedDateTime(date);

		const offset = getOffsetHours(date, timezone);
		setSelectedShiftedDateTime(new Date(date.getTime() - offset * 60 * 60 * 1000));

		const taken = isSlotUnavailable(selectedShiftedDateTime, reservations ?? undefined);

		setUnavailability(taken);
	};

	function getOffsetHours(date: Date, timeZone: string) {
		const dtf = new Intl.DateTimeFormat("en-US", {
			timeZone,
			hour12: false,
			year: "numeric",
			month: "2-digit",
			day: "2-digit",
			hour: "2-digit",
			minute: "2-digit",
			second: "2-digit",
		});

		const parts = dtf.formatToParts(date);
		const map: Record<string, string> = {};
		for (const { type, value } of parts) {
			map[type] = value;
		}

		const localDateStr = `${map.year}-${map.month}-${map.day}T${map.hour}:${map.minute}:${map.second}`;
		const localDate = new Date(localDateStr + "Z"); // treat local time as UTC temporarily

		const offsetMs = date.getTime() - localDate.getTime();
		return offsetMs / (1000 * 60 * 60); // offset in hours
	}

	function isTeam(renter: Renter | null): boolean {
		if (!renter) return false;
		return teams.some((team) => team.id === renter.id);
	}

	const handleManageFavorites = async (field: string) => {
		var updatedFavorites;
		if (!fieldIsFavorite(field)) {
			updatedFavorites = [...(userPreferences?.fav_fields || []), field];
		} else {
			updatedFavorites = userPreferences?.fav_fields.filter((item) => item !== field);
		}

		try {
			await upsertUserPreferences.mutateAsync([
				{
					user_id: user?.id!,
					fav_fields: updatedFavorites!,
					fav_users: userPreferences?.fav_users || [],
					team_invites: userPreferences?.team_invites || [],
				},
			]);

			console.log("managed favorites");
		} catch (error) {
			console.error("Error managing fav field:", error);
		}
	};

	function fieldIsFavorite(fieldId: string) {
		if (userPreferences?.fav_fields.includes(fieldId)) {
			return true;
		}
		return false;
	}

	const [showDatePicker, setShowDatePicker] = useState(false);
	const [showTimePicker, setShowTimePicker] = useState(false);

	return (
		<View style={styles.modalView}>
			<View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
				{/* Boton cerrar PopUp */}
				<TouchableOpacity style={{ padding: 10, alignItems: "flex-start", marginLeft: 10 }} onPress={onClose}>
					<Icon name="xmark" size={24} color="black" style={{ marginTop: 10 }} />
				</TouchableOpacity>

				{/* Boton agregar a favoritos */}
				<TouchableOpacity
					style={{ padding: 10, alignItems: "flex-start", marginLeft: 10 }}
					onPress={() => {
						handleManageFavorites(fieldId);
					}}
				>
					<Icon
						name={fieldIsFavorite(fieldId) ? "heart-circle-check" : "heart"}
						size={24}
						color="black"
						style={{ marginTop: 10 }}
					/>
				</TouchableOpacity>
			</View>
			<View style={{ flex: 1, justifyContent: "space-between" }}>
				<ScrollView contentContainerStyle={[styles.mainInfo, { flexGrow: 1 }]} bounces={false}>
					<View style={styles.topInfo}>
						<View style={{ flex: 1, paddingRight: 10, alignItems: "flex-start" }}>
							<Text
								style={{
									fontSize: 24,
									fontWeight: "bold",
									justifyContent: "center",
								}}
							>
								{name}
							</Text>
							<Text style={{ fontSize: 16, color: "gray", margin: 10 }}>{sport.join(", ")} </Text>
						</View>
						{images && images.length > 0 && (
							<TouchableOpacity
								onPress={() => {
									setCurrentImageIndex(0);
									setIsModalVisible(true);
								}}
							>
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
										<View style={{ alignItems: "center" }}>
											<TouchableOpacity
												style={{ alignSelf: "flex-start", marginBottom: 10 }}
												onPress={() => setIsModalVisible(false)}
											>
												<Icon name="xmark" size={30} color="white" />
											</TouchableOpacity>
											<View style={{ flexDirection: "row", alignItems: "center" }}>
												<TouchableOpacity
													onPress={() =>
														setCurrentImageIndex((prev) => Math.max(0, prev - 1))
													}
													disabled={currentImageIndex === 0}
												>
													<Icon
														name="chevron-left"
														size={30}
														color={currentImageIndex === 0 ? "grey" : "white"}
														style={{ marginRight: 5 }}
													/>
												</TouchableOpacity>
												<Image
													style={{
														width: ScreenWidth * 0.7,
														height: ScreenWidth * 0.7,
														borderRadius: 10,
													}}
													source={{ uri: images[currentImageIndex] }}
													resizeMode="contain"
												/>
												<TouchableOpacity
													onPress={() =>
														setCurrentImageIndex((prev) =>
															Math.min(images.length - 1, prev + 1),
														)
													}
													disabled={currentImageIndex === images.length - 1}
												>
													<Icon
														name="chevron-right"
														size={30}
														color={
															currentImageIndex === images.length - 1 ? "grey" : "white"
														}
														style={{ marginLeft: 5 }}
													/>
												</TouchableOpacity>
											</View>
										</View>
									</View>
								</Modal>
							</TouchableOpacity>
						)}
					</View>
					<View style={{ flexDirection: "row", alignItems: "center" }}>
						<Image style={{ width: 25, height: 25 }} source={require("@/assets/images/cancha.png")} />
						<Text style={{ fontSize: 16, fontStyle: "italic" }}>{location}</Text>
					</View>
					<View style={{ alignSelf: "flex-start", marginTop: 20 }}>
						<Text style={styles.label}>Descripción</Text>
						<Text numberOfLines={2} ellipsizeMode="tail" style={styles.descriptionText}>
							{description}
						</Text>
						<Text style={styles.label}>Precio</Text>
						<Text style={styles.priceText}>${price}</Text>
					</View>
					{/*Funciona en IOS ......................................................................................*/}
					{Platform.OS === "ios" && (
						<View style={styles.selection}>
							<View>
								<Text style={styles.label}>Seleccionar fecha</Text>
								<DateTimePicker value={selectedDateTime} mode="date" onChange={handleDateTimeChange} />
							</View>

							<View>
								<Text style={styles.label}>Seleccionar hora</Text>
								<DateTimePicker
									value={selectedDateTime}
									minimumDate={minimumDate}
									maximumDate={maximumDate}
									mode="time"
									minuteInterval={30}
									onChange={handleDateTimeChange}
								/>
							</View>
						</View>
					)}
					{/* .......................................................................................................*/}
					{/*funciona en android -------------------------------------------------------------------------------------*/}
					{Platform.OS === "android" && (
						<View style={styles.selection}>
							<View>
								<Text style={styles.label}>Seleccionar fecha</Text>
								<TouchableOpacity
									onPress={() => setShowDatePicker(true)}
									style={{
										borderWidth: 1,
										borderRadius: 5,
										borderColor: "#ccc",
										padding: 10,
									}}
								>
									<Text>{selectedDateTime.toLocaleDateString()}</Text>
								</TouchableOpacity>
								{showDatePicker && (
									<DateTimePicker
										value={selectedDateTime}
										mode="date"
										display="default"
										onChange={(event, date) => {
											setShowDatePicker(false);
											if (date) handleDateTimeChange(event, new Date(date));
										}}
									/>
								)}
							</View>

							<View>
								<Text style={styles.label}>Seleccionar hora</Text>
								<TouchableOpacity
									onPress={() => setShowTimePicker(true)}
									style={{
										borderWidth: 1,
										borderRadius: 5,
										borderColor: "#ccc",
										padding: 10,
									}}
								>
									<Text>
										{selectedDateTime.toLocaleTimeString([], {
											hour: "2-digit",
											minute: "2-digit",
										})}
									</Text>
								</TouchableOpacity>
								{showTimePicker && (
									<DateTimePicker
										value={selectedDateTime}
										mode="time"
										display="default"
										minuteInterval={30}
										minimumDate={minimumDate}
										maximumDate={maximumDate}
										onChange={(event, date) => {
											setShowTimePicker(false);
											if (date) handleDateTimeChange(event, new Date(date));
										}}
									/>
								)}
							</View>
						</View>
					)}
					{/* ----------------------------------------------------------------------------------------- */}

					{unavailable && (
						<Text style={{ marginBottom: 10, marginTop: 8, color: "red" }}>
							Fecha y horario no disponibles.
						</Text>
					)}
					{!unavailable && (
						<Text style={{ marginBottom: 10, marginTop: 8, color: "green" }}>
							Fecha y horario disponibles.
						</Text>
					)}

					<Selector<Renter>
						title="Reservar como..."
						options={renters}
						onSelect={setSelectedRenter}
						initialLabel="Seleccionar"
						getLabel={(renter) => renter.name}
					/>
				</ScrollView>

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

				{selectedRenter && !unavailable && isTeam(selectedRenter) && user?.id && (
					<PreReserveButton
						userId={user.id}
						fieldId={fieldId}
						fieldName={selectedRenter.name}
						teamId={selectedRenter.id}
						date_time={selectedShiftedDateTime.toISOString()}
					/>
				)}

				{selectedRenter && !unavailable && !isTeam(selectedRenter) && user?.id && (
					<CheckoutButton
						userId={user.id}
						fieldId={fieldId}
						date_time={selectedShiftedDateTime.toISOString()}
					/>
				)}
			</View>
		</View>
	);
}

function isSlotUnavailable(selectedShiftedDateTime: Date, reservations: { date_time: string }[] | undefined): boolean {
	if (!reservations) {
		return false;
	}

	const isTaken = reservations.some((reservation) => {
		const reservationDate = new Date(reservation.date_time);

		return reservationDate.getTime() === selectedShiftedDateTime.getTime();
	});

	return !!isTaken;
}

const styles = StyleSheet.create({
	modalView: {
		backgroundColor: "#fff",
		borderRadius: 20,
		width: ScreenWidth * 0.9,
		height: ScreenHeight * 0.75,
		alignSelf: "center",
		overflow: "hidden",
	},

	mainInfo: {
		paddingHorizontal: 20,
		paddingBottom: 20,
	},

	topInfo: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: 10,
	},

	selection: {
		marginTop: 20,
		flexDirection: "row",
		justifyContent: "space-between",
		gap: 16,
	},

	select: {
		fontWeight: "600",
		fontSize: 16,
		marginBottom: 10,
	},

	selected: {
		backgroundColor: "#fff",
		borderWidth: 1,
		borderColor: "#ccc",
		borderRadius: 12,
		paddingHorizontal: 12,
		height: 40,
		justifyContent: "center",
	},

	descriptionText: {
		fontSize: 16,
		color: "#555",
		lineHeight: 22,
		marginBottom: 12,
	},

	priceText: {
		fontSize: 16,
		color: "#555",
	},

	descriptionContainer: {
		marginTop: 10,
	},

	fieldInfo: {
		flexDirection: "row",
		alignItems: "center",
		marginTop: 10,
	},

	fieldLocationText: {
		fontSize: 16,
		fontStyle: "italic",
		marginLeft: 8,
		color: "#444",
	},

	fieldTitle: {
		fontSize: 28,
		fontWeight: "700",
		textAlign: "center",
		marginBottom: 6,
	},

	fieldSubtitle: {
		fontSize: 16,
		color: "#777",
		textAlign: "center",
	},
	image: {
		width: 120,
		height: 120,
		borderRadius: 15,
		marginLeft: 10,
	},
	availabilityText: {
		marginTop: 8,
		marginBottom: 10,
		marginLeft: 4,
		fontSize: 14,
	},
	buttonDisabled: {
		backgroundColor: "#ccc",
		paddingVertical: 14,
		alignItems: "center",
		borderRadius: 10,
		marginHorizontal: 20,
		marginTop: 10,
	},
	buttonText: {
		color: "#fff",
		fontWeight: "bold",
		fontSize: 18,
	},
	closeButtonContainer: {
		padding: 20,
		alignItems: "flex-start",
	},
	modalImageContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "rgba(0,0,0,0.8)",
		padding: 20,
	},
	modalImage: {
		width: ScreenWidth * 0.8,
		height: ScreenWidth * 0.8,
		borderRadius: 10,
		marginBottom: 20,
	},
	label: {
		fontWeight: "bold",
		color: "#555",
		fontSize: 16,
		marginRight: 5,
		paddingBottom: 5,
	},
});

export default PopUpReserva;
