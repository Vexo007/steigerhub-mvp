create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants (id) on delete cascade,
  name text not null,
  status text not null default 'active' check (status in ('lead', 'active', 'archived')),
  notes text not null default '',
  created_at timestamptz not null default now()
);

create unique index if not exists customers_tenant_name_idx on public.customers (tenant_id, lower(name));

create table if not exists public.customer_contacts (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants (id) on delete cascade,
  customer_id uuid not null references public.customers (id) on delete cascade,
  full_name text not null,
  email text not null default '',
  phone text not null default '',
  role_label text not null default '',
  is_primary boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.customer_addresses (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants (id) on delete cascade,
  customer_id uuid not null references public.customers (id) on delete cascade,
  label text not null default 'Hoofdadres',
  street text not null,
  postal_code text not null default '',
  city text not null,
  country text not null default 'Nederland',
  access_notes text not null default '',
  created_at timestamptz not null default now()
);

alter table public.projects
  add column if not exists customer_id uuid references public.customers (id) on delete set null,
  add column if not exists address_id uuid references public.customer_addresses (id) on delete set null;

create table if not exists public.project_tasks (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants (id) on delete cascade,
  project_id uuid not null references public.projects (id) on delete cascade,
  assigned_to uuid references public.profiles (id) on delete set null,
  title text not null,
  task_type text not null default 'general',
  status text not null default 'todo' check (status in ('todo', 'planned', 'in_progress', 'blocked', 'done')),
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high')),
  due_date timestamptz,
  notes text not null default '',
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.project_documents (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants (id) on delete cascade,
  project_id uuid references public.projects (id) on delete cascade,
  customer_id uuid references public.customers (id) on delete set null,
  category text not null default 'other' check (category in ('inspection', 'drawing', 'safety_sheet', 'contract', 'certificate', 'other')),
  title text not null,
  bucket_path text not null,
  file_name text not null,
  expires_at timestamptz,
  uploaded_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.project_material_items (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants (id) on delete cascade,
  project_id uuid not null references public.projects (id) on delete cascade,
  name text not null,
  quantity numeric(12,2) not null default 0,
  unit text not null default 'stuks',
  notes text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists public.project_incidents (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants (id) on delete cascade,
  project_id uuid references public.projects (id) on delete set null,
  customer_id uuid references public.customers (id) on delete set null,
  title text not null,
  description text not null default '',
  severity text not null default 'medium' check (severity in ('low', 'medium', 'high', 'critical')),
  status text not null default 'open' check (status in ('open', 'investigating', 'resolved', 'closed')),
  reported_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

create table if not exists public.reminders (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants (id) on delete cascade,
  project_id uuid references public.projects (id) on delete cascade,
  task_id uuid references public.project_tasks (id) on delete cascade,
  kind text not null default 'follow_up' check (kind in ('expiry', 'inspection', 'follow_up', 'subscription')),
  title text not null,
  due_at timestamptz not null,
  status text not null default 'pending' check (status in ('pending', 'sent', 'completed')),
  created_at timestamptz not null default now()
);

insert into public.customers (tenant_id, name)
select distinct p.tenant_id, p.client_name
from public.projects p
where p.client_name is not null and p.client_name <> ''
on conflict do nothing;

insert into public.customer_addresses (tenant_id, customer_id, label, street, city)
select distinct
  p.tenant_id,
  c.id,
  'Projectadres',
  p.site_address,
  p.site_city
from public.projects p
join public.customers c
  on c.tenant_id = p.tenant_id
 and lower(c.name) = lower(p.client_name)
where p.site_address is not null and p.site_address <> ''
on conflict do nothing;

update public.projects p
set customer_id = c.id
from public.customers c
where c.tenant_id = p.tenant_id
  and lower(c.name) = lower(p.client_name)
  and p.customer_id is null;

update public.projects p
set address_id = a.id
from public.customer_addresses a
where a.tenant_id = p.tenant_id
  and a.customer_id = p.customer_id
  and lower(a.street) = lower(p.site_address)
  and lower(a.city) = lower(p.site_city)
  and p.address_id is null;

alter table public.customers enable row level security;
alter table public.customer_contacts enable row level security;
alter table public.customer_addresses enable row level security;
alter table public.project_tasks enable row level security;
alter table public.project_documents enable row level security;
alter table public.project_material_items enable row level security;
alter table public.project_incidents enable row level security;
alter table public.reminders enable row level security;

create policy "tenant scoped customers"
on public.customers
for all
using (public.is_agency_admin() or tenant_id = public.current_tenant_id())
with check (public.is_agency_admin() or tenant_id = public.current_tenant_id());

create policy "tenant scoped customer contacts"
on public.customer_contacts
for all
using (public.is_agency_admin() or tenant_id = public.current_tenant_id())
with check (public.is_agency_admin() or tenant_id = public.current_tenant_id());

create policy "tenant scoped customer addresses"
on public.customer_addresses
for all
using (public.is_agency_admin() or tenant_id = public.current_tenant_id())
with check (public.is_agency_admin() or tenant_id = public.current_tenant_id());

create policy "tenant scoped project tasks"
on public.project_tasks
for all
using (public.is_agency_admin() or tenant_id = public.current_tenant_id())
with check (public.is_agency_admin() or tenant_id = public.current_tenant_id());

create policy "tenant scoped project documents"
on public.project_documents
for all
using (public.is_agency_admin() or tenant_id = public.current_tenant_id())
with check (public.is_agency_admin() or tenant_id = public.current_tenant_id());

create policy "tenant scoped material items"
on public.project_material_items
for all
using (public.is_agency_admin() or tenant_id = public.current_tenant_id())
with check (public.is_agency_admin() or tenant_id = public.current_tenant_id());

create policy "tenant scoped incidents"
on public.project_incidents
for all
using (public.is_agency_admin() or tenant_id = public.current_tenant_id())
with check (public.is_agency_admin() or tenant_id = public.current_tenant_id());

create policy "tenant scoped reminders"
on public.reminders
for all
using (public.is_agency_admin() or tenant_id = public.current_tenant_id())
with check (public.is_agency_admin() or tenant_id = public.current_tenant_id());
