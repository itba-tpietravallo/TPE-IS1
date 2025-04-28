# Database

This folder contains all code related to the database, its maintenance, and mock data.

## DB Client

To host and maintain the PostgreSQL DB, [Supabase](https://supabase.com) was chosen for it's extensive documentation, DX, and cloud hosting services. It's open source nature also allows for self-hosting if costs ever became an issue.

### Error handling on Supabase

> [!NOTE] DB/SQL errors produced on Supabase **WILL NOT** throw and will instead return an error object as follows:

```js
// Lets assume the productx table does not exist
const response = await supabase.from("productx").select("*");
```

Then the response will be:

```js
{
  "error": {
    "code": 404,
    "message": "relation \"public.productx\" does not exist",
    "details": null,
    "hint": null
  },
  "data": null,
  "status": 404,
  "statusCode": 404,
  "statusText": "",
  "body": null // for backwards compatibility: `body === data`
}
```

## ORM

To improve developer experience, an Object-Relational Mapping is used. For a variety of reasons, [Drizzle](https://orm.drizzle.team) was chosen as the best alternative for this task.

### The weird, the bad, and the ugly.

Because of an open issue (#6) on Drizzle (Kit) concerning the PostgreSQL Postgis extension -- which contains geolocation data types -- a fork of drizzle-kit is used instead.

https://github.com/itba-tpietravallo/TPE-IS1/blob/dacaefb85d4711ba33751bd11e55a70019ad6307/db/package.json#L8-9

This does not affect development in any way for features released up to drizzle-kit versions 0.30.8, any patch, minor, or major release after need to be manually applied to the package until the official fix is deployed.

## Environment Variables

To push schema changes, pull, and visualize records using drizzle kit, a `.env` file needs to be present in the `/db` directory, with the following secrets:

- `DATABASE_URL`

This variable is a SECRET, and must be treated as such.

For client libraries connecting to Supabase, the following env variables must be present on either `/web` or `/mobile`:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`

It is okey to expose this values publicly and thus are tracked in Git

## Row Level Security (RLS)

All tables are protected by RLS. Using DrizzleORM, RLS can be explicitly enabled on a table by calling `enableRLS()`.

> [!WARNING]
> Row Level Security means not all operations are allowed, and those that are might depend on the users' authentication level.

Queries made via Supabase are automatically identified internally to one of the following roles:

1. anon
2. authenticated

Anon roles correspond to anonymous users, meaning a users that has not logged in.

An Authenticated call might come from someone who's signed in via the web or mobile applications.

As an example, let's see how to implement RLS on the `users` table using drizzle.

```ts
export const usersTable = pgTable(
	"users",
	{
		id: uuid()
			.primaryKey()
			.notNull()
			.references((): AnyPgColumn => authUsers.id),
		full_name: varchar({ length: 255 }).notNull(),
		avatar_url: text(),
		// ...
	},
	(table) => [
		// create a new Postgres Policy called "users - select authenticated"
		pgPolicy("users - select authenticated", {
			for: "select",
			using: sql`true`,
			to: authenticatedRole,
			as: "restrictive",
		}),
	],
).enableRLS();
```

In this example, RLS is enabled meaning no users can perform any operations not described by a policy. Then, we add a policy targeting `authenticatedRole` and specifically allow `SELECT`s to be performed.

Read more on the [Drizzle docs on RLS](https://orm.drizzle.team/docs/rls).

> [!CAUTION]
> Always enable RLS on public tables to prevent unauthorized read/writes to exposed tables.

## Modifying / visualizing the DB schema

To modify the DB schema change the [`/db/schema.ts`](/db/schema.ts) file and then run the following command:

```sh
# npm i
npx drizzle-kit push
```

To visualize the db schema and records present run:

```sh
# npm i
npx drizzle-kit studio
```

## Caching

> There are only two hard things in Computer Science: cache invalidation and naming things.
>
> Phil Karlton

In order to avoid querying on each navigation, improve load times (prefetch/ssr), and provide a better user/developer experience, Tan Stack Query (formerly React Query) is implemented.

The `useQuery` function, along with [supabase's cache helpers](https://github.com/psteinroe/supabase-cache-helpers), provide an easy way to cache data.

### DTOs

To improve the quality of the code, the [`db/queries.ts`](./db/queries.ts) shall be the only place that contains logic that interacts with the database. This is a cheap/hacky way to abstract the database away from the client layer.

> [!NOTE]
> This means that any changes to queries affect both the web and app clients.

Changes to the `queries.ts` file should ideally not remove data expected by clients, but instead add new queries or expand the scope of existing ones, without breaking compatibility.

Moving forwards, this also provides an easy way to test features in production, by means of using an integer flag like `is_live_mode` that can be selectively filtered on all queries at the same time and in the same place.

## Links

- [Drizzle documentation](https://orm.drizzle.team/docs/overview)
- [Supabase docs](https://supabase.com/docs)
