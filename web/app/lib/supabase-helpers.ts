import { useLoaderData } from "@remix-run/react";
import { createClient } from "@supabase/supabase-js";

let client: ReturnType<typeof createClient> | null = null;

/**
 * @description Creates a singleton for the supabase client
 * @note Any route where this is loaded needs to include the following as part of the loader `SUPABASE_URL` & `SUPABASE_ANON_KEY`
 * 
 * ```
 *  function loader() {
    *      return {
    *          env: {
    *              SUPABASE_URL: process.env.SUPABASE_URL!,
    *              SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY!,
    *          }
    *      }
 *  }
 * ```
 */
const supabase = () => {
    if (!client) {
        const { env } = useLoaderData<{ env: { SUPABASE_URL: string, SUPABASE_ANON_KEY: string } }>();
        client = createClient(env.SUPABASE_URL!, env.SUPABASE_ANON_KEY!)
    };
    return client;
};

export default supabase;