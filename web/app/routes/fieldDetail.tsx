import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "~/components/ui/sheet";

import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarTrigger,
} from "~/components/ui/menubar";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "~/components/ui/carousel";

const sheet = (
  <Sheet>
    <SheetTrigger asChild>
      <Button variant="outline">Editar datos de la Cancha</Button>
    </SheetTrigger>
    <SheetContent>
      <SheetHeader>
        <SheetTitle>Editar Cancha</SheetTitle>
        <SheetDescription>
          Hace los cambios a tu cancha aqui. Hace click en guardar cuando
          termines.
        </SheetDescription>
      </SheetHeader>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="name" className="text-right">
            Nombre
          </Label>
          <Input id="name" className="col-span-3" />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="username" className="text-right">
            Ubicacion
          </Label>
          <Input id="location" className="col-span-3" />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="username" className="text-right">
            Descripción
          </Label>
          <Input id="description" className="col-span-3" />
        </div>
      </div>
      <SheetFooter>
        <SheetClose asChild>
          <Button type="submit">Guardar cambios</Button>
        </SheetClose>
      </SheetFooter>
    </SheetContent>
  </Sheet>
);

const menubar = (
  <Menubar>
    <MenubarMenu>
      <MenubarTrigger>File</MenubarTrigger>
      <MenubarContent>
        <MenubarItem>
          New Tab <MenubarShortcut>⌘T</MenubarShortcut>
        </MenubarItem>
        <MenubarItem>New Window</MenubarItem>
        <MenubarSeparator />
        <MenubarItem>Share</MenubarItem>
        <MenubarSeparator />
        <MenubarItem>Print</MenubarItem>
      </MenubarContent>
    </MenubarMenu>
  </Menubar>
);

const description = (
  <div>
    Goleador prolífico, Messi es conocido por su remate, posicionamiento,
    reacciones rápidas y habilidad para hacer corridas para vencer las líneas
    defensivas rivales. También puede funcionar en un rol de organizador, debido
    a su visión y rango de pases.[804]​ Es frecuentemente llamado "mago" por
    crear situaciones de gol de la nada.[805]​[806]​[807]​ Es, además, un
    preciso lanzador de tiros libres, que comenzó a mejorar bajo Basile en los
    entrenamientos de la selección,[808]​ y penales (77,62 % a noviembre de
    2022),[809]​[810]​ y uno de los mejores en goles de falta directa: entre
    2016 y 2021, anotó 56 goles de ese modo, tres veces más que el resto de los
    jugadores.[811]​[812]​ Tras su salida del Barcelona, marcó cinco con
    Argentina, dos con PSG y dos con Inter Miami.[813]​ También suele anotar
    picando la pelota por encima del arquero.[814]​[815]​ Debido a su habilidad
    con la pelota y baja estatura, es muy ágil para cambiar rápido de dirección
    y evadir así las barridas de sus rivales,[816]​ lo que hizo que los medios
    de España empezaran a llamarlo "La Pulga Atómica", como le había puesto
    Mario Alberto Kempes.[817]​ A pesar de no ser físicamente imponente, tiene
    una fuerza significativa en la parte superior del cuerpo, lo que, combinado
    con su bajo centro de gravedad y equilibrio, lo ayuda a resistir los
    desafíos físicos de los oponentes. En consecuencia, se distingue por simular
    poco en un deporte en el que muchos lo hacen.[818]​[819]​ Por sus cortas
    pero fuertes piernas, puede ejecutar veloces ráfagas de aceleración,
    mientras que sus rápidos pies le permiten mantener controlada la pelota a
    gran velocidad.[cita requerida] Guardiola dijo una vez que era "el único
    jugador más rápido con un balón en los pies que sin balón"
  </div>
);

const carousel = (
  <Carousel>
    <CarouselContent>
      <CarouselItem>
        <img
          src="medidas_sm.jpg"
          alt="Imagen Cancha"
          className="w-full max-w-xl"
        />
      </CarouselItem>
      <CarouselItem>...</CarouselItem>
      <CarouselItem>...</CarouselItem>
    </CarouselContent>
    <CarouselPrevious />
    <CarouselNext />
  </Carousel>
);

function fieldDetail() {
  return (
    <div className="h-full space-x-10 flex flex-row  items-center justify-center ">
      <Card className="max-w-lg w-full shadow-lg p-10">
        <CardHeader className="space-y-5">
          <CardTitle className="text-5xl font-bold">Canchita</CardTitle>
          <div className="flex flex-row">
            <img src="location-logo.png" className="w-[35px] h-[35px]" />
            <CardDescription className="text-2xl">
              San Isidro, Buenos Aires
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-4 py-4">{description}</div>
        </CardContent>
      </Card>
      <div className=" space-y-5 flex flex-col h-screen items-center justify-center ">
        <h2>Imagenes de la cancha</h2>
        {carousel}
        {sheet}
      </div>
    </div>
  );
}

export default fieldDetail;
