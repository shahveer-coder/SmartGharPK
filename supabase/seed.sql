-- Smart Ghar seed data (generated)
begin;
delete from public.reviews; delete from public.orders; delete from public.customers; delete from public.products; delete from public.categories; delete from public.coupons; delete from public.settings;

insert into public.categories (name, slug, icon, description, image_url, is_active) values
('Kitchen Gadgets', 'kitchen-gadgets', '🍳', 'Everyday kitchen helpers that save time and effort.', '/images/products/cat-kitchen.png', true),
('Home Essentials', 'home-essentials', '🏠', 'Smart little upgrades for a comfortable home.', '/images/products/cat-home.png', true),
('Storage Solutions', 'storage-solutions', '📦', 'Organise every corner, keep everything tidy.', '/images/products/cat-storage.png', true),
('Gift Items', 'gift-items', '🎁', 'Thoughtful gadgets that make perfect presents.', '/images/products/cat-gift.png', true);

insert into public.products (title, short_description, full_description, category, original_price, sale_price, stock_quantity, image_url, image_gallery, key_features, tags, is_featured, is_active, rating, review_count) values
('Manual Food Chopper 900ml', 'Chop onions, garlic, herbs and vegetables in seconds with this manual pull-string food chopper. No electricity, no mess and no tears - just pull the…', 'Chop onions, garlic, herbs and vegetables in seconds with this manual pull-string food chopper. No electricity, no mess and no tears - just pull the handle and let the stainless steel blades do the work.

The 900ml bowl is made from BPA-free, food-grade material that is easy to rinse clean. Compact, sturdy and ready for everyday Pakistani kitchen use.', 'Kitchen Gadgets', 1499, 999, 50, '/images/products/chopper.png', '["/images/products/chopper.png"]'::jsonb, '["Pull-string mechanism, no electricity needed", "900ml BPA-free bowl", "Stainless steel blades for fast chopping", "Non-slip base keeps it steady", "Easy to open and dishwasher safe"]'::jsonb, '["best_seller"]'::jsonb, true, true, 4.8, 214),
('Electric Egg Beater & Mixer', 'Whip eggs, cream and batter faster with this handheld electric beater. The powerful motor and twin stainless steel whisks give smooth, lump-free…', 'Whip eggs, cream and batter faster with this handheld electric beater. The powerful motor and twin stainless steel whisks give smooth, lump-free results every time.

Five speed settings let you go from gentle mixing to high-speed whipping with a single hand. Lightweight body and non-slip grip make long baking sessions comfortable.', 'Kitchen Gadgets', 2299, 1799, 30, '/images/products/egg-beater.png', '["/images/products/egg-beater.png"]'::jsonb, '["Powerful motor for quick whisking", "2 stainless steel beaters included", "5 speed settings with turbo", "Ergonomic non-slip grip", "Perfect for eggs, cream and batter"]'::jsonb, '["hot_deal"]'::jsonb, true, true, 4.7, 168),
('Vegetable Slicer Mandoline', 'Slice vegetables evenly in one quick motion with this adjustable mandoline slicer. Perfect for salads, fries, pickles and…', 'Slice vegetables evenly in one quick motion with this adjustable mandoline slicer. Perfect for salads, fries, pickles and stir-fries.

The stainless steel blade stays sharp, while the hand guard keeps your fingers safe. It folds flat, so it takes almost no space in your kitchen drawer.', 'Kitchen Gadgets', 1799, 1299, 45, '/images/products/mandoline.png', '["/images/products/mandoline.png"]'::jsonb, '["Adjustable slicing thickness", "Sharp stainless steel blade", "Hand guard for safe slicing", "Compact foldable design", "Easy to clean under running water"]'::jsonb, '["new"]'::jsonb, false, true, 4.6, 121),
('Automatic Soap Dispenser Touchless', 'Upgrade your basin with a touchless soap dispenser that releases the perfect amount of soap with a wave of your hand. Hygienic, modern and great for…', 'Upgrade your basin with a touchless soap dispenser that releases the perfect amount of soap with a wave of your hand. Hygienic, modern and great for kitchens and washrooms.

The infrared sensor reacts instantly, and the water-resistant body handles everyday splashes. Works with liquid soap, hand wash and sanitiser.', 'Home Essentials', 2499, 1999, 25, '/images/products/soap-dispenser.png', '["/images/products/soap-dispenser.png"]'::jsonb, '["Touchless infrared sensor", "Works with liquid soap or sanitiser", "Rechargeable / battery powered", "Water resistant body", "Saves soap and keeps hands clean"]'::jsonb, '["hot_deal"]'::jsonb, true, true, 4.7, 96),
('Silicone Spatula Set (6 Pieces)', 'A complete six-piece silicone utensil set that handles everything from frying to folding. The soft silicone heads will not scratch your non-stick…', 'A complete six-piece silicone utensil set that handles everything from frying to folding. The soft silicone heads will not scratch your non-stick pans.

Each piece has a solid wooden handle that stays cool and comfortable while cooking. Heat resistant up to 230°C and completely food-safe.', 'Kitchen Gadgets', 1299, 899, 60, '/images/products/spatula-set.png', '["/images/products/spatula-set.png"]'::jsonb, '["Food-grade silicone, BPA free", "Heat resistant up to 230°C", "Wooden handles, comfortable grip", "6 pieces for all kitchen tasks", "Does not scratch non-stick pans"]'::jsonb, '["best_seller"]'::jsonb, false, true, 4.9, 287),
('Air Fryer 4L Digital', 'Enjoy crispy fries, chicken, samosas and more with up to 85% less oil. The 4L basket is large enough for the whole family''s…', 'Enjoy crispy fries, chicken, samosas and more with up to 85% less oil. The 4L basket is large enough for the whole family''s dinner.

The digital panel offers eight one-touch presets and a 60-minute timer with auto shut-off. The detachable non-stick basket washes up in minutes.', 'Kitchen Gadgets', 15999, 12999, 10, '/images/products/air-fryer.png', '["/images/products/air-fryer.png"]'::jsonb, '["4L capacity for the whole family", "Digital touch panel with 8 presets", "Uses up to 85% less oil", "Non-stick detachable basket", "60-minute timer with auto shut-off"]'::jsonb, '["limited"]'::jsonb, true, true, 4.9, 63),
('Oil Sprayer Spray Bottle 100ml', 'Control how much oil you use with a fine, even mist. Ideal for air fryers, grills, salads and baking…', 'Control how much oil you use with a fine, even mist. Ideal for air fryers, grills, salads and baking trays.

The 100ml refillable glass bottle is leak-proof and easy to press - a small gadget that makes a big difference in healthy cooking.', 'Kitchen Gadgets', 899, 599, 80, '/images/products/oil-sprayer.png', '["/images/products/oil-sprayer.png"]'::jsonb, '["Fine mist spray for even oil coating", "100ml refillable glass bottle", "Leak-proof pump design", "Great for air fryers and grills", "Easy to clean and refill"]'::jsonb, '["new"]'::jsonb, false, true, 4.4, 58),
('LED Night Lamp with Touch Control', 'A soft, warm night light with simple touch control. Tap to switch on, tap again to change brightness - no fumbling for switches at…', 'A soft, warm night light with simple touch control. Tap to switch on, tap again to change brightness - no fumbling for switches at night.

The rechargeable battery means you can carry it from the bedroom to the hallway. A 30-minute sleep timer helps children drift off without wasting power.', 'Home Essentials', 1999, 1499, 40, '/images/products/night-lamp.png', '["/images/products/night-lamp.png"]'::jsonb, '["Touch control with 3 brightness levels", "Warm eye-friendly LED light", "USB rechargeable battery", "Portable, perfect for kids rooms", "Automatic 30-minute sleep timer"]'::jsonb, '["new"]'::jsonb, true, true, 4.6, 142),
('Foldable Clothes Drying Rack', 'Dry a full load of laundry without giving up half your room. This foldable rack opens into three generous drying tiers and folds down flat in…', 'Dry a full load of laundry without giving up half your room. This foldable rack opens into three generous drying tiers and folds down flat in seconds.

The steel frame is strong enough for heavy bedsheets yet light enough to move with one hand. Non-slip feet protect your floor.', 'Home Essentials', 3499, 2799, 20, '/images/products/drying-rack.png', '["/images/products/drying-rack.png"]'::jsonb, '["Foldable space-saving design", "Strong steel frame, holds heavy laundry", "Three-tier drying space", "Non-slip feet, no floor scratches", "Opens and folds in seconds"]'::jsonb, '["best_seller"]'::jsonb, false, true, 4.5, 87),
('4-Tier Shoe Rack Organizer', 'Keep up to twelve pairs of shoes tidy with this four-tier organiser. The open design keeps footwear ventilated and easy to…', 'Keep up to twelve pairs of shoes tidy with this four-tier organiser. The open design keeps footwear ventilated and easy to find.

Assembly takes minutes with no tools, and the compact footprint fits neatly beside doors, in wardrobes or on balconies.', 'Home Essentials', 2999, 2299, 35, '/images/products/shoe-rack.png', '["/images/products/shoe-rack.png"]'::jsonb, '["4 tiers hold up to 12 pairs", "Sturdy metal frame with plastic shelves", "Easy assembly, no tools needed", "Compact footprint for small rooms", "Ventilated design prevents odour"]'::jsonb, '["hot_deal"]'::jsonb, false, true, 4.6, 118),
('Airtight Food Container Set (10 Pcs)', 'Store daal, rice, spices, snacks and leftovers in ten airtight containers that stack neatly in your…', 'Store daal, rice, spices, snacks and leftovers in ten airtight containers that stack neatly in your cabinet.

The four-side locking lids keep moisture and insects out, while the BPA-free bodies are safe for the microwave, freezer and dishwasher.', 'Storage Solutions', 2499, 1799, 55, '/images/products/food-containers.png', '["/images/products/food-containers.png"]'::jsonb, '["10-piece set in mixed sizes", "Airtight four-side locking lids", "BPA-free food grade material", "Microwave, freezer and dishwasher safe", "Stackable for tidy cabinets"]'::jsonb, '["best_seller"]'::jsonb, true, true, 4.8, 196),
('Under-Bed Storage Box with Wheels', 'Turn unused space under your bed into real storage. At just 15cm tall, this box slides in easily and rolls out on four smooth…', 'Turn unused space under your bed into real storage. At just 15cm tall, this box slides in easily and rolls out on four smooth wheels.

Perfect for extra bedding, winter clothes and kids'' toys. The zip top keeps dust out and the box folds flat when not needed.', 'Storage Solutions', 1799, 1299, 40, '/images/products/under-bed-storage.png', '["/images/products/under-bed-storage.png"]'::jsonb, '["Slim 15cm profile fits under beds", "Four smooth rolling wheels", "Zip top keeps dust out", "Reinforced fabric holds heavy items", "Collapsible when not in use"]'::jsonb, '["new"]'::jsonb, false, true, 4.4, 74),
('Rotating Kitchen Spice Rack', 'Find every masala at a glance with a 360° rotating spice carousel. Ideal for small kitchens where counter space…', 'Find every masala at a glance with a 360° rotating spice carousel. Ideal for small kitchens where counter space matters.

It holds up to twelve jars, spins smoothly on an anti-slip base, and the shelves lift out for quick cleaning.', 'Storage Solutions', 2299, 1699, 30, '/images/products/spice-rack.png', '["/images/products/spice-rack.png"]'::jsonb, '["360° rotating carousel", "Holds up to 12 spice jars", "Anti-slip base for stable spinning", "Detachable shelves for easy cleaning", "Compact design saves counter space"]'::jsonb, '["limited"]'::jsonb, false, true, 4.5, 109),
('Portable USB Blender Bottle', 'Make a fresh smoothie at home, at the office or while travelling. This portable USB blender charges like a phone and blends in…', 'Make a fresh smoothie at home, at the office or while travelling. This portable USB blender charges like a phone and blends in seconds.

Six stainless steel blades crush fruit and ice with ease, and the leak-proof lid turns the bottle into your travel cup.', 'Gift Items', 3499, 2699, 25, '/images/products/usb-blender.png', '["/images/products/usb-blender.png"]'::jsonb, '["Blend fresh juice anywhere", "USB rechargeable battery", "Six stainless steel blades", "Leak-proof travel bottle lid", "One-button easy operation"]'::jsonb, '["new"]'::jsonb, false, true, 4.3, 66),
('Smart Fitness Watch with Heart Rate', 'Track your health and stay connected with a smart watch that does the essentials well. Monitor heart rate, blood oxygen, sleep and daily…', 'Track your health and stay connected with a smart watch that does the essentials well. Monitor heart rate, blood oxygen, sleep and daily steps.

Get calls and message alerts on your wrist, wear it in the rain and charge it once a week. A thoughtful gift that gets used every day.', 'Gift Items', 4999, 3499, 20, '/images/products/smart-watch.png', '["/images/products/smart-watch.png"]'::jsonb, '["Heart rate and blood oxygen monitoring", "Sleep and step tracking", "Calls and message notifications", "IP67 water resistant", "Up to 7 days battery life"]'::jsonb, '["hot_deal"]'::jsonb, false, true, 4.5, 153);

insert into public.coupons (code, discount_type, discount_value, min_order_amount, max_discount_cap, valid_from, valid_till, usage_limit, is_active) values
('SMART20', 'percentage', 20, 1500, 1000, current_date - 30, current_date + 180, 500, true),
('FIRST500', 'fixed', 500, 3000, 500, current_date - 30, current_date + 180, 300, true),
('FREESHIP', 'free_shipping', 0, 1000, 0, current_date - 30, current_date + 180, 1000, true);

insert into public.settings (store_status, store_name, logo_url, announcement_text, free_shipping_threshold, shipping_fee, whatsapp_number, support_email, business_address, cod_enabled) values (true, 'Smart Ghar', '/images/logo.png', '🚚 Cash on Delivery All Over Pakistan 🇵🇰 | Free Shipping Above PKR 3,000', 3000, 200, '923182158561', 'info@smartghar.pk', 'Karachi, Pakistan', true);

do $$ declare pid uuid; begin
select id into pid from public.products where title = 'Manual Food Chopper 900ml' limit 1;
insert into public.reviews (product_id, customer_name, rating, review_text, is_approved) values (pid, 'Ayesha K.', 5, 'Excellent quality, exactly as shown in the pictures. Delivery was fast too.', true);
select id into pid from public.products where title = 'Manual Food Chopper 900ml' limit 1;
insert into public.reviews (product_id, customer_name, rating, review_text, is_approved) values (pid, 'Bilal R.', 4, 'Using it daily for two weeks, working perfectly. Worth the price.', true);
select id into pid from public.products where title = 'Manual Food Chopper 900ml' limit 1;
insert into public.reviews (product_id, customer_name, rating, review_text, is_approved) values (pid, 'Hira S.', 5, 'Packaging was neat and the product feels premium. Recommended.', true);
select id into pid from public.products where title = 'Electric Egg Beater & Mixer' limit 1;
insert into public.reviews (product_id, customer_name, rating, review_text, is_approved) values (pid, 'Usman A.', 5, 'Using it daily for two weeks, working perfectly. Worth the price.', true);
select id into pid from public.products where title = 'Electric Egg Beater & Mixer' limit 1;
insert into public.reviews (product_id, customer_name, rating, review_text, is_approved) values (pid, 'Fatima N.', 4, 'Packaging was neat and the product feels premium. Recommended.', true);
select id into pid from public.products where title = 'Electric Egg Beater & Mixer' limit 1;
insert into public.reviews (product_id, customer_name, rating, review_text, is_approved) values (pid, 'Zain M.', 5, 'Very useful in the kitchen, saves a lot of time. Thank you Smart Ghar.', true);
select id into pid from public.products where title = 'Vegetable Slicer Mandoline' limit 1;
insert into public.reviews (product_id, customer_name, rating, review_text, is_approved) values (pid, 'Sana T.', 5, 'Packaging was neat and the product feels premium. Recommended.', true);
select id into pid from public.products where title = 'Vegetable Slicer Mandoline' limit 1;
insert into public.reviews (product_id, customer_name, rating, review_text, is_approved) values (pid, 'Hamza Q.', 4, 'Very useful in the kitchen, saves a lot of time. Thank you Smart Ghar.', true);
select id into pid from public.products where title = 'Vegetable Slicer Mandoline' limit 1;
insert into public.reviews (product_id, customer_name, rating, review_text, is_approved) values (pid, 'Ayesha K.', 5, 'Good value for money. Cash on delivery made it easy to order.', true);
select id into pid from public.products where title = 'Automatic Soap Dispenser Touchless' limit 1;
insert into public.reviews (product_id, customer_name, rating, review_text, is_approved) values (pid, 'Bilal R.', 5, 'Very useful in the kitchen, saves a lot of time. Thank you Smart Ghar.', true);
select id into pid from public.products where title = 'Automatic Soap Dispenser Touchless' limit 1;
insert into public.reviews (product_id, customer_name, rating, review_text, is_approved) values (pid, 'Hira S.', 4, 'Good value for money. Cash on delivery made it easy to order.', true);
select id into pid from public.products where title = 'Automatic Soap Dispenser Touchless' limit 1;
insert into public.reviews (product_id, customer_name, rating, review_text, is_approved) values (pid, 'Usman A.', 5, 'Gifted this to my sister and she loved it. Will order again.', true);
select id into pid from public.products where title = 'Silicone Spatula Set (6 Pieces)' limit 1;
insert into public.reviews (product_id, customer_name, rating, review_text, is_approved) values (pid, 'Fatima N.', 5, 'Good value for money. Cash on delivery made it easy to order.', true);
select id into pid from public.products where title = 'Silicone Spatula Set (6 Pieces)' limit 1;
insert into public.reviews (product_id, customer_name, rating, review_text, is_approved) values (pid, 'Zain M.', 4, 'Gifted this to my sister and she loved it. Will order again.', true);
select id into pid from public.products where title = 'Silicone Spatula Set (6 Pieces)' limit 1;
insert into public.reviews (product_id, customer_name, rating, review_text, is_approved) values (pid, 'Sana T.', 5, 'Excellent quality, exactly as shown in the pictures. Delivery was fast too.', true);
select id into pid from public.products where title = 'Air Fryer 4L Digital' limit 1;
insert into public.reviews (product_id, customer_name, rating, review_text, is_approved) values (pid, 'Hamza Q.', 5, 'Gifted this to my sister and she loved it. Will order again.', true);
select id into pid from public.products where title = 'Air Fryer 4L Digital' limit 1;
insert into public.reviews (product_id, customer_name, rating, review_text, is_approved) values (pid, 'Ayesha K.', 4, 'Excellent quality, exactly as shown in the pictures. Delivery was fast too.', true);
select id into pid from public.products where title = 'Air Fryer 4L Digital' limit 1;
insert into public.reviews (product_id, customer_name, rating, review_text, is_approved) values (pid, 'Bilal R.', 5, 'Using it daily for two weeks, working perfectly. Worth the price.', true);
select id into pid from public.products where title = 'Oil Sprayer Spray Bottle 100ml' limit 1;
insert into public.reviews (product_id, customer_name, rating, review_text, is_approved) values (pid, 'Hira S.', 5, 'Excellent quality, exactly as shown in the pictures. Delivery was fast too.', true);
select id into pid from public.products where title = 'Oil Sprayer Spray Bottle 100ml' limit 1;
insert into public.reviews (product_id, customer_name, rating, review_text, is_approved) values (pid, 'Usman A.', 4, 'Using it daily for two weeks, working perfectly. Worth the price.', true);
select id into pid from public.products where title = 'Oil Sprayer Spray Bottle 100ml' limit 1;
insert into public.reviews (product_id, customer_name, rating, review_text, is_approved) values (pid, 'Fatima N.', 5, 'Packaging was neat and the product feels premium. Recommended.', true);
select id into pid from public.products where title = 'LED Night Lamp with Touch Control' limit 1;
insert into public.reviews (product_id, customer_name, rating, review_text, is_approved) values (pid, 'Zain M.', 5, 'Using it daily for two weeks, working perfectly. Worth the price.', true);
select id into pid from public.products where title = 'LED Night Lamp with Touch Control' limit 1;
insert into public.reviews (product_id, customer_name, rating, review_text, is_approved) values (pid, 'Sana T.', 4, 'Packaging was neat and the product feels premium. Recommended.', true);
select id into pid from public.products where title = 'LED Night Lamp with Touch Control' limit 1;
insert into public.reviews (product_id, customer_name, rating, review_text, is_approved) values (pid, 'Hamza Q.', 5, 'Very useful in the kitchen, saves a lot of time. Thank you Smart Ghar.', true);
end $$;

commit;