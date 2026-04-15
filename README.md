# Bluffclub Live

Next.js (App Router) lobby that shows live poker table status, plus a staff-only `/admin` dashboard to add, edit, delete tables and bump seated / waiting counts. Data lives in **Supabase Postgres**; the public lobby subscribes to **Supabase Realtime** on `poker_tables`. Staff sign-in uses **Auth.js** (Credentials) with passwords stored via Prisma.

## Prerequisites

- Node 20+
- A Supabase project (Postgres + Realtime)
- Optional: `psql` or Supabase SQL editor for RLS SQL

## Setup

1. **Clone and install**

   ```bash
   npm install
   ```

2. **Environment**

   Copy `.env.example` to `.env.local` and fill values:

   - `DATABASE_URL` — Supabase **transaction pooler** (port `6543`) for the running app / Prisma Client on Vercel.
   - `DIRECT_URL` — Supabase **direct** Postgres URL (port `5432`, host `db.<project>.supabase.co`). Required for `prisma migrate deploy`; the pooler alone often hangs or errors during migrations.
   - `AUTH_SECRET` — e.g. `openssl rand -base64 32`.
   - `AUTH_URL` — public site URL (`http://localhost:3000` locally, your Vercel URL in prod).
   - `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` — for the lobby browser client + Realtime.
   - `SEED_STAFF_PASSWORD` — used when seeding the first staff user.

3. **Database schema**

   ```bash
   npx prisma migrate deploy
   ```

4. **RLS + Realtime (Supabase)**

   Run the SQL in [`supabase/migrations/20260415120100_rls_realtime.sql`](supabase/migrations/20260415120100_rls_realtime.sql) in the Supabase SQL editor.

   In **Database → Publications**, add `locations` and `poker_tables` to `supabase_realtime` (the SQL file includes commented `ALTER PUBLICATION` lines you can run).

5. **Seed locations, demo tables, staff user**

   ```bash
   npm run db:seed
   ```

   Default staff login: `staff@bluffclub.live` / password from `SEED_STAFF_PASSWORD` (default `changeme`). Change the password in production.

6. **Run**

   ```bash
   npm run dev
   ```

   - Lobby: `/`
   - Admin: `/admin` (redirects to `/sign-in` when logged out)

## Scripts

| Script            | Purpose                          |
| ----------------- | -------------------------------- |
| `npm run dev`     | Next dev (Turbopack)             |
| `npm run build`   | `prisma generate` + `next build` |
| `npm run lint`    | ESLint                           |
| `npm run db:migrate` | `prisma migrate deploy`       |
| `npm run db:seed` | Seed staff + locations + demos |

## Verifying Realtime

1. Open `/` in two browser tabs.
2. In `/admin`, change seated or waiting counts on a table.
3. The lobby tab should update within a second without refresh (requires Realtime publication + RLS SQL applied).

If Supabase env vars are missing, the lobby still renders from the server but shows a notice and skips the subscription.

### `JWTSessionError` / `[auth][error] JWTSessionError`

Usually the session cookie was encrypted with a **different or missing `AUTH_SECRET`**, or the cookie is stale. Fix: set a stable `AUTH_SECRET` in `.env` / Vercel (e.g. `openssl rand -base64 32`), set **`AUTH_URL`** to your real origin (`https://…` on Vercel), redeploy, then **clear site cookies** and sign in again.

The public lobby uses `getToken` so a bad cookie does not spam the console. Other `auth()` paths (e.g. admin actions) still log real errors, but **invalid JWT cookies are silenced** in the shared Auth.js `logger` in `auth.config.ts`.

### `prepared statement "s1" already exists` when running `npm run db:seed`

This happens if Prisma talks to the **Supabase transaction pooler** (port `6543`) without `?pgbouncer=true`, or when the pooler conflicts with prepared statements. The seed script uses **`DIRECT_URL` when set** (direct Postgres, port `5432`) so `npm run db:seed` works reliably. Ensure `.env` has `DIRECT_URL` from Supabase **Database → Connection string → Direct**. For the app’s `DATABASE_URL` pooler string, add **`?pgbouncer=true`** (see `.env.example`).

## Deploy (Vercel)

- Set the same env vars in the Vercel project (you can omit `DIRECT_URL` on Vercel if you only run migrations from your machine or CI with a `.env` that includes it).
- Use Supabase **pooler** for `DATABASE_URL` and **direct** for `DIRECT_URL` when migrating (see `.env.example`).
- Ensure `AUTH_URL` matches your production domain.

## Project layout

- `app/page.tsx` — server-loaded lobby + `LobbyShell` client (Realtime).
- `app/admin/page.tsx` — staff CRUD and quick counters (Server Actions + Prisma).
- `auth.ts` / `middleware.ts` — Auth.js + `/admin` protection.
- `prisma/` — schema + migrations + seed.
- `supabase/migrations/` — RLS + Realtime notes for Supabase.
