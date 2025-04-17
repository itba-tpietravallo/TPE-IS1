import { pgTable, foreignKey, pgPolicy, uuid, integer, varchar, geometry, text } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const mpPayments = pgTable("mp_payments", {
	paymentId: uuid("payment_id").primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	reservationId: uuid("reservation_id").notNull(),
	lastUpdated: integer("last_updated").notNull(),
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
	pgPolicy("payments - select authenticated", { as: "restrictive", for: "select", to: ["authenticated"] }),
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
}, (table) => [
	foreignKey({
			columns: [table.owner],
			foreignColumns: [users.id],
			name: "fields_owner_users_id_fk"
		}),
	pgPolicy("fields - select authenticated", { as: "restrictive", for: "all", to: ["authenticated"] }),
]);

export const reservations = pgTable("reservations", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	fieldId: uuid("field_id").notNull(),
	startTime: varchar("start_time").notNull(),
	date: varchar({ length: 10 }).notNull(),
	ownerId: uuid("owner_id").notNull(),
	paymentsId: uuid("payments_id"),
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
	pgPolicy("reservations - select authenticated", { as: "restrictive", for: "all", to: ["authenticated"] }),
]);

export const sports = pgTable("sports", {
	name: varchar({ length: 255 }).primaryKey().notNull(),
}, (table) => [
	pgPolicy("sports - select authenticated", { as: "restrictive", for: "select", to: ["authenticated"] }),
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
	pgPolicy("users - select authenticated", { as: "restrictive", for: "select", to: ["authenticated"] }),
]);
