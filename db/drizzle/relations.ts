import { relations } from "drizzle-orm/relations";
import { users, mpOauthAuthorization, fields, tournaments, sports, teams, usersInAuth, inscriptions, messages, reservations, mpPayments, fieldReviews, userPreferences } from "./schema";

export const mpOauthAuthorizationRelations = relations(mpOauthAuthorization, ({one}) => ({
	user: one(users, {
		fields: [mpOauthAuthorization.userId],
		references: [users.id]
	}),
}));

export const usersRelations = relations(users, ({one, many}) => ({
	mpOauthAuthorizations: many(mpOauthAuthorization),
	fields: many(fields),
	usersInAuth: one(usersInAuth, {
		fields: [users.id],
		references: [usersInAuth.id]
	}),
	messages: many(messages),
	reservations: many(reservations),
	mpPayments: many(mpPayments),
	fieldReviews: many(fieldReviews),
	userPreferences: many(userPreferences),
}));

export const fieldsRelations = relations(fields, ({one, many}) => ({
	user: one(users, {
		fields: [fields.owner],
		references: [users.id]
	}),
	tournaments: many(tournaments),
	reservations: many(reservations),
	fieldReviews: many(fieldReviews),
}));

export const tournamentsRelations = relations(tournaments, ({one, many}) => ({
	field: one(fields, {
		fields: [tournaments.fieldId],
		references: [fields.id]
	}),
	sport: one(sports, {
		fields: [tournaments.sport],
		references: [sports.name]
	}),
	inscriptions: many(inscriptions),
}));

export const sportsRelations = relations(sports, ({many}) => ({
	tournaments: many(tournaments),
	teams: many(teams),
}));

export const teamsRelations = relations(teams, ({one, many}) => ({
	sport: one(sports, {
		fields: [teams.sport],
		references: [sports.name]
	}),
	inscriptions: many(inscriptions),
	messages: many(messages),
	reservations: many(reservations),
}));

export const usersInAuthRelations = relations(usersInAuth, ({many}) => ({
	users: many(users),
}));

export const inscriptionsRelations = relations(inscriptions, ({one}) => ({
	team: one(teams, {
		fields: [inscriptions.teamId],
		references: [teams.teamId]
	}),
	tournament: one(tournaments, {
		fields: [inscriptions.tournamentId],
		references: [tournaments.id]
	}),
}));

export const messagesRelations = relations(messages, ({one}) => ({
	team: one(teams, {
		fields: [messages.roomId],
		references: [teams.teamId]
	}),
	user: one(users, {
		fields: [messages.userId],
		references: [users.id]
	}),
}));

export const reservationsRelations = relations(reservations, ({one, many}) => ({
	field: one(fields, {
		fields: [reservations.fieldId],
		references: [fields.id]
	}),
	user: one(users, {
		fields: [reservations.ownerId],
		references: [users.id]
	}),
	team: one(teams, {
		fields: [reservations.teamId],
		references: [teams.teamId]
	}),
	mpPayments: many(mpPayments),
}));

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

export const fieldReviewsRelations = relations(fieldReviews, ({one}) => ({
	field: one(fields, {
		fields: [fieldReviews.fieldId],
		references: [fields.id]
	}),
	user: one(users, {
		fields: [fieldReviews.userId],
		references: [users.id]
	}),
}));

export const userPreferencesRelations = relations(userPreferences, ({one}) => ({
	user: one(users, {
		fields: [userPreferences.userId],
		references: [users.id]
	}),
}));