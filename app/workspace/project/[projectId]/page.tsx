import Link from "next/link";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { LogoutButton } from "@/components/forms/logout-button";
import { ProjectTaskBoard } from "@/components/workplans/project-task-board";
import { requireAppUser } from "@/lib/auth";
import { getProjectTaskData } from "@/lib/workplan-data";

export default async function WorkspaceProjectPage({
  params
}: {
  params: Promise<{ projectId: string }>;
}) {
  const user = await requireAppUser();
  const { projectId } = await params;
  const data = await getProjectTaskData(user, projectId);

  return (
    <DashboardShell
      roleLabel={user.role === "tenant_staff" ? "Werkvloer" : user.role === "tenant_admin" ? "Bedrijfsadmin" : "Agency als klant"}
      brand={data.tenant?.name ?? "SteigerHub"}
      title="Projecttaken"
      subtitle="Werk nu per project met duidelijke taakblokken. Zo voelt het meer als een KAM-flow en minder als één lange formulierenlijst."
      navItems={[
        { label: "Project", href: `/workspace/project/${projectId}`, active: true, caption: "Taken per klant" },
        { label: "Werkplan generator", href: `/workspace/project/${projectId}/workplans`, caption: "VGM plan en secties" },
        { label: "Terug naar werkapp", href: `/workspace?projectId=${projectId}`, caption: "Algemene formulieren" }
      ]}
      actions={
        <>
          <Link href="/workspace" className="rounded-full border border-line px-4 py-2 text-sm font-semibold text-ink">
            Werkapp
          </Link>
          <LogoutButton />
        </>
      }
    >
      <ProjectTaskBoard project={data.project} tasks={data.tasks} />
    </DashboardShell>
  );
}
