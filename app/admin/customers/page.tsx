import Link from "next/link";
import { AdminDashboardShell } from "@/components/layout/admin-dashboard-shell";
import { Panel } from "@/components/ui/panel";
import { getAuthorizedTenantId, requireAppUser } from "@/lib/auth";
import { getTenantAdminData } from "@/lib/package-builder-data";

export default async function AdminCustomersPage({
  searchParams
}: {
  searchParams?: Promise<{ tenantId?: string }>;
}) {
  const params = (await searchParams) ?? {};
  const user = await requireAppUser();
  const tenantId = getAuthorizedTenantId(user, params.tenantId) ?? undefined;
  const data = await getTenantAdminData(tenantId);

  const customerMap = new Map<
    string,
    {
      name: string;
      addresses: Set<string>;
      cities: Set<string>;
      projectCount: number;
    }
  >();

  for (const project of data.projects) {
    const current = customerMap.get(project.clientName) ?? {
      name: project.clientName,
      addresses: new Set<string>(),
      cities: new Set<string>(),
      projectCount: 0
    };
    current.addresses.add(project.siteAddress);
    current.cities.add(project.siteCity);
    current.projectCount += 1;
    customerMap.set(project.clientName, current);
  }

  const customers = Array.from(customerMap.values()).sort((left, right) => right.projectCount - left.projectCount);

  return (
    <AdminDashboardShell
      user={user}
      tenant={data.tenant}
      tenantId={tenantId}
      currentKey="customers"
      title="Klanten"
      subtitle="Per klant zie je hier hoeveel projecten er lopen en op welke adressen jouw teams actief zijn."
    >
      <div className="grid gap-6">
        <Panel>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-ink/45">Klantenoverzicht</p>
              <h2 className="mt-2 text-2xl font-semibold text-forest">Bedrijven en adressen</h2>
            </div>
            <p className="text-sm text-ink/55">{customers.length} klant(en)</p>
          </div>
          <div className="mt-5 grid gap-3">
            {customers.length === 0 ? (
              <div className="rounded-[20px] border border-dashed border-line bg-mist/60 px-4 py-4 text-sm text-ink/60">
                Er zijn nog geen klanten zichtbaar. Maak eerst een project aan om de eerste klant te zien.
              </div>
            ) : (
              customers.map((customer) => (
                <div key={customer.name} className="rounded-[22px] border border-line bg-mist/60 p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-lg font-semibold text-forest">{customer.name}</p>
                      <p className="mt-1 text-sm text-ink/60">
                        {customer.projectCount} project(en) · {customer.addresses.size} adres(sen)
                      </p>
                    </div>
                    <Link href="/admin/projects" className="rounded-full border border-line px-4 py-2 text-sm font-semibold text-ink">
                      Bekijk projecten
                    </Link>
                  </div>
                  <div className="mt-4 grid gap-2 text-sm text-ink/65">
                    <p>
                      <span className="font-semibold text-forest">Adressen:</span> {Array.from(customer.addresses).join(", ")}
                    </p>
                    <p>
                      <span className="font-semibold text-forest">Plaatsen:</span> {Array.from(customer.cities).join(", ")}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </Panel>
      </div>
    </AdminDashboardShell>
  );
}
