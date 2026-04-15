-- Run in Supabase SQL Editor after Prisma migrations (same tables).
-- Enables public read for lobby + Realtime for poker_tables.

alter table public.locations enable row level security;
alter table public.poker_tables enable row level security;

-- No writes from anon/authenticated via PostgREST for these paths; staff uses Prisma server-side.
-- Lobby reads with anon key:

create policy "locations_select_public"
  on public.locations for select
  to anon, authenticated
  using (true);

create policy "poker_tables_select_active"
  on public.poker_tables for select
  to anon, authenticated
  using ("is_active" = true);

-- Realtime: in Dashboard → Database → Publications, add tables `locations` and `poker_tables`
-- to the `supabase_realtime` publication (or run):
-- alter publication supabase_realtime add table public.locations;
-- alter publication supabase_realtime add table public.poker_tables;
