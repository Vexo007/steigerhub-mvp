import { AdminDashboardShell } from "@/components/layout/admin-dashboard-shell";
import { TenantAdminOverview } from "@/components/dashboard/tenant-admin-overview";
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
    <AdminDashboardShell
      user={user}
      tenant={data.tenant}
      tenantId={tenantId ?? undefined}
      currentKey="overview"
      title="Admin dashboard"
      subtitle="Beheer hier projecten, klanten, medewerkers en alle bedrijfsinstellingen van deze steigerbouwer."
    >
      <TenantAdminOverview data={data} tenantId={tenantId ?? undefined} />
    </AdminDashboardShell>
  );
}
