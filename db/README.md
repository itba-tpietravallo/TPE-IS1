# Database

This folder contains all code related to the database, its maintenance, and mock data.

## DB Client

To host and maintain the PostgreSQL DB, [Supabase](https://supabase.com) was chosen for it's extensive documentation, DX, and cloud hosting services. It's open source nature also allows for self-hosting if costs ever became an issue.

### Error handling on Supabase

>[!NOTE] DB/SQL errors produced on Supabase **WILL NOT** throw and will instead return an error object as follows:

```js
// Lets assume the productx table does not exist
const response = await supabase.from('productx').select('*')
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
- ‎`DATABASE_URL`

This variable is a SECRET, and must be treated as such.

For client libraries connecting to Supabase, the following env variables must be present on either `/web` or `/mobile`:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`

It is okey to expose this values publicly and thus are tracked in Git

# Modifying / visualizing the DB schema

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

## Links

- [Drizzle documentation](https://orm.drizzle.team/docs/overview)
- [Supabase docs](https://supabase.com/docs)
