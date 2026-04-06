import Link from "next/link";
import { WorkerProjectDashboard } from "@/components/dashboard/worker-project-dashboard";
import { ProjectCreateForm } from "@/components/forms/project-create-form";
import { DynamicRecordForm } from "@/components/forms/dynamic-record-form";
import { Badge } from "@/components/ui/badge";
import { Panel } from "@/components/ui/panel";
import { StatCard } from "@/components/ui/stat-card";
import type { PackageWorkspaceData, UserRole } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export function PackageWorkspace({
  data,
  selectedProjectId,
  userRole
}: {
  data: PackageWorkspaceData;
  selectedProjectId?: string | null;
  userRole: UserRole;
}) {
  if (!data.tenant) {
    return (
      <Panel>
        <h2 className="text-xl font-semibold text-forest">Geen tenant gevonden</h2>
      </Panel>
    );
  }

  const tenant = data.tenant;
  const selectedProject = selectedProjectId ? data.projects.find((project) => project.id === selectedProjectId) ?? null : null;
  const visibleProjects = selectedProject ? [selectedProject] : data.projects;
  const isWorker = userRole === "tenant_staff";

  return (
    <div className="grid gap-6">
      <section className={`grid gap-4 ${isWorker ? "xl:grid-cols-[1.15fr_0.85fr]" : "xl:grid-cols-[1.3fr_0.7fr_0.7fr]"}`}>
        <Panel className="bg-forest text-white">
          <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-white/45">{isWorker ? "Mijn werkdag" : "Actief pakket"}</p>
          <h2 className="mt-2 text-2xl font-semibold">
            {isWorker ? "Kies een project en open daarna direct je taak" : data.packageDefinition?.name ?? "Nog geen pakket gekoppeld"}
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-white/72">
            {isWorker
              ? "De werkapp is nu eerst een projecten dashboard. Daarna kies je per project taken zoals keuring, tekening, oplevering of werkplan."
              : data.packageDefinition?.description ?? "Koppel eerst een pakket of template aan deze tenant."}
          </p>
        </Panel>
        <StatCard label="Projecten" value={data.projects.length} detail="Dossiers voor deze tenant" />
        {!isWorker ? (
          <StatCard
            label="Formulieren"
            value={data.moduleBundles.reduce((sum, bundle) => sum + bundle.forms.length, 0)}
            detail="Actieve formulieren in pakket"
          />
        ) : null}
      </section>

      <section id="projecten" className={isWorker ? "grid gap-6" : "grid gap-6 xl:grid-cols-[0.78fr_1.22fr]"}>
        {!isWorker ? (
          <>
            <Panel className="h-fit">
              <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-ink/45">Werkvloer</p>
              <h3 className="mt-2 text-2xl font-semibold text-forest">Nieuwe opdracht / dossier</h3>
              <p className="mt-2 text-sm text-ink/60">Maak eerst een project aan en koppel daarna formulieren aan dat dossier.</p>
              <div className="mt-5">
                <ProjectCreateForm tenantId={tenant.id} />
              </div>
            </Panel>

            <Panel>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-ink/45">Projecten</p>
                  <h3 className="mt-2 text-2xl font-semibold text-forest">{selectedProject ? "Geselecteerd project" : "Actieve dossiers"}</h3>
                </div>
                {selectedProject ? (
                  <Link href={tenant.id ? `/workspace?tenantId=${tenant.id}` : "/workspace"} className="rounded-full border border-line px-4 py-2 text-sm font-semibold text-ink">
                    Toon alle projecten
                  </Link>
                ) : null}
              </div>
              <div className="mt-5 grid gap-3">
                {visibleProjects.length === 0 ? (
                  <div className="rounded-2xl border border-line bg-mist px-4 py-3 text-sm text-ink/60">Nog geen projecten.</div>
                ) : (
                  visibleProjects.map((project) => (
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
                      <div className="mt-4">
                        <Link href={`/workspace/project/${project.id}`} className="inline-flex rounded-full border border-line px-4 py-2 text-sm font-semibold text-ink">
                          Open project
                        </Link>
                      </div>
                    </article>
                  ))
                )}
              </div>
            </Panel>
          </>
        ) : (
          <WorkerProjectDashboard
            tenant={tenant}
            projects={data.projects}
            moduleBundles={data.moduleBundles}
            projectTasks={data.projectTasks}
            reminders={data.reminders}
            selectedProjectId={selectedProject?.id ?? null}
          />
        )}
      </section>

      {!isWorker ? (
        <section id="profiel" className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
          <Panel>
            <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-ink/45">Bedrijfsprofiel</p>
            <h3 className="mt-2 text-2xl font-semibold text-forest">Eigen bedrijfsomgeving</h3>
            <div className="mt-5 grid gap-4">
              <div className="rounded-[22px] border border-line bg-mist/70 p-5">
                <p className="text-sm font-semibold text-forest">Logo en uitstraling</p>
                <p className="mt-2 text-sm text-ink/60">De eigenaar beheert dit in company settings en werknemers zien dit terug in hun werkapp.</p>
              </div>
              <div className="rounded-[22px] border border-line bg-mist/70 p-5">
                <p className="text-sm font-semibold text-forest">Bedrijfsdocumenten</p>
                <p className="mt-2 text-sm text-ink/60">RE&I, contracten en certificaten horen bij het bedrijfsaccount en staan centraal opgeslagen.</p>
              </div>
            </div>
          </Panel>

          <Panel id="formulieren">
            <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-ink/45">Formulieren</p>
            <h3 className="mt-2 text-2xl font-semibold text-forest">Werkprocessen per module</h3>
            <p className="mt-2 text-sm text-ink/60">Houd het simpel voor werknemers: kies een project, vul een formulier in en sla het direct op.</p>
            {selectedProject ? (
              <div className="mt-4 rounded-[20px] border border-line bg-white px-4 py-4">
                <p className="text-sm font-semibold text-forest">{selectedProject.clientName}</p>
                <p className="mt-1 text-sm text-ink/60">
                  {selectedProject.siteAddress}, {selectedProject.siteCity}
                </p>
              </div>
            ) : null}
            <div className="mt-6 grid gap-6">
              {data.moduleBundles.map((bundle) => (
                <section key={bundle.module.id} className="rounded-[24px] border border-line bg-mist/55 p-5">
                  <div id={`module-${bundle.module.slug}`}>
                    <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-ink/45">Module</p>
                    <h3 className="mt-2 text-2xl font-semibold text-forest">{bundle.module.name}</h3>
                  </div>

                  <div className="mt-6 grid gap-6">
                    {bundle.forms.map(({ form, fields }) => {
                      const records = data.recordsByFormId[form.id] ?? [];
                      const filteredRecords = selectedProject ? records.filter(({ record }) => record.projectId === selectedProject.id) : records;

                      return (
                        <div key={form.id} className="grid gap-4 rounded-[22px] border border-line bg-panel p-5">
                          <DynamicRecordForm
                            tenantId={tenant.id}
                            form={form}
                            fields={fields}
                            projects={data.projects}
                            selectedProjectId={selectedProject?.id ?? null}
                          />
                          <div className="grid gap-3">
                            <p className="text-sm font-semibold text-forest">Recente inzendingen</p>
                            {filteredRecords.length === 0 ? (
                              <div className="rounded-2xl border border-line bg-mist px-4 py-3 text-sm text-ink/60">
                                Nog geen records voor dit formulier.
                              </div>
                            ) : (
                              filteredRecords.map(({ record, actorName, values }) => (
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
      ) : (
        <section id="formulieren">
          <Panel>
            <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-ink/45">Taken</p>
            <h3 className="mt-2 text-2xl font-semibold text-forest">Mijn formulieren</h3>
            <p className="mt-2 text-sm text-ink/60">Deze lijst blijft beschikbaar voor snelle invoer, maar de hoofdflow start nu bovenaan vanuit je projectdashboard.</p>
            <div className="mt-6 grid gap-5">
              {data.moduleBundles.map((bundle) => (
                <section key={bundle.module.id} className="rounded-[22px] border border-line bg-mist/55 p-5">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-ink/45">Module</p>
                    <h3 className="mt-2 text-xl font-semibold text-forest">{bundle.module.name}</h3>
                  </div>
                  <div className="mt-5 grid gap-4">
                    {bundle.forms.map(({ form, fields }) => (
                      <DynamicRecordForm
                        key={form.id}
                        tenantId={tenant.id}
                        form={form}
                        fields={fields}
                        projects={data.projects}
                        selectedProjectId={selectedProject?.id ?? null}
                      />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </Panel>
        </section>
      )}
    </div>
  );
}
