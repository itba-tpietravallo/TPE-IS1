import type { MetaFunction } from "@remix-run/node";
import { Button } from "../components/ui/button";
import { useState, useEffect } from "react";

export const meta: MetaFunction = () => {
  return [
    { title: "New MatchPoint App" },
    { name: "description", content: "Welcome to MatchPoint!" },
  ];
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
      setCurrentImageIndex(
        (prevIndex) => (prevIndex + 1) % galleryImages.length
      );
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
                <h1 className="text-6xl lg:text-9xl text-center font-bold text-[#f18f01]">
                  MatchPoint
                </h1>
                <h3 className="text-2xl lg:text-4xl text-center font-bold text-[#f18f01]/60">
                  No te quedes sin jugar
                </h3>
              </div>
              <div className="space-x-9 text-center mt-1">
                <Button className="hover:bg-[#f18f01]/50" size={"xl"}>
                  Encontrá tu equipo
                </Button>
                <Button className="hover:bg-[#f18f01]/50" size={"xl"}>
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
        <div className="w-1/2 flex flex-col items-center justify-center px-10 text-center">
          <h2 className="text-5xl font-bold text-[#223332] mb-6 text-center">
            Nuestros Servicios
          </h2>
          <p className="text-lg text-[#223332] max-w-lg">
            Conectamos jugadores y canchas. Encontra un equipo para jugar o
            publica tu cancha para alquilar.
          </p>
          <div className="flex flex-wrap gap-8 mt-10">
            <button className="bg-white hover:bg-[#f18f01]/50 shadow-lg rounded-lg p-6 w-full text-left">
              <h3 className="text-2xl font-bold text-[#223332] mb-4">
                Para Deportistas
              </h3>
              <p className="text-[#223332]">
                Crea una cuenta para encontrar deportistas, predios y arbitros
                disponibles.
              </p>
            </button>
            <button className="bg-white hover:bg-[#f18f01]/50 shadow-lg rounded-lg p-6 w-full text-left">
              <h3 className="text-2xl font-bold text-[#223332] mb-4">
                Para Canchas
              </h3>
              <p className="text-[#223332]">
                Da a conocer tu cancha y permite que otros jugadores la reserven
                fácilmente.
              </p>
            </button>
          </div>
        </div>

        {/* Columna Derecha: Espacio para Imagenes */}
        <div className="w-1/2 flex items-center justify-center">
          <div className="w-3/4">
            <img
              src={galleryImages[currentImageIndex]}
              alt={`Gallery Image ${currentImageIndex + 1}`}
              className="rounded-lg shadow-lg w-full h-auto"
            />
          </div>
        </div>
      </div>

      {/* Banner */}
      <div className="flex w-full">
        <img
          src="/images/banner1.jpg"
          alt="Banner"
          className="w-2/3 h-auto object-cover"
        />
        <img
          src="/images/banner_pasto.jpg"
          alt="Banner Pasto"
          className="w-1/3 h-auto object-cover"
        />
      </div>

      {/* About Us Section */}
      <div className="flex flex-row items-center justify-center bg-[#223332] py-20">
        {/* Columna Izquierda: Espacio para Imágenes */}
        <div className="w-1/2 flex items-center justify-center">
          {/* Aquí puedes agregar imágenes más adelante */}
        </div>

        {/* Columna Derecha: Texto */}
        <div className="w-1/2 flex flex-col space-y-6 pr-16">
          <h2 className="text-8xl font-bold text-[#f18f01] mb-6">
            Quienes somos
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl text-left">
            En realidad no se que poner aca. Un about us? Un FAQ? Mapa con las
            locations de las canchas? Nou se pero siento que algo.
          </p>
        </div>
      </div>
    </div>
  );
}
