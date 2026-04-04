import Link from "next/link";
import { ProjectCreateForm } from "@/components/forms/project-create-form";
import { AdminDashboardShell } from "@/components/layout/admin-dashboard-shell";
import { Badge } from "@/components/ui/badge";
import { Panel } from "@/components/ui/panel";
import { getAuthorizedTenantId, requireAppUser } from "@/lib/auth";
import { getTenantAdminData } from "@/lib/package-builder-data";
import { formatDate } from "@/lib/utils";

export default async function AdminProjectsPage({
  searchParams
}: {
  searchParams?: Promise<{ tenantId?: string }>;
}) {
  const params = (await searchParams) ?? {};
  const user = await requireAppUser();
  const tenantId = getAuthorizedTenantId(user, params.tenantId) ?? undefined;
  const data = await getTenantAdminData(tenantId);

  return (
    <AdminDashboardShell
      user={user}
      tenant={data.tenant}
      tenantId={tenantId}
      currentKey="projects"
      title="Projecten"
      subtitle="Bekijk en open hier alle klantprojecten. Vanuit elk project ga je door naar taken, formulieren en werkplannen."
    >
      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Panel>
          <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-ink/45">Nieuw project</p>
          <h2 className="mt-2 text-2xl font-semibold text-forest">Project of dossier aanmaken</h2>
          <p className="mt-2 text-sm text-ink/65">Koppel hier een klant, adres en startdatum zodat het team direct aan de slag kan.</p>
          <div className="mt-5">
            <ProjectCreateForm tenantId={data.tenant?.id ?? ""} />
          </div>
        </Panel>

        <Panel>
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-ink/45">Projectboard</p>
              <h2 className="mt-2 text-2xl font-semibold text-forest">Alle klantprojecten</h2>
            </div>
            <p className="text-sm text-ink/55">{data.projects.length} project(en)</p>
          </div>
          <div className="mt-5 grid gap-3">
            {data.projects.length === 0 ? (
              <div className="rounded-[20px] border border-dashed border-line bg-mist/60 px-4 py-4 text-sm text-ink/60">
                Nog geen projecten gevonden.
              </div>
            ) : (
              data.projects.map((project) => (
                <div key={project.id} className="rounded-[22px] border border-line bg-mist/60 p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-lg font-semibold text-forest">{project.clientName}</p>
                      <p className="mt-1 text-sm text-ink/60">
                        {project.siteAddress}, {project.siteCity}
                      </p>
                    </div>
                    <Badge tone={project.safetyStatus}>{project.safetyStatus}</Badge>
                  </div>
                  <div className="mt-4 grid gap-2 text-sm text-ink/60 md:grid-cols-3">
                    <p>Start: {formatDate(project.startDate)}</p>
                    <p>Status: {project.status}</p>
                    <p>Aangemaakt: {formatDate(project.createdAt)}</p>
                  </div>
                  <p className="mt-4 rounded-[18px] border border-line/70 bg-panel px-4 py-3 text-sm text-ink/70">
                    {project.materialSummary || "Nog geen materiaal- of werknotitie toegevoegd."}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Link href={`/admin/projects/${project.id}`} className="rounded-full bg-lime px-4 py-2 text-sm font-semibold text-white">
                      Open project
                    </Link>
                    <Link href={`/admin/projects/${project.id}/workplans`} className="rounded-full border border-line px-4 py-2 text-sm font-semibold text-ink">
                      Werkplannen
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </Panel>
      </div>
    </AdminDashboardShell>
  );
}
