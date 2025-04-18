import 'dotenv/config';
import { defineConfig } from '@itba-tpietravallo/drizzle-kit';

export default defineConfig({
    out: './drizzle',
    schema: './schema.ts',
    dialect: 'postgresql',
    extensionsFilters: ["postgis"],
    schemaFilter: ["public"],
    dbCredentials: {
        url: process.env.DATABASE_URL!,
    },
    entities: {
        roles: {
          provider: 'supabase',
        //   exclude: ['new_supabase_role']
        }
    }
});