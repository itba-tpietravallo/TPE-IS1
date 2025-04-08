import { MapPin } from "lucide-react";
import { Card, CardTitle, CardDescription, CardContent } from "~/components/ui/card";
import { Link } from "@remix-run/react";

type FieldPreviewProps = {
	name: string;
	img: string /* aca ni idea como poner*/;
	location: string;
};

type FieldsPreviewGridProps = {
	fields: FieldPreviewProps[]; // Array of fields
};

export function FieldsPreviewGrid({ fields }: FieldsPreviewGridProps) {
	return (
		<div className="grid w-full grid-cols-1 gap-2 p-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
			{fields.map((field, index) => (
				<FieldPreview key={index} {...field} />
			))}
		</div>
	);
}

export function FieldPreview(props: FieldPreviewProps) {
	const { name, location, img } = props;
	return (
		<Link to="./detalle-canchas">
			<div className="flex w-full p-2">
				<Card className="w-full">
					<CardTitle className="p-4"> {name} </CardTitle>
					<CardDescription className="m-3 flex items-center gap-2">
						<MapPin className="h-4 w-4 text-gray-500" />
						{location}
					</CardDescription>
					<CardContent className="flex justify-center">
						<img src={img} className="h-32 w-full rounded-lg object-cover" />
					</CardContent>
				</Card>
			</div>
		</Link>
	);
}

export default function () {
	// esta data es para ver como se veria. Falta que me llegue por parámetro desde la BD la info.

	const fields = [
		{ name: "Voley 1", img: "medidas_sm.jpg", location: "Virrey del Pino 1818" },
		{ name: "Fulbo 2", img: "medidas_sm.jpg", location: "San Martin 1234" },
		{ name: "Hockey 3", img: "medidas_sm.jpg", location: "Corrientes 5678" },
		{ name: "Mini golf 4", img: "medidas_sm.jpg", location: "Lavalle 91011" },
		{ name: "Ajedrez 5", img: "medidas_sm.jpg", location: "Belgrano 1213" },
	];

	return (
		<div>
			<br />
			<FieldsPreviewGrid fields={fields} />
		</div>
	);
}
