"use client";

import { useForm, UseFormReturn } from "react-hook-form";
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
import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { LoaderFunctionArgs } from "@remix-run/node";
import { createBrowserClient, createServerClient } from "@supabase/ssr";
import { useLoaderData } from "@remix-run/react";

export function loader(args: LoaderFunctionArgs) {
	const env = {
		SUPABASE_URL: process.env.SUPABASE_URL!,
		SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY!,
	}
	
	return {
		env,
		URL_ORIGIN: new URL(args.request.url).origin
	};
}

export function NewField() {
	const { URL_ORIGIN, env } = useLoaderData<typeof loader>();

	const supabase = createBrowserClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);

	const form = useForm({
		defaultValues: { section: "" },
	});

	const onSubmit = async (data: any) => {
		try {
			const files = data.image || [];
    		const uploadedImageUrls: string[] = [];

    		for (const file of files) {
      			const filePath = `fields/${Date.now()}-${file.name}`;

      			// Upload to Supabase storage
      			const { error: uploadError } = await supabase.storage
        				.from("venues")
        				.upload(filePath, file);

     			if (uploadError) {
        			throw new Error(`Error uploading ${file.name}: ${uploadError.message}`);
     			}

      			// Get public URL
     			const { data: publicUrlData } = supabase
        				.storage
        				.from("venues")
        				.getPublicUrl(filePath);

      			if (publicUrlData?.publicUrl) {
        			uploadedImageUrls.push(publicUrlData.publicUrl);
     			}
    		}

			// Insert form data into a table
			const { error: insertError } = await supabase.from("fields").insert([
				{
					name: data.name,
					street: data.street,
					street_number: data.street_number,
					neighborhood: data.neighbourhood,
					city: data.city,
					sports: data.sports,
					images_urls: uploadedImageUrls,
					description: data.description,
				},
			]);
	
			if (insertError) throw new Error(`Insert error: ${insertError.message}`);

		} catch (err: any) {
			console.error("Submission failed:", err.message || err);
		}
	};
	

	const [options, setOptions] = useState<Option[]>([]);

	useEffect(() => {
		supabase.from("sports").select("name").then((values) => {

			if (values.error) {
				console.error("Error fetching sports:", values.error.message);
				return;
			}

			const fetchedOptions: Option[] = values.data.map((item) => ({
				label: item.name,
				value: item.name.toLowerCase(),
			}));

			setOptions(fetchedOptions);
		});
	}, []);

	return (
		<div className="flex flex-col items-center justify-center min-h-screen space-y-12 bg-[#f2f4f3]">

			<h1 className="text-4xl font-bold mb-4 text-[#f18f01] mt-11">Publicar nueva cancha</h1>
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
					<AddressSection form={form} />
					<hr className="my-4 border-t border-gray-300" />
					<SelectFormSection form={form} options={options} />
					<hr className="my-4 border-t border-gray-300" />
					<ImageSection form={form} />
					<hr className="my-4 border-t border-gray-300" />
					<DescriptionSection
						placeholder="Información adicional sobre la cancha y servicios. Por ejemplo, cantidad de jugadores, días y horarios de apertura."
						box_specifications="w-[800px] h-[200px] text-lg px-4"
						form={form}
					/>
					<div className="flex justify-center items-center w-full">
						<Button className="w-2/12 h-10 text-base bg-[#223332] hover:bg-[#f18f01]/80 mt-5 mb-11" type="submit">
							Publicar
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
	form: UseFormReturn<any, any, undefined>;
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
	return (
		<FormField
			control={form.control}
			name={section}
			render={({ field }) => (
				<FormItem>
					<FormLabel className={clsx(`${label_specifications}`, "text-[#223332]")}>{label}</FormLabel>
					<FormControl>
						<Input
							placeholder={placeholder}
							className={box_specifications}
							{...field}
						/>
					</FormControl>
					<FormDescription>{description}</FormDescription>
					<FormMessage />
				</FormItem>
			)}
		/>
	);
}

function AddressSection({
	form,
}: {
	form: UseFormReturn<any, any, undefined>;
}) {
	return (
		<div className="flex flex-col space-y-5">
			<FormLabel className="text-base font-sansfont-sans text-[#223332]">Dirección</FormLabel>
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
		</div>
	);
}

function SelectFormSection({
	form,
	options,
}: {
	form: UseFormReturn<any, any, undefined>;
	options: Option[];
}) {
	return (
		<FormField
			control={form.control}
			name="sports"
			render={() => (
				<FormItem>
					<div className="flex flex-col space-y-2">
						<FormLabel className="text-base font-sans text-[#223332]">Deporte/s</FormLabel>
						<div className="w-full">
							<MultipleSelector
								options={options}
								placeholder="Escribir el deporte si no aparece como opción..."
								creatable
								emptyIndicator={
									<p className="text-center] text-lg leading-10 text-gray-600 dark:text-gray-400">
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

type DescriptionSectionProps = {
	placeholder: string;
	box_specifications: string;
	form: UseFormReturn<any, any, undefined>;
};

function DescriptionSection({
	placeholder,
	box_specifications,
	form,
}: DescriptionSectionProps) {
	return (
		<FormField
			control={form.control}
			name="description"
			render={({ field }) => (
				<FormItem>
					<FormLabel className="text-base font-sans text-[#223332]">Descripción</FormLabel>
					<FormControl>
						<Textarea
							placeholder={placeholder}
							className={box_specifications}
							{...field}
						/>
					</FormControl>
					<FormMessage />
				</FormItem>
			)}
		/>
	);
}

function ImageSection({ form }: { form: UseFormReturn<any, any, undefined> }) {
	const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
	const fileInputRef = useRef<HTMLInputElement | null>(null);

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
					<FormLabel className="text-base font-sans text-[#223332]">Imágenes</FormLabel>
					<FormControl>
						<div className="flex flex-col gap-2">
							<input
								type="file"
								multiple
								accept="image/*"
								ref={fileInputRef}
								onChange={handleFileChange}
								className="hidden"
							/>

							<Button
								type="button"
								className="w-1/5 h-8 text-sm py-2 px-6 bg-[#223332] hover:bg-[#f18f01]/80"
								onClick={handleButtonClick}
							>
								Seleccionar archivos
							</Button>

							<div className="text-sm">
								{selectedFiles.length > 0 ? (
									<ul className="list-disc pl-5 space-y-2">
										{selectedFiles.map((file, index) => (
											<li
												key={index}
												className="flex items-center justify-between"
											>
												<span>{file.name}</span>
												<Button
													variant="ghost"
													size="sm"
													className="ml-2 text-xs text-black "
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
