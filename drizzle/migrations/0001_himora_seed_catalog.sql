insert into public.categories (name, slug, description, image_url, sort_order) values
 ('Shawls','shawls','Handwoven warmth for every occasion','/__l5e/assets-v1/71f171d1-ffb3-45ff-b9bf-3e06a8355904/p-shawl.jpg',1),
 ('Stoles','stoles','Fine pashmina and merino stoles','/__l5e/assets-v1/5582e192-c287-47c8-ae9a-3bfcbc7ed955/p-stole.jpg',2),
 ('Sadri','sadri','Traditional Himachali waistcoats','/__l5e/assets-v1/3b7296b5-73b5-4f95-85b8-3dd63f25d3cc/p-sadri.jpg',3),
 ('Himachali Caps','himachali-caps','Iconic hand-bordered caps','/__l5e/assets-v1/4637f457-076c-446f-959f-2087e9bcdcb1/p-cap.jpg',4),
 ('Mufflers','mufflers','Chunky knit mufflers','/__l5e/assets-v1/0f5cce4f-2025-43e8-87db-7e2dc843c645/p-muffler.jpg',5),
 ('Scarves','scarves','Lightweight everyday scarves','/__l5e/assets-v1/5582e192-c287-47c8-ae9a-3bfcbc7ed955/p-stole.jpg',6),
 ('Woollen Socks','woollen-socks','Hand-knit socks for deep winter','/__l5e/assets-v1/fff8a4b6-366a-495c-99f1-0cad03cc5921/p-socks.jpg',7),
 ('Trousers','trousers','Tailored wool trousers','/__l5e/assets-v1/d525ff40-21e5-44d5-8870-a7b5d569ad86/p-trousers.jpg',8),
 ('Kids Wear','kids-wear','Soft woollens for little ones','/__l5e/assets-v1/c47c70b4-eb1d-4a6b-b6ce-bf813da31e61/p-kids.jpg',9),
 ('Men''s Woollen Wear','mens-woollen-wear','Everyday winter essentials for men','/__l5e/assets-v1/3b7296b5-73b5-4f95-85b8-3dd63f25d3cc/p-sadri.jpg',10),
 ('Women''s Woollen Wear','womens-woollen-wear','Coats, capes and knitwear','/__l5e/assets-v1/0a8863cc-1f08-4723-8b15-a50d8bcc2ce3/p-coat.jpg',11),
 ('Winter Accessories','winter-accessories','Caps, socks, gloves and more','/__l5e/assets-v1/4637f457-076c-446f-959f-2087e9bcdcb1/p-cap.jpg',12);

insert into public.products (name, slug, description, category_id, sku, price, mrp, material, weight, images, specs, rating, review_count, is_featured, is_new_arrival, is_best_seller) values
 ('Kullu Handwoven Shawl','kullu-handwoven-shawl','A finely handwoven merino shawl from the Kullu valley, finished with a traditional woven border and soft fringe. Light to wear, remarkably warm.',(select id from public.categories where slug='shawls'),'HIM-SHL-001',4499,5999,'100% Merino Wool','480 g',array['/__l5e/assets-v1/71f171d1-ffb3-45ff-b9bf-3e06a8355904/p-shawl.jpg'],'{"Weave":"Handloom","Care":"Dry clean only","Origin":"Kullu, Himachal Pradesh"}',4.8,64,true,false,true),
 ('Midnight Pashmina Stole','midnight-pashmina-stole','An heirloom-grade pashmina stole in deep charcoal with a fine gold thread edge. Feather-light drape with exceptional warmth.',(select id from public.categories where slug='stoles'),'HIM-STL-002',6499,8999,'Fine Pashmina','220 g',array['/__l5e/assets-v1/5582e192-c287-47c8-ae9a-3bfcbc7ed955/p-stole.jpg'],'{"Weave":"Handloom","Care":"Dry clean only","Origin":"Kashmir"}',4.9,41,true,true,false),
 ('Himachali Wool Sadri','himachali-wool-sadri','The classic Himachali sadri in undyed oatmeal wool, trimmed with handwoven Kinnauri patti. Layers beautifully over kurtas and shirts.',(select id from public.categories where slug='sadri'),'HIM-SDR-003',2999,3999,'Pure Wool','620 g',array['/__l5e/assets-v1/3b7296b5-73b5-4f95-85b8-3dd63f25d3cc/p-sadri.jpg'],'{"Fit":"Regular","Care":"Dry clean only","Origin":"Kinnaur"}',4.7,88,false,false,true),
 ('Kinnauri Himachali Cap','kinnauri-himachali-cap','Hand-bordered green and gold Kinnauri patti on soft grey wool. A timeless mark of the hills.',(select id from public.categories where slug='himachali-caps'),'HIM-CAP-004',899,1199,'Pure Wool','90 g',array['/__l5e/assets-v1/4637f457-076c-446f-959f-2087e9bcdcb1/p-cap.jpg'],'{"Care":"Spot clean","Origin":"Kinnaur"}',4.6,132,false,true,true),
 ('Camel Rib Muffler','camel-rib-muffler','A generously long ribbed muffler in warm camel. Chunky, soft and endlessly wearable.',(select id from public.categories where slug='mufflers'),'HIM-MFL-005',1299,1799,'Lambswool Blend','260 g',array['/__l5e/assets-v1/0f5cce4f-2025-43e8-87db-7e2dc843c645/p-muffler.jpg'],'{"Length":"180 cm","Care":"Hand wash cold"}',4.5,57,false,false,true),
 ('Highland Wool Socks','highland-wool-socks','Thick hand-knit socks with cream ribbed cuffs. Made for stone floors and long mountain nights.',(select id from public.categories where slug='woollen-socks'),'HIM-SCK-006',599,899,'Wool Blend','120 g',array['/__l5e/assets-v1/fff8a4b6-366a-495c-99f1-0cad03cc5921/p-socks.jpg'],'{"Care":"Hand wash cold","Pack":"1 pair"}',4.4,203,false,true,false),
 ('Kids Cable Knit Sweater','kids-cable-knit-sweater','A soft cream cable-knit in gentle merino, made to be handed down.',(select id from public.categories where slug='kids-wear'),'HIM-KID-007',1999,2699,'Merino Wool','300 g',array['/__l5e/assets-v1/c47c70b4-eb1d-4a6b-b6ce-bf813da31e61/p-kids.jpg'],'{"Care":"Hand wash cold","Fit":"Relaxed"}',4.8,29,true,true,false),
 ('Tweed Wool Trousers','tweed-wool-trousers','Charcoal herringbone tweed trousers, fully lined, with a clean tailored break.',(select id from public.categories where slug='trousers'),'HIM-TRS-008',3499,4499,'Wool Tweed','700 g',array['/__l5e/assets-v1/d525ff40-21e5-44d5-8870-a7b5d569ad86/p-trousers.jpg'],'{"Fit":"Tailored","Care":"Dry clean only"}',4.5,36,false,false,false),
 ('Dove Wool Overcoat','dove-wool-overcoat','A full-length belted overcoat in dove grey wool melton. Understated, structured, warm.',(select id from public.categories where slug='womens-woollen-wear'),'HIM-COT-009',8999,11999,'Wool Melton','1.4 kg',array['/__l5e/assets-v1/0a8863cc-1f08-4723-8b15-a50d8bcc2ce3/p-coat.jpg'],'{"Fit":"Regular","Lining":"Viscose","Care":"Dry clean only"}',4.9,18,true,true,false);

insert into public.product_variants (product_id, size, color, sku, stock)
select p.id, s.size, c.color, p.sku || '-' || left(s.size,3) || '-' || left(c.color,3), 12
from public.products p
cross join lateral (
  select unnest(case
    when p.slug in ('himachali-wool-sadri','kids-cable-knit-sweater','tweed-wool-trousers','dove-wool-overcoat') then array['S','M','L','XL','XXL']
    when p.slug = 'highland-wool-socks' then array['S','M','L']
    when p.slug = 'kinnauri-himachali-cap' then array['M','L']
    else array['Free Size'] end) as size
) s
cross join lateral (
  select unnest(case
    when p.slug = 'kullu-handwoven-shawl' then array['Ivory','Charcoal']
    when p.slug = 'midnight-pashmina-stole' then array['Charcoal','Wine']
    when p.slug = 'camel-rib-muffler' then array['Camel','Grey']
    when p.slug = 'dove-wool-overcoat' then array['Dove Grey']
    when p.slug = 'highland-wool-socks' then array['Heather Grey']
    when p.slug = 'kinnauri-himachali-cap' then array['Grey']
    when p.slug = 'himachali-wool-sadri' then array['Oatmeal']
    when p.slug = 'kids-cable-knit-sweater' then array['Cream']
    else array['Charcoal'] end) as color
) c;

insert into public.coupons (code, discount_type, discount_value, min_order_value, max_discount, is_active)
values ('WINTER10','percent',10,1999,1500,true), ('HIMORA500','fixed',500,3999,null,true);