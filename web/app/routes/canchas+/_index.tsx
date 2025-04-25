import { MapPin, DollarSign } from "lucide-react";
import { Card, CardTitle, CardDescription, CardContent } from "~/components/ui/card";
import { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { createBrowserClient } from "@supabase/ssr";
import { useEffect, useState } from "react";
import { Link } from "@remix-run/react";
import clsx from "clsx";

type FieldPreviewProps = {
	id: string;
	name: string;
	img: string;
	price: number
	location: string;
};

export function loader(args: LoaderFunctionArgs) {
	const env = {
		SUPABASE_URL: process.env.SUPABASE_URL!,
		SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY!,
	};

	return {
		env,
		URL_ORIGIN: new URL(args.request.url).origin,
	};
}

type FieldsPreviewGridProps = {
	fields: FieldPreviewProps[];
};

export function FieldsPreviewGrid({ fields }: FieldsPreviewGridProps) {
	return (
		<div className="grid w-full grid-cols-1 gap-2 p-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
			{fields.map((field, index) => (
				<FieldPreview key={field.id} {...field} />
			))}
		</div>
	);
}

export function FieldPreview(props: FieldPreviewProps & { className?: string }) {
	const { id, name, location, price, img } = props;
	return (
		<div className={clsx("flex h-full min-h-full w-full grow p-2", props?.className)}>
			<Link to={`/canchas/detalle-canchas/${id}`} className="min-h-full w-full">
				<Card className="min-h-full w-full border border-[#f2f4f3] bg-[#f2f4f3] transition-all duration-200 hover:border-[#f18f01] hover:bg-[#f18f01]">
					<div className="flex flex-col">
						<CardTitle className="p-4">{name}</CardTitle>
						<hr className="mx-4 border-t border-gray-300 w-[85%]" />
						<CardDescription className="p-4 flex flex-col gap-2">
							<div className="flex items-center gap-2">
								<MapPin className="h-4 w-4 text-gray-500" />
								{location}
							</div>
							<div className="flex items-center gap-2">
								<DollarSign className="h-4 w-4 text-gray-500" />
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
	const supabase = createBrowserClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);
	const [users, setUsers] = useState<any[]>([]);

	useEffect(() => {
		supabase
			.from("fields")
			.select("*")
			.then(({ data, error }) => {
				if (error) {
					console.error("Supabase error:", error);
				} else {
					setUsers(data as any[]);
				}
			});
	}, []);

	const fields = users.map((user, i) => ({
		id: user.id,
		name: user.name,
		img: user.images[0],
		price: user.price,
		location: `${user.street} ${user.street_number}`,
	}));

	return (
		<div className="h-full bg-[#f2f4f3] bg-auto w-full bg-cover" style={{ backgroundImage: "url('/matchpoint-bg2.png')" }} >
			<FieldsPreviewGrid fields={fields} />
		</div>
	);
}
