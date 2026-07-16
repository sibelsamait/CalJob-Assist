-- ============================================================
--  CalJob Assist — Supabase Schema
--  Ejecutar en: Supabase Dashboard > SQL Editor
-- ============================================================

-- 1. PROFILES (vinculado a auth.users)
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text,
  role        text not null default 'user' check (role in ('user','tecnico','admin')),
  plan        text not null default 'personal' check (plan in ('personal','team','enterprise','internal')),
  company_id  uuid,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
alter table public.profiles enable row level security;
-- Los usuarios solo ven su propio perfil; admin ve todos
create policy "profile_own_read"   on public.profiles for select using (auth.uid() = id);
create policy "profile_own_update" on public.profiles for update using (auth.uid() = id);
create policy "admin_all_profiles" on public.profiles for all using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
);
-- Trigger: crear perfil automáticamente al registrar usuario
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name');
  return new;
end;
$$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 2. COMPANIES
create table if not exists public.companies (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  rut           text unique not null,
  contact_email text,
  plan          text not null default 'personal' check (plan in ('personal','team','enterprise')),
  status        text not null default 'trial' check (status in ('active','trial','suspended','inactive')),
  users_count   int not null default 0,
  created_at    timestamptz not null default now()
);
alter table public.companies enable row level security;
-- Solo staff ve todas las empresas; usuarios solo ven la suya
create policy "staff_all_companies" on public.companies for all using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin','tecnico'))
);
create policy "user_own_company" on public.companies for select using (
  id in (select company_id from public.profiles where id = auth.uid())
);

-- 3. SUBSCRIPTIONS / PAYMENTS
create table if not exists public.subscriptions (
  id           uuid primary key default gen_random_uuid(),
  company_id   uuid not null references public.companies(id) on delete cascade,
  plan         text not null,
  amount       int not null default 0,   -- en pesos CLP
  status       text not null default 'trial' check (status in ('trial','paid','failed','refunded','cancelled')),
  period       text,                      -- 'Jul 2026'
  stripe_pi_id text,                      -- Stripe PaymentIntent ID
  paid_at      timestamptz,
  refunded_at  timestamptz,
  notes        text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
alter table public.subscriptions enable row level security;
create policy "staff_all_subs" on public.subscriptions for all using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin','tecnico'))
);
create policy "company_subscriptions" on public.subscriptions for select using (
  company_id in (select company_id from public.profiles where id = auth.uid())
);

-- 4. PAYMENT REQUESTS
create table if not exists public.payment_requests (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  company_id    uuid references public.companies(id) on delete set null,
  plan_key      text not null,
  entity_type   text not null check (entity_type in ('natural_person','private_company','public_entity')),
  payment_method text not null,
  status        text not null default 'pending_payment' check (status in ('pending_payment','pending_approval','pending_contract','authorized','failed','cancelled','completed')),
  amount        int,
  currency      text not null default 'CLP',
  external_id   text,
  checkout_url  text,
  expires_at    timestamptz,
  metadata      jsonb,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
alter table public.payment_requests enable row level security;
create policy "insert_payment_request" on public.payment_requests for insert with check (user_id = auth.uid());
create policy "select_own_payment_requests" on public.payment_requests for select using (user_id = auth.uid());
create policy "staff_all_payment_requests" on public.payment_requests for all using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin','tecnico'))
);

-- 5. SEARCH HISTORY
create table if not exists public.search_history (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  query_type  text not null,
  query_text  text not null,
  metadata    jsonb,
  created_at  timestamptz not null default now()
);
alter table public.search_history enable row level security;
create policy "user_search_history" on public.search_history for select using (user_id = auth.uid());
create policy "insert_search_history" on public.search_history for insert with check (user_id = auth.uid());
create policy "staff_all_search_history" on public.search_history for all using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin','tecnico'))
);

-- 6. LICENSES
create table if not exists public.licenses (
  id          uuid primary key default gen_random_uuid(),
  company_id  uuid not null references public.companies(id) on delete cascade,
  user_id     uuid references auth.users(id) on delete set null,
  plan        text not null,
  status      text not null default 'active' check (status in ('active','expired','suspended','revoked','pending')),
  starts_at   timestamptz,
  ends_at     timestamptz,
  metadata    jsonb,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
alter table public.licenses enable row level security;
create policy "company_license_select" on public.licenses for select using (
  company_id in (select company_id from public.profiles where id = auth.uid())
);
create policy "company_license_insert" on public.licenses for insert with check (
  company_id in (select company_id from public.profiles where id = auth.uid())
);
create policy "staff_all_licenses" on public.licenses for all using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin','tecnico'))
);

-- 7. CONTRACTS
create table if not exists public.contracts (
  id           uuid primary key default gen_random_uuid(),
  company_id   uuid not null references public.companies(id) on delete cascade,
  title        text not null,
  description  text,
  status       text not null default 'draft' check (status in ('draft','pending_signature','signed','cancelled')),
  amount       int,
  currency     text not null default 'CLP',
  agreement_url text,
  signed_at    timestamptz,
  metadata     jsonb,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
alter table public.contracts enable row level security;
create policy "company_contract_select" on public.contracts for select using (
  company_id in (select company_id from public.profiles where id = auth.uid())
);
create policy "company_contract_insert" on public.contracts for insert with check (
  company_id in (select company_id from public.profiles where id = auth.uid())
);
create policy "staff_all_contracts" on public.contracts for all using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin','tecnico'))
);

-- 8. PURCHASE ORDERS
create table if not exists public.purchase_orders (
  id            uuid primary key default gen_random_uuid(),
  contract_id   uuid references public.contracts(id) on delete set null,
  company_id    uuid not null references public.companies(id) on delete cascade,
  order_number  text unique not null,
  status        text not null default 'pending_review' check (status in ('pending_review','approved','rejected','completed','cancelled')),
  total_amount  int not null,
  currency      text not null default 'CLP',
  metadata      jsonb,
  issued_at     timestamptz,
  due_date      timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
alter table public.purchase_orders enable row level security;
create policy "company_po_select" on public.purchase_orders for select using (
  company_id in (select company_id from public.profiles where id = auth.uid())
);
create policy "company_po_insert" on public.purchase_orders for insert with check (
  company_id in (select company_id from public.profiles where id = auth.uid())
);
create policy "staff_all_purchase_orders" on public.purchase_orders for all using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin','tecnico'))
);

-- 9. INVOICES
create table if not exists public.invoices (
  id               uuid primary key default gen_random_uuid(),
  company_id        uuid not null references public.companies(id) on delete cascade,
  purchase_order_id uuid references public.purchase_orders(id) on delete set null,
  number           text unique not null,
  status           text not null default 'draft' check (status in ('draft','issued','paid','overdue','cancelled')),
  issue_date       timestamptz,
  due_date         timestamptz,
  total_amount     int not null,
  currency         text not null default 'CLP',
  pdf_path         text,
  metadata         jsonb,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
alter table public.invoices enable row level security;
create policy "company_invoice_select" on public.invoices for select using (
  company_id in (select company_id from public.profiles where id = auth.uid())
);
create policy "company_invoice_insert" on public.invoices for insert with check (
  company_id in (select company_id from public.profiles where id = auth.uid())
);
create policy "staff_all_invoices" on public.invoices for all using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin','tecnico'))
);

-- 10. SUPPORT TICKETS
create table if not exists public.tickets (
  id           uuid primary key default gen_random_uuid(),
  company_id   uuid references public.companies(id) on delete set null,
  user_id      uuid references auth.users(id) on delete set null,
  user_email   text,
  subject      text not null,
  description  text not null,
  status       text not null default 'open' check (status in ('open','in_progress','resolved','closed')),
  priority     text not null default 'medium' check (priority in ('low','medium','high','critical')),
  resolution   text,
  assigned_to  uuid references auth.users(id) on delete set null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
alter table public.tickets enable row level security;
create policy "staff_all_tickets" on public.tickets for all using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin','tecnico'))
);
create policy "user_own_tickets" on public.tickets for select using (user_id = auth.uid());
create policy "user_create_ticket" on public.tickets for insert with check (user_id = auth.uid());

-- 5. AUDIT LOG (inmutable)
create table if not exists public.audit_log (
  id          bigserial primary key,
  user_id     uuid references auth.users(id) on delete set null,
  action      text not null,       -- 'calculate_finiquito', 'export_pdf', etc.
  entity      text,                -- 'finiquito', 'ticket', 'subscription'
  entity_id   text,
  metadata    jsonb,
  ip_address  inet,
  created_at  timestamptz not null default now()
);
alter table public.audit_log enable row level security;
create policy "staff_all_audit" on public.audit_log for select using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin','tecnico'))
);

-- 11. WEBHOOK DELIVERIES (monitor + retries)
create table if not exists public.webhook_deliveries (
  id           uuid primary key default gen_random_uuid(),
  provider     text not null,
  endpoint     text not null,
  payload      jsonb,
  headers      jsonb,
  status       text not null default 'pending' check (status in ('pending','delivered','failed')),
  attempts     int not null default 0,
  last_error   text,
  delivered_at timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
alter table public.webhook_deliveries enable row level security;
create policy "staff_all_webhooks" on public.webhook_deliveries for all using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin','tecnico'))
);

create policy "insert_own_audit" on public.audit_log for insert with check (user_id = auth.uid());

-- 6. DOCUMENTS (PDFs generados)
create table if not exists public.documents (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete cascade,
  company_id  uuid references public.companies(id) on delete cascade,
  type        text not null,       -- 'finiquito','citacion','acta_mediacion','informe'
  title       text not null,
  storage_path text,               -- path en Supabase Storage
  metadata    jsonb,
  created_at  timestamptz not null default now()
);
alter table public.documents enable row level security;
create policy "user_own_docs" on public.documents for all using (user_id = auth.uid());
create policy "staff_all_docs"  on public.documents for select using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin','tecnico'))
);

-- ============================================================
--  Storage bucket para PDFs
-- ============================================================
-- Ejecutar en Storage > New Bucket: "documents" (privado)
-- La política de acceso se maneja via RLS en la tabla documents
-- y signed URLs generados desde el servidor.
