# Incident report: Supabase, 2025-05-13

In the hopes of avoiding future mistakes, an incident report for 2025-05-13 is produced. It is comprised of the following subsections:

- Incident report: Supabase, 2025-05-13
  - [Timeline](#timeline)
  - [What happened](#what-happened)
  - [Why it happened](#why-it-happened)
  - [How it was dealt with](#how-it-was-dealt-with)
  - [Incident prevention](#incident-prevention)

## Timeline
- `2025-05-04 23:32pm`: Increased usage of Supabase egress is noticed
- `2025-05-05 06:45am`: Usage quota was exceeded at 110% of allowed limits. Supabase may begin imposing restrictions on the Database.
- `2025-05-05 06:57am`: The decision to migrate the database was taken.
- `2025-05-05 07:06am`: A new Database instance is spun up.
- `2025-05-05 07:54am`: All data is replicated in the new instance.
- `2025-05-05 08:17am`: New database is fully operational. 

## What happened

Excess Supabase egress triggered quota limits that jeopardized the operation of [matchpointapp.com.ar](matchpointapp.com.ar). This unfortunately coincided with one of the biweekly sprints. 

## Why it happened 

The use of Supabase as both a Database and Storage provider proved convinient as a way to scale up fast with ease. Supabase provides convinient wrappers that handle file upload/download. However, the egress (data transfer) usage is billed alongside the main database egress, meaning triggering a limit on file transfers affected database operations (and auth). As more and more (organic) file transfer operations were performed, this eventually triggered usage limits.

## How it was dealt with

After `2025-05-05 06:57am` the process to migrate away from the Supabase instance hosting Matchpoint's data began. Supabase handles three key aspects that needed to be taken care of:
- Postgres database
- Authentication (OAuth)
- File storage

A new Supabase project was spun up, and a schema/data migration was conducted.

Once credentials had been swapped for new ones, drizzle was utilized to construct the schema of the database. This ensured that even if data replication couldn't be performed, the database could continue working on as a fresh copy. 

```sh
npx drizzle-kit push
```

Data replication was then carried out using postgres' `pg_dump`/`pg_restore`.

```sh
pg_dump postgresql://postgres.[INSTANCE_ID]:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:5432/postgres --data-only --format tar > dump

pg_restore -d postgresql://postgres.[INSTANCE_ID]:[PASSWORD]@aws-0-us-east-2.pooler.supabase.com:5432/postgres dump
```

This copied over all data (and uploaded files!), including user oauth sessions. 

The new OAuth callback URL was set as a trusted endpoint on relevant OAuth providers (Google). This had to be performed manually.

Now, a fully functional replica of the database/auth/storage provider was up. The incident was over...

## Incident prevention

After the sprint was over, inmediate steps to rip out all use of Supabase Storage was taken. Later that day, a platform agnostic put-signed URL upload system was fully operational, using Google Cloud Plaform Storage buckets as the chosen provider. 

Some other steps taken or underway to prevent a similar incident from reoccurring are:

- Creating two fresh copies of the postgres database. Nuking the usage-exceeded instance once all data had been replicated safely.

- Eliminating all use of Supabase as a storage provider, with a new platform agnostic system taking its place. 

- Adressing steps that slowed down the recovery and mitigation with a comprehensive Database backup and secret rotation strategy. This includes but is not limited to:
  - Eliminating manual secret rotation across environments and providers.
  - Establishing documentation as to what/where needed to be updated manually if ever needed.
  - Ensuring one-click database restoration/backups from fresh postgres instances, and providing a clear migration path for files if ever needed.
