import { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { createBrowserClient } from "@supabase/ssr";
import { useEffect, useState } from "react";
import { FieldDetail } from "./FieldDetail";

import {
	getAllReservationsForFieldById,
	getFieldById,
	getAllTournamentsForFieldById,
	getAllFields,
} from "@lib/autogen/queries";

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

	const field = getFieldById(supabase, id || "", { enabled: !!id });
	const reservations = getAllReservationsForFieldById(supabase, id || "", { enabled: !!id });
	const tournaments = getAllTournamentsForFieldById(supabase, id || "", { enabled: !!id });
	const allFieldsQuery = getAllFields(supabase);

	const [name, setName] = useState(field.data?.name);
	const [description, setDescription] = useState(field.data?.description);

	// Isn't this an infinite loop?
	// -- Tomas Pietravallo (2024-04-28)
	// It wasnt but caused other issues 2024-05-13
	useEffect(() => {
		setName(field.data?.name);
		setDescription(field.data?.description);
	}, [field.data?.name, field.data?.description]);

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
			reservations={reservations.data || []}
			tournaments={tournaments.data || []}
			dependantQueries={[allFieldsQuery, tournaments, reservations]}
		/>
	);
}
