import {
	Sheet,
	SheetTrigger,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetDescription,
	SheetFooter,
	SheetClose,
} from "~/components/ui/sheet";
import { Button } from "~/components/ui/button";
import { useLoaderData, useNavigate } from "@remix-run/react";
import { createBrowserClient } from "@supabase/ssr";
import { Trash2 } from "lucide-react";
import { LoaderFunctionArgs } from "@remix-run/node";
import { getAllTournamentsForFieldById, getFieldById } from "@lib/autogen/queries";
import { set, useForm, UseFormReturn } from "react-hook-form";
import { Label } from "~/components/ui/label";
import { useState, useMemo, useEffect } from "react";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "../../../components/ui/form";
import clsx from "clsx";

import { Input } from "../../../components/ui/input";
import { Textarea } from "../../../components/ui/textarea";
import MultipleSelector, { Option } from "../../../components/ui/multiselector";
import { DollarSign, Icon } from "lucide-react";
import { on } from "events";
import { getAllTeams, getTeamById } from "@/lib/autogen/queries";
export function loader(args: LoaderFunctionArgs) {
	const env = {
		SUPABASE_URL:
			process.env.VERCEL_ENV === "production" ? process.env.PROD_SUPABASE_URL! : process.env.DEV_SUPABASE_URL!,
		SUPABASE_ANON_KEY:
			process.env.VERCEL_ENV === "production"
				? process.env.PROD_SUPABASE_ANON_KEY!
				: process.env.DEV_SUPABASE_ANON_KEY!,
	};

	return {
		env,
		URL_ORIGIN: new URL(args.request.url).origin,
		id: args.params.id,
	};
}

type BasicBoxProps = {
	section: string;
	label: string;
	placeholder: string;
	description: string;
	box_specifications: string;
	label_specifications?: string;
	form: UseFormReturn<any, any, any>;
};

function BasicBox({
	section,
	label,
	placeholder,
	description,
	box_specifications,
	label_specifications,
	form,
}: BasicBoxProps) {
	const inputId = `input-${section}`; //para q el formlabel se pueda asociar con el input
	return (
		<FormField
			control={form.control}
			name={section}
			render={({ field }) => (
				<FormItem>
					<FormLabel htmlFor={inputId} className={clsx(`${label_specifications}`, "text-[#223332]")}>
						{label}
					</FormLabel>
					<FormControl>
						<Input id={inputId} placeholder={placeholder} className={box_specifications} {...field} />
					</FormControl>
					<FormDescription>{description}</FormDescription>
					<FormMessage />
				</FormItem>
			)}
		/>
	);
}
export function TournamentForm({ fieldId, onClose = () => {} }: { fieldId: string; onClose?: () => void }) {
	const { env, URL_ORIGIN, id } = useLoaderData<typeof loader>();
	const supabase = createBrowserClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);
	const field = getFieldById(supabase, fieldId || "");
	const [formError, setFormError] = useState(false);

	const [selectedSport, setSelectedSport] = useState<string | null>(null);

	const form = useForm({
		defaultValues: {
			name: "",
			sport: "",
			startDate: "",
			description: "",
			price: "",
			deadline: "",
			cantPlayers: "",
		},
	});

	const options = useMemo(
		() =>
			(field.data?.sports || [])?.map((sport) => ({
				label: sport,
				value: sport,
			})),
		[field.data?.sports],
	);

	const onSubmit = async (data: any) => {
		await supabase.from("tournaments").insert([
			{
				name: data.name,
				fieldId: fieldId,
				sport: selectedSport,
				startDate: data.startDate,
				description: data.description,
				price: data.price,
				deadline: data.deadline,
				cantPlayers: data.cantPlayers,
			},
		]);

		field.refetch();

		onClose();
	};

	return (
		<div className="flex flex-col items-center justify-center space-y-12 bg-[#f2f4f3] p-10">
			<Form {...form}>
				<div className="max-h-[400px] w-full space-y-5 overflow-y-auto">
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
						<BasicBox
							section="name"
							label="Nombre"
							placeholder=""
							description=""
							box_specifications="col-span-3"
							label_specifications="text-base font-sans text-[#223332]"
							form={form}
						/>
						<SelectFormSection
							form={form}
							options={options}
							selectedSport={selectedSport}
							setSelectedSport={setSelectedSport}
						/>

						<DescriptionSection
							placeholder="Información adicional sobre la cancha y servicios. Por ejemplo, cantidad de jugadores, días y horarios de apertura."
							box_specifications="w-[800px] h-[200px] text-lg px-4"
							form={form}
						/>

						<PriceSection form={form} />
						<div className="flex flex-col">
							<Label htmlFor="startDate" className="h-8 px-2 text-sm text-[#223332]">
								Fecha de inicio
							</Label>
							<Input type="date" id="startDate" className="col-span-3" {...form.register("startDate")} />
						</div>
						<div className="flex flex-col">
							<Label htmlFor="deadline" className="h-8 px-2 text-sm text-[#223332]">
								Fecha de limite de inscripción
							</Label>
							<Input type="date" id="deadline" className="col-span-3" {...form.register("deadline")} />
						</div>
						<div className="flex flex-col">
							<Label htmlFor="cant" className="h-8 px-2 text-sm text-[#223332]">
								Cantidad de jugadores
							</Label>
							<Input
								type="number"
								id="cantPlayers"
								className="col-span-3"
								{...form.register("cantPlayers")}
							/>
						</div>
						<div className="flex w-full items-center justify-center">
							<Button
								data-color={formError}
								disabled={formError}
								className="mb-11 mt-5 h-10 w-full bg-[#223332] text-base hover:bg-[#f18f01]/80 data-[color=true]:bg-[#c92626]"
								type="submit"
							>
								{formError ? "Se encontró un error, porfavor vuelva a intentar" : "Publicar"}
							</Button>
						</div>
						<Button
							onClick={onClose}
							className="bg-color mb-11 mt-5 h-10 w-full bg-[#f2f4f3] text-base text-gray-500 underline hover:bg-[#f2f4f3]/80 hover:text-gray-700"
							type="button"
						>
							Cancelar
						</Button>
					</form>
				</div>
			</Form>
		</div>
	);
}

type DescriptionSectionProps = {
	placeholder: string;
	box_specifications: string;
	form: UseFormReturn<any, any, any>;
};

function DescriptionSection({ placeholder, box_specifications, form }: DescriptionSectionProps) {
	const inputId = "input-placeholder";
	return (
		<FormField
			control={form.control}
			name="description"
			render={({ field }) => (
				<FormItem>
					<FormLabel htmlFor={inputId} className="font-sans text-base text-[#223332]">
						Descripción
					</FormLabel>
					<FormControl>
						<Textarea id={inputId} placeholder={placeholder} className={box_specifications} {...field} />
					</FormControl>
					<FormMessage />
				</FormItem>
			)}
		/>
	);
}

function PriceSection({ form }: { form: UseFormReturn<any, any, any> }) {
	const inputId = "input-form"; //para q el formlabel se pueda asociar con el input
	return (
		<FormField
			control={form.control}
			name="price"
			render={({ field }) => (
				<FormItem>
					<FormLabel
						htmlFor={inputId}
						className={clsx("font-sans text-base text-[#223332]", "text-[#223332]")}
					>
						Precio
					</FormLabel>
					<FormControl>
						<div className="relative w-full">
							<span className="absolute left-3 top-1/2 -translate-y-1/2 text-black">
								<DollarSign className="h-4 w-4" />
							</span>
							<Input id={inputId} className="w-6/6 h-10 pl-8 pr-4 text-lg" {...field} />
						</div>
					</FormControl>
					<FormMessage />
				</FormItem>
			)}
		/>
	);
}

function SelectFormSection({
	form,
	options,
	selectedSport,
	setSelectedSport,
}: {
	form: UseFormReturn<any, any, any>;
	options: Option[];
	selectedSport: string | null;
	setSelectedSport: (value: string | null) => void;
}) {
	return (
		<FormField
			control={form.control}
			name="sport"
			render={({ field }) => (
				<FormItem>
					<div className="flex flex-col">
						<FormLabel className="h-8 px-2 text-sm text-[#223332]">Deporte</FormLabel>
						<div className="w-full">
							<MultipleSelector
								value={field.value}
								onChange={(val) => {
									setSelectedSport(val[0]?.value ?? null);
									field.onChange(val);
								}}
								options={options}
								creatable
							/>
						</div>
					</div>
				</FormItem>
			)}
		/>
	);
}

export function SingleTournamentInfo({ tournament_id }: { tournament_id: string }) {
	const { env, URL_ORIGIN, id } = useLoaderData<typeof loader>();
	const supabase = createBrowserClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);
	const [inscriptions, setInscriptions] = useState<any[]>([]);

	const teamsData = getAllTeams(supabase);
	teamsData.refetch();

	useEffect(() => {
		const fetchInscriptions = async () => {
			const { data, error } = await supabase.from("inscriptions").select("*").eq("tournamentId", tournament_id); // Reemplaza con el ID del torneo actual

			if (error) {
				console.error("Error fetching inscriptions:", error);
			} else {
				setInscriptions(data || []);
			}
		};

		if (tournament_id) {
			fetchInscriptions();
		}
	}, [tournament_id]);

	return (
		<div className="mt-4 flex flex-col items-center text-sm text-gray-700">
			{inscriptions.length > 0 ? (
				<div className="w-full max-w-4xl space-y-2">
					<div className="flex justify-center border-b pb-1 font-semibold">
						<div className="w-1/3 text-center">Nombre</div>
						<div className="w-1/3 text-center">Teléfono</div>
						<div className="w-1/3 text-center">Email</div>
					</div>

					{inscriptions.map((inscription, index) => {
						const team = teamsData.data?.find((team) => team.team_id === inscription.teamId);

						return (
							<div key={index} className="flex justify-center py-1">
								<div className="w-1/3 text-center">{team?.name}</div>
								<div className="w-1/3 text-center">{team?.contactPhone}</div>
								<div className="w-1/3 text-center">{team?.contactEmail}</div>
							</div>
						);
					})}
				</div>
			) : (
				<p>No hay inscriptos.</p>
			)}
		</div>
	);
}

type TorneosSheetProps = {
	fieldId: string;
	tournaments: any[];
};

export function TorneosSheet({ fieldId, tournaments }: TorneosSheetProps) {
	const { env, URL_ORIGIN, id } = useLoaderData<typeof loader>();
	const supabase = createBrowserClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);
	const field = getFieldById(supabase, fieldId || "");
	const [showForm, setShowForm] = useState(false);

	const handleDelete = async (t_id: string) => {
		const { error } = await supabase.from("tournaments").delete().eq("id", t_id);

		// if (error) {
		// 	console.error("Error eliminando torneo:", error);
		// } else {
		// 	console.log("Torneo eliminado con éxito");
		// }
	};

	return (
		<Sheet>
			<SheetTrigger asChild>
				<Button
					variant="outline"
					className="bg-[#d97e01] text-sm font-medium hover:bg-white hover:text-[#d97e01]"
				>
					Ver torneos
				</Button>
			</SheetTrigger>
			<SheetContent
				side="bottom"
				className="max-h-[500px] w-full flex-col items-center space-y-5 overflow-y-auto"
			>
				<SheetHeader>
					<SheetTitle className="p-6 font-bold text-[#d97e01]">Torneos de {field.data?.name}</SheetTitle>
				</SheetHeader>
				{tournaments.length > 0 ? (
					<div className="flex flex-col items-center justify-center space-y-5">
						{tournaments.map((tournament) => (
							<div key={tournament.id} className="w-full rounded-lg p-4 shadow-md">
								<div className="flex items-center justify-between">
									<h2 className="text-lg font-bold">{tournament.name}</h2>
									<div className="flex items-center justify-between">
										<h2 className="text-lg font-bold">{tournament.name}</h2>
										<Button
											variant="destructive"
											className="ml-4 bg-red-600 text-white hover:bg-red-700"
											onClick={() => handleDelete(tournament.id)}
										>
											<Trash2 className="mr-2 h-4 w-4" />
											Borrar
										</Button>
									</div>
								</div>
								<p>Fecha de inicio: {new Date(tournament.startDate).toLocaleDateString()}</p>
								<p className="pt-3 text-sm text-gray-600">Inscriptos:</p>
								<SingleTournamentInfo tournament_id={tournament.id} />
							</div>
						))}
					</div>
				) : (
					<div className="flex flex-col items-center justify-center space-y-12">
						<p className="text-lg font-bold">No hay torneos disponibles</p>
					</div>
				)}
				<div className="p-4">
					<Button
						variant="outline"
						className="bg-[#223332] text-sm font-medium text-white hover:bg-[#d97e01] hover:text-[#223332]"
						onClick={() => setShowForm(!showForm)}
					>
						Agregar Torneo
					</Button>
					{showForm && <TournamentForm fieldId={fieldId} onClose={() => setShowForm(false)} />}
				</div>
			</SheetContent>
		</Sheet>
	);
}
