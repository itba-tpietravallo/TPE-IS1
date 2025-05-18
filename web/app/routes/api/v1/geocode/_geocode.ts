import { ActionFunctionArgs } from "@remix-run/node";

export async function action({ request }: ActionFunctionArgs) {
	const apiKey = process.env.GOOGLE_MAPS_API_KEY;
	const { street, street_number, city } = await request.json();
	if (!street || !street_number || !city || !apiKey) {
		return Response.json({ error: "Missing address components or API key" }, { status: 400 });
	}

	const direction = `${street} ${street_number}, ${city}`;
	const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(direction)}&key=${apiKey}`;

	try {
		const response = await fetch(url);
		const data = await response.json();

		if (data.status !== "OK") {
			return Response.json({ error: `Geocoding failed: ${data.status}` }, { status: 400 });
		}

		const { lat, lng } = data.results[0].geometry.location;
		return Response.json({ lat, lng });
	} catch (error) {
		return Response.json({ error: "Failed to geocode address", status: 500 });
	}
}
