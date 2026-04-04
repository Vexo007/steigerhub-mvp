insert into public.tenants (id, name, niche, package_tier, status, stripe_customer_id, contact_name, contact_email)
values
  ('0c2f64da-a4b1-4f9e-a3fd-364e0e8a0aa1', 'SteigerPlus Noord', 'steigerbouw', 'pro', 'active', 'cus_steigerplus', 'J. de Vries', 'planning@steigerplus.nl'),
  ('eaf4b8ce-4815-4d7b-9315-c312041782bb', 'VeiligZicht Steigers', 'steigerbouw', 'starter', 'trialing', 'cus_veiligzicht', 'M. Peters', 'info@veiligzicht.nl')
on conflict (id) do nothing;

insert into public.tenant_module_settings (tenant_id, module_key, enabled)
values
  ('0c2f64da-a4b1-4f9e-a3fd-364e0e8a0aa1', 'materials', true),
  ('0c2f64da-a4b1-4f9e-a3fd-364e0e8a0aa1', 'blueprints', true),
  ('0c2f64da-a4b1-4f9e-a3fd-364e0e8a0aa1', 'safety_docs', true),
  ('0c2f64da-a4b1-4f9e-a3fd-364e0e8a0aa1', 'notes', true),
  ('0c2f64da-a4b1-4f9e-a3fd-364e0e8a0aa1', 'photos', true),
  ('0c2f64da-a4b1-4f9e-a3fd-364e0e8a0aa1', 'timeline', true)
on conflict do nothing;

insert into public.custom_field_definitions (id, tenant_id, label, field_key, input_type, enabled)
values
  ('884f35a2-6df0-4f04-a267-6bc0ddf3f2b1', '0c2f64da-a4b1-4f9e-a3fd-364e0e8a0aa1', 'Contactpersoon op locatie', 'contact_on_site', 'text', true),
  ('335448ac-8adf-45d9-bb6d-34897122b5ab', '0c2f64da-a4b1-4f9e-a3fd-364e0e8a0aa1', 'Levertijdvak', 'delivery_slot', 'text', true)
on conflict do nothing;

insert into public.projects (id, tenant_id, client_name, site_address, site_city, status, material_summary, safety_status, start_date)
values
  ('7df3f3ad-2287-4726-ac05-0c9e3b879bb4', '0c2f64da-a4b1-4f9e-a3fd-364e0e8a0aa1', 'Woonstaete BV', 'Havenstraat 17', 'Groningen', 'active', '72 frames, 110 planken, 18 consoles', 'approved', '2026-04-04'),
  ('3b9f5d37-2a9f-4d03-9038-234209eac287', '0c2f64da-a4b1-4f9e-a3fd-364e0e8a0aa1', 'Zonlicht Vastgoed', 'Prinsenkade 102', 'Zwolle', 'inspection', '48 frames, 80 planken, 6 traptorens', 'pending', '2026-04-01')
on conflict do nothing;

insert into public.project_files (id, tenant_id, project_id, kind, bucket_path, file_name)
values
  ('1470ee8f-5522-4bd6-98a0-a31c7d768701', '0c2f64da-a4b1-4f9e-a3fd-364e0e8a0aa1', '7df3f3ad-2287-4726-ac05-0c9e3b879bb4', 'blueprint', '0c2f64da-a4b1-4f9e-a3fd-364e0e8a0aa1/7df3f3ad-2287-4726-ac05-0c9e3b879bb4/bouwtekening-havenstraat.pdf', 'bouwtekening-havenstraat.pdf'),
  ('604dcc7d-d672-4b15-b159-0649dc7fdf7f', '0c2f64da-a4b1-4f9e-a3fd-364e0e8a0aa1', '7df3f3ad-2287-4726-ac05-0c9e3b879bb4', 'safety', '0c2f64da-a4b1-4f9e-a3fd-364e0e8a0aa1/7df3f3ad-2287-4726-ac05-0c9e3b879bb4/veiligheidsplan-v3.pdf', 'veiligheidsplan-v3.pdf')
on conflict do nothing;

insert into public.project_notes (id, tenant_id, project_id, body)
values
  ('f8b93a3f-dcec-4c69-b16c-cd87b5e3f542', '0c2f64da-a4b1-4f9e-a3fd-364e0e8a0aa1', '7df3f3ad-2287-4726-ac05-0c9e3b879bb4', 'Klant wil extra afscherming aan straatzijde. Voor montage eerst verkeersmaatregel afstemmen.'),
  ('cb512298-eefc-4350-82ea-bc010e85e272', '0c2f64da-a4b1-4f9e-a3fd-364e0e8a0aa1', '3b9f5d37-2a9f-4d03-9038-234209eac287', 'Inspectie-document nog niet ondertekend. Upload verwacht voor einde dag.')
on conflict do nothing;

insert into public.subscriptions (id, tenant_id, stripe_customer_id, stripe_price_id, package_tier, status, current_period_end)
values
  ('f35c9b38-c7dc-4f2e-917c-5ce89ba25f47', '0c2f64da-a4b1-4f9e-a3fd-364e0e8a0aa1', 'cus_steigerplus', 'price_pro', 'pro', 'active', '2026-04-21T00:00:00Z'),
  ('9f979684-dbc3-48c8-b9c6-fb9646f7af5c', 'eaf4b8ce-4815-4d7b-9315-c312041782bb', 'cus_veiligzicht', 'price_starter', 'starter', 'trialing', '2026-04-12T00:00:00Z')
on conflict do nothing;
