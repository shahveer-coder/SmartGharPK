-- ============================================================
-- SMART GHAR — DATABASE SCHEMA
-- ============================================================
create extension if not exists pgcrypto;

-- ---------- generic updated_at ----------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

-- ---------- CATEGORIES ----------
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  slug text unique not null,
  image_url text,
  description text,
  icon text default '🛍️',
  product_count integer default 0,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- ---------- PRODUCTS ----------
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  short_description text,
  full_description text,
  category text not null,
  original_price numeric not null,
  sale_price numeric,
  discount_percent integer default 0,
  stock_quantity integer default 0,
  image_url text not null,
  image_gallery jsonb default '[]'::jsonb,
  key_features jsonb default '[]'::jsonb,
  tags jsonb default '[]'::jsonb,
  is_featured boolean default false,
  is_active boolean default true,
  rating numeric default 4.5,
  review_count integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create or replace function public.products_before_save()
returns trigger language plpgsql as $$
begin
  if new.sale_price is not null and new.original_price > 0 and new.sale_price < new.original_price then
    new.discount_percent := round(((new.original_price - new.sale_price) / new.original_price) * 100);
  else
    new.discount_percent := 0;
  end if;
  new.updated_at := now();
  return new;
end; $$;

drop trigger if exists trg_products_save on public.products;
create trigger trg_products_save before insert or update on public.products
for each row execute function public.products_before_save();

-- ---------- CUSTOMERS ----------
create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  name text,
  phone text unique,
  email text,
  address text,
  city text,
  province text,
  total_orders integer default 0,
  total_spent numeric default 0,
  is_vip boolean default false,
  notes text,
  created_at timestamptz default now(),
  last_order_at timestamptz
);

-- ---------- ORDERS ----------
create sequence if not exists public.order_number_seq start 1;

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text unique,
  customer_name text not null,
  phone text not null,
  email text,
  address text not null,
  city text not null,
  province text not null,
  postal_code text,
  order_items jsonb default '[]'::jsonb,
  subtotal numeric default 0,
  shipping_fee numeric default 0,
  discount_amount numeric default 0,
  coupon_code text,
  total_amount numeric not null,
  payment_method text default 'COD',
  status text default 'pending',
  order_notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create or replace function public.orders_before_save()
returns trigger language plpgsql as $$
begin
  if new.order_number is null then
    new.order_number := 'SG-' || lpad(nextval('public.order_number_seq')::text, 5, '0');
  end if;
  new.updated_at := now();
  return new;
end; $$;

drop trigger if exists trg_orders_save on public.orders;
create trigger trg_orders_save before insert or update on public.orders
for each row execute function public.orders_before_save();

create index if not exists idx_orders_phone on public.orders (phone);
create index if not exists idx_orders_status on public.orders (status);
create index if not exists idx_orders_created on public.orders (created_at desc);

-- ---------- COUPONS ----------
create table if not exists public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  discount_type text default 'percentage',
  discount_value numeric not null default 0,
  min_order_amount numeric default 0,
  max_discount_cap numeric,
  valid_from date default current_date,
  valid_till date,
  usage_limit integer,
  usage_count integer default 0,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- ---------- REVIEWS ----------
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references public.products(id) on delete cascade,
  customer_name text not null,
  rating integer default 5 check (rating between 1 and 5),
  review_text text,
  is_approved boolean default false,
  created_at timestamptz default now()
);

create or replace function public.refresh_product_rating()
returns trigger language plpgsql as $$
declare pid uuid;
begin
  pid := coalesce(new.product_id, old.product_id);
  update public.products p set
    rating = coalesce((select round(avg(r.rating)::numeric, 1) from public.reviews r where r.product_id = pid and r.is_approved), p.rating),
    review_count = (select count(*) from public.reviews r where r.product_id = pid and r.is_approved)
  where p.id = pid;
  return coalesce(new, old);
end; $$;

drop trigger if exists trg_reviews_rating on public.reviews;
create trigger trg_reviews_rating after insert or update or delete on public.reviews
for each row execute function public.refresh_product_rating();

-- ---------- SETTINGS ----------
create table if not exists public.settings (
  id uuid primary key default gen_random_uuid(),
  store_status boolean default true,
  store_name text default 'Smart Ghar',
  logo_url text default '/images/logo.png',
  announcement_text text default '🚚 Cash on Delivery All Over Pakistan 🇵🇰 | Free Shipping Above PKR 3,000',
  free_shipping_threshold numeric default 3000,
  shipping_fee numeric default 200,
  shipping_charges jsonb default '{}'::jsonb,
  whatsapp_number text default '923182158561',
  support_email text default 'info@smartghar.pk',
  business_address text default 'Karachi, Pakistan',
  social_links jsonb default '{"instagram":"https://instagram.com/smartghar.pk","facebook":"https://facebook.com/smartghar.pk","tiktok":"https://tiktok.com/@smartghar.pk","youtube":"https://youtube.com/@smartghar.pk"}'::jsonb,
  bank_details jsonb default '{"bank":"Meezan Bank","title":"Smart Ghar","account":"0000 0000 0000 0000"}'::jsonb,
  easypaisa jsonb default '{"easypaisa":"0318 2158561","jazzcash":"0318 2158561","title":"Smart Ghar"}'::jsonb,
  cod_enabled boolean default true,
  updated_at timestamptz default now()
);

-- ---------- CATEGORY PRODUCT COUNTS ----------
create or replace function public.refresh_category_counts()
returns trigger language plpgsql as $$
begin
  update public.categories c
  set product_count = (select count(*) from public.products p where p.category = c.name and p.is_active);
  return null;
end; $$;

drop trigger if exists trg_products_counts on public.products;
create trigger trg_products_counts after insert or update or delete on public.products
for each statement execute function public.refresh_category_counts();

-- trigger on categories insert to fill count
create or replace function public.category_after_insert()
returns trigger language plpgsql as $$
begin
  update public.categories c set product_count = (select count(*) from public.products p where p.category = c.name and p.is_active) where c.id = new.id;
  return null;
end; $$;
drop trigger if exists trg_category_insert on public.categories;
create trigger trg_category_insert after insert on public.categories
for each row execute function public.category_after_insert();

-- ============================================================
-- RPC: PLACE ORDER  (called by anonymous storefront)
-- ============================================================
create or replace function public.place_order(payload jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order public.orders%rowtype;
  v_phone text;
  v_items jsonb;
  v_subtotal numeric;
begin
  v_phone := regexp_replace(coalesce(payload->>'phone',''), '[^0-9+]', '', 'g');
  if length(v_phone) < 10 then raise exception 'Invalid phone number'; end if;

  v_items := coalesce(payload->'order_items', '[]'::jsonb);
  if jsonb_array_length(v_items) = 0 then raise exception 'Cart is empty'; end if;

  v_subtotal := coalesce((payload->>'subtotal')::numeric, 0);

  insert into public.orders (
    customer_name, phone, email, address, city, province, postal_code,
    order_items, subtotal, shipping_fee, discount_amount, coupon_code,
    total_amount, payment_method, status, order_notes
  ) values (
    trim(payload->>'customer_name'),
    v_phone,
    nullif(trim(coalesce(payload->>'email','')), ''),
    trim(payload->>'address'),
    trim(payload->>'city'),
    trim(payload->>'province'),
    nullif(trim(coalesce(payload->>'postal_code','')), ''),
    v_items,
    v_subtotal,
    coalesce((payload->>'shipping_fee')::numeric, 0),
    coalesce((payload->>'discount_amount')::numeric, 0),
    nullif(upper(trim(coalesce(payload->>'coupon_code',''))), ''),
    coalesce((payload->>'total_amount')::numeric, 0),
    coalesce(nullif(payload->>'payment_method',''), 'COD'),
    'pending',
    nullif(trim(coalesce(payload->>'order_notes','')), '')
  ) returning * into v_order;

  -- coupon usage
  if v_order.coupon_code is not null then
    update public.coupons set usage_count = coalesce(usage_count,0) + 1
    where upper(code) = v_order.coupon_code;
  end if;

  -- customer upsert
  insert into public.customers (name, phone, email, address, city, province, total_orders, total_spent, last_order_at)
  values (v_order.customer_name, v_phone, v_order.email, v_order.address, v_order.city, v_order.province, 1, v_order.total_amount, now())
  on conflict (phone) do update set
    name = excluded.name,
    email = coalesce(excluded.email, public.customers.email),
    address = excluded.address,
    city = excluded.city,
    province = excluded.province,
    total_orders = public.customers.total_orders + 1,
    total_spent = public.customers.total_spent + excluded.total_spent,
    last_order_at = now(),
    is_vip = (public.customers.total_orders + 1) >= 5;

  -- stock decrement
  update public.products p
  set stock_quantity = greatest(0, p.stock_quantity - (item->>'quantity')::int)
  from jsonb_array_elements(v_items) as item
  where p.id::text = item->>'product_id';

  return jsonb_build_object('order_id', v_order.id, 'order_number', v_order.order_number, 'total_amount', v_order.total_amount, 'status', v_order.status);
end; $$;

revoke all on function public.place_order(jsonb) from public;
grant execute on function public.place_order(jsonb) to anon, authenticated;

-- ============================================================
-- RPC: TRACK ORDER
-- ============================================================
create or replace function public.track_order(p_ref text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare v jsonb; v_digits text;
begin
  v_digits := regexp_replace(coalesce(p_ref,''), '[^0-9]', '', 'g');
  select to_jsonb(o) - 'email' - 'postal_code' into v
  from public.orders o
  where upper(o.order_number) = upper(trim(p_ref))
     or (length(v_digits) >= 10 and right(regexp_replace(o.phone,'[^0-9]','','g'), 10) = right(v_digits, 10))
  order by o.created_at desc
  limit 1;
  return v;
end; $$;

revoke all on function public.track_order(text) from public;
grant execute on function public.track_order(text) to anon, authenticated;

-- ============================================================
-- RPC: VALIDATE COUPON
-- ============================================================
create or replace function public.validate_coupon(p_code text, p_subtotal numeric)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare c public.coupons%rowtype; v_discount numeric := 0;
begin
  select * into c from public.coupons where upper(code) = upper(trim(p_code)) limit 1;
  if not found or c.is_active is false then
    return jsonb_build_object('valid', false, 'message', 'Invalid coupon code');
  end if;
  if c.valid_till is not null and c.valid_till < current_date then
    return jsonb_build_object('valid', false, 'message', 'This coupon has expired');
  end if;
  if c.valid_from is not null and c.valid_from > current_date then
    return jsonb_build_object('valid', false, 'message', 'This coupon is not active yet');
  end if;
  if c.usage_limit is not null and c.usage_count >= c.usage_limit then
    return jsonb_build_object('valid', false, 'message', 'This coupon has reached its usage limit');
  end if;
  if p_subtotal < coalesce(c.min_order_amount, 0) then
    return jsonb_build_object('valid', false, 'message', 'Minimum order of PKR ' || to_char(c.min_order_amount, 'FM999,999,999') || ' required');
  end if;

  if c.discount_type = 'percentage' then
    v_discount := round(p_subtotal * c.discount_value / 100);
    if c.max_discount_cap is not null then v_discount := least(v_discount, c.max_discount_cap); end if;
  elsif c.discount_type = 'fixed' then
    v_discount := least(c.discount_value, p_subtotal);
  else
    v_discount := 0;
  end if;

  return jsonb_build_object(
    'valid', true, 'code', c.code, 'discount_type', c.discount_type,
    'discount_value', c.discount_value, 'discount_amount', v_discount,
    'free_shipping', (c.discount_type = 'free_shipping'),
    'message', 'Coupon applied successfully'
  );
end; $$;

revoke all on function public.validate_coupon(text, numeric) from public;
grant execute on function public.validate_coupon(text, numeric) to anon, authenticated;

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table public.products   enable row level security;
alter table public.categories enable row level security;
alter table public.reviews    enable row level security;
alter table public.settings   enable row level security;
alter table public.coupons    enable row level security;
alter table public.orders     enable row level security;
alter table public.customers  enable row level security;

-- public read
drop policy if exists products_public_read on public.products;
create policy products_public_read on public.products for select to anon, authenticated using (is_active = true);

drop policy if exists categories_public_read on public.categories;
create policy categories_public_read on public.categories for select to anon, authenticated using (is_active = true);

drop policy if exists reviews_public_read on public.reviews;
create policy reviews_public_read on public.reviews for select to anon, authenticated using (is_approved = true);

drop policy if exists reviews_public_insert on public.reviews;
create policy reviews_public_insert on public.reviews for insert to anon, authenticated with check (is_approved = false);

drop policy if exists settings_public_read on public.settings;
create policy settings_public_read on public.settings for select to anon, authenticated using (true);

-- admin (authenticated) full control
drop policy if exists products_admin_all on public.products;
create policy products_admin_all on public.products for all to authenticated using (true) with check (true);

drop policy if exists categories_admin_all on public.categories;
create policy categories_admin_all on public.categories for all to authenticated using (true) with check (true);

drop policy if exists reviews_admin_all on public.reviews;
create policy reviews_admin_all on public.reviews for all to authenticated using (true) with check (true);

drop policy if exists settings_admin_all on public.settings;
create policy settings_admin_all on public.settings for all to authenticated using (true) with check (true);

drop policy if exists coupons_admin_all on public.coupons;
create policy coupons_admin_all on public.coupons for all to authenticated using (true) with check (true);

drop policy if exists orders_admin_all on public.orders;
create policy orders_admin_all on public.orders for all to authenticated using (true) with check (true);

drop policy if exists customers_admin_all on public.customers;
create policy customers_admin_all on public.customers for all to authenticated using (true) with check (true);
