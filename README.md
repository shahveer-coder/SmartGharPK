# 🏠 Smart Ghar — Kitchen & Home Gadgets Pakistan

A complete, production-ready e-commerce storefront **and** admin panel for the **Smart Ghar** brand, selling kitchen and home gadgets across Pakistan with **Cash on Delivery** and **WhatsApp ordering**.

Built with plain **HTML5 + CSS3 + Vanilla JavaScript** (no frameworks, no build step) and **Supabase** for the database, authentication and API layer. Hosting is a static deploy — perfect for **Vercel**, Netlify or any static host.

> **Smart Home. Easy Life.**

---

## 🔗 Links

| | |
|---|---|
| **Live store** | **https://smartgharpk.vercel.app** ✅ deployed |
| **Admin panel** | `https://smartgharpk.vercel.app/admin-login.html` |
| **GitHub repo** | https://github.com/shahveer-coder/SmartGharPK |
| **Supabase project** | `gkyqzyehaszjqeiggflu` (region: ap-south-1) |

### 🔑 Admin credentials

```
Email:    admin@smartghar.pk
Password: smart123
```

> Change this password immediately after your first login — **Admin → Settings → Admin account**.

---

## ✨ What's included

### Storefront (7 customer pages)

| Page | Highlights |
|---|---|
| `index.html` | Announcement marquee, sticky shrinking navbar, parallax hero with rotating badge, trust strip, category showcase, hot-selling grid, coupon + countdown offer banner, "why us", auto-playing best-seller carousel, customer reviews, Instagram grid, newsletter, footer |
| `shop.html` | Sidebar filters (search, category, price range, discount, availability, rating), grid/list toggle, sorting, pagination, mobile filter drawer |
| `product-detail.html` | Gallery with thumbnail switching, desktop zoom lens, mobile swipe, key-features box, quantity selector, Add to Cart / Buy Now / Order on WhatsApp / wishlist, delivery info, description–specs–reviews tabs, rating breakdown, review submission, related products |
| `category.html` | Category hero, category switcher tabs, product grid |
| `checkout.html` | Validated COD form, city/province selects, payment methods (COD / bank / EasyPaisa-JazzCash), order summary, promo codes, success modal with **Confirm on WhatsApp** |
| `track-order.html` | Look up by order ID or phone, 5-step progress timeline, estimated delivery date |
| `about.html` | Brand story, mission/vision/values, differentiators, testimonials, CTA |

### Admin panel (Supabase Auth protected)

- **Dashboard** — today's revenue/orders, pending count, month revenue, 7-day bar chart, category pie chart, monthly revenue line chart, top products, low-stock alerts, recent orders
- **Orders** — search, status/city filters, CSV export, detail modal, status updates, call / WhatsApp the customer, delete
- **Products** — full CRUD with **photo upload straight from your phone gallery**, multi-photo gallery (add/remove), key features, tags, featured toggle, active/draft, stock, auto discount %
- **Customers** — auto-built from orders, VIP tagging, order history, call & WhatsApp, CSV export
- **Categories** — CRUD with icon, image, description, live product counts
- **Coupons** — percentage / fixed / free-shipping, min order, max cap, validity dates, usage limits, active toggle
- **Analytics** — date ranges, revenue, AOV, delivered rate, sales by city/category, peak order hours, new customers, top products
- **Settings** — store status & name, announcement text, shipping thresholds, WhatsApp/email/address, social links, payment details, admin password change

### UX / animation checklist

Page-load stagger, navbar logo bounce, AOS scroll reveals, product card lift + image zoom, category rotate/scale, underline slide on nav links, rotating social icons, pulsing WhatsApp float, SALE/NEW badge animations, skeleton loaders, cart bounce + badge pop, ripple buttons, success/error toasts, modal scale-in, hamburger → X, scroll progress bar, back-to-top, mobile sticky bottom nav, bottom-sheet cart drawer.

---

## 🎨 Brand system

| Token | Value |
|---|---|
| Primary green | `#22c55e` |
| Dark forest green | `#14532d` |
| Lime accent | `#84cc16` |
| Soft cream | `#fef9f3` |
| Text dark / gray | `#1f2937` / `#6b7280` |
| Headings | Playfair Display (self-hosted) |
| Body / buttons | Poppins (self-hosted) |

Logo: `images/logo.png` (navbar 44–50px, footer 80px, favicon `images/favicon.png`).

WhatsApp number used everywhere: **`923182158561`** — change it in **one place**: `js/supabase-config.js` (`SITE.whatsapp`) and in the `settings` table (Admin → Settings).

---

## 🗂 Project structure

```
SmartGharPK/
├── index.html                 # Home
├── shop.html                  # All products + filters
├── product-detail.html        # Single product
├── category.html              # Category listing
├── checkout.html              # COD checkout
├── track-order.html           # Order tracking
├── about.html                 # Brand story
├── admin-login.html           # Admin login
├── admin-dashboard.html       # Admin panel
├── 404.html
├── css/
│   ├── style.css              # Design system + layout (mobile-first)
│   ├── animations.css         # All keyframes & micro-interactions
│   └── admin.css              # Admin shell, tables, charts, modals
├── js/
│   ├── supabase-config.js     # Supabase client + shared helpers (money, escape, toast)
│   ├── cart.js                # Cart + wishlist (localStorage) + drawer
│   ├── main.js                # Nav, search, scroll FX, settings, AOS
│   ├── store.js               # Products, shop filters, PDP, quick view
│   ├── checkout.js            # Validation, coupons, place_order, success modal
│   ├── track.js               # Order tracking timeline
│   ├── admin-images.js        # Gallery picker: compress + upload to Supabase Storage
│   └── admin.js               # Auth guard + full admin CRUD + charts
├── images/
│   ├── logo.png               # Brand logo (navbar/footer/admin)
│   ├── favicon.png
│   └── products/              # Product & category artwork
├── vendor/                    # Self-hosted libs (works offline, no CDN dependency)
│   ├── supabase.js            # @supabase/supabase-js v2 (UMD)
│   ├── aos.js / aos.css       # Animate On Scroll
│   ├── fa/                    # Font Awesome 6 icon font + CSS
│   └── fonts/                 # Poppins + Playfair Display woff2
├── supabase/
│   ├── schema.sql             # Tables, triggers, RPCs, RLS policies, storage bucket
│   └── seed.sql               # Categories, 15 products, coupons, settings, reviews
├── tools/                     # Helper scripts used to generate artwork & seed SQL
├── vercel.json                # Cache + security headers
├── robots.txt / sitemap.xml
└── README.md
```

---

## 🗄 Database schema

All tables live in the `public` schema with **RLS enabled**.

| Table | Purpose | Key columns |
|---|---|---|
| `products` | Catalogue | title, category, original_price, sale_price, discount_percent (auto), stock_quantity, image_url, image_gallery (jsonb), key_features (jsonb), tags (jsonb), is_featured, is_active, rating, review_count |
| `orders` | Orders | order_number (auto `SG-00001`), customer_name, phone, address, city, province, order_items (jsonb), subtotal, shipping_fee, discount_amount, coupon_code, total_amount, payment_method, status, order_notes |
| `customers` | Auto-built from orders | name, phone (unique), email, city, total_orders, total_spent, is_vip, last_order_at |
| `categories` | Categories | name, slug, image_url, icon, product_count (auto) |
| `coupons` | Discounts | code, discount_type (percentage/fixed/free_shipping), discount_value, min_order_amount, max_discount_cap, valid_from, valid_till, usage_limit, usage_count, is_active |
| `reviews` | Product reviews | product_id (FK), customer_name, rating (1–5), review_text, is_approved |
| `settings` | Single store config row | store_status, store_name, logo_url, announcement_text, free_shipping_threshold, shipping_fee, whatsapp_number, support_email, business_address, social_links (jsonb), bank_details (jsonb), easypaisa (jsonb), cod_enabled |

**Database functions (RPC)** — `security definer`, safe for anonymous storefront calls:

| Function | Purpose |
|---|---|
| `place_order(payload jsonb)` | Creates the order, bumps coupon usage, upserts the customer, decrements stock — all atomically |
| `track_order(p_ref text)` | Lookup by order number **or** phone, returns order JSON |
| `validate_coupon(p_code, p_subtotal)` | Returns validity + computed discount (percentage / fixed / free shipping) |

**Triggers** keep `discount_percent`, `product_count`, product `rating`/`review_count` and `updated_at` in sync automatically.

### Row Level Security summary

| Role | Access |
|---|---|
| `anon` | SELECT active products / categories / approved reviews / settings; INSERT reviews (unapproved); EXECUTE the 3 RPCs. **No** direct access to orders or customers. |
| `authenticated` (admin) | Full access to all tables; upload / replace / delete images in the `product-images` bucket |
| Storage | `product-images` bucket is public for reading (so the storefront can render photos); writing requires an admin session. 5 MB per file, images only — the panel compresses every photo to ≤1400 px before upload. |

---

## 🚀 Setup guide

### 1. Run locally

The site is 100% static — any static server works:

```bash
# from the project folder
python3 -m http.server 8080
# open http://localhost:8080
```

> Don't open the HTML files with `file://` — absolute asset paths (`/css/...`) need a server.

### 2. Supabase (already configured for this project)

The frontend talks to Supabase using the **publishable/anon key**, which is safe to expose in client code — RLS is what protects your data.

- URL + key live in `js/supabase-config.js`.
- To use your **own** Supabase project instead: create a project, open the SQL editor and run
  1. `supabase/schema.sql`
  2. `supabase/seed.sql`
  then update `SUPABASE_URL` / `SUPABASE_KEY` in `js/supabase-config.js`.
- Create the admin user: Supabase Dashboard → **Authentication → Users → Add user** (`admin@smartghar.pk`, password of your choice, *Auto Confirm User* = on). The seed script that created the current admin uses a bcrypt hash inserted directly into `auth.users`.
- Auth settings used: **Email provider enabled**, min password length 6, signups open (you can disable signups to keep only the admin).

### 3. Deploy to Vercel (2 minutes, zero config)

> **Status: live** → **https://smartgharpk.vercel.app** (project imported from this repo,
> Framework preset: *Other*, no build step, no output directory). Every push to `main`
> redeploys automatically. The Supabase **Site URL** is already set to this domain, so
> auth/password-reset redirects work out of the box.

**Option A — Dashboard (recommended)**

1. Push this repo to GitHub (already done).
2. Go to [vercel.com/new](https://vercel.com/new) → **Import Git Repository** → pick `shahveer-coder/SmartGharPK`.
3. Framework Preset: **Other**. Build command: *(empty)*. Output directory: *(empty)*.
4. **Deploy**. Your site is live at `https://<project>.vercel.app`.
5. Optional: **Settings → Domains** → add `smartghar.pk`.

**Option B — CLI**

```bash
npm i -g vercel
vercel --prod
```

**Option C — drag & drop**: zip the folder and drop it on Vercel → New Project → “Deploy from template/upload”.

After deploying, set the production URL in **Supabase → Authentication → URL Configuration → Site URL** so password-reset emails point to your domain.
This repo already ships with `https://smartgharpk.vercel.app` configured as the Supabase Site URL
and in the redirect allow-list (`localhost:8080/3000` + `*.vercel.app` are allowed too).

If your deployment gets a **different** URL (or you attach a custom domain), update it in three places:

1. `sitemap.xml` — the `<loc>` base
2. `robots.txt` — the `Sitemap:` line
3. Supabase → Authentication → URL Configuration → **Site URL** (+ redirect allow-list)

### 4. Go-live checklist

- [ ] Change the admin password
- [ ] Confirm WhatsApp number in Admin → Settings
- [ ] Replace the 15 demo products with real ones (Admin → Products, or edit `seed.sql`)
- [ ] Replace the illustrated product images with real photos (paste any image URL in the product form)
- [ ] Update bank / EasyPaisa / JazzCash details in Admin → Settings
- [ ] Delete the 6 demo orders if you want a clean start (Admin → Orders)
- [ ] Point your domain and update the canonical/OG URLs

---

## 🔐 Security notes

- **RLS enabled** on all 7 tables; orders/customers are not readable by anonymous users.
- **No service-role key in the browser** — only the public anon key, which cannot bypass RLS.
- **XSS protection**: all database/user content is escaped through `SG.utils.esc()` before it touches the DOM; `img src` values are validated by `SG.utils.safeUrl()`.
- **SQL injection**: all writes go through Supabase's parameterised PostgREST/RPC layer.
- **Admin routes** call `supabase.auth.getSession()` and redirect to `admin-login.html` when unauthenticated.
- Form validation runs client-side; the database enforces constraints and the RPC validates the payload server-side.
- Security headers (`X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`) are set in `vercel.json`.

---

## ⚡ Performance notes

- All libraries, fonts and icons are **self-hosted** in `/vendor` — no third-party CDN calls, no layout shift, works behind firewalls.
- Images are `loading="lazy"` with fixed dimensions to avoid CLS.
- Only ~2.7 MB total repo size including all artwork.
- Products are fetched once per page with server-side `limit`; the shop applies filters client-side (fast, no extra round-trips).
- Skeleton screens cover every loading state; friendly error states with retry when the network fails.
- Long-cache headers for `/vendor` (1 year), `/images` and `/css` via `vercel.json`.

---

## 🧪 Tested flows

- ✅ `place_order` RPC creates `SG-00001`, decrements stock, upserts the customer (verified against the live database)
- ✅ `validate_coupon` — valid code, below-minimum order, invalid code
- ✅ `track_order` — by order number **and** by phone number
- ✅ Cart add / qty change / remove / persistence across pages, badge sync, drawer totals
- ✅ Checkout summary hydrates from `localStorage` on load (subtotal → shipping → total), coupon recalculates the total live (`SMART20` on 2 × 999 → −PKR 400 → PKR 1,798)
- ✅ Checkout validation blocks empty submits (5 field errors), successful order shows the success modal + WhatsApp deep link and empties the cart
- ✅ Track-order renders the full timeline for `SG-00001`
- ✅ Storefront: shop search filters the grid (2 → 1 results), sort applies, cart drawer opens, hamburger↔X toggles the mobile menu, search overlay returns live results
- ✅ Admin: all 8 sections render rows, order detail modal (items + status select + save), product modal pre-fills title/gallery/tags, CSV export present
- ✅ Admin auth guard redirects when signed out
- ✅ All 10 pages load with zero JS syntax errors; no console errors on data-fetch failure (graceful fallbacks)
- ✅ 320 px-wide layout: no horizontal scroll, all touch targets ≥ 44 px

---

## 🖼 Adding product photos (no URLs needed)

Every image field in the admin panel is a **gallery picker**:

| Where | Field |
|---|---|
| Products → Add / Edit | Main Image, Gallery Photos (multi-select) |
| Categories → Add / Edit | Category Image |
| Settings → Store settings | Logo |

1. Tap **Choose from Gallery** → the phone's photo picker (or camera) opens.
2. Pick one photo (or several for *Gallery Photos*).
3. The panel **compresses** it to max 1400 px / ~200 KB, uploads it to the
   `product-images` bucket and fills in the public URL automatically.
4. The thumbnail appears instantly; use **×** to remove a gallery photo.

A **URL** button stays available for power users (external links, `/images/...`
paths). It is hidden by default so nobody has to type URLs on a phone.

> Uploads need the `product-images` bucket + its 4 policies — already applied to
> this project and included at the end of `supabase/schema.sql`.

---

## 🛠 Customisation quick reference

| Want to change… | Edit |
|---|---|
| WhatsApp number | `js/supabase-config.js` → `SITE.whatsapp` **and** Admin → Settings |
| Free shipping threshold / shipping fee | Admin → Settings |
| Colours, radii, shadows | `css/style.css` → `:root` tokens |
| Product card layout | `js/store.js` → `cardHtml()` + `.product-card` in CSS |
| Announcement text | Admin → Settings (`announcement_text`) |
| Homepage sections | `index.html` |
| Coupon codes | Admin → Coupons |

---

## 📄 License & credits

Private project for the Smart Ghar brand. Third-party assets:

- [@supabase/supabase-js](https://github.com/supabase/supabase-js) — MIT
- [AOS](https://github.com/michalsnik/aos) — MIT
- [Font Awesome Free](https://fontawesome.com) — CC BY 4.0 (icons), SIL OFL (fonts)
- [Poppins](https://fonts.google.com/specimen/Poppins) & [Playfair Display](https://fonts.google.com/specimen/Playfair+Display) — SIL OFL

Product/category illustrations are original artwork generated for this project (see `tools/gen_images.py`) and are free to replace with your own product photography.

---

Developed by **Shahveer Coder** — Karachi, Pakistan 🇵🇰
Built with ❤️ for Smart Ghar · *Smart Home. Easy Life.*
