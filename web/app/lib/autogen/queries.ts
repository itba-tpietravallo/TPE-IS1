// ===============================================================
// Source file: db/queries.ts
// This file must contain all the queries to the database.
// This file is automatically copied to /web and /mobile in CI.
// ===============================================================

import { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { useQuery as useQuerySupabase } from "@supabase-cache-helpers/postgrest-react-query";

export function getAllFields(supabase: SupabaseClient<Database>, opts: any = undefined) {
	return useQuerySupabase(supabase.from("fields").select("*"), opts);
}

export function getNearbyFields(supabase: SupabaseClient<Database>, lat: number, long: number, limit?: number, opts: any = undefined) {
	return useQuerySupabase(supabase.rpc("nearby_fields", { lat, long, lim: limit || 5 }));
}

export function getAllFieldsByOwner(supabase: SupabaseClient<Database>, ownerId: string, opts: any = undefined) {
	return useQuerySupabase(supabase.from("fields").select("*").eq("owner", ownerId), opts);
}

export function getFieldById(supabase: SupabaseClient<Database>, fieldId: string, opts: any = undefined) {
	return useQuerySupabase(supabase.from("fields").select("*").eq("id", fieldId).single(), opts);
}

export function getAllSports(supabase: SupabaseClient<Database>, opts: any = undefined) {
	return useQuerySupabase(supabase.from("sports").select("name"), opts);
}

export function insertNewField(
	supabase: SupabaseClient<Database>,
	field: Database["public"]["Tables"]["fields"]["Insert"],
	opts: any = {},
) {
	return useQuerySupabase(supabase.from("fields").insert(field), opts);
}

export function getAllReservationsForFieldById(
	supabase: SupabaseClient<Database>,
	fieldId: string,
	opts: any = undefined,
) {
	return useQuerySupabase(supabase.from("reservations").select("*").eq("field_id", fieldId), opts);
}

export function getAllReservationTimeSlots(supabase: SupabaseClient<Database>, fieldId: string, opts: any = undefined) {
	return useQuerySupabase(supabase.from("reservations").select("date_time").eq("field_id", fieldId), opts);
}

export function getAllTeams(supabase: SupabaseClient<Database>, opts: any = undefined) {
	return useQuerySupabase(supabase.from("teams").select("team_id, name, sport, description, images, players"), opts);
}

export function getTeamMembers(supabase: SupabaseClient<Database>, teamId: string, opts: any = undefined) {
	return useQuerySupabase(supabase.from("teams").select("players").eq("team_id", teamId).single(), opts);
}

export function getAllUsers(supabase: SupabaseClient<Database>, opts: any = undefined) {
	return useQuerySupabase(supabase.from("users").select("id, full_name, avatar_url"), opts);
}

export function getUserAvatar(supabase: SupabaseClient<Database>, user_name: string, opts: any = undefined) {
	return useQuerySupabase(supabase.from("users").select("avatar_url").eq("full_name", user_name).single(), opts);
}

export function getUsername(supabase: SupabaseClient<Database>, userId: string, opts: any = undefined) {
	return useQuery({
		queryKey: [userId, "username"],
		queryFn: async () => {
			let username: string;
			const { data, error } = await supabase
				.from("users")
				.select("full_name, username")
				.eq("id", userId)
				.single()
			
			if (error || !data.username) {
				console.error("Error fetching username:", error, data);
				const base_username = data?.full_name?.toLowerCase().split(" ").join("_")! || "user";
				const similar = await supabase.from("users").select("username").like("username", base_username);
				const def = typeof similar.count === 'number' ? `${base_username}_${similar.count || 0}` : base_username;
				await supabase
					.from("users")
					.update({ username: def })
					.eq("id", userId)
					.throwOnError();
				username = def;
			} else {
				console.log("Username already exists:", data.username);
				username = data.username;
			}

			return username;
		}
	});
}

export function getUserSession(supabase: SupabaseClient<Database>, opts: any = undefined) {
	return (
		useQuery(
			{
				queryKey: ["user_session"],
				queryFn: async () => {
					const id = (await supabase.auth.getSession()).data.session?.user.id;
					return (
						await supabase
							.from("users")
							.select("id, full_name, avatar_url")
							.eq("id", id!)
							.single()
							.throwOnError()
					).data;
				},
			},
			opts,
		) ?? {}
	);
}

export function getLastUserPayments(supabase: SupabaseClient<Database>, userId: string, opts: any = undefined) {
	return useQuery({
		queryKey: [userId, "payments"],
		queryFn: async () => {
			const { data, error } = await supabase
				.from("mp_payments")
				.select("payment_id, last_updated, status, transaction_amount")
				.eq("user_id", userId)
				.order("last_updated", { ascending: false })
				.throwOnError();

			return data;
		},
	});
}
