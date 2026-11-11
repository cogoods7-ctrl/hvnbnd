-- Run this in Supabase's SQL Editor if your database already exists.
-- Stores the shipping fee charged on each order separately from the total,
-- so the admin dashboard can show a clean subtotal / shipping / tax / total
-- breakdown per order.

alter table orders add column if not exists shipping_cost numeric not null default 0;
