"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "../../components/ui/button";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "../../components/ui/form";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import MultipleSelector, { Option } from "../../components/ui/multiselector";
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import clsx from "clsx";
import { LoaderFunctionArgs, json } from "@remix-run/node";
import { createBrowserClient } from "@supabase/ssr";
import { useLoaderData, useSubmit } from "@remix-run/react";
import { authenticateUser } from "~/lib/auth.server";
import { User } from "@supabase/supabase-js";
import { DollarSign } from "lucide-react";
import { getAllSports, useInsertField } from "@/lib/autogen/queries";
import { APIProvider, Map, AdvancedMarker, Pin, InfoWindow, Marker } from "@vis.gl/react-google-maps";
import debounce from "lodash.debounce";
import { Database } from "@lib/autogen/database.types";
import { __GET_PUBLIC_ENV } from "@lib/getenv.server";

// Zod schema for form validation
const fieldSchema = z.object({
	name: z.string().min(1, "El nombre es requerido"),
	street: z.string().min(1, "La calle es requerida"),
	street_number: z.string().min(1, "El número es requerido"),
	neighbourhood: z.string().min(1, "El barrio es requerido"),
	city: z.string().min(1, "La ciudad es requerida"),
	sports: z
		.array(
			z.object({
				label: z.string(),
				value: z.string(),
			}),
		)
		.min(1, "Selecciona al menos un deporte"),
	image: z.array(z.any()).optional(),
	price: z
		.string()
		.min(1, "El precio es requerido")
		.refine((val) => !isNaN(Number(val)), "El precio debe ser un número"),
	description: z.string().optional(),
});

type FieldFormData = z.infer<typeof fieldSchema>;

// 1. Create a type for string-only fields in FieldFormData
// This will be used to restrict BasicBox to only string fields

type StringFieldKeys = {
	[K in keyof FieldFormData]: FieldFormData[K] extends string ? K : never;
}[keyof FieldFormData] &
	string;

export async function loader(args: LoaderFunctionArgs) {
	const env = {
		SUPABASE_URL:
			process.env.VERCEL_ENV === "production" ? process.env.PROD_SUPABASE_URL! : process.env.DEV_SUPABASE_URL!,
		SUPABASE_ANON_KEY:
			process.env.VERCEL_ENV === "production"
				? process.env.PROD_SUPABASE_ANON_KEY!
				: process.env.DEV_SUPABASE_ANON_KEY!,
	};

	const user = (await authenticateUser(args.request)) as { user: User; avatar_url: string };

	return {
		env,
		URL_ORIGIN: new URL(args.request.url).origin,
		GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_WEB_API_KEY,
		__GET_PUBLIC_ENV: __GET_PUBLIC_ENV((process.env.VERCEL_ENV || "development") as "production" | "development"),
		user,
		headers: {
			"Access-Control-Allow-Origin": "*",
		},
	};
}

export function NewField() {
	const { user, URL_ORIGIN, env, GOOGLE_MAPS_API_KEY, __GET_PUBLIC_ENV } = useLoaderData<typeof loader>();
	const submit = useSubmit();
	const supabase = createBrowserClient<Database>(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);
	const [formError, setFormError] = useState(false);
	const [geocodingError, setGeocodingError] = useState<string | null>(null);

	const form = useForm<FieldFormData>({
		resolver: zodResolver(fieldSchema),
		defaultValues: {
			name: "",
			street: "",
			street_number: "",
			neighbourhood: "",
			city: "",
			sports: [],
			image: undefined,
			price: "",
			description: "",
		},
	});

	const [latitude, setLatitude] = useState<number | null>(null);
	const [longitude, setLongitude] = useState<number | null>(null);
	const defaultMapCenter = useMemo(() => ({ lat: -34.37, lng: -58.25 }), []); // Buenos Aires (default)
	const [mapView, setMapView] = useState({ center: defaultMapCenter, zoom: 9 });

	// Debounced geocoding function
	const debouncedGeocode = useMemo(
		() =>
			debounce(
				async (street: string, street_number: string, city: string) => {
					setGeocodingError(null);
					const response = await fetch("/api/v1/geocode", {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({ street, street_number, city }),
					});
					const data = await response.json();

					if (data.error) {
						setGeocodingError("Ingrese una dirección válida");
						setLatitude(null);
						setLongitude(null);
					} else {
						setLatitude(data.lat);
						setLongitude(data.lng);
						setMapView({ center: { lat: data.lat, lng: data.lng }, zoom: 15 });
					}
				},
				250,
				{ leading: false },
			),
		[],
	);

	// Watch address fields for changes
	const watchedStreet = form.watch("street");
	const watchedStreetNumber = form.watch("street_number");
	const watchedCity = form.watch("city");

	useEffect(() => {
		if (watchedStreet && watchedStreetNumber && watchedCity) {
			debouncedGeocode(watchedStreet, watchedStreetNumber, watchedCity);
		} else {
			setLatitude(null);
			setLongitude(null);
			setGeocodingError(null);
		}

		return () => {
			debouncedGeocode.cancel();
		};
	}, [watchedStreet, watchedStreetNumber, watchedCity, debouncedGeocode]);

	const onSubmit = async (data: FieldFormData) => {
		console.log("on sub");
		try {
			if (!latitude || !longitude) {
				setGeocodingError(
					"Por favor, ingrese una dirección válida para ubicarla en el mapa antes de publicar.",
				);
				setFormError(true);
				// return;
			}

			const files = data.image || [];
			const uploadedImageUrls: string[] = [];

			for (const file of files) {
				let headers = new Headers();
				const { downloadURL, signedPUTURL } =
					await // @todo: Refactor once migration to /api/v1/env is implemented
					(
						await fetch(new URL("/api/v1/storage/upload", __GET_PUBLIC_ENV.URL_ORIGIN).toString(), {
							method: "POST",
							body: JSON.stringify({ fileName: file.name, type: "application/octet-stream" }),
							headers,
						})
					).json();

				headers = new Headers();
				headers.set("Content-Type", "application/octet-stream");

				await fetch(signedPUTURL, {
					method: "PUT",
					headers,
					body: file,
				});

				uploadedImageUrls.push(downloadURL);
			}

			await insertFieldMutation.mutateAsync([
				{
					owner: user.user.id,
					name: data.name,
					street: data.street,
					street_number: data.street_number,
					neighborhood: data.neighbourhood,
					city: data.city,
					sports: data.sports.map((s) => s.value),
					images: uploadedImageUrls,
					price: Number(data.price),
					location: `POINT(${latitude || 0} ${longitude || 0})`,
					description: data.description || "",
					avatar_url: user.avatar_url,
				},
			]);

			window.location.href = `${URL_ORIGIN}/canchas`;
		} catch (err: any) {
			console.error("Submission failed:", err.message || err);
			setFormError(true);
			setGeocodingError("Error al cargar el formulario");
			setLatitude(null);
			setLongitude(null);
		}
	};

	const { data: sports } = getAllSports(supabase);
	const insertFieldMutation = useInsertField(supabase);

	const options = useMemo(
		() =>
			(sports || [])?.map((item) => ({
				label: item.name,
				value: item.name,
			})),
		[sports],
	);

	return (
		<div className="flex min-h-screen flex-col items-center justify-center space-y-12 bg-[#f2f4f3]">
			<h1 className="mb-4 mt-11 text-4xl font-bold text-[#f18f01]">Publicar nueva cancha</h1>
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
					<BasicBox
						section="name"
						label="Nombre"
						placeholder=""
						description=""
						box_specifications="w-6/12 h-10 text-lg px-4"
						label_specifications="text-base font-sans text-[#223332]"
						form={form}
					/>
					<hr className="my-4 border-t border-gray-300" />
					<AddressSection
						form={form}
						latitude={latitude}
						longitude={longitude}
						setLatitude={setLatitude}
						setLongitude={setLongitude}
						geocodingError={geocodingError}
						mapCenter={mapView.center}
						mapZoom={mapView.zoom}
						GOOGLE_MAPS_API_KEY={GOOGLE_MAPS_API_KEY!}
						onCloseErrorPopup={() => {
							setGeocodingError(null);
						}}
					/>
					<hr className="my-4 border-t border-gray-300" />
					<SelectFormSection form={form} options={options} />
					<hr className="my-4 border-t border-gray-300" />
					<ImageSection form={form} />
					<hr className="my-4 border-t border-gray-300" />
					<PriceSection form={form} />
					<hr className="my-4 border-t border-gray-300" />
					<DescriptionSection
						placeholder="Información adicional sobre la cancha y servicios. Por ejemplo, cantidad de jugadores, días y horarios de apertura."
						box_specifications="w-[800px] h-[200px] text-lg px-4"
						form={form}
					/>
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
				</form>
			</Form>
		</div>
	);
}

// 2. Update BasicBoxProps to use StringFieldKeys

type BasicBoxProps = {
	section: StringFieldKeys;
	label: string;
	placeholder: string;
	description: string;
	box_specifications: string;
	label_specifications?: string;
	form: ReturnType<typeof useForm<FieldFormData>>;
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
	const inputId = `input-${section}`;
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

type AddressSectionProps = {
	form: ReturnType<typeof useForm<FieldFormData>>;
	latitude: number | null;
	longitude: number | null;
	setLatitude: (lat: number) => void;
	setLongitude: (lng: number) => void;

	GOOGLE_MAPS_API_KEY: string;
	geocodingError: string | null;
	mapCenter: { lat: number; lng: number };
	mapZoom: number;
	onCloseErrorPopup: () => void;
};

function AddressSection({
	form,
	latitude,
	longitude,
	setLatitude,
	setLongitude,
	GOOGLE_MAPS_API_KEY,
	geocodingError,
	mapCenter,
	mapZoom,
	onCloseErrorPopup,
}: AddressSectionProps) {
	const mapId = "535bcf376e37682b";
	const showErrorPopup = geocodingError !== null;

	return (
		<div className="flex flex-col gap-4">
			<FormLabel className="font-sans text-base text-[#223332]">Dirección</FormLabel>
			<div className="flex flex-row gap-6">
				<div className="flex w-1/3 flex-col gap-4">
					<BasicBox
						section="street"
						label="Calle"
						placeholder=""
						description=""
						box_specifications="w-400 h-10 text-lg px-4"
						form={form}
					/>
					<BasicBox
						section="street_number"
						label="Número"
						placeholder=""
						description=""
						box_specifications="w-400 h-10 text-lg px-4"
						form={form}
					/>
					<BasicBox
						section="neighbourhood"
						label="Barrio"
						placeholder=""
						description=""
						box_specifications="w-400 h-10 text-lg px-4"
						form={form}
					/>
					<BasicBox
						section="city"
						label="Ciudad"
						placeholder=""
						description=""
						box_specifications="w-400 h-10 text-lg px-4"
						form={form}
					/>
				</div>
				<div className="h-[400px] w-2/3">
					<APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
						<Map
							mapId={mapId}
							zoom={mapZoom}
							center={mapCenter}
							key={`${mapCenter.lat}-${mapCenter.lng}-${mapZoom}`}
							gestureHandling="greedy"
							disableDefaultUI={false}
							mapTypeId="roadmap"
						>
							{latitude !== null && longitude !== null && (
								<Marker
									position={{ lat: latitude, lng: longitude }}
									draggable={true}
									icon={{
										url: "/matchpoint-marker.png",
										//scaledSize: { width: 32, height: 32 }
									}}
									onDragEnd={(e) => handleMarkerDragEnd(e, setLatitude, setLongitude, form)}
								/>
							)}
							{showErrorPopup && (
								<InfoWindow position={mapCenter} onCloseClick={onCloseErrorPopup}>
									<p>{geocodingError}</p>
								</InfoWindow>
							)}
						</Map>
					</APIProvider>
				</div>
			</div>
		</div>
	);
}

async function handleMarkerDragEnd(
	e: google.maps.MapMouseEvent,
	setLatitude: (lat: number) => void,
	setLongitude: (lng: number) => void,
	form: ReturnType<typeof useForm<FieldFormData>>,
) {
	const newLat = e.latLng?.lat();
	const newLng = e.latLng?.lng();

	if (newLat !== undefined && newLng !== undefined) {
		setLatitude(newLat);
		setLongitude(newLng);

		try {
			const res = await fetch("/api/v1/geocode", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ lat: newLat, lng: newLng }),
			});
			const data = await res.json();

			if (!data.error) {
				form.setValue("street", data.street);
				form.setValue("street_number", data.street_number);
				form.setValue("neighbourhood", data.neighbourhood);
				form.setValue("city", data.city);
			}
		} catch (error) {
			console.error("Reverse geocoding failed", error);
		}
	}
}

function SelectFormSection({ form, options }: { form: ReturnType<typeof useForm<FieldFormData>>; options: Option[] }) {
	return (
		<FormField
			control={form.control}
			name="sports"
			render={({ field }) => (
				<FormItem>
					<div className="flex flex-col space-y-2">
						<FormLabel className="font-sans text-base text-[#223332]">Deporte/s</FormLabel>
						<div className="w-full">
							<MultipleSelector
								value={field.value as Option[]}
								onChange={(val) => field.onChange(val)}
								options={options}
								placeholder="Escribir el deporte si no aparece como opción..."
								creatable
								emptyIndicator={
									<p className="text-center text-lg leading-10 text-gray-600 dark:text-gray-400">
										Ningún resultado encontrado.
									</p>
								}
							/>
						</div>
					</div>
				</FormItem>
			)}
		/>
	);
}

function PriceSection({ form }: { form: ReturnType<typeof useForm<FieldFormData>> }) {
	const inputId = "input-price";
	return (
		<FormField
			control={form.control}
			name="price"
			render={({ field }) => (
				<FormItem>
					<FormLabel htmlFor={inputId} className="font-sans text-base text-[#223332]">
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

type DescriptionSectionProps = {
	placeholder: string;
	box_specifications: string;
	form: ReturnType<typeof useForm<FieldFormData>>;
};

function DescriptionSection({ placeholder, box_specifications, form }: DescriptionSectionProps) {
	const inputId = "input-description";
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

function ImageSection({ form }: { form: ReturnType<typeof useForm<FieldFormData>> }) {
	const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
	const fileInputRef = useRef<HTMLInputElement | null>(null);
	const inputId = "input-image";

	const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const files = event.target.files;
		if (files) {
			const newFiles = Array.from(files);
			setSelectedFiles((prevFiles) => [...prevFiles, ...newFiles]);
			form.setValue("image", [...selectedFiles, ...newFiles]);
		}
	};

	const handleRemoveFile = (index: number) => {
		setSelectedFiles((prevFiles) => {
			const updatedFiles = prevFiles.filter((_, i) => i !== index);
			form.setValue("image", updatedFiles);
			return updatedFiles;
		});
	};

	const handleButtonClick = () => {
		if (fileInputRef.current) {
			fileInputRef.current.click();
		}
	};

	return (
		<FormField
			control={form.control}
			name="image"
			render={() => (
				<FormItem>
					<FormLabel htmlFor={inputId} className="font-sans text-base text-[#223332]">
						Imágenes
					</FormLabel>
					<FormControl>
						<div className="flex flex-col gap-2">
							<input
								id={inputId}
								type="file"
								multiple
								accept="image/*"
								ref={fileInputRef}
								onChange={handleFileChange}
								className="hidden"
							/>

							<Button
								type="button"
								className="h-8 w-1/5 bg-[#223332] px-6 py-2 text-sm hover:bg-[#f18f01]/80"
								onClick={handleButtonClick}
							>
								Seleccionar archivos
							</Button>

							<div className="text-sm">
								{selectedFiles.length > 0 ? (
									<ul className="list-disc space-y-2 pl-5">
										{selectedFiles.map((file, index) => (
											<li key={index} className="flex items-center justify-between">
												<span>{file.name}</span>
												<Button
													variant="ghost"
													size="sm"
													className="ml-2 text-xs text-black"
													onClick={() => handleRemoveFile(index)}
												>
													Remove
												</Button>
											</li>
										))}
									</ul>
								) : (
									<p className="text-gray-500">Ninguna imagen seleccionada</p>
								)}
							</div>
						</div>
					</FormControl>
					<FormMessage />
				</FormItem>
			)}
		/>
	);
}

export default NewField;

//@loladv: todo

//para la siguiente semana o sprint:
// - que el ususario pueda mover el pin
// - guardar la nueva lat y lng del pin si es que el usuario lo mueve
// - no se muestra error si el input no es correcto. Por ejemplo si pones LOLA es la altura no pasa nada. podria decir un error
//estaria bueno que el marker fuese el logito de matchpoint
//fuera del tema mapa:
// los errores  dejan el setFormError(false); y no se actualiza. osea q si hubo un error en algun lado nunca mas te habilita a subr creo
