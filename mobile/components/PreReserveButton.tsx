import { getTeamMembers, useInsertReservation } from "@lib/autogen/queries";
import { supabase } from "@/lib/supabase";
import { Animated, Easing, TouchableOpacity, View, Text, Modal, Button, Image } from "react-native";
import { useState, useRef, useEffect } from "react";

const ButtonStyles = {
	error: {
		backgroundColor: "#DC6464",
	},
	success: {
		backgroundColor: "#5fd700",
		text: "Pre-reservada",
	},
	pending: {
		backgroundColor: "#FFA500",
		text: "Reservando...",
	},
	failure: {
		backgroundColor: "#DC6464",
		text: "Pago rechazado",
	},
	default: {
		backgroundColor: "#f18f04",
		text: "Reservar",
	},
};

const styles = {
	warningTitle: {
		fontSize: 24,
		fontWeight: "bold" as const,
		color: "red",
		textAlign: "center" as const,
		marginBottom: 20,
	},
	warningInfo: {
		fontSize: 16,
		marginBottom: 20,
	},
};

export default function PreReserveButton({
	userId,
	fieldId,
	fieldName,
	teamId,
	date_time,
}: {
	userId: string;
	fieldId: string;
	fieldName: string;
	teamId: string;
	date_time: string;
}) {
	const [pending, setPending] = useState(false);
	const [isSuccess, setIsSuccess] = useState(false);
	const [confirmationVisible, showConfirmationModal] = useState(false);
	const confirmationResolveRef = useRef<(confirmed: boolean) => void>();
	const { data: teamMembersIds } = getTeamMembers(supabase, teamId!, { enabled: !!teamId });
	const insertReservationMutation = useInsertReservation(supabase);

	const spinValue = useRef(new Animated.Value(0)).current;

	useEffect(() => {
		Animated.loop(
			Animated.timing(spinValue, {
				toValue: 1,
				duration: 1000,
				easing: Easing.linear,
				useNativeDriver: true,
			}),
		).start();
	}, [spinValue]);

	const spin = spinValue.interpolate({
		inputRange: [0, 1],
		outputRange: ["0deg", "360deg"],
	});

	const preActionFunction = (): Promise<void> => {
		return new Promise((resolve, reject) => {
			confirmationResolveRef.current = (confirmed: boolean) => {
				showConfirmationModal(false);
				if (confirmed) {
					resolve();
				} else {
					reject();
				}
			};
			showConfirmationModal(true);
		});
	};

	async function handlePress() {
		if (teamMembersIds) {
			try {
				await preActionFunction();
				setPending(true);
			} catch {
				setPending(false);
				setIsSuccess(false);
				return;
			}

			console.log("About to insert reservation for field:", fieldId);

			try {
				await insertReservationMutation.mutateAsync({
					field_id: fieldId,
					date_time: date_time,
					owner_id: userId,
					team_id: teamId,
					bookers_count: teamMembersIds.players.length,
					pending_bookers_ids: teamMembersIds.players,
				});

				console.log("Reservation inserted successfully");
				setPending(false);
				setIsSuccess(true);
			} catch (error) {
				console.error("Error inserting reservation:", error);
				setPending(false);
				setIsSuccess(false);
			}
		} else {
			setPending(false);
		}
	}

	const bgColor = isSuccess
		? ButtonStyles.success.backgroundColor
		: pending
			? ButtonStyles.pending.backgroundColor
			: ButtonStyles.default.backgroundColor;

	const buttonText = isSuccess
		? ButtonStyles.success.text
		: pending
			? ButtonStyles.pending.text
			: ButtonStyles.default.text;

	return (
		<View>
			<Modal
				transparent
				animationType="fade"
				visible={confirmationVisible}
				onRequestClose={() => confirmationResolveRef.current?.(false)}
			>
				<View
					style={{
						flex: 1,
						justifyContent: "center",
						alignItems: "center",
						backgroundColor: "rgba(0,0,0,0.5)",
					}}
				>
					<View style={{ backgroundColor: "white", padding: 30, borderRadius: 12, width: "80%" }}>
						<Text style={styles.warningTitle}>Aviso</Text>
						<Text style={styles.warningInfo}>
							El pago se dividirá de forma equitativa entre todos los integrantes de{" "}
							<Text style={{ fontWeight: "bold" }}>{fieldName}</Text>.{"\n\n"}A cada integrante le
							aparecerá el pago como <Text style={{ fontWeight: "bold" }}>"Pendiente"</Text>.{"\n\n"}La
							reserva no estará confirmada hasta que todos hayan pagado su parte.
						</Text>

						<View style={{ flexDirection: "row", justifyContent: "center" }}>
							<View style={{ marginRight: 25 }}>
								<Button title="Cancelar" onPress={() => confirmationResolveRef.current?.(false)} />
							</View>
							<Button title="Continuar" onPress={() => confirmationResolveRef.current?.(true)} />
						</View>
					</View>
				</View>
			</Modal>

			<TouchableOpacity
				onPress={handlePress}
				disabled={pending || isSuccess}
				style={{
					backgroundColor: bgColor,
					paddingVertical: 14,
					opacity: pending ? 0.6 : 1,
					alignItems: "center",
					marginTop: 20,
					flexDirection: "row",
					justifyContent: "center",
				}}
			>
				<Text
					style={{
						color: "white",
						fontWeight: "bold",
						fontSize: 18,
					}}
				>
					{buttonText}
				</Text>

				{pending && (
					<Animated.View style={{ marginLeft: 10, transform: [{ rotate: spin }] }}>
						<Image
							source={require("@/assets/images/loader-circle.png")}
							style={{
								width: 20,
								height: 20,
								resizeMode: "contain",
							}}
						/>
					</Animated.View>
				)}
			</TouchableOpacity>
		</View>
	);
}
