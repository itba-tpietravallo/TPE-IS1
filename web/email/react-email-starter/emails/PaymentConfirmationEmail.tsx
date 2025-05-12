import { Body, Container, Head, Heading, Html, Img, Section, Tailwind, Text } from "@react-email/components";

interface PaymentConfirmationEmailProps {
	player_name: string;
	amount: number;
	payment_id: string;
	field_name: string;
	reservation_date: Date;
}

export function PaymentConfirmationEmail({
	player_name,
	amount,
	payment_id,
	field_name,
	reservation_date,
}: PaymentConfirmationEmailProps) {
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
							src="https://xqliokcqwbwivehrgaft.supabase.co/storage/v1/object/public/email-photos//matchpoint-logo.png"
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
							<Text className="text-[15px]">
								Tu reserva de la cancha <strong>{field_name}</strong> para el día{" "}
								<strong>{date}</strong> a las <strong>{time}</strong> fue realizada con éxito.
							</Text>
							<br />
							<Section>
								<Text className="text-[15px] font-bold">Datos de la transacción</Text>
								<Text className="text-[15px]">Monto: ${amount}</Text>
								<Text className="text-[15px]">ID de pago: {payment_id}</Text>
							</Section>
						</Section>
					</Container>
				</Body>
			</Tailwind>
		</Html>
	);
}

export default PaymentConfirmationEmail;
