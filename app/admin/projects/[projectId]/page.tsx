import Link from "next/link";
import { AdminDashboardShell } from "@/components/layout/admin-dashboard-shell";
import { ProjectTaskBoard } from "@/components/workplans/project-task-board";
import { Panel } from "@/components/ui/panel";
import { requireAppUser } from "@/lib/auth";
import { getProjectTaskData } from "@/lib/workplan-data";

export default async function AdminProjectDetailPage({
  params
}: {
  params: Promise<{ projectId: string }>;
}) {
  const user = await requireAppUser();
  const { projectId } = await params;
  const data = await getProjectTaskData(user, projectId);

  return (
    <AdminDashboardShell
      user={user}
      tenant={data.tenant}
      tenantId={data.tenant?.id}
      currentKey="projects"
      title={data.project.clientName}
      subtitle="Dit is de projectwerkruimte voor admin. Vanaf hier stuur je door naar taken, formulieren en de werkplan-generator."
    >
      <div className="grid gap-6">
        <Panel className="bg-mist/55">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-ink/45">Projectwerkruimte</p>
              <h2 className="mt-2 text-2xl font-semibold text-forest">Taken en werkplannen voor dit dossier</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link href="/admin/projects" className="rounded-full border border-line px-4 py-2 text-sm font-semibold text-ink">
                Terug naar projecten
              </Link>
              <Link href={`/workspace/project/${projectId}`} className="rounded-full bg-lime px-4 py-2 text-sm font-semibold text-white">
                Open als werkapp
              </Link>
            </div>
          </div>
        </Panel>

        <ProjectTaskBoard
          project={data.project}
          tasks={data.tasks}
          primaryCtaHref={`/admin/projects/${projectId}/workplans`}
          primaryCtaLabel="Open werkplan generator"
        />
      </div>
    </AdminDashboardShell>
  );
}
