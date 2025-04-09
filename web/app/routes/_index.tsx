import type { MetaFunction } from "@remix-run/node";
import { Button } from "../components/ui/button";
import { useState, useEffect } from "react";

export const meta: MetaFunction = () => {
	return [{ title: "New MatchPoint App" }, { name: "description", content: "Welcome to MatchPoint!" }];
};

export function ButtonDemo() {
	return <Button>Button</Button>;
}

const galleryImages = [
	"/images/gallery/arbitro.jpg",
	"/images/gallery/CanchaFutbol.jpg",
	"/images/gallery/CanchaTenis.jpeg",
	"/images/gallery/Hockey.jpg",
	"/images/gallery/partido.jpg",
	"/images/gallery/PartidoTenis.jpg",
	"/images/gallery/Hockey2.jpg",
	"/images/gallery/PartidoTenis2.jpeg",
];

export default function Index() {
	const [currentImageIndex, setCurrentImageIndex] = useState(0);

	// Automatically switch images every 4 seconds
	useEffect(() => {
		const interval = setInterval(() => {
			setCurrentImageIndex((prevIndex) => (prevIndex + 1) % galleryImages.length);
		}, 4000); // 4000ms = 4 seconds

		return () => clearInterval(interval); // Cleanup interval on component unmount
	}, []);

	return (
		<div>
			<div className="flex h-screen items-center justify-center bg-[#223332]">
				<div className="flex flex-col items-center gap-16">
					<header className="flex flex-col items-center gap-5">
						<div className="space-y-10">
							<div className="space-y-3">
								<h1 className="text-center text-6xl font-bold text-[#f18f01] lg:text-9xl">
									MatchPoint
								</h1>
								<h3 className="text-center text-2xl font-bold text-[#f18f01]/60 lg:text-4xl">
									No te quedes sin jugar
								</h3>
							</div>
							<div className="mt-1 space-x-9 text-center">
								<Button className="text-[#F2F4F3] hover:bg-[#f18f01]/50" size={"xl"}>
									Encontrá tu equipo
								</Button>
								<Button className="text-[#F2F4F3] hover:bg-[#f18f01]/50" size={"xl"}>
									Publicá tu cancha
								</Button>
							</div>
						</div>
					</header>
				</div>
			</div>

			{/* Descripcion de los servicios */}
			<div className="flex flex-row items-center justify-center bg-[#f4f4f4] py-20 text-center">
				{/* Columna Izquierda: Texto */}
				<div className="flex w-1/2 flex-col items-center justify-center px-10 text-center">
					<h2 className="mb-6 text-center text-5xl font-bold text-[#223332]">Nuestros Servicios</h2>
					<p className="max-w-lg text-lg text-[#223332]">
						Conectamos jugadores y canchas. Encontra un equipo para jugar o publica tu cancha para alquilar.
					</p>
					<div className="mt-10 flex flex-wrap gap-8">
						<button className="w-full rounded-lg bg-[#F2F4F3] p-6 text-left shadow-lg hover:bg-[#f18f01]/50">
							<h3 className="mb-4 text-2xl font-bold text-[#223332]">Para Deportistas</h3>
							<p className="text-[#223332]">
								Crea una cuenta para encontrar deportistas, predios y arbitros disponibles.
							</p>
						</button>
						<button className="w-full rounded-lg bg-[#F2F4F3] p-6 text-left shadow-lg hover:bg-[#f18f01]/50">
							<h3 className="mb-4 text-2xl font-bold text-[#223332]">Para Canchas</h3>
							<p className="text-[#223332]">
								Da a conocer tu cancha y permite que otros jugadores la reserven fácilmente.
							</p>
						</button>
					</div>
				</div>

				{/* Columna Derecha: Espacio para Imagenes */}
				<div className="flex w-1/2 items-center justify-center">
					<div className="w-3/4">
						<img
							src={galleryImages[currentImageIndex]}
							alt={`Gallery Image ${currentImageIndex + 1}`}
							className="h-auto w-full rounded-lg shadow-lg"
						/>
					</div>
				</div>
			</div>

			{/* Banner */}
			<div className="flex w-full">
				<img src="/images/banner1.jpg" alt="Banner" className="h-auto w-2/3 object-cover" />
				<img src="/images/banner_pasto.jpg" alt="Banner Pasto" className="h-auto w-1/3 object-cover" />
			</div>

			{/* About Us Section */}
			<div className="flex flex-row items-center justify-center bg-[#223332] py-20">
				{/* Columna Izquierda: Espacio para Imágenes */}
				<div className="flex w-1/2 items-center justify-center">
					{/* Aquí puedes agregar imágenes más adelante */}
				</div>

				{/* Columna Derecha: Texto */}
				<div className="flex w-1/2 flex-col space-y-6 pr-16">
					<h2 className="mb-6 text-8xl font-bold text-[#f18f01]">Quienes somos</h2>
					<p className="max-w-3xl text-left text-lg text-gray-600">
						En realidad no se que poner aca. Un about us? Un FAQ? Mapa con las locations de las canchas? Nou
						se pero siento que algo.
					</p>
				</div>
			</div>
		</div>
	);
}
