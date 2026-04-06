import Link from "next/link";
import { IncidentCreateForm } from "@/components/forms/incident-create-form";
import { AdminDashboardShell } from "@/components/layout/admin-dashboard-shell";
import { ProjectTaskBoard } from "@/components/workplans/project-task-board";
import { Panel } from "@/components/ui/panel";
import { getAuthorizedTenantId, requireAppUser } from "@/lib/auth";
import { getTenantAdminData } from "@/lib/package-builder-data";
import { getProjectTaskData } from "@/lib/workplan-data";

export default async function AdminProjectDetailPage({
  params,
  searchParams
}: {
  params: Promise<{ projectId: string }>;
  searchParams?: Promise<{ tenantId?: string }>;
}) {
  const user = await requireAppUser();
  const { projectId } = await params;
  const query = (await searchParams) ?? {};
  const tenantId = getAuthorizedTenantId(user, query.tenantId) ?? undefined;
  const data = await getProjectTaskData(user, projectId);
  const admin = await getTenantAdminData(tenantId ?? data.tenant?.id ?? undefined);

  return (
    <AdminDashboardShell
      user={user}
      tenant={data.tenant}
      tenantId={data.tenant?.id}
      currentKey="projects"
      title={data.project.clientName}
      subtitle="Dit is de projectwerkruimte voor admin. Vanaf hier stuur je door naar taken, formulieren, documenten en de werkplan-generator."
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

        <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
          <Panel>
            <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-ink/45">Open acties</p>
            <h2 className="mt-2 text-2xl font-semibold text-forest">Projecttaken en materieel</h2>
            <div className="mt-5 grid gap-3">
              {admin.projectTasks.filter((task) => task.projectId === projectId).map((task) => (
                <div key={task.id} className="rounded-[20px] border border-line bg-mist/60 px-4 py-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-forest">{task.title}</p>
                      <p className="mt-1 text-sm text-ink/60">{task.taskType} · prioriteit {task.priority}</p>
                    </div>
                    <span className="rounded-full border border-line px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-ink/55">
                      {task.status}
                    </span>
                  </div>
                  {task.notes ? <p className="mt-2 text-sm text-ink/60">{task.notes}</p> : null}
                </div>
              ))}
              {admin.projectTasks.filter((task) => task.projectId === projectId).length === 0 ? (
                <div className="rounded-[20px] border border-line bg-mist/60 px-4 py-4 text-sm text-ink/60">Nog geen taken gekoppeld aan dit project.</div>
              ) : null}

              <div className="rounded-[20px] border border-line bg-panel px-4 py-4">
                <p className="font-semibold text-forest">Materieel</p>
                <p className="mt-1 text-sm text-ink/60">
                  {admin.materialItems.filter((item) => item.projectId === projectId).length > 0
                    ? admin.materialItems
                        .filter((item) => item.projectId === projectId)
                        .map((item) => `${item.quantity} ${item.unit} ${item.name}`)
                        .join(", ")
                    : "Nog geen materieel geregistreerd voor dit project."}
                </p>
              </div>
            </div>
          </Panel>

          <Panel>
            <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-ink/45">Meldingen</p>
            <h2 className="mt-2 text-2xl font-semibold text-forest">Incidenten, documenten en reminders</h2>
            <div className="mt-5 grid gap-5">
              <IncidentCreateForm tenantId={data.tenant?.id ?? ""} projects={admin.projects} customers={admin.customers} />
              <div className="grid gap-3">
                {admin.incidents.filter((incident) => incident.projectId === projectId).map((incident) => (
                  <div key={incident.id} className="rounded-[20px] border border-line bg-mist/60 px-4 py-4">
                    <p className="font-semibold text-forest">{incident.title}</p>
                    <p className="mt-1 text-sm text-ink/60">{incident.severity} · {incident.status}</p>
                  </div>
                ))}
                {admin.projectDocuments.filter((document) => document.projectId === projectId).map((document) => (
                  <div key={document.id} className="rounded-[20px] border border-line bg-panel px-4 py-4">
                    <p className="font-semibold text-forest">{document.title}</p>
                    <p className="mt-1 text-sm text-ink/60">{document.category} · {document.fileName}</p>
                  </div>
                ))}
                {admin.reminders.filter((reminder) => reminder.projectId === projectId).map((reminder) => (
                  <div key={reminder.id} className="rounded-[20px] border border-line bg-panel px-4 py-4">
                    <p className="font-semibold text-forest">{reminder.title}</p>
                    <p className="mt-1 text-sm text-ink/60">{reminder.kind}</p>
                  </div>
                ))}
                {admin.incidents.filter((incident) => incident.projectId === projectId).length === 0 &&
                admin.projectDocuments.filter((document) => document.projectId === projectId).length === 0 &&
                admin.reminders.filter((reminder) => reminder.projectId === projectId).length === 0 ? (
                  <div className="rounded-[20px] border border-line bg-mist/60 px-4 py-4 text-sm text-ink/60">
                    Nog geen incidenten, documenten of reminders voor dit project.
                  </div>
                ) : null}
              </div>
            </div>
          </Panel>
        </section>
      </div>
    </AdminDashboardShell>
  );
}
