-- Altaura Newsletter — Supabase database setup
-- Run this in the same project as insights_schema.sql: SQL Editor -> New query -> paste -> Run

create table if not exists public.subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  created_at timestamptz not null default now()
);

alter table public.subscribers enable row level security;

-- Anyone can subscribe (submit the footer form), but cannot read the list back
create policy "Anyone can subscribe"
  on public.subscribers for insert
  to anon, authenticated
  with check (true);

-- Only you, signed in via /admin.html, can view the subscriber list
create policy "Authenticated users can read subscribers"
  on public.subscribers for select
  to authenticated
  using (true);
