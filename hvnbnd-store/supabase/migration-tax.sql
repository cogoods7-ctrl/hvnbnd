-- Run this in Supabase's SQL Editor if your database already exists.
-- Adds a column to track how much sales tax was actually collected per
-- order once Stripe Tax is turned on (see STRIPE_TAX_ENABLED in .env).

alter table orders add column if not exists tax_amount numeric not null default 0;
