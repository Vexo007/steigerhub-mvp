import Link from "next/link";
import { AdminDashboardShell } from "@/components/layout/admin-dashboard-shell";
import { Panel } from "@/components/ui/panel";
import { WorkplanDetailShell } from "@/components/workplans/workplan-detail-shell";
import { requireAppUser } from "@/lib/auth";
import { getWorkplanDetail } from "@/lib/workplan-data";

export default async function AdminWorkplanDetailPage({
  params
}: {
  params: Promise<{ projectId: string; workplanId: string }>;
}) {
  const user = await requireAppUser();
  const { projectId, workplanId } = await params;
  const data = await getWorkplanDetail(user, workplanId);

  return (
    <AdminDashboardShell
      user={user}
      tenant={data.tenant}
      tenantId={data.tenant?.id}
      currentKey="projects"
      title={data.workplan.title}
      subtitle="Werk het plan stap voor stap uit, zoals in een KAM-flow, maar dan rustiger en projectgericht."
    >
      <div className="grid gap-6">
        <Panel className="bg-forest text-white">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-white/45">Uitvoeringsplan</p>
              <h2 className="mt-2 text-2xl font-semibold">{data.workplan.planType}</h2>
              <p className="mt-2 text-sm text-white/72">
                Project: {data.project.clientName} · {data.project.siteAddress}, {data.project.siteCity}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link href={`/admin/projects/${projectId}/workplans`} className="rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white">
                Terug naar werkplannen
              </Link>
              <Link href={`/workspace/project/${projectId}/workplans/${workplanId}`} className="rounded-full bg-lime px-4 py-2 text-sm font-semibold text-white">
                Open als werkapp
              </Link>
            </div>
          </div>
        </Panel>

        <WorkplanDetailShell
          workplanId={workplanId}
          sections={data.sections}
          projectDefaults={{
            titel: data.workplan.title,
            opdrachtgever: data.project.clientName,
            plaats: data.project.siteCity,
            adres: data.project.siteAddress,
            startdatum: data.project.startDate
          }}
        />
      </div>
    </AdminDashboardShell>
  );
}
