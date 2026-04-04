create table public.company_profiles (
  tenant_id uuid primary key references public.tenants (id) on delete cascade,
  display_name text not null default '',
  primary_color text not null default '#0a331c',
  secondary_color text not null default '#49a642',
  logo_path text,
  rie_notes text not null default '',
  company_notes text not null default '',
  updated_at timestamptz not null default now()
);

create table public.company_documents (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants (id) on delete cascade,
  category text not null check (category in ('rie', 'contract', 'certificate', 'other')),
  title text not null,
  bucket_path text not null,
  file_name text not null,
  uploaded_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.company_profiles enable row level security;
alter table public.company_documents enable row level security;

create policy "company profile tenant scoped"
on public.company_profiles
for all
using (public.is_agency_admin() or tenant_id = public.current_tenant_id())
with check (public.is_agency_admin() or tenant_id = public.current_tenant_id());

create policy "company documents tenant scoped"
on public.company_documents
for all
using (public.is_agency_admin() or tenant_id = public.current_tenant_id())
with check (public.is_agency_admin() or tenant_id = public.current_tenant_id());
