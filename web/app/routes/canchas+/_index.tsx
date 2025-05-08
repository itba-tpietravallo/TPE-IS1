import { MapPin, DollarSign } from "lucide-react";
import { Card, CardTitle, CardDescription, CardContent } from "~/components/ui/card";
import { LoaderFunctionArgs } from "@remix-run/node";
import { useEffect, useState } from "react";
import { Link } from "@remix-run/react";
import clsx from "clsx";

import { useLoaderData } from "@remix-run/react"; // Remix Loader
import { createBrowserClient } from "@supabase/ssr"; // Supabase Client

import { dehydrate, QueryClient } from "@tanstack/react-query"; // React Query

import { getAllFields } from "@lib/autogen/queries"; // Database Queries
import type { Database } from "@lib/autogen/database.types"; // Database Types
import { createSupabaseServerClient } from "@lib/supabase.server";
import { fetchQueryInitialData, prefetchQuery } from "@supabase-cache-helpers/postgrest-react-query";

type FieldPreviewProps = {
	id: string;
	name: string;
	img: string;
	price: number;
	location: string;
};

export async function loader(args: LoaderFunctionArgs) {
	const env = {
		SUPABASE_URL: process.env.SUPABASE_URL!,
		SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY!,
	};

	const queryClient = new QueryClient();

	const { supabaseClient } = createSupabaseServerClient(args.request);
	// fix: comment this out as useContext is not defined on the server
	// need to expose query as part of the db queries file
	// await queryClient.prefetchQuery(["getAllFields"], () => getAllFields(supabaseClient));
	// @todo fetchQueryInitialData

	return {
		env,
		URL_ORIGIN: new URL(args.request.url).origin,
		dehydratedState: dehydrate(queryClient),
	};
}

type FieldsPreviewGridProps = {
	fields: FieldPreviewProps[] | null;
};

export function FieldsPreviewGrid({ fields }: FieldsPreviewGridProps) {
	return (
		<div className="grid w-full grid-cols-1 gap-2 p-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
			{fields?.map((field, index) => <FieldPreview key={field.id} {...field} />)}
		</div>
	);
}

export function FieldPreview(props: FieldPreviewProps & { className?: string }) {
	const { id, name, location, price, img } = props;
	return (
		<div className={clsx("flex h-full min-h-full w-full grow p-2", props?.className)}>
			<Link to={`/canchas/detalle-canchas/${id}`} className="min-h-full w-full">
				<Card className="group min-h-full w-full border border-[#22332a] bg-[#223332]/80 backdrop-blur-md transition-all duration-200 hover:bg-[#223332]">
					<div className="flex flex-col">
						<CardTitle className="p-4 text-[#f2f4f3] group-hover:text-[#f18f01]">{name}</CardTitle>
						<hr className="mx-4 w-[85%] border-t border-gray-200" />
						<CardDescription className="flex flex-col gap-2 p-4">
							<div className="flex items-center gap-2 text-gray-300">
								<MapPin className="h-4 w-4" />
								{location}
							</div>
							<div className="flex items-center gap-2 text-gray-300">
								<DollarSign className="h-4 w-4" />
								{price}
							</div>
						</CardDescription>
					</div>
					<CardContent className="flex justify-center">
						<img src={img} className="h-32 w-full rounded-lg object-cover" />
					</CardContent>
				</Card>
			</Link>
		</div>
	);
}

export default function () {
	const { URL_ORIGIN, env } = useLoaderData<typeof loader>();
	const supabase = createBrowserClient<Database>(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);

	const { data } = getAllFields(supabase);

	const fields = data?.map((user, i) => ({
		id: user.id,
		name: user.name,
		img: user.images[0],
		price: user.price,
		location: `${user.street} ${user.street_number}`,
	}))!;

	return (
		<div className="h-full w-full bg-[#f2f4f3] bg-cover" style={{ backgroundImage: "url('/matchpoint-bg2.png')" }}>
			<FieldsPreviewGrid fields={fields} />
		</div>
	);
}
