import { relations } from "drizzle-orm/relations";
import { reservations, mpPayments, users, fields, usersInAuth } from "./schema";

export const mpPaymentsRelations = relations(mpPayments, ({one}) => ({
	reservation: one(reservations, {
		fields: [mpPayments.reservationId],
		references: [reservations.id]
	}),
	user: one(users, {
		fields: [mpPayments.userId],
		references: [users.id]
	}),
}));

export const reservationsRelations = relations(reservations, ({one, many}) => ({
	mpPayments: many(mpPayments),
	field: one(fields, {
		fields: [reservations.fieldId],
		references: [fields.id]
	}),
	user: one(users, {
		fields: [reservations.ownerId],
		references: [users.id]
	}),
}));

export const usersRelations = relations(users, ({one, many}) => ({
	mpPayments: many(mpPayments),
	fields: many(fields),
	reservations: many(reservations),
	usersInAuth: one(usersInAuth, {
		fields: [users.id],
		references: [usersInAuth.id]
	}),
}));

export const fieldsRelations = relations(fields, ({one, many}) => ({
	user: one(users, {
		fields: [fields.owner],
		references: [users.id]
	}),
	reservations: many(reservations),
}));

export const usersInAuthRelations = relations(usersInAuth, ({many}) => ({
	users: many(users),
}));