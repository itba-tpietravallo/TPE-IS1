// ===============================================================
// Source file: db/queries.ts
// This file must contain all the queries to the database.
// This file is automatically copied to /web and /mobile in CI.
// ===============================================================

import { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

export function getAllFields(supabase: SupabaseClient<Database>) {
	return supabase.from("fields").select("*");
}

export function getAllFieldsByOwner(supabase: SupabaseClient<Database>, ownerId: string) {
	return supabase.from("fields").select("*").eq("owner", ownerId);
}

export function getFieldById(supabase: SupabaseClient<Database>, fieldId: string) {
	return supabase.from("fields").select("*").eq("id", fieldId).single();
}

export function getAllSports(supabase: SupabaseClient<Database>) {
	return supabase.from("sports").select("name");
}

export function insertNewField(
	supabase: SupabaseClient<Database>,
	field: Database["public"]["Tables"]["fields"]["Insert"],
) {
	return supabase.from("fields").insert(field);
}

export function getAllReservationsForFieldById(supabase: SupabaseClient<Database>, fieldId: string) {
	return supabase.from("reservations").select("*").eq("field_id", fieldId);
}

export function getAllReservationTimeSlots(supabase: SupabaseClient<Database>, fieldId: string) {
	return supabase.from("reservations").select("date_time").eq("field_id", fieldId);
	// .gte("start_time", startTime);
}

export function getAllTeams(supabase: SupabaseClient<Database>) {
	return supabase.from("teams").select("team_id, name, sport, description, images, players");
}

export function getTeamMembers(supabase: SupabaseClient<Database>, teamId: string) {
	return supabase.from("teams").select("players").eq("team_id", teamId).single();
}

export function getUserSession(supabase: SupabaseClient<Database>) {
	return supabase.from("users").select("id, full_name, avatar_url").eq("id", `auth.uid()`).single();
}

export function getAllUsers(supabase: SupabaseClient<Database>) {
	return supabase.from("users").select("id, full_name, avatar_url");
}
