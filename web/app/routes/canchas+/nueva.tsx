"use client";

import { set, useForm, UseFormReturn } from "react-hook-form";
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
import { LoaderFunctionArgs } from "@remix-run/node";
import { createBrowserClient } from "@supabase/ssr";
import { useLoaderData } from "@remix-run/react";
import { authenticateUser } from "~/lib/auth.server";
import { User } from "@supabase/supabase-js";
import { DollarSign } from "lucide-react";
import { getAllSports, insertNewField } from "@/lib/autogen/queries";
import { APIProvider, Map, AdvancedMarker, Pin, InfoWindow } from "@vis.gl/react-google-maps";
import debounce from "lodash.debounce";

export async function loader(args: LoaderFunctionArgs) {
	const env = {
		SUPABASE_URL: process.env.SUPABASE_URL!,
		SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY!,
	};

	const user = (await authenticateUser(args.request)) as { user: User; avatar_url: string };

	return {
		env,
		URL_ORIGIN: new URL(args.request.url).origin,
		user,
	};
}

//extraigo la logica del geocode de lu a una funcion. Asi puedo llamarla desde el mapa
type GeocodeResult = {
	lat: number;
	lng: number;
} | null;

export async function getCoordinates(
	street: string,
	street_number: string,
	city: string,
	apiKey: string,
): Promise<GeocodeResult> {
	if (!street || !street_number || !city || !apiKey) {
		console.warn("Geocoding skipped: Missing address components or API key."); //para debuggear
		return null;
	}
	const direction = `${street} ${street_number}, ${city}`;
	const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(direction)}&key=${apiKey}`;

	const locationData = await fetch(url)
		.then((res) => res.json() as unknown as { results: { geometry: any }[]; status: string })
		.catch(() => null);

	if (!locationData || locationData.status != "OK") {
		console.warn(`Geocoding failed for address ${direction}: ${locationData?.status}`);
		return null;
	}

	const { lat, lng } = locationData.results[0].geometry.location;
	return { lat, lng };
}

export function NewField() {
	const { user, URL_ORIGIN, env } = useLoaderData<typeof loader>();

	const supabase = createBrowserClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);
	const [formError, setFormError] = useState(false);

	const [geocodingError, setGeocodingError] = useState<string | null>(null);

	const form = useForm({
		defaultValues: {
			section: "",
			name: "",
			street: "",
			street_number: "",
			neighbourhood: "",
			city: "",
			sports: [],
			image: [],
			price: "",
			description: "",
		},
	});

	const apiKey = "AIzaSyBw6wwGh_tfBhOikkUtc8uibxX1GPbr1ew";
	const [latitude, setLatitude] = useState<number | null>(null);
	const [longitude, setLongitude] = useState<number | null>(null);
	const defaultMapCenter = useMemo(() => ({ lat: -34.37, lng: -58.25 }), []); //buenos aires (default)
	const [mapView, setMapView] = useState({ center: defaultMapCenter, zoom: 9 });

	// --- Geo ---
	const handleGeocodeResult = useCallback(
		(result: Awaited<ReturnType<typeof getCoordinates>>) => {
			if (result) {
				setLatitude(result.lat);
				setLongitude(result.lng);
				setGeocodingError(null);
				setMapView({ center: { lat: result.lat, lng: result.lng }, zoom: 15 });
			} else {
				setLatitude(null);
				setLongitude(null);
				setGeocodingError("No se pudo encontrar la dirección en el mapa.");
			}
		},
		[setLatitude, setLongitude, setGeocodingError, setMapView, defaultMapCenter],
	);

	// Debounce de la llamada a la funcion getCoordinates
	const debouncedGeocode = useMemo(
		() =>
			debounce(async (street: string, street_number: string, city: string) => {
				setGeocodingError(null);
				const result = await getCoordinates(street, street_number, city, apiKey);
				handleGeocodeResult(result);
			}, 750),
		[apiKey, handleGeocodeResult],
	);

	//watch de los campos street, city y altura
	const watchedStreet = form.watch("street");
	const watchedStreetNumber = form.watch("street_number");
	const watchedCity = form.watch("city");

	//  trigger el debounced geocoding
	useEffect(() => {
		// Only call if essential fields have some value, prevents initial empty calls
		if (watchedStreet || watchedStreetNumber || watchedCity) {
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

	//Aca terminaria la geocodeada

	const onSubmit = async (data: any) => {
		try {
			const files = data.image || [];
			const uploadedImageUrls: string[] = [];

			for (const file of files) {
				const filePath = `fields/${Date.now()}-${file.name}`;

				const { error: uploadError } = await supabase.storage.from("venues").upload(filePath, file);

				if (uploadError) {
					throw new Error(`Error uploading ${file.name}: ${uploadError.message}`);
				}

				const { data: publicUrlData } = supabase.storage.from("venues").getPublicUrl(filePath);

				if (publicUrlData?.publicUrl) {
					uploadedImageUrls.push(publicUrlData.publicUrl);
				}
			}

			// //const apiKey = "AIzaSyBw6wwGh_tfBhOikkUtc8uibxX1GPbr1ew";
			// const direction = `${data.street} ${data.street_number}, ${data.city}`;
			// const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(direction)}&key=${apiKey}`;
			// const locationData = await fetch(url)
			// 	.then((res) => res.json() as unknown as { results: { geometry: any }[]; status: string })
			// 	.catch(() => null);

			// if (!locationData || locationData.status != "OK") {
			setFormError(true);
			// 	setLatitude(null);
			// 	setLongitude(null);
			// 	throw new Error(`The coordinates could not be retrieved from address ${direction}.`);
			// }

			// const { lat, lng } = locationData.results[0].geometry.location;
			// setLatitude(lat);
			// setLongitude(lng);

			// console.log(lat, lng);

			let currentLat = latitude;
			let currentLng = longitude;

			if (currentLat === null || currentLng === null) {
				console.log("Coordinates missing on submit, attempting final geocode...");
				const result = await getCoordinates(data.street, data.street_number, data.city, apiKey);
				if (result) {
					currentLat = result.lat;
					currentLng = result.lng;

					setLatitude(result.lat);
					setLongitude(result.lng);
					setGeocodingError(null);
					setMapView({ center: { lat: result.lat, lng: result.lng }, zoom: 15 });
				} else {
					setGeocodingError(
						"Por favor, ingrese una dirección válida para ubicarla en el mapa antes de publicar.",
					);
					setFormError(true);
					return;
				}
			}

			const sportsArray = Array.isArray(data.sports)
				? data.sports.map((s: any) => (typeof s === "string" ? s : s.value || s.label))
				: [];

			const { error: insertError } = await insertNewField(supabase, {
				owner: user.user.id,
				name: data.name,
				street: data.street,
				street_number: data.street_number,
				neighborhood: data.neighbourhood,
				city: data.city,
				sports: sportsArray,
				images: uploadedImageUrls,
				price: Number(data.price),
				location: `POINT(${currentLat} ${currentLng})`,
				description: data.description,
				avatar_url: user.avatar_url,
			});

			if (insertError) throw new Error(`Insert error: ${insertError.message}`);
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

	const options = useMemo(
		() =>
			(sports || [])?.map((item) => ({
				label: item.name,
				value: item.name.toLowerCase(),
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
						apiKey={apiKey}
						geocodingError={geocodingError}
						mapCenter={mapView.center}
						mapZoom={mapView.zoom}
						onCloseErrorPopup={() => {
							setGeocodingError(null);
							//aca podriamos resetear el mapa a buenos aires si las coordenadas no cierran
							//if (latitude === null && longitude === null) {
							// setMapView({ center: defaultMapCenter, zoom: 9 });
							//}
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
type AddressSectionProps = {
	form: UseFormReturn<any, any, any>;
	latitude: number | null;
	longitude: number | null;
	apiKey: string;
	geocodingError: string | null;
	mapCenter: { lat: number; lng: number };
	mapZoom: number;
	onCloseErrorPopup: () => void;
};

function AddressSection({
	form,
	latitude,
	longitude,
	apiKey,
	geocodingError,
	mapCenter,
	mapZoom,
	onCloseErrorPopup,
}: AddressSectionProps) {
	const mapId = "535bcf376e37682b";
	const inputId = `input-${form}`;
	const showErrorPopup = geocodingError !== null;

	return (
		<div className="flex flex-col space-y-5">
			<FormLabel htmlFor={inputId} className="font-sansfont-sans text-base text-[#223332]">
				Dirección
			</FormLabel>
			<div className="flex flex-row space-x-10">
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
			<APIProvider apiKey={apiKey}>
				<div style={{ width: "100%", height: "400px" }}>
					<Map
						mapId={mapId}
						zoom={mapZoom}
						center={mapCenter}
						key={`${mapCenter.lat}-${mapCenter.lng}-${mapZoom}`}
						gestureHandling="greedy"
						disableDefaultUI={true}
					>
						{latitude !== null && longitude !== null && (
							<AdvancedMarker position={{ lat: latitude, lng: longitude }}>
								<Pin />
							</AdvancedMarker>
						)}
						{showErrorPopup && (
							<InfoWindow position={mapCenter} onCloseClick={onCloseErrorPopup}>
								<p>{geocodingError}</p>
							</InfoWindow>
						)}
					</Map>
				</div>
			</APIProvider>
		</div>
	);
}

function SelectFormSection({ form, options }: { form: UseFormReturn<any, any, any>; options: Option[] }) {
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
								value={field.value || []}
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

function ImageSection({ form }: { form: UseFormReturn<any, any, any> }) {
	const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
	const fileInputRef = useRef<HTMLInputElement | null>(null);
	const inputId = "input-form";

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
			name="images"
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
//fuera del tema mapa:
// los errores  dejan el setFormError(false); y no se actualiza. osea q si hubo un error en algun lado nunca mas te habilita a subr creo
