import { pgTable, index, foreignKey, integer, varchar, geometry, text, uuid } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const fields = pgTable("fields", {
	id: integer().primaryKey().generatedAlwaysAsIdentity({ name: "users_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	name: varchar({ length: 255 }).notNull(),
	location: geometry({ type: "point" }).notNull(),
	avatar: text(),
	images: text().array(),
	owner: uuid().notNull(),
}, (table) => [
	index("spatial_index").using("gist", table.location.asc().nullsLast().op("gist_geometry_ops_2d")),
	foreignKey({
			columns: [table.owner],
			foreignColumns: [users.id],
			name: "fields_owner_users_id_fk"
		}),
]);

export const users = pgTable("users", {
	id: uuid().primaryKey().notNull(),
	firstName: varchar("first_name", { length: 255 }).notNull(),
	lastName: varchar("last_name", { length: 255 }).notNull(),
});
