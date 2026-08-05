-- Run this in Supabase's SQL Editor if your database already exists.
-- Lets you log what Tapstitch actually charged you per order (from their
-- invoice) so the admin dashboard can calculate real profit, not just
-- revenue.

alter table orders add column if not exists fulfillment_cost numeric not null default 0;
