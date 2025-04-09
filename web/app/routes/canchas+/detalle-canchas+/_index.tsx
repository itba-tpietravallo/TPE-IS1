("use client");

import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { MapPin } from "lucide-react";
import { ChangeEventHandler, ReactNode, useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~/components/ui/card";

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

import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "~/components/ui/carousel";
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
	const { name, setName, location, setLocation, description, setDescription } = props;

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
		setName(globalName);
		setLocation(globalLocation);
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
							Ubicacion
						</Label>
						<Input placeholder={location} id="location" className="col-span-3" onChange={handleChangeLoc} />
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
	date: string;
	hour: string;
	name: string;
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
	setLocation: (e: string) => void;
	description: string;
	setDescription: (e: string) => void;
	reservations: Reservation[];
};

export function FieldDetail(props: FieldProps) {
	const { imgSrc, name, setName, location, setLocation, description, setDescription , reservations} = props;

	return (
		<div className="h-full bg-[#f2f4f3]">
			<div className="flex h-full flex-row items-center justify-center space-x-12">
				<Card className="w-full max-w-3xl p-10 shadow-lg">
					<CardHeader className="space-y-5">
						<CardTitle className="text-5xl font-bold">{name}</CardTitle>
						<div className="flex flex-row">
							<MapPin className="h-6 w-6 text-gray-500" />
							<CardDescription className="text-2xl">{location}</CardDescription>
						</div>
					</CardHeader>
					<CardContent className="grid gap-4">
						<div className="grid gap-4 py-4">{description}</div>
						<DataTable columns={columns} data={reservations} />
					</CardContent>
				</Card>
				<div className="flex h-screen w-[400px] flex-col items-center justify-center space-y-5">
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



//!================================================================================= CHEQUEAR ESTO =================================================================================

// todo este código en qué queda ?
let globalName = "Canchita";
let globalLocation = "Av. Rolon 326, San Isidro, Buenos Aires";
let globalDescription =
	"Lionel Andrés Messi Cuccittini (Rosario, 24 de junio de 1987), conocido como Leo Messi, es un futbolista argentino que juega como delantero o centrocampista. Desde 2023, integra el plantel del Inter Miami de la MLS canadoestadounidense. Es también internacional con la selección de Argentina, de la que es capitán.";

export default function () {
	const imgs: string[] = ["../img3-f11.jpg", "../img2-f11.jpg", "../img1-f11.jpg"];
	const [name, setName] = useState(globalName);
	const [location, setLocation] = useState(globalLocation);
	const [description, setDescription] = useState(globalDescription);
	//todo falta que el edit datos de la cancha le peguen a la db

	return (
		<p>Hola</p>
	);
}
