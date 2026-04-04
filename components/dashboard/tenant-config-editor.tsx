import { FieldCreateForm } from "@/components/forms/field-create-form";
import { FormCreateForm } from "@/components/forms/form-create-form";
import { ModuleCreateForm } from "@/components/forms/module-create-form";
import { ModuleToggleButton } from "@/components/forms/module-toggle-button";
import { Panel } from "@/components/ui/panel";
import type { TenantConfigData } from "@/lib/types";

export function TenantConfigEditor({ data }: { data: TenantConfigData }) {
  if (!data.tenant) {
    return (
      <Panel>
        <h2 className="text-xl font-semibold text-ink">Tenant niet gevonden</h2>
      </Panel>
    );
  }

  const tenant = data.tenant;

  return (
    <div className="grid gap-6">
      <Panel>
        <p className="text-sm uppercase tracking-[0.2em] text-ink/50">Klantconfiguratie</p>
        <h1 className="mt-2 text-3xl font-semibold text-ink">{tenant.name}</h1>
        <p className="mt-2 text-sm text-ink/60">
          Pakket: {data.packageDefinition?.name ?? "Nog geen pakket"}.
          Hier kun je modules, formulieren en velden aanpassen zonder code.
        </p>
      </Panel>

      {data.packageDefinition ? (
        <Panel>
          <h2 className="text-xl font-semibold text-ink">Nieuwe module toevoegen</h2>
          <div className="mt-4">
            <ModuleCreateForm packageId={data.packageDefinition.id} tenantId={tenant.id} />
          </div>
        </Panel>
      ) : null}

      {data.moduleBundles.map((bundle) => (
        <Panel key={bundle.module.id}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-ink/50">Module</p>
              <h2 className="mt-2 text-2xl font-semibold text-ink">{bundle.module.name}</h2>
            </div>
            <ModuleToggleButton
              moduleId={bundle.module.id}
              tenantId={tenant.id}
              isEnabled={bundle.module.isEnabled}
            />
          </div>

          <div className="mt-6 grid gap-6">
            <FormCreateForm moduleId={bundle.module.id} tenantId={tenant.id} />

            {bundle.forms.map(({ form, fields }) => (
              <div key={form.id} className="rounded-[24px] bg-mist p-5">
                <h3 className="text-xl font-semibold text-ink">{form.name}</h3>
                {form.description ? <p className="mt-1 text-sm text-ink/60">{form.description}</p> : null}
                <div className="mt-4 grid gap-3">
                  {fields.map((field) => (
                    <div key={field.id} className="rounded-2xl bg-white px-4 py-3 text-sm text-ink/75">
                      <p className="font-semibold text-ink">{field.label}</p>
                      <p>
                        {field.type}
                        {field.required ? " · verplicht" : " · optioneel"}
                      </p>
                      {field.options.length > 0 ? <p>Opties: {field.options.join(", ")}</p> : null}
                    </div>
                  ))}
                </div>
                <div className="mt-4">
                  <FieldCreateForm formId={form.id} tenantId={tenant.id} />
                </div>
              </div>
            ))}
          </div>
        </Panel>
      ))}
    </div>
  );
}
