import { pgTable, foreignKey, pgPolicy, uuid, varchar, text, integer, geometry, timestamp, boolean, unique, bigint } from "drizzle-orm/pg-core"
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

export const fields = pgTable("fields", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	owner: uuid().notNull(),
	name: varchar({ length: 255 }).notNull(),
	price: integer().notNull(),
	location: geometry({ type: "point" }),
	streetNumber: varchar("street_number", { length: 6 }).notNull(),
	street: varchar({ length: 255 }).notNull(),
	neighborhood: varchar({ length: 255 }).notNull(),
	sports: text().array().notNull(),
	description: text(),
	city: varchar({ length: 255 }).notNull(),
	avatarUrl: text("avatar_url"),
	images: text().array(),
	adminedBy: text().array().default([""]).notNull(),
	slotDuration: integer("slot_duration").default(60).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.owner],
			foreignColumns: [users.id],
			name: "fields_owner_users_id_fk"
		}),
	pgPolicy("fields - select authenticated", { as: "permissive", for: "all", to: ["authenticated"], using: sql`true` }),
]);

export const tournaments = pgTable("tournaments", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: text().notNull(),
	fieldId: uuid().notNull(),
	sport: text().notNull(),
	startDate: timestamp({ withTimezone: true, mode: 'string' }).notNull(),
	description: text(),
	price: integer().notNull(),
	deadline: timestamp({ withTimezone: true, mode: 'string' }).notNull(),
	cantPlayers: integer().notNull(),
	active: boolean().default(true).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.fieldId],
			foreignColumns: [fields.id],
			name: "tournaments_fieldId_fields_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.sport],
			foreignColumns: [sports.name],
			name: "tournaments_sport_sports_name_fk"
		}).onDelete("cascade"),
	pgPolicy("tournaments - update authenticated", { as: "permissive", for: "update", to: ["authenticated"], using: sql`true`, withCheck: sql`true`  }),
	pgPolicy("tournaments - insert authenticated", { as: "permissive", for: "insert", to: ["authenticated"] }),
	pgPolicy("tournaments - select authenticated", { as: "permissive", for: "select", to: ["authenticated"] }),
	pgPolicy("tournaments - delete authenticated", { as: "permissive", for: "delete", to: ["authenticated"] }),
]);

export const sports = pgTable("sports", {
	name: varchar({ length: 255 }).primaryKey().notNull(),
}, (table) => [
	pgPolicy("sports - select authenticated", { as: "permissive", for: "select", to: ["authenticated"], using: sql`true` }),
]);

export const teams = pgTable("teams", {
	teamId: uuid("team_id").defaultRandom().primaryKey().notNull(),
	name: text().notNull(),
	sport: text().notNull(),
	description: text(),
	images: text().array(),
	players: text().array().notNull(),
	contactPhone: text().notNull(),
	contactEmail: text().notNull(),
	playerRequests: text().array().notNull(),
	admins: text().array().notNull(),
	isPublic: boolean().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.sport],
			foreignColumns: [sports.name],
			name: "teams_sport_sports_name_fk"
		}),
	pgPolicy("teams - select authenticated", { as: "permissive", for: "all", to: ["authenticated"], using: sql`true` }),
]);

export const users = pgTable("users", {
	id: uuid().primaryKey().notNull(),
	fullName: varchar("full_name", { length: 255 }).notNull(),
	avatarUrl: text("avatar_url"),
	username: text(),
	email: text().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.id],
			foreignColumns: [table.id],
			name: "users_id_users_id_fk"
		}),
	unique("users_email_unique").on(table.email),
	pgPolicy("users - select authenticated", { as: "permissive", for: "select", to: ["authenticated"], using: sql`true` }),
]);

export const inscriptions = pgTable("inscriptions", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	tournamentId: uuid().notNull(),
	teamId: uuid(),
}, (table) => [
	foreignKey({
			columns: [table.teamId],
			foreignColumns: [teams.teamId],
			name: "inscriptions_teamId_teams_team_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.tournamentId],
			foreignColumns: [tournaments.id],
			name: "inscriptions_tournamentId_tournaments_id_fk"
		}).onDelete("cascade"),
	pgPolicy("inscriptions - insert authenticated", { as: "permissive", for: "insert", to: ["authenticated"], withCheck: sql`true`  }),
	pgPolicy("inscriptions - update authenticated", { as: "permissive", for: "update", to: ["authenticated"] }),
	pgPolicy("inscriptions - select authenticated", { as: "permissive", for: "select", to: ["authenticated"] }),
]);

export const messages = pgTable("messages", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	roomId: uuid("room_id").notNull(),
	content: text().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.roomId],
			foreignColumns: [teams.teamId],
			name: "messages_room_id_teams_team_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "messages_user_id_users_id_fk"
		}).onDelete("cascade"),
	pgPolicy("messages - allow select for authenticated users", { as: "permissive", for: "select", to: ["authenticated"], using: sql`true` }),
	pgPolicy("messages - allow insert for owners", { as: "permissive", for: "insert", to: ["authenticated"] }),
]);

export const reservations = pgTable("reservations", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	paymentsIds: bigint("payments_ids", { mode: "number" }).array(),
	fieldId: uuid("field_id").notNull(),
	dateTime: timestamp("date_time", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	ownerId: uuid("owner_id").notNull(),
	teamId: uuid("team_id"),
	confirmed: boolean().default(false).notNull(),
	bookersCount: integer("bookers_count").notNull(),
	pendingBookersIds: text("pending_bookers_ids").array().notNull(),
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
	foreignKey({
			columns: [table.teamId],
			foreignColumns: [teams.teamId],
			name: "reservations_team_id_teams_team_id_fk"
		}).onDelete("cascade"),
	pgPolicy("reservations - select authenticated", { as: "permissive", for: "all", to: ["authenticated"], using: sql`true` }),
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

export const fieldReviews = pgTable("field_reviews", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	fieldId: uuid("field_id").notNull(),
	userId: uuid("user_id").notNull(),
	rating: integer().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.fieldId],
			foreignColumns: [fields.id],
			name: "field_reviews_field_id_fields_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "field_reviews_user_id_users_id_fk"
		}).onDelete("cascade"),
	unique("unique_user_field").on(table.fieldId, table.userId),
	pgPolicy("select_authenticated", { as: "permissive", for: "select", to: ["authenticated"], using: sql`true` }),
	pgPolicy("insert_authenticated", { as: "permissive", for: "insert", to: ["authenticated"] }),
	pgPolicy("update_own_review", { as: "permissive", for: "update", to: ["authenticated"] }),
]);

export const userPreferences = pgTable("user_preferences", {
	userId: uuid("user_id").primaryKey().notNull(),
	favUsers: text("fav_users").array().notNull(),
	favFields: text("fav_fields").array().notNull(),
	teamInvites: text("team_invites").array().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "user_preferences_user_id_users_id_fk"
		}).onDelete("cascade"),
	pgPolicy("user_preferences - select authenticated", { as: "permissive", for: "select", to: ["authenticated"], using: sql`true` }),
	pgPolicy("user_preferences - update authenticated", { as: "permissive", for: "update", to: ["authenticated"] }),
	pgPolicy("user_preferences - insert authenticated", { as: "permissive", for: "insert", to: ["authenticated"] }),
]);
