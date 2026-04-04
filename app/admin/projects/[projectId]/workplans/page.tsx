import Link from "next/link";
import { AdminDashboardShell } from "@/components/layout/admin-dashboard-shell";
import { Panel } from "@/components/ui/panel";
import { WorkplanCreateForm } from "@/components/workplans/workplan-create-form";
import { requireAppUser } from "@/lib/auth";
import { getProjectWorkplans } from "@/lib/workplan-data";
import { formatDate } from "@/lib/utils";

export default async function AdminProjectWorkplansPage({
  params
}: {
  params: Promise<{ projectId: string }>;
}) {
  const user = await requireAppUser();
  const { projectId } = await params;
  const data = await getProjectWorkplans(user, projectId);

  return (
    <AdminDashboardShell
      user={user}
      tenant={data.tenant}
      tenantId={data.tenant?.id}
      currentKey="projects"
      title="Werkplan generator"
      subtitle="Kies een plantype, maak een projectplan aan en werk daarna verder in compacte secties."
    >
      <div className="grid gap-6 xl:grid-cols-[0.72fr_1.28fr]">
        <Panel>
          <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-ink/45">Nieuw werkplan</p>
          <h2 className="mt-2 text-2xl font-semibold text-forest">{data.project.clientName}</h2>
          <p className="mt-2 text-sm text-ink/60">
            {data.project.siteAddress}, {data.project.siteCity}
          </p>
          <div className="mt-5">
            <WorkplanCreateForm tenantId={data.project.tenantId} projectId={data.project.id} />
          </div>
        </Panel>

        <Panel>
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-ink/45">Bestaande plannen</p>
              <h2 className="mt-2 text-2xl font-semibold text-forest">Werkplannen per project</h2>
            </div>
            <Link href={`/admin/projects/${projectId}`} className="rounded-full border border-line px-4 py-2 text-sm font-semibold text-ink">
              Terug naar project
            </Link>
          </div>
          <div className="mt-5 grid gap-3">
            {data.workplans.length === 0 ? (
              <div className="rounded-[20px] border border-dashed border-line bg-mist/60 px-4 py-4 text-sm text-ink/60">
                Nog geen werkplannen voor dit project.
              </div>
            ) : (
              data.workplans.map((workplan) => (
                <div key={workplan.id} className="rounded-[22px] border border-line bg-mist/60 p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-lg font-semibold text-forest">{workplan.title}</p>
                      <p className="mt-1 text-sm text-ink/60">{workplan.planType}</p>
                      <p className="mt-1 text-xs text-ink/45">Aangemaakt op {formatDate(workplan.createdAt)}</p>
                    </div>
                    <Link href={`/admin/projects/${projectId}/workplans/${workplan.id}`} className="rounded-full bg-lime px-4 py-2 text-sm font-semibold text-white">
                      Open plan
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
