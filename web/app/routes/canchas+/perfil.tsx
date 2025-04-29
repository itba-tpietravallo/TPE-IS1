import { LoaderFunctionArgs } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { createBrowserClient } from "@supabase/ssr";
import { useEffect, useState } from "react";
import { ProfilePictureAvatar } from "~/components/profile-picture";
import { Card, CardContent, CardDescription, CardFooter, CardHeader } from "~/components/ui/card";
import { authenticateUser } from "~/lib/auth.server";
import { FieldsPreviewGrid } from "./_index";
import { getAllFieldsByOwner } from "@lib/autogen/queries";

type Field = {
	avatar_url: string;
	city: string;
	description: string;
	id: string;
	images: string[];
	location: {
		type: string;
		coordinates: number[];
	};
	name: string;
	neighborhood: string;
	owner: string;
	sports: string[];
	street: string;
	street_number: string;
};

export async function loader({ request }: LoaderFunctionArgs) {
	const env = {
		SUPABASE_URL: process.env.SUPABASE_URL!,
		SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY!,
	};

	return { ...(await authenticateUser(request)), env };
}

export default function Index() {
	const { user, avatar_url, email, phone, full_name, env } = useLoaderData<typeof loader>();
	const supabase = createBrowserClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);
	const { data: fields } = getAllFieldsByOwner(supabase, user.id);

	return (
		<>
			<div className="items-left flex h-fit min-h-fit w-full flex-col justify-start gap-4 p-4">
				<div>
					<h1 className="text-3xl">Tu perfil</h1>
					<Card className="w-full">
						<CardHeader className="w-full text-left">
							<div className="grid max-w-fit grid-cols-4 items-center gap-4">
								<h2 className="col-span-3 text-2xl font-bold">{full_name}</h2>
								<ProfilePictureAvatar
									str={avatar_url}
									name={full_name}
									className="h-full max-h-20 w-full max-w-20"
								/>
							</div>
						</CardHeader>
						<CardContent>
							<hr className="mb-2" />
							<CardDescription className="flex flex-col gap-4">
								<h2 className="text-xl text-muted-foreground">Informacion de tu cuenta</h2>
								<ul className="flex h-auto flex-col gap-2">
									<li className="flex flex-row items-center gap-2">
										<span className="text-lg font-bold">Email:</span>
										<span className="text-lg">{email}</span>
									</li>
									<li className="flex flex-row items-center gap-2">
										<span className="text-lg font-bold">Telefono:</span>
										<span className="text-lg">{phone || "(no vinculado)"}</span>
									</li>
									<li className="flex flex-row items-center gap-2">
										<span className="text-lg font-bold">Cuenta creada el dia:</span>
										<span className="text-lg">
											{new Date(user?.created_at).toLocaleDateString()}
										</span>
									</li>
								</ul>
								<Link
									to={"https://matchpointapp.com.ar/api/v1/payments/oauth/mercadopago"}
									className="h-fit w-fit cursor-pointer rounded border border-blue-600 bg-blue-300 p-2 px-4 text-lg leading-none text-black shadow-sm"
								>
									Vincular a Mercado Pago
								</Link>
							</CardDescription>
						</CardContent>
					</Card>
				</div>
				<div>
					<h1 className="text-3xl">Canchas vinculadas</h1>
					<Card className="h-fit min-h-fit w-full">
						<CardHeader className="w-full text-left">
							<h2 className="text-2xl font-bold">Tus canchas</h2>
						</CardHeader>
						<CardContent>
							<hr className="mb-2" />
							<CardDescription>
								{(fields || [])?.length === 0 ? (
									<p className="text-lg">No tienes canchas vinculadas a tu cuenta.</p>
								) : (
									<FieldsPreviewGrid
										fields={(fields || [])?.map((field) => ({
											id: field.id,
											name: field.name,
											location: `${field.street} ${field.street_number}, ${field.neighborhood}, ${field.city}`,
											price: field.price,
											img: (field.images || [])[0] || "undefined_image",
										}))}
									/>
								)}
							</CardDescription>
						</CardContent>
					</Card>
				</div>
			</div>
		</>
	);
}
