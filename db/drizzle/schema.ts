import { pgTable, foreignKey, pgPolicy, uuid, varchar, text, integer, geometry, bigint, timestamp, pgView, numeric } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const mpOauthAuthorization = pgTable("mp_oauth_authorization", {
	userId: uuid("user_id").primaryKey().notNull(),
	mercadoPagoUserId: varchar("mercado_pago_user_id", { length: 255 }).notNull(),
	processor: varchar({ length: 255 }).notNull(),
	accessToken: text("access_token").notNull(),
	refreshToken: text("refresh_token").notNull(),
	expiresIn: integer("expires_in").notNull(),
	scope: text().notNull(),
	publicKey: text("public_key").notNull(),
	liveMode: integer("live_mode").notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "mp_oauth_authorization_user_id_users_id_fk"
		}).onDelete("cascade"),
	pgPolicy("oauth_authorization - insert authenticated", { as: "permissive", for: "insert", to: ["authenticated"], withCheck: sql`true`  }),
	pgPolicy("oauth_authorization - select authenticated", { as: "permissive", for: "select", to: ["authenticated"] }),
	pgPolicy("oauth_authorization - update authenticated", { as: "permissive", for: "update", to: ["authenticated"] }),
]);

export const teams = pgTable("teams", {
	teamId: uuid("team_id").defaultRandom().primaryKey().notNull(),
	name: text().notNull(),
	sport: text().notNull(),
	description: text(),
	images: text().array(),
	players: text().array().notNull(),
}, (table) => [
	pgPolicy("teams - select authenticated", { as: "permissive", for: "select", to: ["authenticated"], using: sql`true` }),
	pgPolicy("teams - update authenticated", { as: "permissive", for: "update", to: ["authenticated"] }),
	pgPolicy("teams - insert authenticated", { as: "permissive", for: "insert", to: ["authenticated"] }),
]);

export const fields = pgTable("fields", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	owner: uuid().notNull(),
	name: varchar({ length: 255 }).notNull(),
	location: geometry({ type: "point" }),
	streetNumber: varchar("street_number", { length: 6 }).notNull(),
	street: varchar({ length: 255 }).notNull(),
	neighborhood: varchar({ length: 255 }).notNull(),
	sports: text().array().notNull(),
	description: text(),
	city: varchar({ length: 255 }).notNull(),
	avatarUrl: text("avatar_url"),
	images: text().array(),
	price: integer().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.owner],
			foreignColumns: [users.id],
			name: "fields_owner_users_id_fk"
		}),
	pgPolicy("fields - select authenticated", { as: "permissive", for: "all", to: ["authenticated"], using: sql`true` }),
]);

export const sports = pgTable("sports", {
	name: varchar({ length: 255 }).primaryKey().notNull(),
}, (table) => [
	pgPolicy("sports - select authenticated", { as: "permissive", for: "select", to: ["authenticated"], using: sql`true` }),
]);

export const mpPayments = pgTable("mp_payments", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	paymentId: bigint("payment_id", { mode: "number" }).primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	reservationId: uuid("reservation_id").notNull(),
	lastUpdated: timestamp("last_updated", { withTimezone: true, mode: 'string' }).notNull(),
	status: varchar({ length: 255 }).notNull(),
	transactionAmount: integer("transaction_amount").notNull(),
	netReceivedAmount: integer("net_received_amount").notNull(),
	totalPaidAmount: integer("total_paid_amount").notNull(),
}, (table) => [
	foreignKey({
			columns: [table.reservationId],
			foreignColumns: [reservations.id],
			name: "mp_payments_reservation_id_reservations_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "mp_payments_user_id_users_id_fk"
		}).onDelete("cascade"),
	pgPolicy("payments - select authenticated", { as: "permissive", for: "select", to: ["authenticated"], using: sql`(( SELECT auth.uid() AS uid) = user_id)` }),
]);

export const reservations = pgTable("reservations", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	fieldId: uuid("field_id").notNull(),
	dateTime: timestamp("date_time", { withTimezone: true, mode: 'string' }).notNull(),
	ownerId: uuid("owner_id").notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	paymentsId: bigint("payments_id", { mode: "number" }),
}, (table) => [
	foreignKey({
			columns: [table.fieldId],
			foreignColumns: [fields.id],
			name: "reservations_field_id_fields_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.ownerId],
			foreignColumns: [users.id],
			name: "reservations_owner_id_users_id_fk"
		}).onDelete("cascade"),
	pgPolicy("reservations - select authenticated", { as: "permissive", for: "all", to: ["authenticated"], using: sql`true` }),
]);

export const users = pgTable("users", {
	id: uuid().primaryKey().notNull(),
	avatarUrl: text("avatar_url"),
	fullName: varchar("full_name", { length: 255 }).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.id],
			foreignColumns: [table.id],
			name: "users_id_users_id_fk"
		}),
	pgPolicy("users - select authenticated", { as: "permissive", for: "select", to: ["authenticated"], using: sql`true` }),
]);
export const fieldsDistanceView = pgView("fields_distance_view", {	id: uuid(),
	owner: uuid(),
	name: varchar({ length: 255 }),
	location: geometry({ type: "point" }),
	streetNumber: varchar("street_number", { length: 6 }),
	street: varchar({ length: 255 }),
	neighborhood: varchar({ length: 255 }),
	sports: text(),
	description: text(),
	city: varchar({ length: 255 }),
	avatarUrl: text("avatar_url"),
	images: text(),
	price: integer(),
	distMeters: numeric("dist_meters"),
}).as(sql`SELECT fields.id, fields.owner, fields.name, fields.location, fields.street_number, fields.street, fields.neighborhood, fields.sports, fields.description, fields.city, fields.avatar_url, fields.images, fields.price, 1.0 AS dist_meters FROM fields`);