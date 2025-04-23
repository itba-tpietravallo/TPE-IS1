import { drizzle } from "drizzle-orm/postgres-js";

import postgres from "postgres";
import { fieldsTable, usersTable } from "./schema";
import { InferInsertModel, sql } from "drizzle-orm";

await (async function main() {
	const client = postgres(process.env.DATABASE_URL!, { prepare: false });
	const db = drizzle({ client });

	const user_id = "85a36c63-97f6-4c8d-b967-94c8d452a8b1"; // tpietravallo@itba.edu.ar

	const dummyData: (typeof fieldsTable.$inferInsert)[] = [
		{
			name: "V11",
			location: { x: -34.6117189, y: -58.4100384 },
			owner: user_id,
			avatar_url: "https://www.github.com/itba-tpietravallo.png", // ITBA Logo
			images: [
				"https://xqliokcqwbwivehrgaft.supabase.co/storage/v1/object/public/venues/da593797-983f-4647-a4cf-c05e2c796b30/connor-coyne-OgqWLzWRSaI-unsplash.jpg",
				"https://xqliokcqwbwivehrgaft.supabase.co/storage/v1/object/public/venues/da593797-983f-4647-a4cf-c05e2c796b30/fancy-crave-qowyMze7jqg-unsplash.jpg",
			],
			price: 1111,
			city: "Buenos Aires",
			street_number: "1234",
			street: "Av. Corrientes",
			neighborhood: "Centro",
			sports: ["Futbol"],
			description: "Un lugar para jugar al futbol y al basquet",
		},
		{
			name: "Club de Amigos",
			location: { x: -34.5729272, y: -58.4120894 },
			owner: user_id,
			price: 5000,
			avatar_url: "https://www.github.com/itba-tpietravallo.png", // ITBA Logo
			images: [
				"https://xqliokcqwbwivehrgaft.supabase.co/storage/v1/object/public/venues/da593797-983f-4647-a4cf-c05e2c796b30/izuddin-helmi-adnan-K5ChxJaheKI-unsplash.jpg",
				"https://xqliokcqwbwivehrgaft.supabase.co/storage/v1/object/public/venues/da593797-983f-4647-a4cf-c05e2c796b30/jason-charters-IorqsMssQH0-unsplash.jpg",
			],
			city: "Buenos Aires",
			street_number: "5678",
			street: "Av. Libertador",
			neighborhood: "Belgrano",
			sports: ["Futbol", "Hockey"],
			description: "Un lugar para jugar al futbol y al basquet",
		},
		{
			name: "Estadio Monumental",
			location: { x: -34.5455258, y: -58.4522481 },
			owner: user_id,
			price: 10000,
			avatar_url: "https://www.github.com/itba-tpietravallo.png", // ITBA Logo
			images: [
				"https://xqliokcqwbwivehrgaft.supabase.co/storage/v1/object/public/venues/da593797-983f-4647-a4cf-c05e2c796b30/river.jpg",
			],
			city: "Buenos Aires",
			street_number: "910",
			street: "Av. Figueroa Alcorta",
			neighborhood: "Nuñez",
			sports: ["Futbol"],
			description: "El estadio de River Plate",
		},
	];

	const insert = await db.insert(fieldsTable).values(dummyData);

	client.end();
})();
