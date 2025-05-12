import { relations } from "drizzle-orm";
import {
	geometry,
	index,
	pgTable,
	serial,
	text,
	varchar,
	integer,
	pgSchema,
	uuid,
	AnyPgColumn,
	pgPolicy,
	timestamp,
	bigint,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm/sql";
import { authenticatedRole } from "drizzle-orm/supabase";

// BEGIN NOTICE: WARNING
// THE AUTH SCHEMA AND AUTH USERS TABLE ARE A STUB FOR `auth.users` WHICH IS MANAGED BY SUPABASE.
// THEY ARE NOT USED IN THE APPLICATION, BUT THEY ARE HERE FOR REFERENCE.
// THE AUTH SCHEMA AND AUTH USERS TABLE ARE NOT MANAGED BY DRIZZLE ORM.
// **** DO NOT ATTEMPT TO USE THEM IN YOUR CODE. ****
const authSchema = pgSchema("auth");
const authUsers = authSchema.table("users", {
	id: uuid("id").primaryKey(),
});
// END NOTICE: WARNING

export const usersTable = pgTable(
	"users",
	{
		id: uuid()
			.primaryKey()
			.notNull()
			.references((): AnyPgColumn => authUsers.id),
		full_name: varchar({ length: 255 }).notNull(),
		avatar_url: text(),
		username: text().notNull(),
		email: text().notNull().unique(),
	},
	(table) => [
		// INSERT, UPDATE, DELETE are disallowed by default.
		// This table is managed via Supabase triggers on auth.users.
		// Do not grant users insert/delete privileges on this table.
		pgPolicy("users - select authenticated", {
			for: "select",
			using: sql`true`,
			withCheck: sql``,
			to: authenticatedRole, // only allow authenticated users to select from the table
			as: "permissive",
		}),
	],
).enableRLS();

export const fieldsTable = pgTable(
	"fields",
	{
		id: uuid().primaryKey().defaultRandom().notNull(),
		owner: uuid()
			.notNull()
			.references(() => usersTable.id),
		name: varchar({ length: 255 }).notNull(),
		price: integer().notNull(),
		location: geometry("location", {
			type: "Point",
			mode: "xy",
			srid: 4326,
		}),
		street_number: varchar({ length: 6 }).notNull(),
		street: varchar({ length: 255 }).notNull(),
		neighborhood: varchar({ length: 255 }).notNull(),
		sports: text().array().notNull(),
		description: text(),
		city: varchar({ length: 255 }).notNull(),
		avatar_url: text(),
		images: text().array(),
	},
	(table) => [
		// index("spatial_index").using("gist", table.location),

		// Ownership information is stored in the `owner` column. Validated with ON BEFORE INSERT/UPDATE/DELETE triggers.
		// owner is verified by a trigger `on_field_created  -> validate_new_field()`
		pgPolicy("fields - select authenticated", {
			for: "all",
			using: sql`true`,
			to: authenticatedRole,
			as: "permissive",
		}),
	],
).enableRLS();

export const sportsTable = pgTable(
	"sports",
	{
		name: varchar({ length: 255 }).primaryKey().notNull(),
	},
	(table) => [
		// Only allow authenticated users to select from the table, all other operations are disallowed by default.
		pgPolicy("sports - select authenticated", {
			for: "select",
			using: sql`true`,
			withCheck: sql``,
			to: authenticatedRole,
			as: "permissive",
		}),
	],
).enableRLS();

export const reservationsTable = pgTable(
	"reservations",
	{
		id: uuid().primaryKey().defaultRandom().notNull(),
		field_id: uuid()
			.notNull()
			.references(() => fieldsTable.id, { onDelete: "cascade" }),
		date_time: timestamp({ withTimezone: true }).notNull(),
		owner_id: uuid()
			.notNull()
			.references(() => usersTable.id, { onDelete: "cascade" }),
		payments_id: bigint({ mode: "number" }).default(sql`NULL`),
	},
	(table) => [
		pgPolicy("reservations - select authenticated", {
			for: "all",
			using: sql`true`,
			withCheck: sql``,
			to: authenticatedRole,
			as: "permissive",
		}),
	],
).enableRLS();

export const mpPaymentsTable = pgTable(
	"mp_payments",
	{
		payment_id: bigint({ mode: "number" }).primaryKey().notNull(),
		user_id: uuid()
			.notNull()
			.references(() => usersTable.id, { onDelete: "cascade" }),
		reservation_id: uuid()
			.notNull()
			.references(() => reservationsTable.id, { onDelete: "cascade" }),
		last_updated: timestamp({ withTimezone: true }).notNull(),
		status: varchar({ length: 255 }).notNull(),
		transaction_amount: integer().notNull(),
		net_received_amount: integer().notNull(),
		total_paid_amount: integer().notNull(),
	},
	(table) => [
		// Only allow authenticated users (WHOSE ID MATCHES THE RECORD) to select from the table, all other operations are disallowed by default.
		pgPolicy("payments - select authenticated", {
			for: "select",
			using: sql`(select auth.uid()) = user_id`,
			withCheck: sql``,
			to: authenticatedRole,
			as: "permissive",
		}),
	],
).enableRLS();

export const mpOAuthAuthorizationTable = pgTable(
	"mp_oauth_authorization",
	{
		user_id: uuid()
			.primaryKey()
			.notNull()
			.references(() => usersTable.id, { onDelete: "cascade" }),
		mercado_pago_user_id: varchar({ length: 255 }).notNull(),
		processor: varchar({ length: 255 }).notNull(),
		access_token: text().notNull(),
		refresh_token: text().notNull(),
		expires_in: integer().notNull(),
		scope: text().notNull(),
		public_key: text().notNull(),
		live_mode: integer().notNull(),
	},
	(table) => [
		// Only allow authenticated users (WHOSE ID MATCHES THE RECORD) to select from the table, all other operations are disallowed by default.
		pgPolicy("oauth_authorization - select authenticated", {
			for: "select",
			using: sql`(select auth.uid()) = user_id`,
			to: authenticatedRole,
			as: "permissive",
		}),
		pgPolicy("oauth_authorization - insert authenticated", {
			for: "insert",
			withCheck: sql`true`,
			to: authenticatedRole,
			as: "permissive",
		}),
		pgPolicy("oauth_authorization - update authenticated", {
			for: "update",
			using: sql`(select auth.uid()) = user_id`,
			withCheck: sql`true`,
			to: authenticatedRole,
			as: "permissive",
		}),
		// Insert, update are checked by triggers on the table.
	],
).enableRLS();

export const teamsTable = pgTable(
	"teams",
	{
		team_id: uuid().primaryKey().defaultRandom().notNull(),
		name: text().notNull(),
		sport: text().notNull(), //@TODO: hacer reference a sportsTable
		description: text(),
		images: text().array(),
		players: text().array().notNull(), //Solucion provisoria | @TODO: convertir a uuid y hacer reference a usersTable
	},
	(table) => [
		pgPolicy("teams - select authenticated", {
			for: "all",
			using: sql`true`,
			withCheck: sql``,
			to: authenticatedRole,
			as: "permissive",
		}),
	],
).enableRLS();

export const tournamentsTable = pgTable(
	"tournaments",
	{
		id: uuid().primaryKey().defaultRandom().notNull(),
		name: text().notNull(),
		fieldId: uuid()
			.notNull()
			.references(() => fieldsTable.id, { onDelete: "cascade" }),
		sport: text().notNull(),
		startDate: timestamp({ withTimezone: true }).notNull(),
		description: text(),
		price: integer().notNull(),
		deadline: timestamp({ withTimezone: true }).notNull(),
		cantPlayers: integer().notNull(),
		players: text().array(),
	},
	(table) => [
		pgPolicy("tournaments - select authenticated", {
			for: "select",
			using: sql`true`,
			to: authenticatedRole, // only allow authenticated users to select from the table
			as: "permissive",
		}),
		pgPolicy("tournaments - insert authenticated", {
			for: "insert",
			withCheck: sql`true`,
			to: authenticatedRole, // only allow authenticated users to select from the table
			as: "permissive",
		}),
		pgPolicy("tournaments - update authenticated", {
			for: "update",
			withCheck: sql`true`,
			using: sql`true`,
			to: authenticatedRole, // only allow authenticated users to select from the table
			as: "permissive",
		}),
	],
).enableRLS();
