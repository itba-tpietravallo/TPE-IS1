// ===============================================================
// Source file: db/queries.ts
// This file must contain all the queries to the database.
// This file is automatically copied to /web and /mobile in CI.
// ===============================================================

import { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { useQuery as useQuerySupabase } from "@supabase-cache-helpers/postgrest-react-query";

export const queries = {
  getAllFields: (supabase: SupabaseClient<Database>) =>
    supabase.from("fields").select("*"),

  getNearbyFields: (
    supabase: SupabaseClient<Database>,
    lat: number,
    long: number,
    limit?: number
  ) => supabase.rpc("nearby_fields", { lat, long, lim: limit || 5 }),

  getAllFieldsByOwner: (supabase: SupabaseClient<Database>, ownerId: string) =>
    supabase.from("fields").select("*").eq("owner", ownerId).or(`adminedBy.cs.{${ownerId}}`),

  getIsFieldOwner: (supabase: SupabaseClient<Database>, fieldId: string, userId: string) =>
    supabase
      .from("fields")
      .select("id")
      .eq("id", fieldId)
      .eq("owner", userId as string)
      .single(),

  getFieldById: (supabase: SupabaseClient<Database>, fieldId: string) =>
    supabase.from("fields").select("*").eq("id", fieldId).single(),

  getAllSports: (supabase: SupabaseClient<Database>) =>
    supabase.from("sports").select("name"),

  getAllReservationsForFieldById: (
    supabase: SupabaseClient<Database>,
    fieldId: string
  ) => supabase.from("reservations").select("*").eq("field_id", fieldId),

  getAllReservationTimeSlots: (
    supabase: SupabaseClient<Database>,
    fieldId: string
  ) =>
    supabase.from("reservations").select("date_time").eq("field_id", fieldId),

  getAllTeams: (supabase: SupabaseClient<Database>) =>
    supabase.from("teams").select("*"),

  getTeamById: (supabase: SupabaseClient<Database>, teamId: string) =>
    supabase.from("teams").select("*").eq("team_id", teamId).single(),

  getTeamMembers: (supabase: SupabaseClient<Database>, teamId: string) =>
    supabase.from("teams").select("players").eq("team_id", teamId).single(),

  getTeamIdByName: (supabase: SupabaseClient<Database>, name: string) =>
    supabase.from("teams").select("team_id").eq("name", name),

  getAllUsers: (supabase: SupabaseClient<Database>) =>
    supabase.from("users").select("id, full_name, avatar_url"),

  getUserAvatar: (supabase: SupabaseClient<Database>, user_name: string) =>
    supabase
      .from("users")
      .select("avatar_url")
      .eq("full_name", user_name)
      .single(),

  getUsername: (supabase: SupabaseClient<Database>, userId: string) =>
    supabase
      .from("users")
      .select("full_name, username")
      .eq("id", userId)
      .single(),

  getUserSession: (supabase: SupabaseClient<Database>, userId: string) =>
    supabase
      .from("users")
      .select("id, full_name, avatar_url, username")
      .eq("id", userId)
      .single(),

  getUserAuthSession: (supabase: SupabaseClient<Database>) =>
    supabase.auth.getSession().then((res) => res.data.session),

  getLastUserPayments: (supabase: SupabaseClient<Database>, userId: string) =>
    supabase
      .from("mp_payments")
      .select("payment_id, last_updated, status, transaction_amount")
      .eq("user_id", userId)
      .order("last_updated", { ascending: false }),

  getAllTournaments: (supabase: SupabaseClient<Database>) =>
    supabase.from("tournaments").select("*"),

  getAllTournamentsForFieldById: (
    supabase: SupabaseClient<Database>,
    fieldId: string
  ) => supabase.from("tournaments").select("*").eq("fieldId", fieldId),

  getAllTeamsByUser: (supabase: SupabaseClient<Database>, userId: string) =>
    supabase
      .from("teams")
      .select("team_id, name")
      .contains("players", [userId]),

  getPendingReservationsByUser: (
    supabase: SupabaseClient<Database>,
    userId: string
  ) =>
    supabase
      .from("reservations")
      .select(
        "id, date_time, teams ( name ), bookers_count, fields ( id, price, name ), pending_bookers_ids"
      )
      .contains("pending_bookers_ids", [userId]),
};

export function getAllFields(
  supabase: SupabaseClient<Database>,
  opts: any = undefined
) {
  return useQuerySupabase(queries.getAllFields(supabase), opts);
}

export function getIsFieldOwner(
  supabase: SupabaseClient<Database>,
  fieldId: string,
  userId: string,
  opts: any = undefined
) {
  return useQuerySupabase(
    queries.getIsFieldOwner(supabase, fieldId, userId),
    { enabled: fieldId && userId, ...opts }
  );
}

export function getNearbyFields(
  supabase: SupabaseClient<Database>,
  lat: number,
  long: number,
  limit?: number,
  opts: any = undefined
) {
  return useQuerySupabase(
    queries.getNearbyFields(supabase, lat, long, limit),
    opts
  );
}

export function getAllFieldsByOwner(
  supabase: SupabaseClient<Database>,
  ownerId: string,
  opts: any = undefined
) {
  return useQuerySupabase(queries.getAllFieldsByOwner(supabase, ownerId), opts);
}

export function getFieldById(
  supabase: SupabaseClient<Database>,
  fieldId: string,
  opts: any = undefined
) {
  return useQuerySupabase(queries.getFieldById(supabase, fieldId), opts);
}

export function getAllSports(
  supabase: SupabaseClient<Database>,
  opts: any = undefined
) {
  return useQuerySupabase(queries.getAllSports(supabase), opts);
}

export function getAllReservationsForFieldById(
  supabase: SupabaseClient<Database>,
  fieldId: string,
  opts: any = undefined
) {
  return useQuerySupabase(
    queries.getAllReservationsForFieldById(supabase, fieldId),
    opts
  );
}

export function getAllReservationTimeSlots(
  supabase: SupabaseClient<Database>,
  fieldId: string,
  opts: any = undefined
) {
  return useQuerySupabase(
    queries.getAllReservationTimeSlots(supabase, fieldId),
    opts
  );
}

export function getAllTeams(
  supabase: SupabaseClient<Database>,
  opts: any = undefined
) {
  return useQuerySupabase(queries.getAllTeams(supabase), opts);
}

export function getTeamById(
  supabase: SupabaseClient<Database>,
  teamId: string,
  opts: any = undefined
) {
  return useQuerySupabase(queries.getTeamById(supabase, teamId), opts);
}

export function getTeamMembers(
  supabase: SupabaseClient<Database>,
  teamId: string,
  opts: any = undefined
) {
  return useQuerySupabase(queries.getTeamMembers(supabase, teamId), opts);
}

export function getTeamIdByName(
  supabase: SupabaseClient<Database>,
  name: string,
  opts: any = undefined
) {
  return useQuerySupabase(queries.getTeamIdByName(supabase, name), opts);
}

export function getAllUsers(
  supabase: SupabaseClient<Database>,
  opts: any = undefined
) {
  return useQuerySupabase(queries.getAllUsers(supabase), opts);
}

export function getUserAvatar(
  supabase: SupabaseClient<Database>,
  user_name: string,
  opts: any = undefined
) {
  return useQuerySupabase(queries.getUserAvatar(supabase, user_name), opts);
}

export function getUsername(
  supabase: SupabaseClient<Database>,
  userId: string,
  opts: any = undefined
) {
  return useQuery({
    queryKey: [userId, "username"],
    queryFn: async () => {
      let username: string;
      const { data, error } = await queries.getUsername(supabase, userId);

      if (error || !data.username) {
        console.error("Error fetching username:", error, data);
        const base_username =
          data?.full_name?.toLowerCase().split(" ").join("_")! || "user";
        const similar = await supabase
          .from("users")
          .select("username")
          .like("username", base_username);
        const def =
          typeof similar.count === "number"
            ? `${base_username}_${similar.count || 0}`
            : base_username;
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
    },
  });
}

export function getUserSession(
  supabase: SupabaseClient<Database>,
  opts: any = undefined
) {
  return useQuery({
    queryKey: ["user_session"],
    queryFn: async () => {
      const session = await queries.getUserAuthSession(supabase);
      // Using getOwnPropertyDescriptor to avoid supabase's getter which logs non-applicable warnings
      const id = Object.getOwnPropertyDescriptor(session, "user")?.value
        ?.id as string;
      return (await queries.getUserSession(supabase, id).throwOnError()).data;
    },
  });
}

export function getUserAuthSession(
  supabase: SupabaseClient<Database>,
  opts: any = undefined
) {
  return useQuery({
    queryKey: ["user_auth_session"],
    queryFn: async () => {
      const session = await queries.getUserAuthSession(supabase);
      return session;
    },
  });
}

export function getLastUserPayments(
  supabase: SupabaseClient<Database>,
  userId: string,
  opts: any = undefined
) {
  return useQuerySupabase(queries.getLastUserPayments(supabase, userId), opts);
}

export function getAllTournaments(
  supabase: SupabaseClient<Database>,
  opts: any = undefined
) {
  return useQuerySupabase(queries.getAllTournaments(supabase), opts);
}

export function getAllTournamentsForFieldById(
  supabase: SupabaseClient<Database>,
  fieldId: string,
  opts: any = undefined
) {
  return useQuerySupabase(
    queries.getAllTournamentsForFieldById(supabase, fieldId),
    opts
  );
}

export function getAllTeamsByUser(
  supabase: SupabaseClient<Database>,
  userId: string,
  opts: any = undefined
) {
  return useQuerySupabase(queries.getAllTeamsByUser(supabase, userId), opts);
}

export function getPendingReservationsByUser(
  supabase: SupabaseClient<Database>,
  userId: string,
  opts: any = undefined
) {
  return useQuerySupabase(
    queries.getPendingReservationsByUser(supabase, userId),
    opts
  );
}
