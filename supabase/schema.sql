-- The Art of Lifestyle — database schema
-- Run this once in Supabase: Dashboard -> SQL Editor -> New query -> paste -> Run

create extension if not exists "pgcrypto";

-- ---------- SETTINGS (single row) ----------
create table if not exists settings (
  id smallint primary key default 1,
  shop_name text not null default 'The Art of Lifestyle',
  owner_name text not null default 'Arti',
  tagline text not null default 'Every measurement tells a story.',
  subline text not null default 'Bespoke lehengas, bridal couture and everyday elegance — cut, fitted and finished by Arti Boutique.',
  hero_image text not null default '/hero.jpg',
  address text not null default '12, Main Bazaar Road, Malad West, Mumbai, Maharashtra – 400064',
  phone text not null default '+91 88888 88888',
  whatsapp text not null default '+91 88888 88888',
  email text not null default 'support@theartoflifestyle.com',
  instagram text not null default 'theartoflifestyle',
  facebook text not null default 'theartoflifestyle',
  hours text not null default 'Tues – Sun, 11:00 AM – 8:00 PM (Closed Mondays)',
  staff_pin text not null default '1234',
  constraint single_row check (id = 1)
);
insert into settings (id) values (1) on conflict (id) do nothing;

-- ---------- CATEGORIES ----------
create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  image text,
  created_at timestamptz not null default now()
);

-- ---------- SKUS (designs) ----------
create table if not exists skus (
  id uuid primary key default gen_random_uuid(),
  sku text not null,
  name text not null,
  category_id uuid references categories(id) on delete cascade,
  price numeric not null default 0,
  image text,
  description text,
  trending boolean not null default false,
  created_at timestamptz not null default now()
);

-- ---------- ALTERATION SERVICES ----------
create table if not exists alterations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  price numeric not null default 0,
  description text,
  created_at timestamptz not null default now()
);

-- ---------- BILL NUMBER COUNTER ----------
create table if not exists bill_counter (
  id smallint primary key default 1,
  counter int not null default 1,
  constraint single_row_counter check (id = 1)
);
insert into bill_counter (id, counter) values (1, 1) on conflict (id) do nothing;

-- ---------- BILLS ----------
create table if not exists bills (
  id uuid primary key default gen_random_uuid(),
  bill_no text not null,
  bill_date date not null default current_date,
  status text not null default 'Pending',
  customer_name text not null,
  customer_phone text not null,
  customer_address text,
  expected_delivery date,
  items jsonb not null default '[]',
  measurements jsonb not null default '{}',
  subtotal numeric not null default 0,
  discount numeric not null default 0,
  advance numeric not null default 0,
  total numeric not null default 0,
  balance numeric not null default 0,
  notes text,
  created_at timestamptz not null default now()
);

-- ---------- ENQUIRIES (contact form leads) ----------
create table if not exists enquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  message text,
  enquiry_date date not null default current_date,
  handled boolean not null default false,
  created_at timestamptz not null default now()
);

-- ---------- ATOMIC BILL NUMBER GENERATOR ----------
-- A single UPDATE...RETURNING statement is atomic in Postgres, so this is
-- safe even if two employees save a bill at the exact same second.
create or replace function next_bill_no() returns text as $$
declare
  n int;
  yr text := to_char(current_date, 'YYYY');
begin
  update bill_counter set counter = counter + 1 where id = 1 returning counter - 1 into n;
  return 'AOL-' || yr || '-' || lpad(n::text, 4, '0');
end;
$$ language plpgsql;

-- ---------- ROW LEVEL SECURITY ----------
-- All reads/writes in this app go through Next.js API routes using the
-- service role key on the server, so RLS can stay locked down by default.
alter table settings enable row level security;
alter table categories enable row level security;
alter table skus enable row level security;
alter table alterations enable row level security;
alter table bills enable row level security;
alter table enquiries enable row level security;
alter table bill_counter enable row level security;
-- (No policies are added on purpose — the anon key therefore cannot read or
-- write anything directly; only the service role key used by the API routes can.)

-- ---------- SEED DATA ----------
insert into categories (id, name, image) values
  ('11111111-1111-1111-1111-111111111111', 'Blouse', 'https://picsum.photos/seed/aol-blouse/700/900'),
  ('22222222-2222-2222-2222-222222222222', 'Suit', 'https://picsum.photos/seed/aol-suit/700/900'),
  ('33333333-3333-3333-3333-333333333333', 'Lehenga', 'https://picsum.photos/seed/aol-lehenga/700/900'),
  ('44444444-4444-4444-4444-444444444444', 'Kurta', 'https://picsum.photos/seed/aol-kurta/700/900'),
  ('55555555-5555-5555-5555-555555555555', 'Bridal Wear', 'https://picsum.photos/seed/aol-bridal/700/900')
on conflict (id) do nothing;

insert into skus (sku, name, category_id, price, image, description, trending) values
  ('AOL-BL-101', 'Royal Zari Blouse', '11111111-1111-1111-1111-111111111111', 2200, 'https://picsum.photos/seed/aol-bl101/600/760', 'A structured silk blouse finished with hand-laid zari borders, built to anchor a heavier lehenga or saree.', true),
  ('AOL-BL-102', 'Mirror-Work Blouse', '11111111-1111-1111-1111-111111111111', 1800, 'https://picsum.photos/seed/aol-bl102/600/760', 'Panels of hand-stitched mirror work over raw silk, cut close to the body for a festive fit.', false),
  ('AOL-BL-103', 'Classic Silk Blouse', '11111111-1111-1111-1111-111111111111', 1200, 'https://picsum.photos/seed/aol-bl103/600/760', 'Our everyday pattern — plain silk, clean seams, stitched exactly to your blouse measurements.', false),
  ('AOL-SU-201', 'Chikankari Anarkali Suit', '22222222-2222-2222-2222-222222222222', 4500, 'https://picsum.photos/seed/aol-su201/600/760', 'Lucknowi hand-embroidery over a flared anarkali silhouette, paired with matching dupatta.', true),
  ('AOL-SU-202', 'Straight-Cut Cotton Suit', '22222222-2222-2222-2222-222222222222', 2800, 'https://picsum.photos/seed/aol-su202/600/760', 'A breathable cotton three-piece for everyday wear, tailored in a relaxed straight cut.', false),
  ('AOL-SU-203', 'Palazzo Suit Set', '22222222-2222-2222-2222-222222222222', 3200, 'https://picsum.photos/seed/aol-su203/600/760', 'Wide-leg palazzo paired with a short kurti and printed dupatta — built for movement.', false),
  ('AOL-LE-301', 'Bridal Zardozi Lehenga', '33333333-3333-3333-3333-333333333333', 28000, 'https://picsum.photos/seed/aol-le301/600/760', 'Our signature bridal piece — dense zardozi hand-work on silk, fully lined and boned for support.', true),
  ('AOL-LE-302', 'Festive Georgette Lehenga', '33333333-3333-3333-3333-333333333333', 12500, 'https://picsum.photos/seed/aol-le302/600/760', 'Flowing georgette with sequin embroidery, light enough for sangeet nights and long functions.', true),
  ('AOL-LE-303', 'Banarasi Silk Lehenga', '33333333-3333-3333-3333-333333333333', 18500, 'https://picsum.photos/seed/aol-le303/600/760', 'Woven Banarasi silk with a contrast dupatta border, tailored for receptions and pujas.', false),
  ('AOL-KU-401', 'Hand-Block Print Kurta', '44444444-4444-4444-4444-444444444444', 1600, 'https://picsum.photos/seed/aol-ku401/600/760', 'Jaipuri hand-block print on soft cotton, cut in a straight kurta silhouette.', false),
  ('AOL-KU-402', 'Embroidered Festive Kurta', '44444444-4444-4444-4444-444444444444', 2400, 'https://picsum.photos/seed/aol-ku402/600/760', 'Thread-embroidered yoke over a flared kurta, styled for festive daywear.', false),
  ('AOL-KU-403', 'Everyday Cotton Kurta', '44444444-4444-4444-4444-444444444444', 950, 'https://picsum.photos/seed/aol-ku403/600/760', 'Our simplest pattern — pure cotton, minimal fuss, stitched to your exact size.', false),
  ('AOL-BR-501', 'Reception Gown Lehenga', '55555555-5555-5555-5555-555555555555', 32000, 'https://picsum.photos/seed/aol-br501/600/760', 'A gown-cut lehenga with a fitted bodice and trailing skirt, designed for reception entrances.', true),
  ('AOL-BR-502', 'Sangeet Cape Lehenga', '55555555-5555-5555-5555-555555555555', 15500, 'https://picsum.photos/seed/aol-br502/600/760', 'A lehenga set with a detachable embellished cape, built for sangeet-night choreography.', false)
on conflict do nothing;

insert into alterations (name, price, description) values
  ('Blouse resizing', 250, 'Taking in or letting out an existing blouse to fit correctly.'),
  ('Lehenga waist adjustment', 450, 'Refitting the waistband and skirt drape without disturbing the work.'),
  ('Kurta length alteration', 200, 'Shortening or extending kurta length, hem re-finished by hand.'),
  ('Sleeve refitting', 180, 'Adjusting sleeve width or length on blouses, kurtas and suits.'),
  ('Zipper / hook replacement', 150, 'Replacing worn zippers, hooks or button closures.'),
  ('Embroidery repair', 300, 'Starting price — restoring loose or damaged embroidery and mirror work.')
on conflict do nothing;
