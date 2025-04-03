import { drizzle, PostgresJsDatabase } from 'drizzle-orm/postgres-js';

import postgres from 'postgres';
import { fieldsTable } from './schema';
import { getTableColumns, sql } from 'drizzle-orm';

if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not defined\n\nNOTE: THIS IS A SENSITIVE VALUE. DO NOT SHARE IT WITH ANYONE. TREAT THE SAME AS A PASSWORD.");
}

async function main() {
    // Disable prefetch as it is not supported for "Transaction" pool mode 
    const client = postgres(process.env.DATABASE_URL!, { prepare: false });
    const db = drizzle({ client });
    client.end();
}

main();
