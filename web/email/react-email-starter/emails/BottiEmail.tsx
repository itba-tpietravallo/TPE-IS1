import { Body, Container, Head, Heading, Html, Img, Link, Section, Tailwind, Text } from "@react-email/components";

interface BottiEmailProps {
	name: string;
}

export function BottiEmail({ name }: BottiEmailProps) {
	return (
		<Html>
			<Head />
			<Tailwind>
				<Body className="bg-white px-2 font-sans">
					<Section className="mx-auto">
						<Img
							src="https://xqliokcqwbwivehrgaft.supabase.co/storage/v1/object/public/email-photos//matchpoint-logo.png"
							alt="MatchPoint Logo"
							className="h-[45px] w-auto"
						/>
					</Section>
					<Container className="mx-auto my-[20px] max-w-[465px] rounded border border-solid border-[#eaeaea]">
						<Container className="rounded-t bg-[#f18f01]">
							<Heading className="mx-0 my-[30px] p-0 text-center text-[28px] font-normal text-[#223332]">
								Tu cancha te espera
							</Heading>
						</Container>
						<Section className="bg-[#f2f4f3] p-4 text-[#223332]">
							<Text className="text-[20px]">Hola {name}!</Text>
							<Text className="text-[15px]">
								Escuchamos que tenías ganas de jugar, no te quedes sin la oportunidad!.
							</Text>
							<br />
							<Text className="text-[15px]">
								Esperamos verte en la presentación de nuestra app mañana, ahora con mails
								deconfirmación.
							</Text>
							<br />
							<Link href="https://matchpointapp.com.ar">Ir a MatchPoint</Link>
						</Section>
					</Container>
				</Body>
			</Tailwind>
		</Html>
	);
}

export default BottiEmail;
