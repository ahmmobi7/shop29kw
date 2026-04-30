-- ============================================================
-- Shop29 + LinkBridge: Supabase Schema
-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

-- 1. Categories table
create table if not exists categories (
  id          uuid        default gen_random_uuid() primary key,
  name        text        unique not null,
  slug        text        unique not null,
  created_at  timestamptz default now()
);

-- 2. Posts table
create table if not exists posts (
  id            uuid          default gen_random_uuid() primary key,
  embed_url     text          not null,
  original_url  text          not null,
  description   text          not null,
  category_id   uuid          references categories(id) on delete set null,
  likes         integer       default 0,
  is_new        boolean       default true,
  product_name  text,
  product_brand text,
  product_price decimal(10,2),
  product_sizes text[],
  platform      text          check (platform in ('youtube','instagram','tiktok','other')),
  created_at    timestamptz   default now()
);

-- 3. Row Level Security
alter table categories enable row level security;
alter table posts       enable row level security;

-- Public can READ everything
create policy "Public read posts"
  on posts for select using (true);

create policy "Public read categories"
  on categories for select using (true);

-- Only authenticated users (LinkBridge admin) can write
create policy "Auth insert posts"
  on posts for insert
  with check (auth.role() = 'authenticated');

create policy "Auth update posts"
  on posts for update
  using (auth.role() = 'authenticated');

create policy "Auth delete posts"
  on posts for delete
  using (auth.role() = 'authenticated');

create policy "Auth manage categories"
  on categories for all
  using (auth.role() = 'authenticated');

-- 4. Indexes for performance
create index if not exists idx_posts_created_at    on posts (created_at desc);
create index if not exists idx_posts_category_id   on posts (category_id);
create index if not exists idx_posts_original_url  on posts (original_url);

-- 5. Seed default categories
insert into categories (name, slug) values
  ('Clothing',     'clothing'),
  ('Accessories',  'accessories'),
  ('Gadgets',      'gadgets'),
  ('Home',         'home'),
  ('Beauty',       'beauty')
on conflict (slug) do nothing;

-- ============================================================
-- IMPORTANT: In Supabase Dashboard → Authentication → Providers
-- Enable Email provider and create ONE admin user.
-- That user's auth.uid() will be the only one allowed to write.
-- ============================================================
