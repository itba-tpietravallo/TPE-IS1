("use client");
import type { Database } from "@lib/autogen/database.types";
import type { SupabaseClient } from "@supabase/supabase-js";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { DollarSign, MapPin, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "~/components/ui/carousel";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "~/components/ui/sheet";
import { TorneosSheet } from "./TorneosSheet";
import { DeleteFieldButton } from "./DeleteFieldButton";
import type { UseQueryResult } from "@tanstack/react-query";

type CarouselProps = {
	imgSrc: string[];
};

export type Reservation = {
	id: string;
	date_time: string;
	owner_id: string;
};

type FieldProps = {
	id?: string;
	supabase: SupabaseClient<Database>;
	imgSrc: string[];
	name: string;
	location: string;
	price: number;
	description: string;
	reservations: Reservation[];
	tournaments: any[];
	users: any[];
	dependantQueries?: UseQueryResult[];
	onSave: (newName: string, newDescription: string, price: number) => void;
	loading: boolean;
};

export function FieldDetail(props: FieldProps) {
	const {
		id,
		supabase,
		imgSrc,
		name,
		location,
		price,
		description,
		reservations,
		tournaments,
		users,
		onSave,
		loading,
	} = props;

	return (
		<div className="h-full bg-[#f2f4f3]">
			<div className="flex h-full flex-row items-center justify-center space-x-12">
				<Card className="w-full max-w-3xl bg-[#223332] p-10 shadow-lg">
					{loading ? (
						<div className="flex h-64 flex-col items-center justify-center text-[#f2f4f3]">
							<Loader2 className="mr-2 h-10 w-10 animate-spin" />
							<p className="mt-4 text-xl">Cargando cancha...</p>
						</div>
					) : (
						<>
							<CardHeader className="space-y-5">
								<div className="flex flex-row items-center justify-between">
									<CardTitle className="text-5xl font-bold text-[#f2f4f3]">{name}</CardTitle>
								</div>
								<div className="flex flex-row">
									<MapPin className="my-auto h-6 w-6 text-gray-400" />
									<CardDescription className="text-2xl text-gray-400">{location}</CardDescription>
								</div>
								<div className="flex flex-row">
									<DollarSign className="my-auto h-6 w-6 text-gray-400" />
									<CardDescription className="text-2xl text-gray-400">{price}</CardDescription>
								</div>
							</CardHeader>
							<CardContent className="grid gap-4">
								<div className="grid gap-4 py-4 text-[#f2f4f3]">{description}</div>
								<div className="w-full overflow-x-auto">
									<h2 className="mb-4 border-gray-500 text-left text-xl font-semibold text-[#f2f4f3]">
										Reservas:
									</h2>
									<div className="rounded-lg border border-white p-6 shadow-md">
										<div className="grid grid-cols-3 gap-4 border-gray-500 px-6 py-4 text-[#f2f4f3]">
											<div className="text-lg font-semibold">Fecha</div>
											<div className="text-lg font-semibold">Horario</div>
											<div className="text-lg font-semibold">Nombre</div>
										</div>
										<div>
											{reservations.length > 0 ? (
												reservations.map((reservations) => (
													<div className="gap- grid grid-cols-3 border-t border-gray-500 px-6 py-4 text-[#f2f4f3]">
														<div>
															{new Date(reservations.date_time).toLocaleDateString(
																"es-ES",
																{
																	year: "numeric",
																	month: "2-digit",
																	day: "2-digit",
																},
															)}{" "}
														</div>
														<div>
															{" "}
															{new Date(reservations.date_time).toLocaleTimeString(
																"es-ES",
																{
																	hour: "2-digit",
																	minute: "2-digit",
																},
															)}{" "}
														</div>
														<div>
															{" "}
															{
																(users || [])?.find(
																	(user) => user.id === reservations.owner_id,
																)?.full_name
															}
														</div>
													</div>
												))
											) : (
												<div className="flex h-full w-full items-center justify-center border-t border-gray-500 text-lg italic text-white">
													No hay reservas
												</div>
											)}
										</div>
									</div>
								</div>
								<TorneosSheet fieldId={id || ""} tournaments={tournaments} />
								<DeleteFieldButton
									supabase={supabase}
									fieldId={id || ""}
									dependantQueries={props?.dependantQueries || []}
								/>
							</CardContent>
						</>
					)}
				</Card>
				<div className="flex h-screen w-[400px] flex-col items-center justify-center space-y-5">
					<MyCarousel imgSrc={imgSrc} />

					<MySheet name={name} description={description} price={price} onSave={onSave} />
				</div>
			</div>
		</div>
	);
}

export default function MySheet({
	name,
	description,
	price,
	onSave,
}: {
	name: string;
	description: string;
	price: number;
	onSave: (newName: string, newDescription: string, price: number) => void;
}) {
	const [open, setOpen] = useState(false);
	const [localName, setLocalName] = useState(name);
	const [localDescription, setLocalDescription] = useState(description);
	const [localPrice, setLocalPrice] = useState(price);

	const handleSave = () => {
		onSave(localName, localDescription, localPrice);
		setOpen(false);
	};

	useEffect(() => {
		setLocalName(name);
		setLocalDescription(description);
		setLocalPrice(price);
	}, [name, description]);

	return (
		<Sheet open={open} onOpenChange={setOpen}>
			<SheetTrigger asChild>
				<Button className="w-full">Editar datos de la cancha</Button>
			</SheetTrigger>
			<SheetContent>
				<SheetHeader>
					<SheetTitle>Modificá los datos de tu cancha</SheetTitle>
				</SheetHeader>
				<div className="mt-4 space-y-4">
					<div>
						<label htmlFor="name" className="mb-1 block font-semibold">
							Nombre
						</label>
						<Input id="name" value={localName} onChange={(e) => setLocalName(e.target.value)} />
					</div>

					<div>
						<label htmlFor="price" className="mb-1 block font-semibold">
							Precio
						</label>
						<Input id="price" value={localPrice} onChange={(e) => setLocalPrice(Number(e.target.value))} />
					</div>

					<div>
						<label htmlFor="description" className="mb-1 block font-semibold">
							Descripción
						</label>
						<p className="text-xs text-gray-600">
							{" "}
							Agregá acá cualquier información que consideres importante
						</p>
						<Input
							id="description"
							value={localDescription}
							onChange={(e) => setLocalDescription(e.target.value)}
						/>
					</div>
					<Button onClick={handleSave}>Guardar cambios</Button>
				</div>
			</SheetContent>
		</Sheet>
	);
}

export function MyCarousel(props: CarouselProps) {
	const { imgSrc } = props;
	return (
		<Carousel>
			<CarouselContent>
				{imgSrc?.map((img) => (
					<CarouselItem key={img}>
						<img src={img} alt="Imagen Cancha" className="h-full w-full" />
					</CarouselItem>
				))}
			</CarouselContent>
			<CarouselPrevious />
			<CarouselNext />
		</Carousel>
	);
}
