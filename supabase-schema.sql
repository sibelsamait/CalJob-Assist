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
  created_at   timestamptz not null default now()
);
alter table public.subscriptions enable row level security;
create policy "staff_all_subs" on public.subscriptions for all using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin','tecnico'))
);

-- 4. SUPPORT TICKETS
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
