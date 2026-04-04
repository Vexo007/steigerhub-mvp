import { ProjectCreateForm } from "@/components/forms/project-create-form";
import { DynamicRecordForm } from "@/components/forms/dynamic-record-form";
import { Badge } from "@/components/ui/badge";
import { Panel } from "@/components/ui/panel";
import { StatCard } from "@/components/ui/stat-card";
import type { PackageWorkspaceData } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export function PackageWorkspace({ data }: { data: PackageWorkspaceData }) {
  if (!data.tenant) {
    return (
      <Panel>
        <h2 className="text-xl font-semibold text-forest">Geen tenant gevonden</h2>
      </Panel>
    );
  }

  const tenant = data.tenant;

  return (
    <div className="grid gap-6">
      <section className="grid gap-4 xl:grid-cols-[1.3fr_0.7fr_0.7fr]">
        <Panel className="bg-forest text-white">
          <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-white/45">Actief pakket</p>
          <h2 className="mt-2 text-2xl font-semibold">
            {data.packageDefinition?.name ?? "Nog geen pakket gekoppeld"}
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-white/72">
            {data.packageDefinition?.description ?? "Koppel eerst een pakket of template aan deze tenant."}
          </p>
        </Panel>
        <StatCard label="Projecten" value={data.projects.length} detail="Dossiers voor deze tenant" />
        <StatCard
          label="Formulieren"
          value={data.moduleBundles.reduce((sum, bundle) => sum + bundle.forms.length, 0)}
          detail="Actieve formulieren in pakket"
        />
      </section>

      <section id="projecten" className="grid gap-6 xl:grid-cols-[0.78fr_1.22fr]">
        <Panel className="h-fit">
          <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-ink/45">Werkvloer</p>
          <h3 className="mt-2 text-2xl font-semibold text-forest">Nieuwe opdracht / dossier</h3>
          <p className="mt-2 text-sm text-ink/60">
            Maak eerst een project aan en koppel daarna formulieren aan dat dossier.
          </p>
          <div className="mt-5">
            <ProjectCreateForm tenantId={tenant.id} />
          </div>
        </Panel>

        <Panel>
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-ink/45">Projecten</p>
              <h3 className="mt-2 text-2xl font-semibold text-forest">Actieve dossiers</h3>
            </div>
          </div>
          <div className="mt-5 grid gap-3">
            {data.projects.length === 0 ? (
              <div className="rounded-2xl border border-line bg-mist px-4 py-3 text-sm text-ink/60">Nog geen projecten.</div>
            ) : (
              data.projects.map((project) => (
                <article key={project.id} className="rounded-[22px] border border-line bg-mist/70 px-4 py-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-forest">{project.clientName}</p>
                      <p className="text-sm text-ink/60">
                        {project.siteAddress}, {project.siteCity}
                      </p>
                    </div>
                    <Badge tone={project.safetyStatus}>{project.safetyStatus}</Badge>
                  </div>
                  <p className="mt-2 text-sm text-ink/60">Start: {formatDate(project.startDate)} · Status: {project.status}</p>
                  <p className="mt-3 text-sm text-ink/72">{project.materialSummary || "Nog geen notitie."}</p>
                </article>
              ))
            )}
          </div>
        </Panel>
      </section>

      <section id="profiel" className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        <Panel>
          <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-ink/45">Bedrijfsprofiel</p>
          <h3 className="mt-2 text-2xl font-semibold text-forest">Eigen bedrijfsomgeving</h3>
          <div className="mt-5 grid gap-4">
            <div className="rounded-[22px] border border-dashed border-line bg-mist/70 p-5">
              <p className="text-sm font-semibold text-forest">Logo en uitstraling</p>
              <p className="mt-2 text-sm text-ink/60">Hier komt de volgende stap: bedrijfslogo, kleuraccenten en herkenbare klantomgeving.</p>
            </div>
            <div className="rounded-[22px] border border-dashed border-line bg-mist/70 p-5">
              <p className="text-sm font-semibold text-forest">RE&I en documenten</p>
              <p className="mt-2 text-sm text-ink/60">We reserveren hier nu al ruimte voor bedrijfsdocumenten, RE&I en andere admin-onderdelen.</p>
            </div>
          </div>
        </Panel>

        <Panel id="formulieren">
          <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-ink/45">Formulieren</p>
          <h3 className="mt-2 text-2xl font-semibold text-forest">Werkprocessen per module</h3>
          <p className="mt-2 text-sm text-ink/60">
            Houd het simpel voor werknemers: kies een project, vul een formulier in en sla het direct op.
          </p>
          <div className="mt-6 grid gap-6">
            {data.moduleBundles.map((bundle) => (
              <section key={bundle.module.id} className="rounded-[24px] border border-line bg-mist/55 p-5">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-ink/45">Module</p>
                  <h3 className="mt-2 text-2xl font-semibold text-forest">{bundle.module.name}</h3>
                </div>

                <div className="mt-6 grid gap-6">
                  {bundle.forms.map(({ form, fields }) => {
                    const records = data.recordsByFormId[form.id] ?? [];
                    return (
                      <div key={form.id} className="grid gap-4 rounded-[22px] border border-line bg-panel p-5">
                        <DynamicRecordForm tenantId={tenant.id} form={form} fields={fields} projects={data.projects} />
                        <div className="grid gap-3">
                          <p className="text-sm font-semibold text-forest">Recente inzendingen</p>
                          {records.length === 0 ? (
                            <div className="rounded-2xl border border-line bg-mist px-4 py-3 text-sm text-ink/60">
                              Nog geen records voor dit formulier.
                            </div>
                          ) : (
                            records.map(({ record, actorName, values }) => (
                              <div key={record.id} className="rounded-2xl border border-line bg-mist px-4 py-3 text-sm text-ink/75">
                                <p className="font-semibold text-forest">{formatDate(record.createdAt)}</p>
                                <p className="mt-1 text-sm text-ink/60">
                                  Uitgevoerd door: {actorName ?? "Onbekend"}
                                  {record.projectId
                                    ? ` · Project: ${data.projects.find((project) => project.id === record.projectId)?.clientName ?? "Onbekend"}`
                                    : ""}
                                </p>
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
              </section>
            ))}
          </div>
        </Panel>
      </section>
    </div>
  );
}
