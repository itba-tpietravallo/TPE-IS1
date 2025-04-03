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
} from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
	id: uuid().primaryKey().notNull(),
	first_name: varchar({ length: 255 }).notNull(),
	last_name: varchar({ length: 255 }).notNull(),
	avatar: text(),
});

export const fieldsTable = pgTable(
	"fields",
	{
		id: integer().primaryKey().generatedAlwaysAsIdentity().notNull(),
		owner: uuid()
			.notNull()
			.references(() => usersTable.id),
		name: varchar({ length: 255 }).notNull(),
		location: geometry("location", {
			type: "point",
			mode: "xy",
			srid: 4326,
		}).notNull(),
		street_number: varchar({ length: 6 }).notNull(),
		street: varchar({ length: 255 }).notNull(),
		neighborhood: varchar({ length: 255 }).notNull(),
		sports: text().array().notNull(),
		description: text(),
		city: varchar({ length: 255 }).notNull(),
		avatar: text(),
		images: text().array(),
	},
	(t) => [index("spatial_index").using("gist", t.location)]
);

export const sportsTable = pgTable("sports", {
	name: varchar({ length: 255 }).primaryKey().notNull(),
});
