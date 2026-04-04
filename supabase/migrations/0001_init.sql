create extension if not exists "pgcrypto";

create type public.user_role as enum ('agency_admin', 'tenant_admin', 'tenant_staff');
create type public.tenant_status as enum ('trialing', 'active', 'past_due', 'paused', 'blocked');
create type public.package_tier as enum ('starter', 'pro', 'plus');
create type public.niche_type as enum ('steigerbouw');
create type public.module_key as enum ('materials', 'blueprints', 'safety_docs', 'notes', 'photos', 'timeline');
create type public.project_status as enum ('draft', 'planned', 'active', 'inspection', 'completed');
create type public.file_kind as enum ('photo', 'blueprint', 'safety', 'other');

create table public.tenants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  niche public.niche_type not null default 'steigerbouw',
  package_tier public.package_tier not null default 'starter',
  status public.tenant_status not null default 'trialing',
  stripe_customer_id text,
  contact_name text not null,
  contact_email text not null,
  created_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  tenant_id uuid references public.tenants (id) on delete cascade,
  role public.user_role not null,
  full_name text not null,
  email text not null,
  created_at timestamptz not null default now()
);

create table public.tenant_module_settings (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants (id) on delete cascade,
  module_key public.module_key not null,
  enabled boolean not null default true,
  unique (tenant_id, module_key)
);

create table public.custom_field_definitions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants (id) on delete cascade,
  label text not null,
  field_key text not null,
  input_type text not null check (input_type in ('text', 'textarea', 'date', 'number')),
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  unique (tenant_id, field_key)
);

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants (id) on delete cascade,
  client_name text not null,
  site_address text not null,
  site_city text not null,
  status public.project_status not null default 'draft',
  material_summary text not null default '',
  safety_status text not null check (safety_status in ('missing', 'pending', 'approved')) default 'missing',
  start_date date,
  created_at timestamptz not null default now()
);

create table public.project_notes (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants (id) on delete cascade,
  project_id uuid not null references public.projects (id) on delete cascade,
  author_id uuid references public.profiles (id) on delete set null,
  body text not null,
  created_at timestamptz not null default now()
);

create table public.project_files (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants (id) on delete cascade,
  project_id uuid not null references public.projects (id) on delete cascade,
  kind public.file_kind not null default 'other',
  bucket_path text not null,
  file_name text not null,
  created_at timestamptz not null default now()
);

create table public.project_custom_field_values (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants (id) on delete cascade,
  project_id uuid not null references public.projects (id) on delete cascade,
  field_definition_id uuid not null references public.custom_field_definitions (id) on delete cascade,
  value_text text,
  created_at timestamptz not null default now(),
  unique (project_id, field_definition_id)
);

create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null unique references public.tenants (id) on delete cascade,
  stripe_customer_id text not null,
  stripe_subscription_id text,
  stripe_price_id text not null,
  package_tier public.package_tier not null,
  status public.tenant_status not null default 'trialing',
  current_period_end timestamptz,
  trial_ends_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references public.tenants (id) on delete cascade,
  actor_profile_id uuid references public.profiles (id) on delete set null,
  action text not null,
  target_table text not null,
  target_id text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create or replace function public.current_tenant_id()
returns uuid
language sql
security definer
set search_path = public
as $$
  select tenant_id from public.profiles where id = auth.uid()
$$;

create or replace function public.is_agency_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'agency_admin'
  )
$$;

alter table public.tenants enable row level security;
alter table public.profiles enable row level security;
alter table public.tenant_module_settings enable row level security;
alter table public.custom_field_definitions enable row level security;
alter table public.projects enable row level security;
alter table public.project_notes enable row level security;
alter table public.project_files enable row level security;
alter table public.project_custom_field_values enable row level security;
alter table public.subscriptions enable row level security;
alter table public.audit_logs enable row level security;

create policy "agency admins can manage tenants"
on public.tenants
for all
using (public.is_agency_admin())
with check (public.is_agency_admin());

create policy "users can read own profile"
on public.profiles
for select
using (id = auth.uid() or public.is_agency_admin());

create policy "agency admins can manage profiles"
on public.profiles
for all
using (public.is_agency_admin())
with check (public.is_agency_admin());

create policy "tenant scoped module access"
on public.tenant_module_settings
for all
using (public.is_agency_admin() or tenant_id = public.current_tenant_id())
with check (public.is_agency_admin() or tenant_id = public.current_tenant_id());

create policy "tenant scoped custom fields"
on public.custom_field_definitions
for all
using (public.is_agency_admin() or tenant_id = public.current_tenant_id())
with check (public.is_agency_admin() or tenant_id = public.current_tenant_id());

create policy "tenant scoped projects"
on public.projects
for all
using (public.is_agency_admin() or tenant_id = public.current_tenant_id())
with check (public.is_agency_admin() or tenant_id = public.current_tenant_id());

create policy "tenant scoped notes"
on public.project_notes
for all
using (public.is_agency_admin() or tenant_id = public.current_tenant_id())
with check (public.is_agency_admin() or tenant_id = public.current_tenant_id());

create policy "tenant scoped files"
on public.project_files
for all
using (public.is_agency_admin() or tenant_id = public.current_tenant_id())
with check (public.is_agency_admin() or tenant_id = public.current_tenant_id());

create policy "tenant scoped custom field values"
on public.project_custom_field_values
for all
using (public.is_agency_admin() or tenant_id = public.current_tenant_id())
with check (public.is_agency_admin() or tenant_id = public.current_tenant_id());

create policy "tenant scoped subscriptions"
on public.subscriptions
for select
using (public.is_agency_admin() or tenant_id = public.current_tenant_id());

create policy "agency manages subscriptions"
on public.subscriptions
for all
using (public.is_agency_admin())
with check (public.is_agency_admin());

create policy "tenant scoped audit logs"
on public.audit_logs
for select
using (public.is_agency_admin() or tenant_id = public.current_tenant_id());

create policy "agency manages audit logs"
on public.audit_logs
for insert
with check (public.is_agency_admin() or tenant_id = public.current_tenant_id());

insert into storage.buckets (id, name, public)
values ('tenant-files', 'tenant-files', false)
on conflict (id) do nothing;

create policy "tenant storage read"
on storage.objects
for select
using (
  bucket_id = 'tenant-files'
  and (
    public.is_agency_admin()
    or split_part(name, '/', 1)::uuid = public.current_tenant_id()
  )
);

create policy "tenant storage write"
on storage.objects
for insert
with check (
  bucket_id = 'tenant-files'
  and (
    public.is_agency_admin()
    or split_part(name, '/', 1)::uuid = public.current_tenant_id()
  )
);

create policy "tenant storage delete"
on storage.objects
for delete
using (
  bucket_id = 'tenant-files'
  and (
    public.is_agency_admin()
    or split_part(name, '/', 1)::uuid = public.current_tenant_id()
  )
);

