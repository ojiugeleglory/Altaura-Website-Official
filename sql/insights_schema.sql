-- Altaura Insights — Supabase database setup
-- Run this once in your Supabase project: Dashboard -> SQL Editor -> New query -> paste -> Run

create extension if not exists pgcrypto;

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  category text,
  excerpt text,
  cover_image_url text,
  body text not null,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.posts enable row level security;

-- Anyone (including logged-out visitors) can read posts marked published
create policy "Public can read published posts"
  on public.posts for select
  using (published = true);

-- Signed-in users (you, via the admin panel) can read every post, including drafts
create policy "Authenticated users can read all posts"
  on public.posts for select
  to authenticated
  using (true);

-- Signed-in users can create, edit, and delete posts
create policy "Authenticated users can insert posts"
  on public.posts for insert
  to authenticated
  with check (true);

create policy "Authenticated users can update posts"
  on public.posts for update
  to authenticated
  using (true);

create policy "Authenticated users can delete posts"
  on public.posts for delete
  to authenticated
  using (true);

-- Note: after running this, also create a Storage bucket named
-- "insights-images" (Dashboard -> Storage -> New bucket -> mark it Public)
-- for cover image uploads. See README-INSIGHTS-SETUP.md for the full walkthrough.
