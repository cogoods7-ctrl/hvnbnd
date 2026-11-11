-- Run this in Supabase's SQL Editor if your database already exists.
-- Free shipping kicks in at $70 or more in the cart (2 shirts at $35 each).
-- If you already ran an earlier version of this migration that added a
-- quantity-based "free_shipping_min_qty" column, this replaces it — safe
-- to run either way.

alter table settings add column if not exists free_shipping_threshold numeric not null default 70.00;
alter table settings drop column if exists free_shipping_min_qty;
