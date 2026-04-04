import Link from "next/link";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { LogoutButton } from "@/components/forms/logout-button";
import { Panel } from "@/components/ui/panel";
import { WorkplanDetailShell } from "@/components/workplans/workplan-detail-shell";
import { requireAppUser } from "@/lib/auth";
import { getWorkplanDetail } from "@/lib/workplan-data";

export default async function WorkplanDetailPage({
  params
}: {
  params: Promise<{ projectId: string; workplanId: string }>;
}) {
  const user = await requireAppUser();
  const { projectId, workplanId } = await params;
  const data = await getWorkplanDetail(user, workplanId);

  return (
    <DashboardShell
      roleLabel={user.role === "tenant_staff" ? "Werkvloer" : user.role === "tenant_admin" ? "Bedrijfsadmin" : "Agency als klant"}
      brand={data.tenant?.name ?? "SteigerHub"}
      title={data.workplan.title}
      subtitle="Werk het plan stap voor stap uit in secties, zoals je nu ook in het KAM-systeem ziet, maar dan rustiger en moderner."
      navItems={[
        { label: "Werkplan", href: `/workspace/project/${projectId}/workplans/${workplanId}`, active: true, caption: "Secties en voortgang" },
        { label: "Lijst", href: `/workspace/project/${projectId}/workplans`, caption: "Alle werkplannen" }
      ]}
      actions={
        <>
          <Link href={`/workspace/project/${projectId}/workplans`} className="rounded-full border border-line px-4 py-2 text-sm font-semibold text-ink">
            Terug naar werkplannen
          </Link>
          <LogoutButton />
        </>
      }
    >
      <div className="grid gap-6">
        <Panel className="bg-forest text-white">
          <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-white/45">Uitvoeringsplan</p>
          <h2 className="mt-2 text-2xl font-semibold">{data.workplan.planType}</h2>
          <p className="mt-2 text-sm text-white/72">
            Project: {data.project.clientName} · {data.project.siteAddress}, {data.project.siteCity}
          </p>
        </Panel>

        <WorkplanDetailShell workplanId={workplanId} sections={data.sections} />
      </div>
    </DashboardShell>
  );
}
