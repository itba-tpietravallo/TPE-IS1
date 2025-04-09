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
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm/sql";

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

export const usersTable = pgTable("users", {
	id: uuid()
		.primaryKey()
		.notNull()
		.references((): AnyPgColumn => authUsers.id),
	full_name: varchar({ length: 255 }).notNull(),
	avatar_url: text(),
});

export const fieldsTable = pgTable(
	"fields",
	{
		id: uuid().primaryKey().defaultRandom().notNull(),
		owner: uuid()
			.notNull()
			.references(() => usersTable.id),
		name: varchar({ length: 255 }).notNull(),
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
	(t) => [index("spatial_index").using("gist", t.location)]
);

export const sportsTable = pgTable("sports", {
	name: varchar({ length: 255 }).primaryKey().notNull(),
});

export const reservationsTable = pgTable("reservations", {
	id: uuid().primaryKey().defaultRandom().notNull(),
	field_id: uuid()
		.notNull()
		.references(() => fieldsTable.id, { onDelete: "cascade" }),
	start_time: integer().notNull(),
	date: varchar({ length: 10 }).notNull(),
	owner_id: uuid()
		.notNull()
		.references(() => usersTable.id, { onDelete: "cascade" }),
	payments_id: uuid().default(sql`NULL`),
});

export const payments = pgTable("mp_payments", {
	payment_id: uuid().primaryKey().notNull(),
	user_id: uuid()
		.notNull()
		.references(() => usersTable.id, { onDelete: "cascade" }),
	reservation_id: uuid()
		.notNull()
		.references(() => reservationsTable.id, { onDelete: "cascade" }),
	last_updated: integer().notNull(),
	status: varchar({ length: 255 }).notNull(),
	transaction_amount: integer().notNull(),
	net_received_amount: integer().notNull(),
	total_paid_amount: integer().notNull(),
});
