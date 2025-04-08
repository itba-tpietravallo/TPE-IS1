import { drizzle } from "drizzle-orm/postgres-js";

import postgres from "postgres";
import { fieldsTable, sportsTable, usersTable } from "./schema";
import { sql } from "drizzle-orm";

await (async function main() {
    const client = postgres(process.env.DATABASE_URL!, { prepare: false });
    const db = drizzle({ client });
    
    await db.insert(sportsTable).values([
        { 'name': "Fútbol", },
        { 'name': "Hockey sobre césped", },
        { 'name': "Voley", },
        { 'name': "Básquet", },
        { 'name': "Rugby", },
        { 'name': "Handball", },
        { 'name': "Pádel", },
        { 'name': "Tenis de mesa", },
    ]);

    client.end();
})();
