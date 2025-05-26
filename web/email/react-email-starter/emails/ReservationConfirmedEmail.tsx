import { Body, Container, Head, Heading, Html, Img, Section, Tailwind, Text } from "@react-email/components";

interface ReservationConfirmedEmailProps {
	player_name: string;
	field_name: string;
	reservation_date: Date;
	team_name?: string;
}

export function ReservationConfirmedEmail({
	player_name,
	field_name,
	reservation_date,
	team_name,
}: ReservationConfirmedEmailProps) {
	const date = reservation_date.toLocaleDateString("es-ES", {
		day: "2-digit",
		month: "long",
		year: "numeric",
	});

	const time = reservation_date.toLocaleTimeString("es-ES", {
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
							src="https://matchpointapp.com.ar/matchpoint-logo.png"
							alt="MatchPoint Logo"
							className="h-[45px] w-auto"
						/>
					</Section>
					<Container className="mx-auto my-[20px] max-w-[465px] rounded border border-solid border-[#eaeaea]">
						<Container className="rounded-t bg-[#f18f01]">
							<Heading className="mx-0 my-[30px] p-0 text-center text-[28px] font-normal text-[#223332]">
								Reserva confirmada
							</Heading>
						</Container>
						<Section className="bg-[#f2f4f3] p-4 text-[#223332]">
							<Text className="text-[20px]">Hola {player_name}!</Text>
							{team_name ? (
								<Text className="text-[15px]">
									La reserva que realizó tu equipo <strong>{team_name}</strong> de la cancha{" "}
									<strong>{field_name}</strong> para el día <strong>{date}</strong> ha sido
									confirmada.
								</Text>
							) : (
								<Text className="text-[15px]">
									Tu reserva a la cancha <strong>{field_name}</strong> para el día{" "}
									<strong>{date}</strong> ha sido confirmada.
								</Text>
							)}
						</Section>
					</Container>
				</Body>
			</Tailwind>
		</Html>
	);
}

export default ReservationConfirmedEmail;
