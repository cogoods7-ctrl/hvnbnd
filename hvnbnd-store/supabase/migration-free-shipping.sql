-- Run this in Supabase's SQL Editor if your database already exists.
-- Adds the free-shipping threshold your announcement bar already promises
-- ("Free shipping on orders over $75") — this makes that claim actually
-- true instead of just marketing copy with nothing behind it.

alter table settings add column if not exists free_shipping_threshold numeric not null default 75.00;
