import { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { createBrowserClient } from "@supabase/ssr";
import { useEffect, useState } from "react";
import { FieldDetail } from "./FieldDetail";

import { getAllReservationsForFieldById, getFieldById, getAllTournamentsForFieldById } from "@lib/autogen/queries";

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

export default function FieldDetailPage() {
	// @todo prefetch images
	const { env, URL_ORIGIN, id } = useLoaderData<typeof loader>();
	const supabase = createBrowserClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);
	const { data: field } = getFieldById(supabase, id || "");
	const { data: reservations } = getAllReservationsForFieldById(supabase, id || "");
	const { data: tournaments } = getAllTournamentsForFieldById(supabase, id || "");

	const [name, setName] = useState(field?.name);
	const [description, setDescription] = useState(field?.description);

	// Isn't this an infinite loop?
	// -- Tomas Pietravallo (2024-04-28)
	// It wasnt but caused other issues 2024-05-13
	useEffect(() => {
		setName(field?.name);
		setDescription(field?.description);
	}, [field?.name, field?.description]);

	return (
		<FieldDetail
			key={id}
			name={name || ""}
			description={description || ""}
			imgSrc={field?.images ?? []}
			price={field?.price || 0}
			location={`${field?.street} ${field?.street_number}`}
			setDescription={setDescription}
			setName={setName}
			reservations={reservations || []}
			tournaments={tournaments || []}
		/>
	);
}
