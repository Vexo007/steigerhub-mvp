import type {
  CustomFieldDefinition,
  Project,
  ProjectFile,
  ProjectNote,
  Tenant,
  TenantModuleSetting
} from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ProjectCreateForm } from "@/components/forms/project-create-form";
import { Panel } from "@/components/ui/panel";

export function TenantOverview({
  tenant,
  projects,
  projectFiles,
  projectNotes,
  modules,
  fields,
  source
}: {
  tenant: Tenant | null;
  projects: Project[];
  projectFiles: ProjectFile[];
  projectNotes: ProjectNote[];
  modules: TenantModuleSetting[];
  fields: CustomFieldDefinition[];
  source: "mock" | "supabase";
}) {
  if (!tenant) {
    return (
      <Panel>
        <h2 className="text-xl font-semibold text-ink">Geen tenant gevonden</h2>
        <p className="mt-2 text-sm text-ink/60">
          Voeg eerst een tenant toe in Supabase of laat de pagina op mockdata draaien.
        </p>
      </Panel>
    );
  }

  return (
    <div className="grid gap-6">
      <section className="grid gap-4 md:grid-cols-3">
        <Panel>
          <p className="text-sm uppercase tracking-[0.2em] text-ink/50">Actieve dossiers</p>
          <p className="mt-3 text-3xl font-semibold text-ink">{projects.length}</p>
        </Panel>
        <Panel>
          <p className="text-sm uppercase tracking-[0.2em] text-ink/50">Modules aan</p>
          <p className="mt-3 text-3xl font-semibold text-ink">{modules.filter((item) => item.enabled).length}</p>
        </Panel>
        <Panel>
          <p className="text-sm uppercase tracking-[0.2em] text-ink/50">Extra velden</p>
          <p className="mt-3 text-3xl font-semibold text-ink">{fields.length}</p>
          <p className="mt-2 text-sm text-ink/55">{source === "supabase" ? tenant.name : "Mock tenant preview"}</p>
        </Panel>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Panel>
          <h2 className="text-xl font-semibold text-ink">Dossiers op locatie</h2>
          <p className="mt-1 text-sm text-ink/60">
            Mobile-first overzicht voor materiaal, tekening, veiligheid en tijdlijn.
          </p>
          <div className="mt-5 grid gap-4">
            {projects.map((project) => {
              const files = projectFiles.filter((file) => file.projectId === project.id);
              const notes = projectNotes.filter((note) => note.projectId === project.id);

              return (
                <article key={project.id} className="rounded-[24px] bg-mist p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-semibold text-ink">{project.clientName}</h3>
                      <p className="text-sm text-ink/60">
                        {project.siteAddress}, {project.siteCity}
                      </p>
                    </div>
                    <Badge tone={project.safetyStatus}>{project.safetyStatus}</Badge>
                  </div>
                  <dl className="mt-4 grid gap-3 text-sm text-ink/80 md:grid-cols-3">
                    <div>
                      <dt className="text-ink/50">Status</dt>
                      <dd className="mt-1 font-medium capitalize">{project.status}</dd>
                    </div>
                    <div>
                      <dt className="text-ink/50">Start</dt>
                      <dd className="mt-1 font-medium">{formatDate(project.startDate)}</dd>
                    </div>
                    <div>
                      <dt className="text-ink/50">Materiaal</dt>
                      <dd className="mt-1 font-medium">{project.materialSummary}</dd>
                    </div>
                  </dl>
                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    <div className="rounded-2xl bg-white px-4 py-3">
                      <p className="text-xs uppercase tracking-[0.16em] text-ink/50">Bestanden</p>
                      <ul className="mt-2 grid gap-2 text-sm text-ink/80">
                        {files.map((file) => (
                          <li key={file.id}>
                            {file.fileName} · <span className="capitalize">{file.kind}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="rounded-2xl bg-white px-4 py-3">
                      <p className="text-xs uppercase tracking-[0.16em] text-ink/50">Laatste notitie</p>
                      <p className="mt-2 text-sm text-ink/80">{notes[0]?.body ?? "Nog geen notities."}</p>
                    </div>
                  </div>
                </article>
              );
            })}
            {projects.length === 0 ? (
              <div className="rounded-[24px] bg-mist p-5 text-sm text-ink/60">
                Nog geen dossiers gevonden voor deze tenant.
              </div>
            ) : null}
          </div>
        </Panel>

        <Panel>
          <h2 className="text-xl font-semibold text-ink">Nieuw dossier / opdracht</h2>
          <p className="mt-1 text-sm text-ink/60">
            Maak hier een klantopdracht aan zodat het team materiaal, adres en voortgang kan bijhouden.
          </p>
          <div className="mt-5">
            <ProjectCreateForm tenantId={tenant.id} />
          </div>
        </Panel>
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <Panel>
          <h2 className="text-xl font-semibold text-ink">Tenant-configuratie</h2>
          <p className="mt-1 text-sm text-ink/60">
            Voor MVP gebruiken we toggles en extra velden in plaats van een volledige formulierbouwer.
          </p>
          <div className="mt-5 grid gap-3">
            {modules.map((module) => (
              <div key={module.moduleKey} className="flex items-center justify-between rounded-2xl bg-mist px-4 py-3">
                <span className="text-sm font-medium text-ink">{module.moduleKey}</span>
                <Badge tone={module.enabled ? "active" : "paused"}>
                  {module.enabled ? "aan" : "uit"}
                </Badge>
              </div>
            ))}
          </div>
          <div className="mt-5">
            <p className="text-xs uppercase tracking-[0.16em] text-ink/50">Aangepaste velden</p>
            <div className="mt-3 grid gap-3">
              {fields.map((field) => (
                <div key={field.id} className="rounded-2xl border border-ink/10 px-4 py-3">
                  <p className="font-medium text-ink">{field.label}</p>
                  <p className="text-sm text-ink/60">{field.fieldKey}</p>
                </div>
              ))}
            </div>
          </div>
        </Panel>
      </section>
    </div>
  );
}
