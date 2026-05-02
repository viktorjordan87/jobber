# Docker Setup (Postgres + pgAdmin)

This folder contains local database services for `auth`.

## Start and stop

From the repository root:

- `npm run docker:up`
- `npm run docker:down`
- `npm run docker:ps`
- `npm run docker:logs`

Or directly:

- `docker compose -f docker/docker.compose.yml up -d`
- `docker compose -f docker/docker.compose.yml down`

## Services and ports

- Postgres container: `jobber_auth_postgres`
- pgAdmin container: `jobber_auth_pgadmin`
- Host -> Postgres: `localhost:5432`
- Host -> pgAdmin: `http://localhost:5433`

## pgAdmin login

Use the pgAdmin web credentials from compose:

- Email: `pgadmin4@pgadmin.org`
- Password: `pgadmin_password`

## Register Postgres in pgAdmin

When adding a server in pgAdmin, use:

- Host name/address: `postgres`
- Port: `5432`
- Maintenance DB: `jobber_auth` (or `postgres`)
- Username: `postgres_user`
- Password: `postgres_password`

### Important

Inside pgAdmin, do **not** use `localhost` or `127.0.0.1` for the database host.
`localhost` from inside the pgAdmin container points to pgAdmin itself, not to Postgres.
Use Docker service DNS name `postgres`.

## Prisma connection string

For this docker setup, use a direct Postgres URL in `apps/auth/.env`:

`DATABASE_URL="postgresql://postgres_user:postgres_password@localhost:5432/jobber_auth?schema=public"`

## Postgres 18+ note

With `postgres:latest` (currently 18+), mount the volume to:

- `/var/lib/postgresql`

The compose file is already configured this way.
