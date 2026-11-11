-- Run this in Supabase's SQL Editor.
-- 1) Lets several products (colorways) be grouped into ONE product page.
alter table products add column if not exists group_id text;
alter table products add column if not exists is_default boolean not null default false;
alter table products add column if not exists swatch text;
alter table products add column if not exists sort_order integer not null default 0;

-- 2) Adds "Made for Higher Tee" — 7 colors, White is the base/default.
--    Price $35 and stock 25 per color are placeholders: change them any time
--    in /admin/dashboard > Products.
insert into products
  (id, name, colorway, category, price, stock, sizes, image_front, image_back, tapstitch_id, group_id, is_default, swatch, sort_order)
values
('mfh-white','Made for Higher Tee','White','Graphic Tees',35,25,array['S','M','L','XL'],'/images/mfh_white_front.jpg','/images/mfh_white_back.jpg','','made-for-higher',true,'#f1f1ef',0),
('mfh-black','Made for Higher Tee','Black','Graphic Tees',35,25,array['S','M','L','XL'],'/images/mfh_black_front.jpg','/images/mfh_black_back.jpg','','made-for-higher',false,'#2f2f32',1),
('mfh-light-gray','Made for Higher Tee','Light Gray','Graphic Tees',35,25,array['S','M','L','XL'],'/images/mfh_light-gray_front.jpg','/images/mfh_light-gray_back.jpg','','made-for-higher',false,'#a4abb1',2),
('mfh-sky-blue','Made for Higher Tee','Sky Blue','Graphic Tees',35,25,array['S','M','L','XL'],'/images/mfh_sky-blue_front.jpg','/images/mfh_sky-blue_back.jpg','','made-for-higher',false,'#afd3e6',3),
('mfh-purple','Made for Higher Tee','Purple','Graphic Tees',35,25,array['S','M','L','XL'],'/images/mfh_purple_front.jpg','/images/mfh_purple_back.jpg','','made-for-higher',false,'#c3aad5',4),
('mfh-pink','Made for Higher Tee','Pink','Graphic Tees',35,25,array['S','M','L','XL'],'/images/mfh_pink_front.jpg','/images/mfh_pink_back.jpg','','made-for-higher',false,'#ff969b',5),
('mfh-rose-pink','Made for Higher Tee','Rose Pink','Graphic Tees',35,25,array['S','M','L','XL'],'/images/mfh_rose-pink_front.jpg','/images/mfh_rose-pink_back.jpg','','made-for-higher',false,'#ffc4db',6)
on conflict (id) do nothing;
