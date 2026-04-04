create table public.packages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  niche public.niche_type not null default 'steigerbouw',
  description text not null default '',
  is_template boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.tenants
add column if not exists package_id uuid references public.packages (id) on delete set null;

create table public.package_modules (
  id uuid primary key default gen_random_uuid(),
  package_id uuid not null references public.packages (id) on delete cascade,
  name text not null,
  slug text not null,
  sort_order integer not null default 0,
  is_enabled boolean not null default true,
  created_at timestamptz not null default now(),
  unique (package_id, slug)
);

create table public.module_forms (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.package_modules (id) on delete cascade,
  name text not null,
  description text not null default '',
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.form_fields (
  id uuid primary key default gen_random_uuid(),
  form_id uuid not null references public.module_forms (id) on delete cascade,
  label text not null,
  field_key text not null,
  type text not null check (type in ('text', 'textarea', 'number', 'date', 'select', 'checkbox', 'photo')),
  required boolean not null default false,
  options jsonb not null default '[]'::jsonb,
  help_text text not null default '',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  unique (form_id, field_key)
);

create table public.records (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants (id) on delete cascade,
  project_id uuid references public.projects (id) on delete cascade,
  form_id uuid not null references public.module_forms (id) on delete cascade,
  created_by uuid references public.profiles (id) on delete set null,
  status text not null default 'submitted',
  created_at timestamptz not null default now()
);

create table public.field_values (
  id uuid primary key default gen_random_uuid(),
  record_id uuid not null references public.records (id) on delete cascade,
  field_id uuid not null references public.form_fields (id) on delete cascade,
  value jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (record_id, field_id)
);

alter table public.packages enable row level security;
alter table public.package_modules enable row level security;
alter table public.module_forms enable row level security;
alter table public.form_fields enable row level security;
alter table public.records enable row level security;
alter table public.field_values enable row level security;

create policy "agency admins manage packages"
on public.packages
for all
using (public.is_agency_admin())
with check (public.is_agency_admin());

create policy "tenants can read assigned package"
on public.packages
for select
using (
  public.is_agency_admin()
  or id in (
    select package_id
    from public.tenants
    where id = public.current_tenant_id()
  )
);

create policy "agency admins manage modules"
on public.package_modules
for all
using (public.is_agency_admin())
with check (public.is_agency_admin());

create policy "tenants can read package modules"
on public.package_modules
for select
using (
  public.is_agency_admin()
  or package_id in (
    select package_id
    from public.tenants
    where id = public.current_tenant_id()
  )
);

create policy "agency admins manage forms"
on public.module_forms
for all
using (public.is_agency_admin())
with check (public.is_agency_admin());

create policy "tenants can read forms"
on public.module_forms
for select
using (
  public.is_agency_admin()
  or module_id in (
    select pm.id
    from public.package_modules pm
    join public.tenants t on t.package_id = pm.package_id
    where t.id = public.current_tenant_id()
  )
);

create policy "agency admins manage fields"
on public.form_fields
for all
using (public.is_agency_admin())
with check (public.is_agency_admin());

create policy "tenants can read fields"
on public.form_fields
for select
using (
  public.is_agency_admin()
  or form_id in (
    select mf.id
    from public.module_forms mf
    join public.package_modules pm on pm.id = mf.module_id
    join public.tenants t on t.package_id = pm.package_id
    where t.id = public.current_tenant_id()
  )
);

create policy "records are tenant scoped"
on public.records
for all
using (public.is_agency_admin() or tenant_id = public.current_tenant_id())
with check (public.is_agency_admin() or tenant_id = public.current_tenant_id());

create policy "field values follow record access"
on public.field_values
for all
using (
  public.is_agency_admin()
  or record_id in (
    select id from public.records where tenant_id = public.current_tenant_id()
  )
)
with check (
  public.is_agency_admin()
  or record_id in (
    select id from public.records where tenant_id = public.current_tenant_id()
  )
);
