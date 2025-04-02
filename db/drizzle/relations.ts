import { relations } from "drizzle-orm/relations";
import { users, fields } from "./schema";

export const fieldsRelations = relations(fields, ({one}) => ({
	user: one(users, {
		fields: [fields.owner],
		references: [users.id]
	}),
}));

export const usersRelations = relations(users, ({many}) => ({
	fields: many(fields),
}));