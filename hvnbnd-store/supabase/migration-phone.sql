-- Run this in Supabase's SQL Editor if your database already exists.
-- Adds customer phone number, now collected at checkout for manual
-- Tapstitch order fulfillment.

alter table orders add column if not exists customer_phone text;
