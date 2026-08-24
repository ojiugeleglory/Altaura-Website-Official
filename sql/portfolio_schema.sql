-- Altaura Portfolio — Supabase database setup
-- Run this in the same project as insights_schema.sql: SQL Editor -> New query -> paste -> Run

create table if not exists public.portfolio_items (
  id uuid primary key default gen_random_uuid(),
  brand_name text not null,
  category text not null,
  eyebrow text,
  tag_1 text,
  tag_2 text,
  result_stat text not null,
  challenge text not null,
  approach text not null,
  outcome text not null,
  closing_line text,
  image_url text,
  display_order integer not null default 0,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.portfolio_items enable row level security;

-- Anyone can read published case studies
create policy "Public can read published portfolio items"
  on public.portfolio_items for select
  using (published = true);

-- Signed-in users (you, via the admin panel) can read every item, including drafts
create policy "Authenticated users can read all portfolio items"
  on public.portfolio_items for select
  to authenticated
  using (true);

-- Signed-in users can create, edit, and delete portfolio items
create policy "Authenticated users can insert portfolio items"
  on public.portfolio_items for insert
  to authenticated
  with check (true);

create policy "Authenticated users can update portfolio items"
  on public.portfolio_items for update
  to authenticated
  using (true);

create policy "Authenticated users can delete portfolio items"
  on public.portfolio_items for delete
  to authenticated
  using (true);

-- Note: portfolio cover images use the same "insights-images" storage bucket
-- you already created, no new bucket needed.
