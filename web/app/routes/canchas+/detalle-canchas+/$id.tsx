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
	getAllUsers,
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

	const usersQuery = getAllUsers(supabase);
	const { data: users } = usersQuery;

	const [name, setName] = useState(field.data?.name);
	const [description, setDescription] = useState(field.data?.description);
	const [price, setPrice] = useState(field.data?.price);

	const handleUpdate = async (newName: string, newDesc: string, newPrice: number) => {
		setName(newName);
		setDescription(newDesc);
		const { data, error } = await supabase
			.from("fields")
			.update({ name: newName, description: newDesc, price: newPrice })
			.eq("id", id);

		if (error) {
			console.error("Error updating field:", error);
		} else {
			console.log("Field updated successfully:", data);
			// hago refresh cuando tengo update the field
			field.refetch();
			allFieldsQuery.refetch();
		}
	};
	// sin este useEffect, cuando hago hard refresh pierdo nombre, descripcion, precio
	useEffect(() => {
		if (field.data) {
			setName(field.data.name);
			setDescription(field.data.description);
			setPrice(field.data.price);
		}
	}, [field.data]);

	const isLoading = field.isLoading || reservations.isLoading || tournaments.isLoading || usersQuery.isLoading;

	return (
		<FieldDetail
			id={id}
			supabase={supabase}
			key={id}
			name={name || ""}
			description={description || ""}
			imgSrc={field.data?.images ?? []}
			price={field.data?.price || 0}
			location={`${field.data?.street} ${field.data?.street_number}, ${field.data?.neighborhood}`}
			reservations={reservations.data || []}
			tournaments={tournaments.data || []}
			users={users || []}
			dependantQueries={[allFieldsQuery, tournaments, reservations]}
			onSave={handleUpdate}
			loading={isLoading}
		/>
	);
}
