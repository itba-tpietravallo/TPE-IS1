import { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

export function getAllFields(supabase: SupabaseClient<Database>) {
	return supabase.from("fields").select("*");
}

export function getAllSports(supabase: SupabaseClient<Database>) {
	return supabase.from("sports").select("*");
}
