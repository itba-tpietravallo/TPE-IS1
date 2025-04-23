("use client");

import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { MapPin } from "lucide-react";
import { ReactNode, useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";

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

import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "~/components/ui/carousel";
import { useLoaderData, useNavigate } from "@remix-run/react";
import { createBrowserClient } from "@supabase/ssr";
import { LoaderFunctionArgs } from "@remix-run/node";
import { set } from "react-hook-form";

let globalName = "";
let globalDescription = "";

export function loader(args: LoaderFunctionArgs) {
	const env = {
		SUPABASE_URL: process.env.SUPABASE_URL!,
		SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY!,
	};

	return {
		env,
		URL_ORIGIN: new URL(args.request.url).origin,
		id: args.params.id,
	};
}

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
	description: string;
	setDescription: (e: string) => void;
};

export function MySheet(props: SheetProps) {
	const { env, URL_ORIGIN, id } = useLoaderData<typeof loader>();
	const supabase = createBrowserClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);

	const { name, setName, description, setDescription } = props;

	const handleChangeName = (e: React.ChangeEvent<HTMLInputElement>) => {
		globalName = e.target.value;
	};

	const handleChangeDescr = (e: React.ChangeEvent<HTMLInputElement>) => {
		globalDescription = e.target.value;
	};

	const handleSave = () => {
		if (globalName !== "") {
			setName(globalName);
		}
		if (globalDescription !== "") {
			setDescription(globalDescription);
		}
	};

	useEffect(() => {
		supabase
			.from("fields")
			.update({
				name: name,
			})
			.eq("id", id)
			.then(({ data, error }) => {
				if (error) {
					console.error("Error al guardar:", error.message);
				} else {
					console.log("Guardado exitosamente:", data);
				}
			});
	}, [name]);

	useEffect(() => {
		supabase
			.from("fields")
			.update({
				description: description,
			})
			.eq("id", id)
			.then(({ data, error }) => {
				if (error) {
					console.error("Error al guardar:", error.message);
				} else {
					console.log("Guardado exitosamente:", data);
				}
			});
	}, [description]);

	return (
		<Sheet>
			<SheetTrigger asChild>
				<Button variant="outline">Editar datos de la Cancha</Button>
			</SheetTrigger>
			<SheetContent>
				<SheetHeader>
					<SheetTitle>Editar Cancha</SheetTitle>
					<SheetDescription>
						Hace los cambios a tu cancha aqui. Hace click en guardar cuando termines.
					</SheetDescription>
				</SheetHeader>
				<div className="grid gap-4 py-4">
					<div className="grid grid-cols-4 items-center gap-4">
						<Label htmlFor="name" className="text-right">
							Nombre
						</Label>
						<Input placeholder={name} id="name" className="col-span-3" onChange={handleChangeName} />
					</div>
					<div className="grid grid-cols-4 items-center gap-4">
						<Label htmlFor="username" className="text-right">
							Descripción
						</Label>
						<Input
							placeholder={description}
							id="description" //no se para que sirve esto
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

type CarouselProps = {
	imgSrc: string[];
};

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

export type Reservation = {
	id: string;
	start_time: string;
	date: string;
	owner_id: string;
};

export const columns: ColumnDef<Reservation, unknown>[] = [
	{
		accessorKey: "date",
		header: "Fecha",
		meta: {
			className: "w-1/3 text-center",
		} as { className: string },
	},
	{
		accessorKey: "hour",
		header: "Hora",
		meta: {
			className: "w-1/3 text-center",
		} as { className: string },
	},
	{
		accessorKey: "name",
		header: "Nombre",
		meta: {
			className: "w-1/3 text-center",
		} as { className: string },
	},
];

type FieldProps = {
	imgSrc: string[];
	name: string;
	setName: (e: string) => void;
	location: string;
	description: string;
	setDescription: (e: string) => void;
	reservations: Reservation[];
};

type Users = {
	id: string;
	full_name: string;
};
export function FieldDetail(props: FieldProps) {
	const { imgSrc, name, setName, location, description, setDescription, reservations } = props;
	const { env, URL_ORIGIN, id } = useLoaderData<typeof loader>();
	const supabase = createBrowserClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);
	const [users, setUsers] = useState<Users[]>([]);

	useEffect(() => {
		supabase
			.from("users")
			.select("*")
			.then(({ data, error }) => {
				if (error) {
					console.error("Error al guardar:", error.message);
				} else {
					setUsers(data as Users[]);
				}
			});
	}, [name]);

	return (
		<div className="h-full bg-[#f2f4f3]">
			<div className="flex h-full flex-row items-center justify-center space-x-12">
				<Card className="w-full max-w-3xl bg-[#223332] p-10 shadow-lg">
					<CardHeader className="space-y-5">
						<CardTitle className="text-5xl font-bold text-[#f2f4f3]">{name}</CardTitle>
						<div className="flex flex-row">
							<MapPin className="h-6 w-6 text-gray-400" />
							<CardDescription className="text-2xl text-gray-400">{location}</CardDescription>
						</div>
					</CardHeader>
					<CardContent className="grid gap-4">
						<div className="grid gap-4 py-4 text-[#f2f4f3]">{description}</div>
						<div className="w-full overflow-x-auto">
							<h2 className="mb-4 border-gray-500 text-left text-xl font-semibold text-[#f2f4f3]">
								Reservas:
							</h2>
							<div className="w-full overflow-x-auto rounded-lg border border-white p-6 shadow-md">
								<div className="grid grid-cols-3 gap-4 border-gray-500 px-6 py-4 text-[#f2f4f3]">
									<div className="text-lg font-semibold">Fecha</div>
									<div className="text-lg font-semibold">Horario</div>
									<div className="text-lg font-semibold">Nombre</div>
								</div>
								<div className="grid grid-cols-3 items-center gap-4 border-t border-gray-500 px-6 py-3">
									{reservations.length > 0 ? (
										reservations.map((reservations) => (
											<div>
												<div> {reservations.date}</div>
												<div> {reservations.start_time}</div>
												<div>
													{" "}
													{users.find((user) => user.id === reservations.owner_id)?.full_name}
												</div>
											</div>
										))
									) : (
										//quiero que esté centrado

										<div className="flex h-full w-full items-center justify-center text-lg italic text-white">
											No hay reservas
										</div>
									)}
								</div>
							</div>
						</div>
					</CardContent>
				</Card>
				<div className="flex h-screen w-[400px] flex-col items-center justify-center space-y-5">
					<MyCarousel imgSrc={imgSrc} />
					<MySheet name={name} setName={setName} description={description} setDescription={setDescription} />
				</div>
			</div>
		</div>
	);
}

interface DataTableProps<TData, TValue> {
	columns: ColumnDef<TData, TValue>[];
	data: TData[];
}

export function DataTable<TData, TValue>({ columns, data }: DataTableProps<TData, TValue>) {
	const table = useReactTable({
		data,
		columns,
		getCoreRowModel: getCoreRowModel(),
	});

	return (
		<div className="rounded-md border">
			<Table className="w-full table-fixed">
				<TableHeader>
					{table.getHeaderGroups().map((headerGroup) => (
						<TableRow key={headerGroup.id}>
							{headerGroup.headers.map((header) => {
								return (
									<TableHead
										key={header.id}
										className={cn(
											(header.column.columnDef.meta as { className?: string })?.className,
										)}
									>
										{flexRender(header.column.columnDef.header, header.getContext())}
									</TableHead>
								);
							})}
						</TableRow>
					))}
				</TableHeader>
				<TableBody>
					{table.getRowModel().rows?.length ? (
						table.getRowModel().rows.map((row) => (
							<TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
								{row.getVisibleCells().map((cell) => (
									<TableCell
										key={cell.id}
										className={cn(
											(cell.column.columnDef.meta as { className?: string })?.className,
										)}
									>
										{flexRender(cell.column.columnDef.cell, cell.getContext())}
									</TableCell>
								))}
							</TableRow>
						))
					) : (
						<TableRow>
							<TableCell colSpan={columns.length} className="text-center">
								No data available
							</TableCell>
						</TableRow>
					)}
				</TableBody>
			</Table>
		</div>
	);
}
