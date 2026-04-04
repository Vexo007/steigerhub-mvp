import { EmployeeCreateForm } from "@/components/forms/employee-create-form";
import { AdminDashboardShell } from "@/components/layout/admin-dashboard-shell";
import { Badge } from "@/components/ui/badge";
import { Panel } from "@/components/ui/panel";
import { getAuthorizedTenantId, requireAppUser } from "@/lib/auth";
import { getTenantAdminData } from "@/lib/package-builder-data";
import { formatDate } from "@/lib/utils";

export default async function AdminEmployeesPage({
  searchParams
}: {
  searchParams?: Promise<{ tenantId?: string }>;
}) {
  const params = (await searchParams) ?? {};
  const user = await requireAppUser();
  const tenantId = getAuthorizedTenantId(user, params.tenantId) ?? undefined;
  const data = await getTenantAdminData(tenantId);

  return (
    <AdminDashboardShell
      user={user}
      tenant={data.tenant}
      tenantId={tenantId}
      currentKey="employees"
      title="Medewerkers"
      subtitle="Beheer hier managers en werknemers van het bedrijf, inclusief rollen en tijdelijke logins."
    >
      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Panel>
          <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-ink/45">Nieuwe gebruiker</p>
          <h2 className="mt-2 text-2xl font-semibold text-forest">Manager of werknemer toevoegen</h2>
          <p className="mt-2 text-sm text-ink/65">De bedrijfsadmin maakt hier medewerkers aan die daarna kunnen inloggen op het eigen account.</p>
          <div className="mt-5">
            <EmployeeCreateForm />
          </div>
        </Panel>

        <Panel>
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-ink/45">Teamlijst</p>
              <h2 className="mt-2 text-2xl font-semibold text-forest">Alle medewerkers</h2>
            </div>
            <p className="text-sm text-ink/55">{data.employees.length} gebruiker(s)</p>
          </div>
          <div className="mt-5 grid gap-3">
            {data.employees.length === 0 ? (
              <div className="rounded-[20px] border border-dashed border-line bg-mist/60 px-4 py-4 text-sm text-ink/60">
                Er zijn nog geen medewerkers toegevoegd.
              </div>
            ) : (
              data.employees.map((employee) => (
                <div key={employee.id} className="rounded-[22px] border border-line bg-mist/60 p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-lg font-semibold text-forest">{employee.fullName}</p>
                      <p className="mt-1 text-sm text-ink/60">{employee.email}</p>
                    </div>
                    <Badge tone={employee.role === "tenant_admin" ? "active" : "trialing"}>
                      {employee.role === "tenant_admin" ? "manager" : "werknemer"}
                    </Badge>
                  </div>
                  <p className="mt-3 text-sm text-ink/60">Toegevoegd op {formatDate(employee.createdAt)}</p>
                </div>
              ))
            )}
          </div>
        </Panel>
      </div>
    </AdminDashboardShell>
  );
}
