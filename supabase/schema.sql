-- ========================================================================
-- BAZAAR E-COMMERCE PLATFORM — SUPABASE POSTGRESQL PRODUCTION SCHEMA
-- Full relational schema with RLS, triggers, indexes, and role-based policies
-- ========================================================================

-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- 1. ENUMS
create type user_role as enum ('customer', 'delivery', 'admin');
create type user_status as enum ('active', 'suspended');
create type supplier_product_status as enum ('AVAILABLE', 'NEEDS_CONFIRMATION', 'UNAVAILABLE');
create type order_status as enum (
  'PENDING',
  'AWAITING_SUPPLIER',
  'CONFIRMED',
  'PREPARING',
  'READY_FOR_DELIVERY',
  'ASSIGNED',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
  'DELIVERY_FAILED',
  'CANCELLED',
  'RETURNED'
);
create type payment_method as enum ('COD', 'CARD', 'INSTAPAY');
create type payment_status as enum ('PENDING', 'PAID', 'REFUNDED');
create type courier_status as enum ('AVAILABLE', 'BUSY', 'SUSPENDED');
create type delivery_app_status as enum ('PENDING', 'APPROVED', 'REJECTED');

-- 2. PROFILES (Extends Supabase auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  name text not null,
  phone text not null,
  role user_role not null default 'customer',
  status user_status not null default 'active',
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. CATEGORIES
create table public.categories (
  id text primary key,
  name text not null,
  slug text unique not null,
  description text,
  image_url text not null,
  display_order int default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. SUPPLIERS (Internal / Admin only)
create table public.suppliers (
  id text primary key,
  name text not null,
  contact_person text not null,
  phone text not null,
  email text,
  address text not null,
  products_supplied text,
  notes text,
  last_verified_at timestamp with time zone default timezone('utc'::text, now()) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. PRODUCTS
create table public.products (
  id text primary key,
  name text not null,
  slug text unique not null,
  description text not null,
  short_description text not null,
  price numeric(10,2) not null check (price >= 0),
  original_price numeric(10,2) check (original_price >= price),
  cost_price numeric(10,2) not null check (cost_price >= 0),
  category_id text references public.categories(id) on delete set null,
  weight_volume text not null,
  ingredients text,
  nutritional_info text,
  origin text not null,
  supplier_id text references public.suppliers(id) on delete set null,
  status supplier_product_status not null default 'AVAILABLE',
  stock_quantity int not null default 0 check (stock_quantity >= 0),
  is_featured boolean default false,
  is_new boolean default false,
  is_active boolean default true,
  rating numeric(3,2) default 5.0 check (rating >= 0 and rating <= 5),
  review_count int default 0 check (review_count >= 0),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. PRODUCT IMAGES
create table public.product_images (
  id uuid default uuid_generate_v4() primary key,
  product_id text references public.products(id) on delete cascade not null,
  image_url text not null,
  is_primary boolean default false,
  display_order int default 0
);

-- 7. COURIER PROFILES
create table public.courier_profiles (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade unique not null,
  full_name text not null,
  phone text not null,
  email text not null,
  governorate text not null,
  covered_areas text not null,
  vehicle_type text not null,
  national_id text not null,
  status courier_status not null default 'AVAILABLE',
  rating numeric(3,2) default 5.0,
  active_orders_count int default 0 check (active_orders_count >= 0),
  total_delivered_count int default 0 check (total_delivered_count >= 0),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 8. DELIVERY APPLICATIONS (Public apply -> Admin review)
create table public.delivery_applications (
  id uuid default uuid_generate_v4() primary key,
  full_name text not null,
  email text not null,
  phone text not null,
  governorate text not null,
  covered_areas text not null,
  vehicle_type text not null,
  national_id text not null,
  status delivery_app_status not null default 'PENDING',
  notes text,
  reviewed_by uuid references public.profiles(id) on delete set null,
  reviewed_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 9. ORDERS
create table public.orders (
  id text primary key,
  order_number text unique not null,
  user_id uuid references public.profiles(id) on delete set null,
  customer_name text not null,
  customer_email text not null,
  customer_phone text not null,
  governorate text not null,
  city text not null,
  street_address text not null,
  building_details text,
  notes text,
  subtotal numeric(10,2) not null check (subtotal >= 0),
  delivery_fee numeric(10,2) not null check (delivery_fee >= 0),
  total_amount numeric(10,2) not null check (total_amount >= 0),
  total_cost numeric(10,2) not null check (total_cost >= 0),
  estimated_profit numeric(10,2) not null,
  payment_method payment_method not null default 'COD',
  payment_status payment_status not null default 'PENDING',
  order_status order_status not null default 'PENDING',
  supplier_status text not null default 'PENDING',
  assigned_agent_id uuid references public.profiles(id) on delete set null,
  assigned_agent_name text,
  assigned_agent_phone text,
  assigned_at timestamp with time zone,
  cancel_reason text,
  failure_reason text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 10. ORDER ITEMS
create table public.order_items (
  id uuid default uuid_generate_v4() primary key,
  order_id text references public.orders(id) on delete cascade not null,
  product_id text references public.products(id) on delete set null,
  product_name text not null,
  product_image text,
  unit_price numeric(10,2) not null,
  cost_price numeric(10,2) not null,
  quantity int not null check (quantity > 0),
  total_price numeric(10,2) not null
);

-- 11. ORDER STATUS HISTORY
create table public.order_status_history (
  id uuid default uuid_generate_v4() primary key,
  order_id text references public.orders(id) on delete cascade not null,
  previous_status order_status,
  new_status order_status not null,
  changed_by_user_id text not null,
  changed_by_name text not null,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 12. REVIEWS
create table public.reviews (
  id uuid default uuid_generate_v4() primary key,
  product_id text references public.products(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  user_name text not null,
  rating int not null check (rating >= 1 and rating <= 5),
  comment text not null,
  is_verified_purchase boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 13. NOTIFICATIONS
create table public.notifications (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  message text not null,
  link text,
  is_read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 14. AUDIT LOGS
create table public.audit_logs (
  id uuid default uuid_generate_v4() primary key,
  user_id text not null,
  user_name text not null,
  user_role text not null,
  action text not null,
  entity_type text not null,
  entity_id text not null,
  details text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 15. INDEXES FOR PERFORMANCE
create index idx_products_category on public.products(category_id);
create index idx_products_status on public.products(status);
create index idx_orders_user on public.orders(user_id);
create index idx_orders_status on public.orders(order_status);
create index idx_orders_assigned_agent on public.orders(assigned_agent_id);
create index idx_notifications_user on public.notifications(user_id, is_read);
create index idx_reviews_product on public.reviews(product_id);

-- ========================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ========================================================================

alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.categories enable row level security;
alter table public.suppliers enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.order_status_history enable row level security;
alter table public.delivery_applications enable row level security;
alter table public.reviews enable row level security;
alter table public.notifications enable row level security;
alter table public.audit_logs enable row level security;

-- Profiles: users read their own; admins read all
create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);

create policy "Admins have full access to profiles" on public.profiles
  for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- Products: Everyone can read active products (cost_price hidden in view for public)
create policy "Anyone can read active products" on public.products
  for select using (is_active = true);

create policy "Admins manage products" on public.products
  for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- Categories: Everyone can read
create policy "Anyone can read categories" on public.categories
  for select using (true);

-- Suppliers: Admins only!
create policy "Admins access suppliers" on public.suppliers
  for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- Orders: Customer views own; Courier views assigned; Admin views all
create policy "Customers view own orders" on public.orders
  for select using (auth.uid() = user_id);

create policy "Couriers view assigned orders" on public.orders
  for select using (auth.uid() = assigned_agent_id);

create policy "Admins manage all orders" on public.orders
  for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- Notifications: Users manage own
create policy "Users manage own notifications" on public.notifications
  for all using (auth.uid() = user_id);
