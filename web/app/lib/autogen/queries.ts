// ===============================================================
// Source file: db/queries.ts
// This file must contain all the queries to the database.
// This file is automatically copied to /web and /mobile in CI.
// ===============================================================

import { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

import { useEffect } from "react";
import {
	useQuery,
	UseQueryOptions,
	useQueryClient,
} from "@tanstack/react-query";

import {
	useQuery as useQuerySupabase,
	useInsertMutation,
	useDeleteMutation,
	useUpdateMutation,
	useUpsertMutation,
} from "@supabase-cache-helpers/postgrest-react-query";

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
		supabase
			.from("fields")
			.select("*")
			.or(`adminedBy.cs.{${ownerId}}, owner.eq.${ownerId}`),

	getIsFieldOwner: (
		supabase: SupabaseClient<Database>,
		fieldId: string,
		userId: string
	) =>
		supabase
			.from("fields")
			.select("id")
			.eq("id", fieldId)
			.eq("owner", userId as string)
			.maybeSingle(),

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
			.select("id, full_name, avatar_url, username, email")
			.eq("id", userId)
			.single(),

	getUserAuthSession: (supabase: SupabaseClient<Database>) =>
		supabase.auth.getSession().then((res) => res.data.session),

	getIsLinkedToPaymentMethod: (
		supabase: SupabaseClient<Database>,
		user_id: string
	) =>
		supabase
			.from("mp_oauth_authorization")
			.select("user_id")
			.eq("user_id", user_id)
			.single(),

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
			.select("team_id, name, images")
			.contains("players", [userId]),

	getAllTeamsByAdminUser: (
		supabase: SupabaseClient<Database>,
		userId: string
	) =>
		supabase.from("teams").select("team_id, name").contains("admins", [userId]),

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

	getUserReservations: (supabase: SupabaseClient<Database>, userId: string) =>
		supabase
			.from("reservations")
			.select(
				"*, field: fields (name, street_number, street, neighborhood, city)"
			)
			.eq("owner_id", userId)
			.order("date_time", { ascending: true }),

	getInscriptionsByTournament: (
		supabase: SupabaseClient<Database>,
		tournamentId: string
	) =>
		supabase.from("inscriptions").select("*").eq("tournamentId", tournamentId),

	getUserPreferencesByUserId: (
		supabase: SupabaseClient<Database>,
		userId: string
	) =>
		supabase
			.from("user_preferences")
			.select("*")
			.eq("user_id", userId)
			.single(),

	getFieldReviewsAvg: (supabase: SupabaseClient<Database>, fieldId: string) =>
		supabase.from("field_reviews").select("rating").eq("field_id", fieldId),

	getCurrentUserFieldReview: (
		supabase: SupabaseClient<Database>,
		fieldId: string,
		userId: string
	) =>
		supabase
			.from("field_reviews")
			.select("rating")
			.eq("field_id", fieldId)
			.eq("user_id", userId)
			.single(),
};

export const mutations = {
	insertField: (supabase: SupabaseClient<Database>) =>
		useInsertMutation(supabase.from("fields"), ["id"], "*", {
			onError: (error) => console.error("Error inserting field:", error),
		}),

	updateField: (supabase: SupabaseClient<Database>) =>
		useUpdateMutation(supabase.from("fields"), ["id"], "*", {
			onError: (error) => console.error("Error updating field:", error),
		}),

	deleteField: (supabase: SupabaseClient<Database>) =>
		useDeleteMutation(supabase.from("fields"), ["id"], "*", {
			onError: (error) => console.error("Error deleting field:", error),
		}),

	insertTournament: (supabase: SupabaseClient<Database>) =>
		useInsertMutation(supabase.from("tournaments"), ["id"], "*", {
			onError: (error) => console.error("Error inserting tournament:", error),
		}),

	updateTournament: (supabase: SupabaseClient<Database>) =>
		useUpdateMutation(supabase.from("tournaments"), ["id"], "*", {
			onError: (error) => console.error("Error updating tournament:", error),
		}),

	deleteTournament: (supabase: SupabaseClient<Database>) =>
		useDeleteMutation(supabase.from("tournaments"), ["id"], "*", {
			onError: (error) => console.error("Error deleting tournament:", error),
		}),

	updateFieldAdmins: (supabase: SupabaseClient<Database>) =>
		useUpdateMutation(supabase.from("fields"), ["id"], "*", {
			onError: (error) => console.error("Error updating field admins:", error),
		}),

	insertReservation: (supabase: SupabaseClient<Database>) =>
		useInsertMutation(supabase.from("reservations"), ["id"], "*", {
			onError: (error) => console.error("Error inserting reservation:", error),
		}),

	updateReservation: (supabase: SupabaseClient<Database>) =>
		useUpdateMutation(supabase.from("reservations"), ["id"], "*", {
			onError: (error) => console.error("Error updating reservation:", error),
		}),
	insertFieldReview: (supabase: SupabaseClient<Database>) =>
		useUpsertMutation(
			supabase.from("field_reviews"),
			["field_id", "user_id"],
			"*",
			{
				onError: (error) => console.error("Error inserting review:", error),
			}
		),
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
	return useQuerySupabase(queries.getIsFieldOwner(supabase, fieldId, userId), {
		enabled: !!(fieldId && userId),
		...opts,
	});
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

export function getUserSession(
	supabase: SupabaseClient<Database>,
	userId: string,
	opts: any = undefined
) {
	return useQuerySupabase(queries.getUserSession(supabase, userId), {
		enabled: !!userId,
		...opts,
	});
}

export function getUserLinkedToPaymentMethod(
	supabase: SupabaseClient<Database>,
	user_id: string,
	opts: any = undefined
) {
	return useQuerySupabase(
		queries.getIsLinkedToPaymentMethod(supabase, user_id),
		{
			enabled: !!user_id,
			...opts,
		}
	);
}

export function getUsername(
	supabase: SupabaseClient<Database>,
	userId: string,
	opts: any = undefined
) {
	return useQuery<{ username: string; full_name: string }>({
		queryKey: [userId, "username"],
		queryFn: async (): Promise<{ username: string; full_name: string }> => {
			let username: string;
			const { data, error } = await queries.getUsername(supabase, userId);

			if (error || !data.username) {
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

			return { username, full_name: data?.full_name! };
		},
		enabled: !!userId,
		...opts,
	});
}

export function getUserSessionById(
	supabase: SupabaseClient<Database>,
	id: string,
	opts: any = undefined
) {
	return useQuery({
		queryKey: ["user_session"],
		queryFn: async () => {
			// Using getOwnPropertyDescriptor to avoid supabase's getter which logs non-applicable warnings
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

export function getAllTeamsByAdminUser(
	supabase: SupabaseClient<Database>,
	userId: string,
	opts: any = undefined
) {
	return useQuerySupabase(
		queries.getAllTeamsByAdminUser(supabase, userId),
		opts
	);
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

export function getUserReservations(
	supabase: SupabaseClient<Database>,
	userId: string,
	opts: any = undefined
) {
	return useQuerySupabase(queries.getUserReservations(supabase, userId), {
		enabled: !!userId,
		...opts,
	});
}

export function getUserEmailById(
	supabase: SupabaseClient<Database>,
	id: string
) {
	return useQuerySupabase(
		supabase.from("users").select("email").eq("id", id).single(),
		{
			enabled: !!id,
		}
	);
}

export function getUserPreferencesByUserId(
	supabase: SupabaseClient<Database>,
	userId: string,
	opts: any = undefined
) {
	return useQuerySupabase(
		queries.getUserPreferencesByUserId(supabase, userId),
		opts
	);
}

export function useUpdateField(supabase: SupabaseClient<Database>) {
	// Using the built-in useUpdateMutation from supabase-cache-helpers
	// This will automatically handle cache updates and optimistic updates
	return useUpdateMutation(
		supabase.from("fields"),
		["id"], // Primary key columns
		"*", // Select all columns for the cache update
		{
			// Define any additional options as needed
			onError: (error) => {
				console.error("Error updating field:", error);
			},
		}
	);
}

export function useInsertField(supabase: SupabaseClient<Database>) {
	// Using the built-in useInsertMutation from supabase-cache-helpers
	// This will automatically handle cache updates and optimistic updates
	return useInsertMutation(
		supabase.from("fields"),
		["id"], // Primary key columns
		"*", // Select all columns for the cache update
		{
			// Define any additional options as needed
			onError: (error) => {
				console.error("Error inserting field:", error);
			},
		}
	);
}

export function useDeleteField(supabase: SupabaseClient<Database>) {
	// Using the built-in useDeleteMutation from supabase-cache-helpers
	// This will automatically handle cache updates and optimistic updates
	return useDeleteMutation(
		supabase.from("fields"),
		["id"], // Primary key columns
		"*", // Select all columns for the cache update
		{
			// Define any additional options as needed
			onError: (error) => {
				console.error("Error deleting field:", error);
			},
		}
	);
}

export function useUpdateFieldAdmins(supabase: SupabaseClient<Database>) {
	// Using the built-in useUpdateMutation from supabase-cache-helpers
	// This will handle cache invalidation and optimistic updates automatically
	const mutation = useUpdateMutation(
		supabase.from("fields"),
		["id"], // Primary key columns
		"*", // Select all columns for the cache update
		{
			onError: (error) => {
				console.error("Error updating field admins:", error);
			},
		}
	);

	// Wrap the mutation to adapt the parameter format
	return {
		...mutation,
		mutateAsync: async ({
			fieldId,
			adminedBy,
		}: {
			fieldId: string;
			adminedBy: string[];
		}) => {
			return mutation.mutateAsync({
				id: fieldId,
				adminedBy,
			});
		},
		mutate: (
			{ fieldId, adminedBy }: { fieldId: string; adminedBy: string[] },
			options?: any
		) => {
			return mutation.mutate(
				{
					id: fieldId,
					adminedBy,
				},
				options
			);
		},
	};
}

export function useInsertTournament(supabase: SupabaseClient<Database>) {
	// Using the built-in useInsertMutation from supabase-cache-helpers
	// This will automatically handle cache updates and optimistic updates
	return useInsertMutation(
		supabase.from("tournaments"),
		["id"], // Primary key columns
		"*", // Select all columns for the cache update
		{
			// Define callbacks for specific behaviors
			onError: (error) => {
				console.error("Error inserting tournament:", error);
			},
			// Handle field-specific cache invalidation
			onSettled: (data, error, variables) => {
				// If we have a fieldId in the variables, invalidate field-specific queries
				if (variables && "fieldId" in variables) {
					const queryClient = useQueryClient();
					queryClient.invalidateQueries({
						queryKey: [
							"supabase",
							"from",
							"tournaments",
							"eq",
							"fieldId",
							variables.fieldId,
						],
					});
				}
			},
		}
	);
}

export function useDeleteTournament(supabase: SupabaseClient<Database>) {
	// Using the built-in useDeleteMutation from supabase-cache-helpers
	// This will automatically handle cache updates and optimistic updates
	const deleteHook = useDeleteMutation(
		supabase.from("tournaments"),
		["id"], // Primary key columns
		"*", // Select all columns for the cache update
		{
			onError: (error) => {
				console.error("Error deleting tournament:", error);
			},
			onSettled: () => {
				// We need to invalidate field-specific queries as well
				const queryClient = useQueryClient();
				queryClient.invalidateQueries({
					queryKey: ["supabase", "from", "tournaments", "eq", "fieldId"],
				});
			},
		}
	);

	// Return the mutation with the correct interface
	return deleteHook;
}

// lo copié y pegué del updateTeam
export function useUpdateTournament(supabase: SupabaseClient<Database>) {
	// Using the built-in useUpdateMutation from supabase-cache-helpers
	return useUpdateMutation(
		supabase.from("tournaments"),
		["id"], // Primary key columns
		"*", // Select all columns for the cache update
		{
			onError: (error) => {
				console.error("Error updating team:", error);
			},
		}
	);
}
export function useInsertReservation(supabase: SupabaseClient<Database>) {
	// Using the built-in useInsertMutation from supabase-cache-helpers
	// This will automatically handle cache updates and optimistic updates
	return useInsertMutation(
		supabase.from("reservations"),
		["id"], // Primary key columns
		"*", // Select all columns for the cache update
		{
			onError: (error) => {
				console.error("Error inserting reservation:", error);
			},
			// Handle field-specific cache invalidation
			onSettled: (data, error, variables) => {
				// If we have a field_id in the variables, invalidate field-specific queries
				if (variables && "field_id" in variables) {
					const queryClient = useQueryClient();
					queryClient.invalidateQueries({
						queryKey: [
							"supabase",
							"from",
							"reservations",
							"eq",
							"field_id",
							variables.field_id,
						],
					});
				}
			},
		}
	);
}

export function useUpdateReservation(supabase: SupabaseClient<Database>) {
	// Using the built-in useUpdateMutation from supabase-cache-helpers
	const updateMutation = useUpdateMutation(
		supabase.from("reservations"),
		["id"], // Primary key columns
		"*", // Select all columns for the cache update
		{
			onError: (error) => {
				console.error("Error updating reservation:", error);
			},
			// Handle field-specific cache invalidation
			onSettled: (data, error, variables) => {
				// Check if field_id is present in the update data
				if (
					variables &&
					typeof variables === "object" &&
					"field_id" in variables
				) {
					const queryClient = useQueryClient();
					queryClient.invalidateQueries({
						queryKey: [
							"supabase",
							"from",
							"reservations",
							"eq",
							"field_id",
							variables.field_id,
						],
					});
				}
			},
		}
	);

	// We need a wrapper because the API signature is different
	// The built-in hook expects a flat object with id, but our API provides { id, data }
	return {
		...updateMutation,
		mutateAsync: async ({
			id,
			data,
		}: {
			id: string;
			data: Partial<Database["public"]["Tables"]["reservations"]["Update"]>;
		}) => {
			return updateMutation.mutateAsync({
				id,
				...data,
			});
		},
		mutate: (
			{
				id,
				data,
			}: {
				id: string;
				data: Partial<Database["public"]["Tables"]["reservations"]["Update"]>;
			},
			options?: any
		) => {
			return updateMutation.mutate(
				{
					id,
					...data,
				},
				options
			);
		},
	};
}

export function useUpdateTeam(supabase: SupabaseClient<Database>) {
	// Using the built-in useUpdateMutation from supabase-cache-helpers
	return useUpdateMutation(
		supabase.from("teams"),
		["team_id"], // Primary key columns
		"*", // Select all columns for the cache update
		{
			onError: (error) => {
				console.error("Error updating team:", error);
			},
		}
	);
}

export function useInsertTeam(supabase: SupabaseClient<Database>) {
	// Using the built-in useInsertMutation from supabase-cache-helpers
	return useInsertMutation(
		supabase.from("teams"),
		["team_id"], // Primary key columns
		"*", // Select all columns for the cache update
		{
			onError: (error) => {
				console.error("Error inserting team:", error);
			},
		}
	);
}

export function useDeleteTeam(supabase: SupabaseClient<Database>) {
	// Using the built-in useDeleteMutation from supabase-cache-helpers
	return useDeleteMutation(
		supabase.from("teams"),
		["team_id"], // Primary key columns
		"*", // Select all columns for the cache update
		{
			onError: (error) => {
				console.error("Error deleting team:", error);
			},
		}
	);
}

export function useInsertInscription(supabase: SupabaseClient<Database>) {
	// Using the built-in useInsertMutation from supabase-cache-helpers
	return useInsertMutation(
		supabase.from("inscriptions"),
		["id"], // Primary key columns
		"*", // Select all columns for the cache update
		{
			onError: (error) => {
				console.error("Error inserting inscription:", error);
			},
		}
	);
}

export function useDeleteReservation(supabase: SupabaseClient<Database>) {
	// Using the built-in useDeleteMutation from supabase-cache-helpers
	return useDeleteMutation(
		supabase.from("reservations"),
		["id"], // Primary key columns
		"*", // Select all columns for the cache update
		{
			onError: (error) => {
				console.error("Error deleting reservation:", error);
			},
		}
	);
}

export function useDeleteOAuthAuthorization(
	supabase: SupabaseClient<Database>
) {
	// Using the built-in useDeleteMutation from supabase-cache-helpers
	return useDeleteMutation(
		supabase.from("mp_oauth_authorization"),
		["user_id"], // Primary key columns
		"*", // Select all columns for the cache update
		{
			onError: (error) => {
				console.error("Error deleting OAuth authorization:", error);
			},
		}
	);
}

export const messagesQueryKey = (roomId: string) => [
	"supabase",
	"from",
	"messages",
	"eq",
	"room_id",
	roomId,
];

export function useChatMessages(
	supabase: SupabaseClient<Database> | null,
	roomId: string
) {
	const queryClient = useQueryClient();

	useEffect(() => {
		if (!supabase || !roomId) return;

		const channel = supabase
			.channel(`room:${roomId}`)
			.on(
				"postgres_changes",
				{
					event: "INSERT",
					schema: "public",
					table: "messages",
					filter: `room_id=eq.${roomId}`,
				},
				() => {
					queryClient.invalidateQueries({ queryKey: key });
				}
			)
			.subscribe();

		return () => {
			supabase.removeChannel(channel);
		};
	}, [supabase, roomId, queryClient]);

	const key = messagesQueryKey(roomId);
	return useQuery({
		queryKey: key,
		queryFn: async () => {
			if (!supabase) throw new Error("Supabase client not provided.");
			const { data, error } = await supabase
				.from("messages")
				.select("*, users(username, avatar_url)")
				.eq("room_id", roomId)
				.order("created_at");

			if (error) throw error;
			return data;
		},
		enabled: !!supabase && !!roomId,
	});
}

export function useInsertMessage(supabase: SupabaseClient<Database>) {
	// Using the built-in useInsertMutation from supabase-cache-helpers
	return useInsertMutation(supabase.from("messages"), ["id"], "*", {
		onError: (error) => {
			console.error("Error inserting message:", error);
		},
	});
}

export function useInsertUserPreferences(supabase: SupabaseClient<Database>) {
	// Using the built-in useInsertMutation from supabase-cache-helpers
	return useInsertMutation(
		supabase.from("user_preferences"),
		["user_id"], // Primary key columns
		"*", // Select all columns for the cache update
		{
			onError: (error) => {
				console.error("Error inserting user preferences:", error);
			},
		}
	);
}

export function useUpdateUserPreferences(supabase: SupabaseClient<Database>) {
	// Using the built-in useUpdateMutation from supabase-cache-helpers
	return useUpdateMutation(
		supabase.from("user_preferences"),
		["user_id"], // Primary key columns
		"*", // Select all columns for the cache update
		{
			onError: (error) => {
				console.error("Error updating user preferences:", error);
			},
		}
	);
}

export function useUpsertUserPreferences(supabase: SupabaseClient<Database>) {
	// Using the built-in useUpdateMutation from supabase-cache-helpers
	return useUpsertMutation(
		supabase.from("user_preferences"),
		["user_id"], // Primary key columns
		"*", // Select all columns for the cache update
		{
			onError: (error) => {
				console.error("Error updating user preferences:", error);
			},
		}
	);
}

export function getFieldReviewsAvg(
	supabase: SupabaseClient<Database>,
	fieldId: string,
	opts: any = undefined
) {
	return useQuerySupabase(queries.getFieldReviewsAvg(supabase, fieldId), opts);
}

export function getCurrentUserFieldReview(
	supabase: SupabaseClient<Database>,
	fieldId: string,
	userId: string,
	opts: any = undefined
) {
	return useQuerySupabase(
		queries.getCurrentUserFieldReview(supabase, fieldId, userId),
		opts
	);
}

export function useInsertFieldReview(supabase: SupabaseClient<Database>) {
	return useUpsertMutation(
		supabase.from("field_reviews"),
		["field_id", "user_id"],
		"*",
		{
			onConflict: "field_id,user_id",
			onError: (error) => {
				console.error("Error inserting or updating review:", error);
			},
		}
	);
}
