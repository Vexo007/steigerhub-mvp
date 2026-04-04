import { FieldCreateForm } from "@/components/forms/field-create-form";
import { FormCreateForm } from "@/components/forms/form-create-form";
import { ModuleCreateForm } from "@/components/forms/module-create-form";
import { ModuleToggleButton } from "@/components/forms/module-toggle-button";
import { Panel } from "@/components/ui/panel";
import type { PackageTemplateData } from "@/lib/types";

export function PackageTemplateEditor({ data }: { data: PackageTemplateData }) {
  if (!data.packageDefinition) {
    return (
      <Panel>
        <h2 className="text-xl font-semibold text-forest">Template niet gevonden</h2>
      </Panel>
    );
  }

  return (
    <div className="grid gap-6">
      <Panel className="bg-forest text-white">
        <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-white/45">Templatebeheer</p>
        <h1 className="mt-2 text-3xl font-semibold">{data.packageDefinition.name}</h1>
        <p className="mt-2 text-sm text-white/72">
          Hier bepaal je exact welke features, formulieren en velden straks beschikbaar zijn voor klanten met dit pakket.
        </p>
      </Panel>

      <Panel>
        <h2 className="text-xl font-semibold text-forest">Nieuwe module toevoegen</h2>
        <div className="mt-4">
          <ModuleCreateForm packageId={data.packageDefinition.id} />
        </div>
      </Panel>

      {data.moduleBundles.map((bundle) => (
        <Panel key={bundle.module.id}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-ink/45">Module</p>
              <h2 className="mt-2 text-2xl font-semibold text-forest">{bundle.module.name}</h2>
            </div>
            <ModuleToggleButton moduleId={bundle.module.id} isEnabled={bundle.module.isEnabled} />
          </div>

          <div className="mt-6 grid gap-6">
            <FormCreateForm moduleId={bundle.module.id} />

            {bundle.forms.map(({ form, fields }) => (
              <div key={form.id} className="rounded-[22px] border border-line bg-mist/70 p-5">
                <h3 className="text-xl font-semibold text-forest">{form.name}</h3>
                {form.description ? <p className="mt-1 text-sm text-ink/60">{form.description}</p> : null}
                <div className="mt-4 grid gap-3">
                  {fields.map((field) => (
                    <div key={field.id} className="rounded-2xl border border-line bg-panel px-4 py-3 text-sm text-ink/75">
                      <p className="font-semibold text-forest">{field.label}</p>
                      <p>
                        {field.type}
                        {field.required ? " · verplicht" : " · optioneel"}
                      </p>
                      {field.options.length > 0 ? <p>Opties: {field.options.join(", ")}</p> : null}
                    </div>
                  ))}
                </div>
                <div className="mt-4">
                  <FieldCreateForm formId={form.id} />
                </div>
              </div>
            ))}
          </div>
        </Panel>
      ))}
    </div>
  );
}
