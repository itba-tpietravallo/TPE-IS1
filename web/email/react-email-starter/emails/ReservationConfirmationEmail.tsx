import { Body, Container, Head, Heading, Html, Img, Section, Tailwind, Text } from "@react-email/components";

interface ReservationConfirmationEmailProps {
	player_name: string;
	address: string;
	field_name: string;
	reservation_date: Date;
}

export function ReservationConfirmationEmail({
	player_name,
	address,
	field_name,
	reservation_date,
}: ReservationConfirmationEmailProps) {
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
						<Container className="rounded-t bg-[#f18f01]">
							<Heading className="mx-0 my-[30px] p-0 text-center text-[28px] font-normal text-[#223332]">
								¡La cancha está reservada! 🎯
							</Heading>
						</Container>
						<Section className="bg-[#f2f4f3] p-4 text-[#223332]">
							<Text className="text-[20px]">¡Hola {player_name}!</Text>
							<Text className="text-[15px]">
								Tu reserva de la cancha <strong>{field_name}</strong> para el{" "}
								<strong>{date} a las {time}</strong> está confirmada. ¡Es hora de jugar! 🏃‍♂️⚽
							</Text>
							<br />
							<Section>
								<Text className="text-[15px] font-bold">📋 Detalles de tu reserva</Text>
								<Text className="text-[15px]">🏟️ Cancha: {field_name}</Text>
								<Text className="text-[15px]">📍 Dirección: {address}</Text>
								<Text className="text-[15px]">📅 Fecha: {date}</Text>
								<Text className="text-[15px]">⏰ Hora: {time}</Text>
							</Section>
							<br />
							<Text className="text-[15px]">
								¡Prepárate para dar lo mejor de vos! Nos vemos en la cancha. 🔥
							</Text>
						</Section>
					</Container>
				</Body>
			</Tailwind>
		</Html>
	);
}

export default ReservationConfirmationEmail;