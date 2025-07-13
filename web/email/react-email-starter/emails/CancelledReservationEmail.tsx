import { Body, Container, Head, Heading, Html, Img, Section, Tailwind, Text } from "@react-email/components";

interface CancelledReservationEmailProps {
	player_name: string;
	amount: number;
	payment_id: string;
	field_name: string;
	reservation_date: Date;
	confirmed?: boolean;
}

export function CancelledReservationEmail({
	player_name,
	amount,
	payment_id,
	field_name,
	reservation_date,
	confirmed,
}: CancelledReservationEmailProps) {
	const date = reservation_date.toLocaleDateString("es-ES", {
		day: "2-digit",
		month: "long",
		year: "numeric",
	});

	const time = new Date(reservation_date.getTime() - 3 * 60 * 60 * 1000).toLocaleTimeString("es-ES", {
		hour: "2-digit",
		minute: "2-digit",
		hour12: false,
	});

	return (
		<Html>
			<Head />
			<Tailwind>
				<Body className="bg-white px-2 font-sans">
					<Section className="">
						<Img
							src="https://storage.googleapis.com/email-images-matchpointapp/matchpoint-logo.png"
							alt="MatchPoint Logo"
							className="h-[45px] w-auto"
						/>
					</Section>
					<Container className="mx-auto my-[20px] max-w-[465px] rounded border border-solid border-[#eaeaea]">
						<Container className="rounded-t bg-[#dc3545]">
							<Heading className="mx-0 my-[30px] p-0 text-center text-[28px] font-normal text-white">
								Reserva cancelada 😔
							</Heading>
						</Container>
						<Section className="bg-[#f2f4f3] p-4 text-[#223332]">
							<Text className="text-[20px]">Hola {player_name},</Text>
							<Text className="text-[15px]">
								Te escribimos para informarte que tu reserva de la cancha <strong>{field_name}</strong> para el{" "}
								<strong>{date} a las {time}</strong> ha sido cancelada.
							</Text>
							<br />
							{confirmed && (
								<Text className="text-[15px]">
									No te preocupes, ya estamos procesando la devolución de tu pago. El reembolso debería aparecer en tu cuenta en los próximos días hábiles.
								</Text>
							)}
							<br />
							<Section>
								<Text className="text-[15px] font-bold">📋 Detalles de la cancelación</Text>
								<Text className="text-[15px]">📍 Cancha: {field_name}</Text>
								<Text className="text-[15px]">📅 Fecha original: {date}</Text>
								<Text className="text-[15px]">⏰ Hora original: {time}</Text>
								{confirmed && (
									<>
										<Text className="text-[15px]">💰 Monto a reembolsar: ${amount}</Text>
										<Text className="text-[15px]">🆔 ID de pago: {payment_id}</Text>
									</>
								)}
							</Section>
							<br />
							<Text className="text-[15px]">
								¡No bajes los brazos! Te invitamos a buscar otra fecha que te vaya bien. ¡Seguimos esperándote en la cancha! 💪
							</Text>
						</Section>
					</Container>
				</Body>
			</Tailwind>
		</Html>
	);
}

export default CancelledReservationEmail;