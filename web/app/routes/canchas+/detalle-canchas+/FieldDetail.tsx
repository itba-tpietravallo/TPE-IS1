("use client");
import type { Database } from "@lib/autogen/database.types";
import type { SupabaseClient } from "@supabase/supabase-js";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { DollarSign, MapPin, Loader2, Info, OctagonAlert, Check, ChevronRight, ChevronLeft } from "lucide-react";
import { useEffect, useState, Suspense } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "~/components/ui/carousel";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "~/components/ui/sheet";
import { TorneosSheet } from "./TorneosSheet";
import { ReservationSheet } from "./ReseravtionSheet";
import { DeleteFieldButton } from "./DeleteFieldButton";
import type { UseQueryResult } from "@tanstack/react-query";
import {
	getAllTeams,
	getIsFieldOwner,
	getUserAuthSession,
	useUpdateFieldAdmins,
	getUserEmailById,
} from "@lib/autogen/queries";
import { useQuery, UseQuerySingleReturn } from "@supabase-cache-helpers/postgrest-react-query";
import { en } from "@supabase/auth-ui-shared";
import { WeekCalendar } from "@components/calendar";

import {
	Pagination,
	PaginationContent,
	PaginationEllipsis,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from "@/components/ui/pagination";

type CarouselProps = {
	imgSrc: string[];
};

type FieldProps = {
	id?: string;
	supabase: SupabaseClient<Database>;
	ff?: UseQuerySingleReturn<Database["public"]["Tables"]["fields"]["Row"]>;
	imgSrc: string[];
	name: string;
	location: string;
	price: number;
	description: string;
	slot_duration: number | undefined;
	reservations: NonNullable<UseQuerySingleReturn<Database["public"]["Tables"]["reservations"]["Row"]>["data"]>[];
	tournaments: any[];
	users: any[];
	dependantQueries?: UseQueryResult[];
	onSave: (newName: string, newDescription: string, price: number) => void;
	loading: boolean;
};

export const UserEmailFromId = (props: { supabase: SupabaseClient<Database>; id: string }) => {
	const {
		data: user,
		error,
		isLoading,
	} = useQuery(props.supabase.from("users").select("email").eq("id", props.id).single(), {
		enabled: !!props.id,
	});
	return isLoading ? <p>Cargando...</p> : <p>{user?.email!}</p>;
};

export function FieldDetail(props: FieldProps) {
	const {
		id,
		supabase,
		imgSrc,
		name,
		ff,
		location,
		slot_duration,
		price,
		description,
		reservations,
		tournaments,
		users,
		onSave,
		loading,
	} = props;

	const teamsData = getAllTeams(supabase);
	const [sheetOpen, setSheetOpen] = useState(false);
	const user = getUserAuthSession(supabase);

	const isOwner = !!getIsFieldOwner(supabase, id!, user.data?.user.id!, { enabled: !!(!!user.data?.user.id && !!id) })
		?.data?.id;
	const updateFieldAdminsMutation = useUpdateFieldAdmins(supabase);

	const [currentPage, setCurrentPage] = useState(1);
	const reservationsPerPage = 5;

	const totalPages = Math.ceil(reservations.length / reservationsPerPage);
	const paginatedReservations = reservations.slice(
		(currentPage - 1) * reservationsPerPage,
		currentPage * reservationsPerPage,
	);

	const getPaginationRange = (totalPages: number, currentPage: number) => {
		const delta = 2;
		const range: (number | "...")[] = [];

		for (let i = 1; i <= totalPages; i++) {
			if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
				range.push(i);
			} else if (range[range.length - 1] !== "...") {
				range.push("...");
			}
		}

		return range;
	};

	return (
		<div className="mb-10 h-full min-h-fit bg-[#f2f4f3] py-10">
			<div className="flex h-full max-h-fit flex-row items-center justify-center space-x-12">
				<Card className="w-full max-w-3xl bg-[#223332] p-10 shadow-lg">
					<Suspense
						fallback={
							<div className="flex h-64 flex-col items-center justify-center text-[#f2f4f3]">
								<Loader2 className="mr-2 h-10 w-10 animate-spin" />
								<p className="mt-4 text-xl">Cargando cancha...</p>
							</div>
						}
					>
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
									<div className="rounded-xl border border-white bg-[#2b3a39] p-6 shadow-md">
										<div className="grid grid-cols-5 gap-4 border-b border-gray-400 pb-3 text-center text-sm font-semibold text-white">
											<span>Fecha</span>
											<span>Horario</span>
											<span>Nombre Equipo</span>
											<span>Pago</span>
											<span>Info</span>
										</div>
										<div className="divide-y divide-gray-600">
											{reservations.length > 0 ? (
												paginatedReservations.map((reservation) => {
													const team = teamsData.data?.find(
														(team) => team.team_id === reservation?.team_id,
													);

													return (
														<div
															key={reservation.id}
															className="grid grid-cols-5 items-center gap-4 rounded-md py-3 text-center text-sm text-white transition hover:bg-[#364845]"
														>
															<div>
																{new Date(reservation.date_time)
																	.toLocaleDateString("es-ES", {
																		year: "numeric",
																		month: "2-digit",
																		day: "2-digit",
																	})
																	.replace(/^\b\w/g, (char) => char.toUpperCase())}
															</div>
															<div>
																{new Date(reservation.date_time)
																	.toLocaleTimeString("es-ES", {
																		hour: "2-digit",
																		minute: "2-digit",
																	})
																	.replace(/^\b\w/g, (char) => char.toUpperCase())}
															</div>
															<div>{team?.name || "Desconocido"}</div>
															<div className="flex justify-center">
																{reservation.paid ? (
																	<Check className="h-5 w-5 text-green-400" />
																) : (
																	<OctagonAlert className="h-5 w-5 text-yellow-400" />
																)}
															</div>
															<div>
																<ReservationSheet
																	reservation={reservation}
																	team={team}
																	supabase={supabase}
																/>
															</div>
														</div>
													);
												})
											) : (
												<div className="flex h-full w-full items-center justify-center py-6 text-sm italic text-gray-300">
													No hay reservas
												</div>
											)}
										</div>
										{totalPages > 1 && (
											<div className="mt-6 flex justify-center">
												<Pagination>
													<PaginationContent className="text-white">
														{currentPage > 1 && (
															<PaginationItem>
																<PaginationLink
																	href="#"
																	size="default"
																	className="text-white"
																	onClick={(e) => {
																		e.preventDefault();
																		setCurrentPage((prev) => Math.max(prev - 1, 1));
																	}}
																>
																	<ChevronLeft />
																	Anterior
																</PaginationLink>
															</PaginationItem>
														)}

														{getPaginationRange(totalPages, currentPage).map(
															(page, index) => (
																<PaginationItem key={index}>
																	{page === "..." ? (
																		<PaginationEllipsis />
																	) : (
																		<PaginationLink
																			href="#"
																			size="default"
																			isActive={page === currentPage}
																			className={`${
																				page === currentPage
																					? "bg-white text-black hover:bg-white"
																					: "text-white"
																			}`}
																			onClick={(e) => {
																				e.preventDefault();
																				setCurrentPage(page);
																			}}
																		>
																			{page}
																		</PaginationLink>
																	)}
																</PaginationItem>
															),
														)}

														{currentPage < totalPages && (
															<PaginationItem>
																<PaginationLink
																	href="#"
																	size="default"
																	className="text-white"
																	onClick={(e) => {
																		e.preventDefault();
																		setCurrentPage((prev) =>
																			Math.min(prev + 1, totalPages),
																		);
																	}}
																>
																	Siguiente
																	<ChevronRight />
																</PaginationLink>
															</PaginationItem>
														)}
													</PaginationContent>
												</Pagination>
											</div>
										)}
									</div>
								</div>
								<TorneosSheet fieldId={id || ""} tournaments={tournaments} />
								<div className="w-full">
									{isOwner && (
										<Sheet>
											<SheetTrigger asChild>
												<Button
													variant="outline"
													className="w-full border-white bg-[#2b3a39] text-white hover:bg-[#364845]"
												>
													Añadir administrador
												</Button>
											</SheetTrigger>
											<SheetContent>
												<SheetHeader>
													<SheetTitle>Gestión de administradores</SheetTitle>
												</SheetHeader>
												<div className="mt-6 space-y-6">
													<form
														onSubmit={async (e) => {
															e.preventDefault();
															const form = e.target as HTMLFormElement;
															const email = form.email.value;

															const u = await supabase
																.from("users")
																.select("id")
																.eq("email", email)
																.single();

															if (u.error || !u.data) {
																alert("Usuario no encontrado");
																return;
															}

															if (email && ff) {
																const adminedBy = [
																	...(ff?.data?.adminedBy || []),
																	u.data.id,
																];

																await updateFieldAdminsMutation.mutateAsync({
																	fieldId: ff?.data?.id!,
																	adminedBy,
																});

																form.reset();
															}
														}}
														className="flex flex-col space-y-4"
													>
														<div>
															<label
																htmlFor="email"
																className="mb-1 block text-sm font-semibold"
															>
																Correo electrónico
															</label>
															<div className="flex gap-2">
																<Input
																	id="email"
																	name="email"
																	type="email"
																	placeholder="correo@ejemplo.com"
																/>
																<Button type="submit">Añadir</Button>
															</div>
														</div>
													</form>

													<div className="space-y-2">
														<h3 className="text-sm font-semibold">
															Administradores actuales
														</h3>
														<div className="max-h-[300px] overflow-y-auto rounded-md border p-2">
															{ff?.data?.adminedBy && ff.data.adminedBy.length > 0 ? (
																(ff?.data?.adminedBy || []).map((admin, _) => {
																	return (
																		<div
																			key={`k${_}`}
																			className="flex items-center justify-between py-2"
																		>
																			<span className="text-sm">
																				<UserEmailFromId
																					supabase={supabase}
																					id={admin}
																				/>
																			</span>
																			{admin && ff && (
																				<Button
																					size="sm"
																					variant="destructive"
																					onClick={async () => {
																						await updateFieldAdminsMutation.mutateAsync(
																							{
																								fieldId: ff?.data?.id!,
																								adminedBy:
																									ff?.data?.adminedBy.filter(
																										(i) =>
																											i !== admin,
																									) || [],
																							},
																						);
																					}}
																				>
																					Eliminar
																				</Button>
																			)}
																		</div>
																	);
																})
															) : (
																<p
																	key="fallback"
																	className="py-2 text-center text-sm italic text-gray-500"
																>
																	No hay administradores
																</p>
															)}
														</div>
													</div>
												</div>
											</SheetContent>
										</Sheet>
									)}
								</div>
								{isOwner && (
									<DeleteFieldButton
										supabase={supabase}
										fieldId={id || ""}
										dependantQueries={props?.dependantQueries || []}
									/>
								)}
							</CardContent>
						</>
					</Suspense>
				</Card>
				<div className="flex h-screen max-h-fit w-[400px] flex-col items-center justify-center space-y-5">
					<MyCarousel imgSrc={imgSrc} />
					<MySheet name={name} description={description} price={price} onSave={onSave} />
				</div>
			</div>
			<div className="mt-10 flex w-full flex-col items-center justify-center space-y-10 bg-[#f2f4f3]">
				<hr className="w-4/5 border border-[#d9dbda]" />
				<div className="mb-10 flex w-4/5 items-center justify-center bg-[#f2f4f3]">
					<WeekCalendar
						reservations={reservations.map((r) => ({
							date_time: r.date_time,
							slot_duration: ff?.data?.slot_duration,
							event_name: "Reserva",
							payment_status: r.pending_bookers_ids.length > 0 ? "pending" : "confirmed",
							sport: undefined,
							team: r.team_id,
							owner: r.owner_id,
						}))}
						supabase={supabase}
					/>
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
						<img src={img} alt="Imagen Cancha" className="h-full max-h-fit w-full" />
					</CarouselItem>
				))}
			</CarouselContent>
			<CarouselPrevious />
			<CarouselNext />
		</Carousel>
	);
}
