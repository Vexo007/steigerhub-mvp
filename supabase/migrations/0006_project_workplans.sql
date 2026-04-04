create table public.project_workplans (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants (id) on delete cascade,
  project_id uuid not null references public.projects (id) on delete cascade,
  title text not null,
  plan_type text not null,
  status text not null default 'draft',
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.project_workplan_sections (
  id uuid primary key default gen_random_uuid(),
  workplan_id uuid not null references public.project_workplans (id) on delete cascade,
  section_key text not null,
  title text not null,
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  unique (workplan_id, section_key)
);

alter table public.project_workplans enable row level security;
alter table public.project_workplan_sections enable row level security;

create policy "project workplans tenant scoped"
on public.project_workplans
for all
using (public.is_agency_admin() or tenant_id = public.current_tenant_id())
with check (public.is_agency_admin() or tenant_id = public.current_tenant_id());

create policy "project workplan sections tenant scoped"
on public.project_workplan_sections
for all
using (
  public.is_agency_admin()
  or exists (
    select 1
    from public.project_workplans workplans
    where workplans.id = workplan_id
      and workplans.tenant_id = public.current_tenant_id()
  )
)
with check (
  public.is_agency_admin()
  or exists (
    select 1
    from public.project_workplans workplans
    where workplans.id = workplan_id
      and workplans.tenant_id = public.current_tenant_id()
  )
);
