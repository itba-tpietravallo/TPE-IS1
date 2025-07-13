import { Body, Container, Head, Heading, Html, Img, Section, Tailwind, Text } from "@react-email/components";

interface BottiMailFinalEmailProps {
	player_name: string;
}

export function BottiMailFinal({
	player_name,
}: BottiMailFinalEmailProps) {
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
							<Heading className="mx-0 my-[30px] p-0 text-center text-[28px] font-normal text-white">
								MatchPoint te espera 🏟️
							</Heading>
						</Container>
						<Section className="bg-[#f2f4f3] p-4 text-[#223332]">
							<Text className="text-[15px]">
								Hola {player_name}!
							</Text>
							<Text className="text-[15px]">
								Sabemos que tenés ganas de jugar, ¡no te quedes sin la oportunidad!
							</Text>
							<Text className="text-[15px]">
								Te esperamos mañana a las 8:00 en la presentación de nuestra app, ¡ahora con mails de confirmación!
							</Text>
							<Text>
								Si no podés esperar, podés empezar instalando <a href="https://storage.googleapis.com/matchpointapp-android-apks/MatchPoint.apk" className="text-[#f18f01] underline">nuestra APK de Android</a>, o <a href="https://matchpointapp.com.ar" className="text-[#f18f01] underline">visitando nuestra web</a>.
							</Text>
							<Text>¿Querés ver todos nuestros OKRs, C4s, roadmaps y más? <a href="https://drive.google.com/drive/folders/14sF9bespwfx1I6Y7vi2j3NuNsztg2V-S?usp=sharing" className="text-[#f18f01] underline">¡Te tenemos cubierto 😎!</a></Text>
							<Text>Contamos con procesamiento de pagos, emails, app y más. ¡Te estamos esperando! No te quedes sin jugar 🏃‍♂️</Text>
							<Text className="text-[15px] text-center">
								<a href="https://matchpointapp.com.ar" className="text-[#f18f01] underline">
									Ir a MatchPoint
								</a>
							</Text>
						</Section>
					</Container>
				</Body>
			</Tailwind>
		</Html>
	);
}

export default BottiMailFinal;