-- Run this once in your Supabase project's SQL Editor (Supabase Dashboard
-- > SQL Editor > New Query > paste this whole file > Run).

create table if not exists products (
  id text primary key,
  name text not null,
  colorway text not null,
  category text not null,
  price numeric not null,
  stock integer not null default 0,
  sizes text[] not null default array['S','M','L','XL'],
  image_front text,
  image_back text,
  tapstitch_id text default '',
  low_stock_flag boolean not null default false,
  created_at timestamptz default now()
);

create table if not exists orders (
  id text primary key,
  stripe_session_id text unique,
  customer_name text,
  customer_email text,
  address text,
  city text,
  state text,
  zip text,
  items jsonb not null,
  total numeric not null,
  status text not null default 'Pending Payment',
  created_at timestamptz default now()
);

-- Products are publicly readable (the storefront needs to list them).
alter table products enable row level security;
drop policy if exists "Public read products" on products;
create policy "Public read products" on products for select using (true);

-- Orders are NOT publicly readable or writable — only the server (using the
-- service role key, which bypasses RLS) can touch this table. No policies
-- are created here on purpose.
alter table orders enable row level security;

-- Store-wide settings (currently just shipping) — a single row, id = 1.
create table if not exists settings (
  id integer primary key default 1,
  shipping_rate numeric not null default 5.00,
  updated_at timestamptz default now(),
  constraint single_row check (id = 1)
);
insert into settings (id, shipping_rate) values (1, 5.00) on conflict (id) do nothing;

alter table settings enable row level security;
drop policy if exists "Public read settings" on settings;
create policy "Public read settings" on settings for select using (true);
grant usage on schema public to anon, authenticated;
grant select on public.settings to anon, authenticated;
grant all on public.settings to service_role;

 Image paths point at /public/images,
-- which already ships with the real product photos in this project.
-- Seed the two products from Chapter 1. Image paths point at /public/images,
-- which already ships with the real product photos in this project.
insert into products (id, name, colorway, category, price, stock, image_front, image_back, tapstitch_id) values
('p4','Made New Tee','Black','Graphic Tees',46,11,'/images/logo_black_front.jpg','/images/madenew_black_back.jpg',''),
('p5','Made New Tee','White','Graphic Tees',42,17,'/images/logo_white_front.jpg','/images/madenew_white_back.jpg',''),
('p6','Made New Tee','Grey','Graphic Tees',42,6,'/images/logo_grey_front.jpg','/images/madenew_grey_back.jpg',''),
('p7','Art Studio Tee','Black','Art Studio',44,8,'/images/art_black_front.jpg','/images/art_black_back.jpg',''),
('p8','Art Studio Tee','Grey','Art Studio',44,13,'/images/art_grey_front.jpg','/images/art_grey_back.jpg',''),
('p9','Art Studio Tee','White','Art Studio',44,19,'/images/art_white_front.jpg','/images/art_white_back.jpg','')
on conflict (id) do nothing;
