import { ProjectCreateForm } from "@/components/forms/project-create-form";
import { DynamicRecordForm } from "@/components/forms/dynamic-record-form";
import { Panel } from "@/components/ui/panel";
import type { PackageWorkspaceData } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export function PackageWorkspace({ data }: { data: PackageWorkspaceData }) {
  if (!data.tenant) {
    return (
      <Panel>
        <h2 className="text-xl font-semibold text-ink">Geen tenant gevonden</h2>
      </Panel>
    );
  }

  return (
    <div className="grid gap-6">
      <Panel>
        <p className="text-sm uppercase tracking-[0.2em] text-ink/50">Actief pakket</p>
        <h2 className="mt-2 text-2xl font-semibold text-ink">
          {data.packageDefinition?.name ?? "Nog geen pakket gekoppeld"}
        </h2>
        <p className="mt-2 text-sm text-ink/60">
          {data.packageDefinition?.description ?? "Koppel eerst een pakket of template aan deze tenant."}
        </p>
      </Panel>

      <section className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <Panel>
          <h3 className="text-xl font-semibold text-ink">Nieuwe opdracht / dossier</h3>
          <p className="mt-2 text-sm text-ink/60">
            Maak eerst een project aan en koppel daarna formulieren aan dat dossier.
          </p>
          <div className="mt-5">
            <ProjectCreateForm tenantId={data.tenant.id} />
          </div>
        </Panel>

        <Panel>
          <h3 className="text-xl font-semibold text-ink">Projecten</h3>
          <div className="mt-5 grid gap-3">
            {data.projects.length === 0 ? (
              <div className="rounded-2xl bg-mist px-4 py-3 text-sm text-ink/60">Nog geen projecten.</div>
            ) : (
              data.projects.map((project) => (
                <article key={project.id} className="rounded-2xl bg-mist px-4 py-3">
                  <p className="font-semibold text-ink">{project.clientName}</p>
                  <p className="text-sm text-ink/60">
                    {project.siteAddress}, {project.siteCity}
                  </p>
                  <p className="mt-1 text-sm text-ink/60">
                    Start: {formatDate(project.startDate)} · Status: {project.status}
                  </p>
                </article>
              ))
            )}
          </div>
        </Panel>
      </section>

      {data.moduleBundles.map((bundle) => (
        <Panel key={bundle.module.id}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-ink/50">Module</p>
              <h3 className="mt-2 text-2xl font-semibold text-ink">{bundle.module.name}</h3>
            </div>
          </div>

          <div className="mt-6 grid gap-6">
            {bundle.forms.map(({ form, fields }) => {
              const records = data.recordsByFormId[form.id] ?? [];
              return (
                <div key={form.id} className="grid gap-4 rounded-[28px] bg-mist p-5">
                  <DynamicRecordForm tenantId={data.tenant!.id} form={form} fields={fields} projects={data.projects} />
                  <div className="grid gap-3">
                    <p className="text-sm font-semibold text-ink">Recente inzendingen</p>
                    {records.length === 0 ? (
                      <div className="rounded-2xl bg-white px-4 py-3 text-sm text-ink/60">
                        Nog geen records voor dit formulier.
                      </div>
                    ) : (
                      records.map(({ record, values }) => (
                        <div key={record.id} className="rounded-2xl bg-white px-4 py-3 text-sm text-ink/75">
                          <p className="font-semibold text-ink">{formatDate(record.createdAt)}</p>
                          <ul className="mt-2 grid gap-1">
                            {values.map((value) => (
                              <li key={value.id}>
                                {value.fieldId}:{" "}
                                <span className="text-ink/60">
                                  {typeof value.value === "object" ? JSON.stringify(value.value) : String(value.value)}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Panel>
      ))}
    </div>
  );
}
