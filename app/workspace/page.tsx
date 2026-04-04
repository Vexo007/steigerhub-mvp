import Link from "next/link";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { PackageWorkspace } from "@/components/dashboard/package-workspace";
import { LogoutButton } from "@/components/forms/logout-button";
import { requireAppUser } from "@/lib/auth";
import { getPackageWorkspaceData } from "@/lib/package-builder-data";

export default async function WorkspacePage({
  searchParams
}: {
  searchParams?: Promise<{ tenantId?: string }>;
}) {
  const params = (await searchParams) ?? {};
  const user = await requireAppUser();
  const tenantId = user.role === "agency_admin" ? params.tenantId : user.tenantId ?? undefined;
  const data = await getPackageWorkspaceData(tenantId);
  const roleLabel = user.role === "agency_admin" ? "Tenant demo" : user.role === "tenant_admin" ? "Bedrijfsadmin" : "Werkvloer";

  return (
    <DashboardShell
      roleLabel={roleLabel}
      brand={data.tenant?.name ?? "SteigerHub"}
      title="Werkprocessen en formulieren"
      subtitle={`Ingelogd als ${user.fullName}. Dit scherm is rustig gehouden voor mobiel gebruik op de werkvloer en duidelijk genoeg voor de eigenaar op desktop.`}
      navItems={[
        { label: "Overzicht", href: tenantId ? `/workspace?tenantId=${tenantId}` : "/workspace", active: true, caption: "Dashboard en taken" },
        { label: "Projecten", href: tenantId ? `/workspace?tenantId=${tenantId}#projecten` : "/workspace#projecten", caption: "Klant en adres" },
        { label: "Formulieren", href: tenantId ? `/workspace?tenantId=${tenantId}#formulieren` : "/workspace#formulieren", caption: "Invullen en uploaden" },
        { label: "Bedrijfsprofiel", href: tenantId ? `/workspace?tenantId=${tenantId}#profiel` : "/workspace#profiel", caption: "Logo en RE&I" }
      ]}
      actions={
        <>
          {user.role === "agency_admin" ? (
            <Link href="/agency" className="rounded-full border border-line px-4 py-2 text-sm font-semibold text-ink">
              Agency
            </Link>
          ) : null}
          <LogoutButton />
        </>
      }
    >
      <PackageWorkspace data={data} />
    </DashboardShell>
  );
}
