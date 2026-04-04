import Link from "next/link";
import type { Route } from "next";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { TenantConfigEditor } from "@/components/dashboard/tenant-config-editor";
import { LogoutButton } from "@/components/forms/logout-button";
import { requireAgencyUser } from "@/lib/auth";
import { getTenantConfigData } from "@/lib/package-builder-data";

export default async function TenantConfigPage({
  params
}: {
  params: Promise<{ tenantId: string }>;
}) {
  await requireAgencyUser();
  const { tenantId } = await params;
  const data = await getTenantConfigData(tenantId);

  return (
    <DashboardShell
      roleLabel="Agency"
      brand="SteigerHub"
      title="Configuratie per klant"
      subtitle="Schakel hier modules in of uit en pas formulieren en velden aan zonder code. Dit is je white-label beheerlaag."
      navItems={[
        { label: "Overzicht", href: "/agency", caption: "Klanten en omzet" },
        { label: "Pakketten", href: "/agency/packages", caption: "Templates en modules" },
        { label: "Klantconfig", href: `/agency/tenants/${tenantId}/config`, active: true, caption: "Per tenant aanpassen" }
      ]}
      actions={
        <>
          <Link href="/agency" className="rounded-full border border-line px-4 py-2 text-sm font-semibold text-ink">
            Agency
          </Link>
          {tenantId ? (
            <Link
              href={`/workspace?tenantId=${tenantId}` as Route}
              className="rounded-full bg-lime px-4 py-2 text-sm font-semibold text-white"
            >
              Open workspace
            </Link>
          ) : null}
          <LogoutButton />
        </>
      }
    >
      <TenantConfigEditor data={data} />
    </DashboardShell>
  );
}
