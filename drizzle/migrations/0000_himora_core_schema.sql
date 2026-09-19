-- ROLES
create type public.app_role as enum ('admin','customer');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  phone text,
  created_at timestamptz not null default now()
);
grant select, insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;
create policy "own profile read" on public.profiles for select to authenticated using (auth.uid() = id);
create policy "own profile insert" on public.profiles for insert to authenticated with check (auth.uid() = id);
create policy "own profile update" on public.profiles for update to authenticated using (auth.uid() = id);

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;
create policy "read own roles" on public.user_roles for select to authenticated using (auth.uid() = user_id);

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, email, phone)
  values (new.id, new.raw_user_meta_data->>'full_name', new.email, new.raw_user_meta_data->>'phone')
  on conflict (id) do nothing;
  insert into public.user_roles (user_id, role) values (new.id, 'customer') on conflict do nothing;
  return new;
end; $$;
create trigger on_auth_user_created after insert on auth.users
for each row execute function public.handle_new_user();

-- CATEGORIES
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  image_url text,
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
grant select on public.categories to anon, authenticated;
grant insert, update, delete on public.categories to authenticated;
grant all on public.categories to service_role;
alter table public.categories enable row level security;
create policy "categories public read" on public.categories for select to anon, authenticated using (true);
create policy "categories admin write" on public.categories for all to authenticated
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

-- PRODUCTS
create table public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  category_id uuid references public.categories(id) on delete set null,
  sku text,
  price numeric(10,2) not null,
  mrp numeric(10,2),
  material text,
  weight text,
  images text[] not null default '{}',
  specs jsonb not null default '{}'::jsonb,
  rating numeric(2,1) not null default 4.5,
  review_count int not null default 0,
  is_active boolean not null default true,
  is_featured boolean not null default false,
  is_new_arrival boolean not null default false,
  is_best_seller boolean not null default false,
  created_at timestamptz not null default now()
);
grant select on public.products to anon, authenticated;
grant insert, update, delete on public.products to authenticated;
grant all on public.products to service_role;
alter table public.products enable row level security;
create policy "products public read" on public.products for select to anon, authenticated using (true);
create policy "products admin write" on public.products for all to authenticated
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

create table public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  size text not null default 'Free Size',
  color text not null default 'Natural',
  sku text,
  stock int not null default 0,
  price_delta numeric(10,2) not null default 0,
  unique (product_id, size, color)
);
grant select on public.product_variants to anon, authenticated;
grant insert, update, delete on public.product_variants to authenticated;
grant all on public.product_variants to service_role;
alter table public.product_variants enable row level security;
create policy "variants public read" on public.product_variants for select to anon, authenticated using (true);
create policy "variants admin write" on public.product_variants for all to authenticated
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

-- ADDRESSES
create table public.addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  label text not null default 'Home',
  full_name text not null,
  phone text not null,
  house text,
  street text,
  area text,
  city text not null,
  state text not null,
  pincode text not null,
  country text not null default 'India',
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.addresses to authenticated;
grant all on public.addresses to service_role;
alter table public.addresses enable row level security;
create policy "own addresses" on public.addresses for all to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- COUPONS
create table public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  discount_type text not null default 'percent',
  discount_value numeric(10,2) not null,
  min_order_value numeric(10,2) not null default 0,
  max_discount numeric(10,2),
  expires_at timestamptz,
  usage_limit int,
  used_count int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
grant select on public.coupons to anon, authenticated;
grant insert, update, delete on public.coupons to authenticated;
grant all on public.coupons to service_role;
alter table public.coupons enable row level security;
create policy "coupons public read" on public.coupons for select to anon, authenticated using (is_active);
create policy "coupons admin write" on public.coupons for all to authenticated
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

-- ORDERS
create sequence public.order_seq start 1;
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  user_id uuid references auth.users(id) on delete set null,
  customer_name text not null,
  email text not null,
  phone text not null,
  shipping_address jsonb not null,
  subtotal numeric(10,2) not null,
  discount numeric(10,2) not null default 0,
  shipping numeric(10,2) not null default 0,
  tax numeric(10,2) not null default 0,
  total numeric(10,2) not null,
  coupon_code text,
  payment_method text not null default 'cod',
  payment_status text not null default 'pending',
  payment_reference text,
  status text not null default 'Order Placed',
  tracking_number text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update on public.orders to authenticated;
grant all on public.orders to service_role;
alter table public.orders enable row level security;
create policy "own orders read" on public.orders for select to authenticated
  using (auth.uid() = user_id or public.has_role(auth.uid(),'admin'));
create policy "admin orders update" on public.orders for update to authenticated
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  variant_id uuid references public.product_variants(id) on delete set null,
  product_name text not null,
  image_url text,
  size text,
  color text,
  unit_price numeric(10,2) not null,
  quantity int not null
);
grant select on public.order_items to authenticated;
grant all on public.order_items to service_role;
alter table public.order_items enable row level security;
create policy "order items read" on public.order_items for select to authenticated
  using (exists (select 1 from public.orders o where o.id = order_id and (o.user_id = auth.uid() or public.has_role(auth.uid(),'admin'))));

-- REVIEWS
create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  rating int not null check (rating between 1 and 5),
  title text,
  body text,
  is_visible boolean not null default true,
  created_at timestamptz not null default now()
);
grant select on public.reviews to anon, authenticated;
grant insert, update, delete on public.reviews to authenticated;
grant all on public.reviews to service_role;
alter table public.reviews enable row level security;
create policy "reviews public read" on public.reviews for select to anon, authenticated using (is_visible or public.has_role(auth.uid(),'admin'));
create policy "reviews own write" on public.reviews for insert to authenticated with check (auth.uid() = user_id);
create policy "reviews admin manage" on public.reviews for all to authenticated
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

-- WISHLIST
create table public.wishlists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, product_id)
);
grant select, insert, delete on public.wishlists to authenticated;
grant all on public.wishlists to service_role;
alter table public.wishlists enable row level security;
create policy "own wishlist" on public.wishlists for all to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- STORE SETTINGS
create table public.store_settings (
  id int primary key default 1 check (id = 1),
  hero_title text not null default 'Premium Woollen Wear for Every Winter',
  hero_subtitle text not null default 'Handcrafted in the Himalayas. Made to last a lifetime.',
  hero_image_url text,
  shipping_fee numeric(10,2) not null default 99,
  free_shipping_threshold numeric(10,2) not null default 2499,
  tax_percent numeric(5,2) not null default 5,
  cod_enabled boolean not null default true,
  delivery_days int not null default 5,
  updated_at timestamptz not null default now()
);
grant select on public.store_settings to anon, authenticated;
grant insert, update on public.store_settings to authenticated;
grant all on public.store_settings to service_role;
alter table public.store_settings enable row level security;
create policy "settings public read" on public.store_settings for select to anon, authenticated using (true);
create policy "settings admin write" on public.store_settings for all to authenticated
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
insert into public.store_settings (id) values (1);

-- PLACE ORDER (atomic, validates stock, decrements inventory)
create or replace function public.place_order(
  p_items jsonb,
  p_customer jsonb,
  p_address jsonb,
  p_payment_method text,
  p_coupon text default null
) returns public.orders
language plpgsql security definer set search_path = public as $$
declare
  v_item jsonb;
  v_variant public.product_variants;
  v_product public.products;
  v_subtotal numeric(10,2) := 0;
  v_discount numeric(10,2) := 0;
  v_shipping numeric(10,2) := 0;
  v_tax numeric(10,2) := 0;
  v_total numeric(10,2);
  v_settings public.store_settings;
  v_coupon public.coupons;
  v_order public.orders;
  v_number text;
  v_qty int;
  v_line numeric(10,2);
begin
  if auth.uid() is null then raise exception 'Not authenticated'; end if;
  if jsonb_array_length(p_items) = 0 then raise exception 'Cart is empty'; end if;
  select * into v_settings from public.store_settings where id = 1;

  for v_item in select * from jsonb_array_elements(p_items) loop
    v_qty := (v_item->>'quantity')::int;
    select * into v_variant from public.product_variants where id = (v_item->>'variant_id')::uuid for update;
    if v_variant is null then raise exception 'Product option not found'; end if;
    if v_variant.stock < v_qty then raise exception 'Insufficient stock'; end if;
    select * into v_product from public.products where id = v_variant.product_id;
    if v_product is null or not v_product.is_active then raise exception 'Product unavailable'; end if;
    v_subtotal := v_subtotal + (v_product.price + v_variant.price_delta) * v_qty;
  end loop;

  if p_coupon is not null and length(trim(p_coupon)) > 0 then
    select * into v_coupon from public.coupons
      where upper(code) = upper(trim(p_coupon)) and is_active
        and (expires_at is null or expires_at > now())
        and (usage_limit is null or used_count < usage_limit);
    if v_coupon.id is not null and v_subtotal >= v_coupon.min_order_value then
      if v_coupon.discount_type = 'percent' then
        v_discount := round(v_subtotal * v_coupon.discount_value / 100, 2);
        if v_coupon.max_discount is not null then v_discount := least(v_discount, v_coupon.max_discount); end if;
      else
        v_discount := least(v_coupon.discount_value, v_subtotal);
      end if;
      update public.coupons set used_count = used_count + 1 where id = v_coupon.id;
    end if;
  end if;

  if (v_subtotal - v_discount) < v_settings.free_shipping_threshold then
    v_shipping := v_settings.shipping_fee;
  end if;
  v_tax := round((v_subtotal - v_discount) * v_settings.tax_percent / 100, 2);
  v_total := v_subtotal - v_discount + v_shipping + v_tax;

  v_number := 'ORD-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('public.order_seq')::text, 5, '0');

  insert into public.orders (order_number, user_id, customer_name, email, phone, shipping_address,
    subtotal, discount, shipping, tax, total, coupon_code, payment_method, payment_status, status)
  values (v_number, auth.uid(), p_customer->>'full_name', p_customer->>'email', p_customer->>'phone', p_address,
    v_subtotal, v_discount, v_shipping, v_tax, v_total, nullif(trim(coalesce(p_coupon,'')),''),
    p_payment_method, case when p_payment_method = 'cod' then 'pending' else 'pending' end, 'Order Placed')
  returning * into v_order;

  for v_item in select * from jsonb_array_elements(p_items) loop
    v_qty := (v_item->>'quantity')::int;
    select * into v_variant from public.product_variants where id = (v_item->>'variant_id')::uuid;
    select * into v_product from public.products where id = v_variant.product_id;
    v_line := v_product.price + v_variant.price_delta;
    insert into public.order_items (order_id, product_id, variant_id, product_name, image_url, size, color, unit_price, quantity)
    values (v_order.id, v_product.id, v_variant.id, v_product.name,
      coalesce(v_product.images[1], null), v_variant.size, v_variant.color, v_line, v_qty);
    update public.product_variants set stock = stock - v_qty where id = v_variant.id;
  end loop;

  return v_order;
end; $$;
grant execute on function public.place_order(jsonb,jsonb,jsonb,text,text) to authenticated;
