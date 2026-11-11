-- Run this in Supabase's SQL Editor if your database already exists.
-- Tracks which promotion/discount code (if any) was used on each order,
-- and how much it saved the customer — so you can see which brand
-- ambassador's code is actually driving sales.

alter table orders add column if not exists promo_code text;
alter table orders add column if not exists discount_amount numeric not null default 0;
