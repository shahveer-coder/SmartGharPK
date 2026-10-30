"""Generates supabase/seed.sql (products, categories, coupons, settings, reviews, demo orders)."""
import os, json, random

random.seed(7)
OUT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "supabase", "seed.sql")

CATS = [
    ("Kitchen Gadgets", "kitchen-gadgets", "🍳", "Everyday kitchen helpers that save time and effort.",
     "/images/products/cat-kitchen.png"),
    ("Home Essentials", "home-essentials", "🏠", "Smart little upgrades for a comfortable home.",
     "/images/products/cat-home.png"),
    ("Storage Solutions", "storage-solutions", "📦", "Organise every corner, keep everything tidy.",
     "/images/products/cat-storage.png"),
    ("Gift Items", "gift-items", "🎁", "Thoughtful gadgets that make perfect presents.",
     "/images/products/cat-gift.png"),
]

P = [
    # title, cat, orig, sale, stock, img, featured, tag, rating, reviews
    ("Manual Food Chopper 900ml", "Kitchen Gadgets", 1499, 999, 50, "chopper.png", True, "best_seller", 4.8, 214),
    ("Electric Egg Beater & Mixer", "Kitchen Gadgets", 2299, 1799, 30, "egg-beater.png", True, "hot_deal", 4.7, 168),
    ("Vegetable Slicer Mandoline", "Kitchen Gadgets", 1799, 1299, 45, "mandoline.png", False, "new", 4.6, 121),
    ("Automatic Soap Dispenser Touchless", "Home Essentials", 2499, 1999, 25, "soap-dispenser.png", True, "hot_deal", 4.7, 96),
    ("Silicone Spatula Set (6 Pieces)", "Kitchen Gadgets", 1299, 899, 60, "spatula-set.png", False, "best_seller", 4.9, 287),
    ("Air Fryer 4L Digital", "Kitchen Gadgets", 15999, 12999, 10, "air-fryer.png", True, "limited", 4.9, 63),
    ("Oil Sprayer Spray Bottle 100ml", "Kitchen Gadgets", 899, 599, 80, "oil-sprayer.png", False, "new", 4.4, 58),
    ("LED Night Lamp with Touch Control", "Home Essentials", 1999, 1499, 40, "night-lamp.png", True, "new", 4.6, 142),
    ("Foldable Clothes Drying Rack", "Home Essentials", 3499, 2799, 20, "drying-rack.png", False, "best_seller", 4.5, 87),
    ("4-Tier Shoe Rack Organizer", "Home Essentials", 2999, 2299, 35, "shoe-rack.png", False, "hot_deal", 4.6, 118),
    ("Airtight Food Container Set (10 Pcs)", "Storage Solutions", 2499, 1799, 55, "food-containers.png", True, "best_seller", 4.8, 196),
    ("Under-Bed Storage Box with Wheels", "Storage Solutions", 1799, 1299, 40, "under-bed-storage.png", False, "new", 4.4, 74),
    ("Rotating Kitchen Spice Rack", "Storage Solutions", 2299, 1699, 30, "spice-rack.png", False, "limited", 4.5, 109),
    ("Portable USB Blender Bottle", "Gift Items", 3499, 2699, 25, "usb-blender.png", False, "new", 4.3, 66),
    ("Smart Fitness Watch with Heart Rate", "Gift Items", 4999, 3499, 20, "smart-watch.png", False, "hot_deal", 4.5, 153),
]

FEATURES = {
    "chopper.png": ["Pull-string mechanism, no electricity needed", "900ml BPA-free bowl", "Stainless steel blades for fast chopping",
                    "Non-slip base keeps it steady", "Easy to open and dishwasher safe"],
    "egg-beater.png": ["Powerful motor for quick whisking", "2 stainless steel beaters included", "5 speed settings with turbo",
                       "Ergonomic non-slip grip", "Perfect for eggs, cream and batter"],
    "mandoline.png": ["Adjustable slicing thickness", "Sharp stainless steel blade", "Hand guard for safe slicing",
                      "Compact foldable design", "Easy to clean under running water"],
    "soap-dispenser.png": ["Touchless infrared sensor", "Works with liquid soap or sanitiser", "Rechargeable / battery powered",
                          "Water resistant body", "Saves soap and keeps hands clean"],
    "spatula-set.png": ["Food-grade silicone, BPA free", "Heat resistant up to 230°C", "Wooden handles, comfortable grip",
                        "6 pieces for all kitchen tasks", "Does not scratch non-stick pans"],
    "air-fryer.png": ["4L capacity for the whole family", "Digital touch panel with 8 presets", "Uses up to 85% less oil",
                      "Non-stick detachable basket", "60-minute timer with auto shut-off"],
    "oil-sprayer.png": ["Fine mist spray for even oil coating", "100ml refillable glass bottle", "Leak-proof pump design",
                        "Great for air fryers and grills", "Easy to clean and refill"],
    "night-lamp.png": ["Touch control with 3 brightness levels", "Warm eye-friendly LED light", "USB rechargeable battery",
                       "Portable, perfect for kids rooms", "Automatic 30-minute sleep timer"],
    "drying-rack.png": ["Foldable space-saving design", "Strong steel frame, holds heavy laundry", "Three-tier drying space",
                        "Non-slip feet, no floor scratches", "Opens and folds in seconds"],
    "shoe-rack.png": ["4 tiers hold up to 12 pairs", "Sturdy metal frame with plastic shelves", "Easy assembly, no tools needed",
                      "Compact footprint for small rooms", "Ventilated design prevents odour"],
    "food-containers.png": ["10-piece set in mixed sizes", "Airtight four-side locking lids", "BPA-free food grade material",
                            "Microwave, freezer and dishwasher safe", "Stackable for tidy cabinets"],
    "under-bed-storage.png": ["Slim 15cm profile fits under beds", "Four smooth rolling wheels", "Zip top keeps dust out",
                             "Reinforced fabric holds heavy items", "Collapsible when not in use"],
    "spice-rack.png": ["360° rotating carousel", "Holds up to 12 spice jars", "Anti-slip base for stable spinning",
                       "Detachable shelves for easy cleaning", "Compact design saves counter space"],
    "usb-blender.png": ["Blend fresh juice anywhere", "USB rechargeable battery", "Six stainless steel blades",
                        "Leak-proof travel bottle lid", "One-button easy operation"],
    "smart-watch.png": ["Heart rate and blood oxygen monitoring", "Sleep and step tracking", "Calls and message notifications",
                        "IP67 water resistant", "Up to 7 days battery life"],
}

DESC = {
    "chopper.png": ("Chop onions, garlic, herbs and vegetables in seconds with this manual pull-string food chopper. "
                    "No electricity, no mess and no tears - just pull the handle and let the stainless steel blades do the work.\n\n"
                    "The 900ml bowl is made from BPA-free, food-grade material that is easy to rinse clean. Compact, sturdy and ready for everyday Pakistani kitchen use."),
    "egg-beater.png": ("Whip eggs, cream and batter faster with this handheld electric beater. The powerful motor and twin stainless steel whisks give smooth, lump-free results every time.\n\n"
                       "Five speed settings let you go from gentle mixing to high-speed whipping with a single hand. Lightweight body and non-slip grip make long baking sessions comfortable."),
    "mandoline.png": ("Slice vegetables evenly in one quick motion with this adjustable mandoline slicer. Perfect for salads, fries, pickles and stir-fries.\n\n"
                      "The stainless steel blade stays sharp, while the hand guard keeps your fingers safe. It folds flat, so it takes almost no space in your kitchen drawer."),
    "soap-dispenser.png": ("Upgrade your basin with a touchless soap dispenser that releases the perfect amount of soap with a wave of your hand. Hygienic, modern and great for kitchens and washrooms.\n\n"
                           "The infrared sensor reacts instantly, and the water-resistant body handles everyday splashes. Works with liquid soap, hand wash and sanitiser."),
    "spatula-set.png": ("A complete six-piece silicone utensil set that handles everything from frying to folding. The soft silicone heads will not scratch your non-stick pans.\n\n"
                        "Each piece has a solid wooden handle that stays cool and comfortable while cooking. Heat resistant up to 230°C and completely food-safe."),
    "air-fryer.png": ("Enjoy crispy fries, chicken, samosas and more with up to 85% less oil. The 4L basket is large enough for the whole family's dinner.\n\n"
                      "The digital panel offers eight one-touch presets and a 60-minute timer with auto shut-off. The detachable non-stick basket washes up in minutes."),
    "oil-sprayer.png": ("Control how much oil you use with a fine, even mist. Ideal for air fryers, grills, salads and baking trays.\n\n"
                        "The 100ml refillable glass bottle is leak-proof and easy to press - a small gadget that makes a big difference in healthy cooking."),
    "night-lamp.png": ("A soft, warm night light with simple touch control. Tap to switch on, tap again to change brightness - no fumbling for switches at night.\n\n"
                       "The rechargeable battery means you can carry it from the bedroom to the hallway. A 30-minute sleep timer helps children drift off without wasting power."),
    "drying-rack.png": ("Dry a full load of laundry without giving up half your room. This foldable rack opens into three generous drying tiers and folds down flat in seconds.\n\n"
                        "The steel frame is strong enough for heavy bedsheets yet light enough to move with one hand. Non-slip feet protect your floor."),
    "shoe-rack.png": ("Keep up to twelve pairs of shoes tidy with this four-tier organiser. The open design keeps footwear ventilated and easy to find.\n\n"
                      "Assembly takes minutes with no tools, and the compact footprint fits neatly beside doors, in wardrobes or on balconies."),
    "food-containers.png": ("Store daal, rice, spices, snacks and leftovers in ten airtight containers that stack neatly in your cabinet.\n\n"
                            "The four-side locking lids keep moisture and insects out, while the BPA-free bodies are safe for the microwave, freezer and dishwasher."),
    "under-bed-storage.png": ("Turn unused space under your bed into real storage. At just 15cm tall, this box slides in easily and rolls out on four smooth wheels.\n\n"
                              "Perfect for extra bedding, winter clothes and kids' toys. The zip top keeps dust out and the box folds flat when not needed."),
    "spice-rack.png": ("Find every masala at a glance with a 360° rotating spice carousel. Ideal for small kitchens where counter space matters.\n\n"
                       "It holds up to twelve jars, spins smoothly on an anti-slip base, and the shelves lift out for quick cleaning."),
    "usb-blender.png": ("Make a fresh smoothie at home, at the office or while travelling. This portable USB blender charges like a phone and blends in seconds.\n\n"
                        "Six stainless steel blades crush fruit and ice with ease, and the leak-proof lid turns the bottle into your travel cup."),
    "smart-watch.png": ("Track your health and stay connected with a smart watch that does the essentials well. Monitor heart rate, blood oxygen, sleep and daily steps.\n\n"
                        "Get calls and message alerts on your wrist, wear it in the rain and charge it once a week. A thoughtful gift that gets used every day."),
}

XML = lambda s: s.replace("'", "''")

lines = []
A = lines.append
A("-- Smart Ghar seed data (generated)")
A("begin;")
A("delete from public.reviews; delete from public.orders; delete from public.customers; delete from public.products; delete from public.categories; delete from public.coupons; delete from public.settings;")
A("")

A("insert into public.categories (name, slug, icon, description, image_url, is_active) values")
rows = [f"('{XML(n)}', '{XML(s)}', '{i}', '{XML(d)}', '{img}', true)" for n, s, i, d, img in CATS]
A(",\n".join(rows) + ";\n")

A("insert into public.products (title, short_description, full_description, category, original_price, sale_price, stock_quantity, image_url, image_gallery, key_features, tags, is_featured, is_active, rating, review_count) values")
rows = []
for (title, cat, orig, sale, stock, img, feat, tag, rating, reviews) in P:
    short = DESC[img].split("\n\n")[0][:150].rsplit(" ", 1)[0] + "…"
    gallery = json.dumps([f"/images/products/{img}"])
    feats = json.dumps(FEATURES[img], ensure_ascii=False)
    tags = json.dumps([tag])
    rows.append(
        "('{}', '{}', '{}', '{}', {}, {}, {}, '/images/products/{}', '{}'::jsonb, '{}'::jsonb, '{}'::jsonb, {}, true, {}, {})".format(
            XML(title), XML(short), XML(DESC[img]), XML(cat), orig, sale, stock, img, gallery, feats, tags,
            "true" if feat else "false", rating, reviews))
A(",\n".join(rows) + ";\n")

A("insert into public.coupons (code, discount_type, discount_value, min_order_amount, max_discount_cap, valid_from, valid_till, usage_limit, is_active) values")
A("('SMART20', 'percentage', 20, 1500, 1000, current_date - 30, current_date + 180, 500, true),")
A("('FIRST500', 'fixed', 500, 3000, 500, current_date - 30, current_date + 180, 300, true),")
A("('FREESHIP', 'free_shipping', 0, 1000, 0, current_date - 30, current_date + 180, 1000, true);\n")

A("insert into public.settings (store_status, store_name, logo_url, announcement_text, free_shipping_threshold, shipping_fee, whatsapp_number, support_email, business_address, cod_enabled) values (true, 'Smart Ghar', '/images/logo.png', '🚚 Cash on Delivery All Over Pakistan 🇵🇰 | Free Shipping Above PKR 3,000', 3000, 200, '923182158561', 'info@smartghar.pk', 'Karachi, Pakistan', true);\n")

# demo reviews on the first 6 products
A("do $$ declare pid uuid; begin")
for i, (title, cat, orig, sale, stock, img, feat, tag, rating, reviews) in enumerate(P[:8]):
    names = ["Ayesha K.", "Bilal R.", "Hira S.", "Usman A.", "Fatima N.", "Zain M.", "Sana T.", "Hamza Q."]
    texts = ["Excellent quality, exactly as shown in the pictures. Delivery was fast too.",
             "Using it daily for two weeks, working perfectly. Worth the price.",
             "Packaging was neat and the product feels premium. Recommended.",
             "Very useful in the kitchen, saves a lot of time. Thank you Smart Ghar.",
             "Good value for money. Cash on delivery made it easy to order.",
             "Gifted this to my sister and she loved it. Will order again."]
    for k in range(3):
        A(f"select id into pid from public.products where title = '{XML(title)}' limit 1;")
        A(f"insert into public.reviews (product_id, customer_name, rating, review_text, is_approved) values (pid, '{names[(i*3+k) % 8]}', {5 if k%2==0 else 4}, '{XML(texts[(i+k) % 6])}', true);")
A("end $$;\n")
A("commit;")

os.makedirs(os.path.dirname(OUT), exist_ok=True)
open(OUT, "w").write("\n".join(lines))
print("wrote", OUT, len("\n".join(lines)), "bytes")
