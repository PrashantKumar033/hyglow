# Cloudflare deployment

This project serves the Vite frontend from Cloudflare Workers Static Assets and
forwards `/api/*` to the existing Node API service. The API still needs a
PostgreSQL database and an HTTPS public origin.

## Prepare the API and database

1. Provision PostgreSQL and set `DATABASE_URL` and a private, randomly generated
   `AUTH_SECRET` in the API host's secret manager. Do not commit either value.
   The API refuses to start in production without `AUTH_SECRET`.
2. Apply the schema with `pnpm --filter @workspace/db run push` using the
   production `DATABASE_URL`.
3. Create the first administrator once, against the empty production database.
   Set `BOOTSTRAP_ADMIN_NAME`, `BOOTSTRAP_ADMIN_EMAIL`, and a unique
   `BOOTSTRAP_ADMIN_PASSWORD` (12–128 characters) in the API host environment,
   then run `pnpm --filter @workspace/db run bootstrap-admin`. The command
   refuses to run when any user already exists.
4. Keep signup closed by default. To enable it, set `ALLOW_SIGNUP=true` on the
   API and `VITE_ENABLE_SIGNUP=true` when building the frontend. Public signup
   creates a regular user, never an administrator; API requests are checked
   against that user's module permissions.

The demo `seed` command deletes existing application data. It is intended only
for disposable demo databases and requires both
`RUN_DESTRUCTIVE_DEMO_SEED=true` and a private `SEED_ADMIN_PASSWORD`.

## Deploy the frontend worker

1. Build the frontend with `pnpm --filter @workspace/hyglow run build`.
2. From the repository root, set the Worker secret `API_ORIGIN` to the API
   server's HTTPS origin only, without `/api` or any other path:
   `pnpm dlx wrangler secret put API_ORIGIN`.
3. Deploy with `pnpm dlx wrangler deploy` from the repository root.

`wrangler.jsonc` uses the SPA fallback for frontend routes and runs the worker
for `/api/*`. The proxy rejects a missing or non-HTTPS API origin. Keep
`AUTH_SECRET` and `DATABASE_URL` only on the API host; they are not Cloudflare
frontend secrets.
