import { drizzle } from "drizzle-orm/postgres-js";

import postgres from "postgres";
import { fieldsTable, usersTable } from "./schema";
import { sql } from "drizzle-orm";

await (async function main() {
    const client = postgres(process.env.DATABASE_URL!, { prepare: false });
    const db = drizzle({ client });

    const user_id = 'da593797-983f-4647-a4cf-c05e2c796b30'; // tpietravallo@itba.edu.ar

    const dummyData = [
        {
            name: "V11", 
            location: sql`ST_SetSRID(ST_MakePoint(-34.6117189,-58.4100384), 4326)`,
            owner: user_id,
            avatar: "https://www.github.com/itba-tpietravallo.png", // ITBA Logo
            images: [
                "https://xqliokcqwbwivehrgaft.supabase.co/storage/v1/object/public/venues/da593797-983f-4647-a4cf-c05e2c796b30/connor-coyne-OgqWLzWRSaI-unsplash.jpg",
                "https://xqliokcqwbwivehrgaft.supabase.co/storage/v1/object/public/venues/da593797-983f-4647-a4cf-c05e2c796b30/fancy-crave-qowyMze7jqg-unsplash.jpg",
            ]
        },
        {
            name: "Club de Amigos",
            location: sql`ST_SetSRID(ST_MakePoint(-34.5729272,-58.4120894), 4326)`,
            owner: user_id,
            avatar: "https://www.github.com/itba-tpietravallo.png", // ITBA Logo
            images: [
                "https://xqliokcqwbwivehrgaft.supabase.co/storage/v1/object/public/venues/da593797-983f-4647-a4cf-c05e2c796b30/izuddin-helmi-adnan-K5ChxJaheKI-unsplash.jpg",
                "https://xqliokcqwbwivehrgaft.supabase.co/storage/v1/object/public/venues/da593797-983f-4647-a4cf-c05e2c796b30/jason-charters-IorqsMssQH0-unsplash.jpg",
            ]
        },
        {
            name: "Estadio Monumental",
            location: sql`ST_SetSRID(ST_MakePoint(-34.5455258,-58.4522481), 4326)`,
            owner: user_id,
            avatar: "https://www.github.com/itba-tpietravallo.png", // ITBA Logo
            images: [
                "https://xqliokcqwbwivehrgaft.supabase.co/storage/v1/object/public/venues/da593797-983f-4647-a4cf-c05e2c796b30/river.jpg"
            ]
        }
    ];

    /** Done manually because user predates supabase auth trigger */
    // await db.insert(usersTable).values({
    //     id: user_id,
    //     first_name: "Tomás",
    //     last_name: "Pietravallo",
    //     avatar: "https://www.github.com/itba-tpietravallo.png", // ITBA Logo
    // });
    
    await db.insert(fieldsTable).values(dummyData);

    client.end();
})();