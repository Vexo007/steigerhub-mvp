do $$
declare
  basic_package uuid;
  pro_package uuid;
  custom_package uuid;
  oplevering_module uuid;
  inspectie_module uuid;
  keuring_module uuid;
  werkplan_module uuid;
  rei_module uuid;
  oplevering_form uuid;
  inspectie_form uuid;
  keuring_form uuid;
  werkplan_form uuid;
  rei_form uuid;
begin
  insert into public.packages (name, niche, description, is_template)
  values ('Steigerbouw Basic', 'steigerbouw', 'Basispakket voor oplevering en inspecties', true)
  returning id into basic_package;

  insert into public.packages (name, niche, description, is_template)
  values ('Steigerbouw Pro', 'steigerbouw', 'Uitgebreid pakket met werkplannen, RE&I en keuringen', true)
  returning id into pro_package;

  insert into public.packages (name, niche, description, is_template)
  values ('Steigerbouw Custom', 'steigerbouw', 'Template voor klant-specifieke uitbreidingen', true)
  returning id into custom_package;

  insert into public.package_modules (package_id, name, slug, sort_order)
  values
    (basic_package, 'Oplevering', 'oplevering', 1),
    (basic_package, 'Werkplek inspectie', 'werkplek-inspectie', 2),
    (pro_package, 'Oplevering', 'oplevering', 1),
    (pro_package, 'Werkplek inspectie', 'werkplek-inspectie', 2),
    (pro_package, '2-weekse keuring', '2-weekse-keuring', 3),
    (pro_package, 'Werkplan generator', 'werkplan-generator', 4),
    (pro_package, 'RE&I', 'rei', 5),
    (custom_package, 'Oplevering', 'oplevering', 1)
  on conflict do nothing;

  select id into oplevering_module from public.package_modules where package_id = pro_package and slug = 'oplevering' limit 1;
  select id into inspectie_module from public.package_modules where package_id = pro_package and slug = 'werkplek-inspectie' limit 1;
  select id into keuring_module from public.package_modules where package_id = pro_package and slug = '2-weekse-keuring' limit 1;
  select id into werkplan_module from public.package_modules where package_id = pro_package and slug = 'werkplan-generator' limit 1;
  select id into rei_module from public.package_modules where package_id = pro_package and slug = 'rei' limit 1;

  insert into public.module_forms (module_id, name, description, sort_order)
  values
    (oplevering_module, 'Opleveringsrapport', 'Oplevering met klantbevestiging en foto’s', 1),
    (inspectie_module, 'Inspectieformulier', 'Dagelijkse of wekelijkse werkplekinspectie', 1),
    (keuring_module, '2-weekse keuring', 'Controleformulier voor periodieke keuring', 1),
    (werkplan_module, 'Werkplan', 'Werkplan voor opbouw en veiligheid', 1),
    (rei_module, 'RE&I registratie', 'Risico inventarisatie en evaluatie', 1)
  on conflict do nothing;

  select id into oplevering_form from public.module_forms where module_id = oplevering_module limit 1;
  select id into inspectie_form from public.module_forms where module_id = inspectie_module limit 1;
  select id into keuring_form from public.module_forms where module_id = keuring_module limit 1;
  select id into werkplan_form from public.module_forms where module_id = werkplan_module limit 1;
  select id into rei_form from public.module_forms where module_id = rei_module limit 1;

  insert into public.form_fields (form_id, label, field_key, type, required, options, sort_order)
  values
    (oplevering_form, 'Klantnaam', 'klantnaam', 'text', true, '[]'::jsonb, 1),
    (oplevering_form, 'Adres gecontroleerd', 'adres_gecontroleerd', 'checkbox', true, '[]'::jsonb, 2),
    (oplevering_form, 'Opmerkingen', 'opmerkingen', 'textarea', false, '[]'::jsonb, 3),
    (oplevering_form, 'Foto oplevering', 'foto_oplevering', 'photo', false, '[]'::jsonb, 4),
    (inspectie_form, 'Inspectiedatum', 'inspectiedatum', 'date', true, '[]'::jsonb, 1),
    (inspectie_form, 'Veiligheidsniveau', 'veiligheidsniveau', 'select', true, '["Groen","Oranje","Rood"]'::jsonb, 2),
    (inspectie_form, 'Toelichting', 'toelichting', 'textarea', false, '[]'::jsonb, 3),
    (keuring_form, 'Volgende keuring', 'volgende_keuring', 'date', true, '[]'::jsonb, 1),
    (keuring_form, 'Keuring akkoord', 'keuring_akkoord', 'checkbox', true, '[]'::jsonb, 2),
    (werkplan_form, 'Werkzaamheden', 'werkzaamheden', 'textarea', true, '[]'::jsonb, 1),
    (werkplan_form, 'Aantal monteurs', 'aantal_monteurs', 'number', true, '[]'::jsonb, 2),
    (rei_form, 'Risico', 'risico', 'textarea', true, '[]'::jsonb, 1),
    (rei_form, 'Maatregel', 'maatregel', 'textarea', true, '[]'::jsonb, 2)
  on conflict do nothing;

  update public.tenants
  set package_id = pro_package
  where package_id is null;
end $$;
