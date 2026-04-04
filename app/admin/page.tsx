import Link from "next/link";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { TenantAdminOverview } from "@/components/dashboard/tenant-admin-overview";
import { LogoutButton } from "@/components/forms/logout-button";
import { getAuthorizedTenantId, requireAppUser } from "@/lib/auth";
import { getTenantAdminData } from "@/lib/package-builder-data";

export default async function AdminPage({
  searchParams
}: {
  searchParams?: Promise<{ tenantId?: string }>;
}) {
  const params = (await searchParams) ?? {};
  const user = await requireAppUser();

  let tenantId: string | null;
  try {
    tenantId = getAuthorizedTenantId(user, params.tenantId);
  } catch {
    tenantId = user.tenantId;
  }

  const data = await getTenantAdminData(tenantId ?? undefined);

  return (
    <DashboardShell
      roleLabel={user.role === "agency_admin" ? "Agency als klant" : "Bedrijfsadmin"}
      brand={data.tenant?.name ?? "SteigerHub"}
      title="Admin dashboard"
      subtitle="Beheer je bedrijf, medewerkers en zie welke werknemer welk formulier heeft ingevuld."
      navItems={[
        { label: "Overzicht", href: tenantId ? `/admin?tenantId=${tenantId}` : "/admin", active: true, caption: "Bedrijf en team" },
        { label: "Company settings", href: tenantId ? `/admin/settings/company?tenantId=${tenantId}` : "/admin/settings/company", caption: "Logo en documenten" },
        { label: "Werkapp", href: tenantId ? `/workspace?tenantId=${tenantId}` : "/workspace", caption: "Werknemer weergave" }
      ]}
      actions={
        <>
          {user.role === "agency_admin" ? (
            <Link href="/agency" className="rounded-full border border-line px-4 py-2 text-sm font-semibold text-ink">
              Terug naar agency
            </Link>
          ) : null}
          <LogoutButton />
        </>
      }
    >
      <TenantAdminOverview data={data} />
    </DashboardShell>
  );
}
