import Link from "next/link";
import { CustomerCreateForm } from "@/components/forms/customer-create-form";
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

  const customers =
    data.customers.length > 0
      ? data.customers.map((customer) => ({
          ...customer,
          contacts: data.contacts.filter((contact) => contact.customerId === customer.id),
          addresses: data.addresses.filter((address) => address.customerId === customer.id),
          projectCount: data.projects.filter((project) => project.customerId === customer.id || project.clientName === customer.name).length
        }))
      : [];

  return (
    <AdminDashboardShell
      user={user}
      tenant={data.tenant}
      tenantId={tenantId}
      currentKey="customers"
      title="Klanten"
      subtitle="Bouw hier per klant echte historie op met contactpersonen, adressen, projecten, documenten en klachten."
    >
      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Panel>
          <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-ink/45">Nieuwe klant</p>
          <h2 className="mt-2 text-2xl font-semibold text-forest">Bedrijf, contact en adres</h2>
          <p className="mt-2 text-sm text-ink/60">Voeg een klant toe met direct de belangrijkste contactgegevens en hoofdadres.</p>
          <div className="mt-5">
            <CustomerCreateForm tenantId={data.tenant?.id ?? ""} />
          </div>
        </Panel>

        <Panel>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-ink/45">Klantenoverzicht</p>
              <h2 className="mt-2 text-2xl font-semibold text-forest">Bedrijven, adressen en historie</h2>
            </div>
            <p className="text-sm text-ink/55">{customers.length} klant(en)</p>
          </div>
          <div className="mt-5 grid gap-3">
            {customers.length === 0 ? (
              <div className="rounded-[20px] border border-dashed border-line bg-mist/60 px-4 py-4 text-sm text-ink/60">
                Er zijn nog geen klanten zichtbaar. Voeg hierboven de eerste klant toe.
              </div>
            ) : (
              customers.map((customer) => (
                <div key={customer.id} className="rounded-[22px] border border-line bg-mist/60 p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-lg font-semibold text-forest">{customer.name}</p>
                      <p className="mt-1 text-sm text-ink/60">
                        {customer.projectCount} project(en) · {customer.addresses.length} adres(sen)
                      </p>
                    </div>
                    <Link href="/admin/projects" className="rounded-full border border-line px-4 py-2 text-sm font-semibold text-ink">
                      Bekijk projecten
                    </Link>
                  </div>
                  <div className="mt-4 grid gap-2 text-sm text-ink/65">
                    <p>
                      <span className="font-semibold text-forest">Contacten:</span>{" "}
                      {customer.contacts.length > 0
                        ? customer.contacts.map((contact) => `${contact.fullName}${contact.email ? ` (${contact.email})` : ""}`).join(", ")
                        : "Nog geen contact toegevoegd"}
                    </p>
                    <p>
                      <span className="font-semibold text-forest">Adressen:</span>{" "}
                      {customer.addresses.length > 0
                        ? customer.addresses.map((address) => `${address.street}, ${address.city}`).join(" · ")
                        : "Nog geen adres toegevoegd"}
                    </p>
                    {customer.notes ? (
                      <p>
                        <span className="font-semibold text-forest">Notitie:</span> {customer.notes}
                      </p>
                    ) : null}
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
