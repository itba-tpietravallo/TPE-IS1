import { ActionFunctionArgs } from "@remix-run/node";

async function fetchReverseGeocoding(lat: number, lng: number, apiKey: string) {
	const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`;
	const response = await fetch(url);
	const data = await response.json();
	return data;
}

export async function action({ request }: ActionFunctionArgs) {
	const apiKey = process.env.GOOGLE_MAPS_WEB_API_KEY!;
	const body = await request.json();
	if (!apiKey) {
		return Response.json({ error: "Missing API key" }, { status: 400 });
	}

	if (body.lat && body.lng) {
		try {
			const data = await fetchReverseGeocoding(body.lat, body.lng, apiKey);
			if (data.status !== "OK") {
				return Response.json({ error: `Reverse geocoding failed: ${data.status}` }, { status: 400 });
			}

			const components = data.results[0]?.address_components || [];
			const get = (type: string) => components.find((c: any) => c.types.includes(type))?.long_name || "";

			return Response.json({
				street: get("route"),
				street_number: get("street_number"),
				neighbourhood: get("sublocality") || get("neighborhood"),
				city: get("locality") || get("administrative_area_level_2"),
			});
		} catch (error) {
			return Response.json({ error: "Failed reverse geocoding" }, { status: 500 });
		}
	}

	const { street, street_number, city } = body;
	if (!street || !street_number || !city) {
		return Response.json({ error: "Missing address components" }, { status: 400 });
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
