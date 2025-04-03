import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { ChangeEventHandler, ReactNode, useState } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";

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
import { LiveReload, useNavigate } from "@remix-run/react";

type ButtonProps = {
  path?: string;
  children: ReactNode;
};

export function MyButton(props: ButtonProps) {
  const { path, children } = props;
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const handleClick = () => setIsLoading(!isLoading);
  return (
    <Button
      onClick={() => {
        handleClick();
        navigate(path ? path : ".");
      }}
      variant={`${isLoading ? "secondary" : "outline"}`}
    >
      {isLoading ? "Loading..." : children}
    </Button>
  );
}

type SheetProps = {
  name: string;
  setName: (e: string) => void;
  location: string;
  setLocation: (e: string) => void;
  description: string;
  setDescription: (e: string) => void;
};

export function MySheet(props: SheetProps) {
  const { name, setName, location, setLocation, description, setDescription } =
    props;

  const handleChangeName = (e: React.ChangeEvent<HTMLInputElement>) => {
    globalName = e.target.value;
  };

  const handleChangeLoc = (e: React.ChangeEvent<HTMLInputElement>) => {
    globalLocation = e.target.value;
  };

  const handleChangeDescr = (e: React.ChangeEvent<HTMLInputElement>) => {
    globalDescription = e.target.value;
  };

  const handleSave = () => {
    setName(globalName)
    setLocation(globalLocation)
    setDescription(globalDescription);
  };

  return (
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
            <Input
              placeholder={name}
              id="name"
              className="col-span-3"
              onChange={handleChangeName}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="username" className="text-right">
              Ubicacion
            </Label>
            <Input
              placeholder={location}
              id="location"
              className="col-span-3"
              onChange={handleChangeLoc}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="username" className="text-right">
              Descripción
            </Label>
            <Input
              placeholder={description}
              id="description"
              className="col-span-3"
              onChange={handleChangeDescr}
            />
          </div>
        </div>
        <SheetFooter>
          <SheetClose asChild>
            <Button type="submit" onClick={handleSave}>
              Guardar cambios
            </Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

export function MyMenubar() {
  return (
    <Menubar className="p-8">
      <MenubarMenu>
        <MyButton path="../canchas">Volver</MyButton>
      </MenubarMenu>
    </Menubar>
  );
}

type CarouselProps = {
  imgSrc: string[];
};

export function MyCarousel(props: CarouselProps) {
  const { imgSrc } = props;
  return (
    <Carousel>
      <CarouselContent>
        {imgSrc.map((img) => (
          <CarouselItem>
            <img src={img} alt="Imagen Cancha" className="w-full h-full" />
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  );
}

type FieldProps = {
  imgSrc: string[];
  name: string;
  setName: (e: string) => void;
  location: string;
  setLocation: (e: string) => void;
  description: string;
  setDescription: (e: string) => void;
};

export function FieldDetail(props: FieldProps) {
  const {
    imgSrc,
    name,
    setName,
    location,
    setLocation,
    description,
    setDescription,
  } = props;
  return (
    <div className="h-full">
      <MyMenubar />
      <div className="h-full space-x-12 flex flex-row  items-center justify-center ">
        <Card className="max-w-lg w-full shadow-lg p-10">
          <CardHeader className="space-y-5">
            <CardTitle className="text-5xl font-bold">{name}</CardTitle>
            <div className="flex flex-row">
              <img src="location-logo.png" className="w-[35px] h-[35px]" />
              <CardDescription className="text-2xl">{location}</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-4 py-4">{description}</div>
          </CardContent>
        </Card>
        <div className="w-[600px] space-y-5 flex flex-col h-screen items-center justify-center ">
          <MyCarousel imgSrc={imgSrc} />
          <MySheet
            name={name}
            setName={setName}
            location={location}
            setLocation={setLocation}
            description={description}
            setDescription={setDescription}
          />
        </div>
      </div>
    </div>
  );
}

let globalName = "Canchita";
let globalLocation = "Av. Rolon 326, San Isidro, Buenos Aires";
let globalDescription =
  "Lionel Andrés Messi Cuccittini (Rosario, 24 de junio de 1987), conocido como Leo Messi, es un futbolista argentino que juega como delantero o centrocampista. Desde 2023, integra el plantel del Inter Miami de la MLS canadoestadounidense. Es también internacional con la selección de Argentina, de la que es capitán.";

export default function () {
  const imgs: string[] = ["img3-f11.jpg", "img2-f11.jpg", "img1-f11.jpg"];
  const [name, setName] = useState(globalName);
  const [location, setLocation] = useState(globalLocation);
  const [description, setDescription] = useState(globalDescription);

  return (
    <FieldDetail
      imgSrc={imgs}
      name={globalName}
      setName={setName}
      location={globalLocation}
      setLocation={setLocation}
      description={description}
      setDescription={setDescription}
    />
  );
}
