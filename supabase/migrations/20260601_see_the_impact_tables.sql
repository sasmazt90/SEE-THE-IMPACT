create extension if not exists pgcrypto;

create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  user_type text not null check (user_type in ('consumer', 'brand')),
  message text not null,
  email text,
  subject text,
  brand_name text,
  user_agent text,
  ip_hash text,
  created_at timestamptz not null default now()
);

create table if not exists public.sponsored_brands (
  id uuid primary key default gen_random_uuid(),
  brand_name text not null,
  sector text,
  score integer check (score between 0 and 100),
  logo_url text,
  url text,
  active boolean not null default true,
  start_date timestamptz not null default now(),
  end_date timestamptz not null default (now() + interval '1 year'),
  impressions_cap integer not null default 0,
  impressions_count integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.sponsored_products (
  id uuid primary key default gen_random_uuid(),
  product_name text not null,
  brand text,
  sector text,
  score integer check (score between 0 and 100),
  image_url text,
  url text,
  active boolean not null default true,
  start_date timestamptz not null default now(),
  end_date timestamptz not null default (now() + interval '1 year'),
  impressions_cap integer not null default 0,
  impressions_count integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.contact_messages enable row level security;
alter table public.sponsored_brands enable row level security;
alter table public.sponsored_products enable row level security;

drop policy if exists "Anyone can create contact messages" on public.contact_messages;
create policy "Anyone can create contact messages"
  on public.contact_messages
  for insert
  to anon
  with check (true);

drop policy if exists "Anyone can read active sponsored brands" on public.sponsored_brands;
create policy "Anyone can read active sponsored brands"
  on public.sponsored_brands
  for select
  to anon
  using (active = true);

drop policy if exists "Anyone can update sponsored brand impressions" on public.sponsored_brands;
create policy "Anyone can update sponsored brand impressions"
  on public.sponsored_brands
  for update
  to anon
  using (active = true)
  with check (active = true);

drop policy if exists "Anyone can read active sponsored products" on public.sponsored_products;
create policy "Anyone can read active sponsored products"
  on public.sponsored_products
  for select
  to anon
  using (active = true);

drop policy if exists "Anyone can update sponsored product impressions" on public.sponsored_products;
create policy "Anyone can update sponsored product impressions"
  on public.sponsored_products
  for update
  to anon
  using (active = true)
  with check (active = true);

create index if not exists sponsored_brands_sector_idx on public.sponsored_brands (sector);
create index if not exists sponsored_products_sector_idx on public.sponsored_products (sector);
