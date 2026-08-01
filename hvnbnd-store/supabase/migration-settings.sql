-- Run this in Supabase's SQL Editor if your database already exists
-- (i.e. you're updating an existing store rather than setting one up from
-- scratch). This adds the "settings" table used for the admin-editable
-- shipping rate.

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
