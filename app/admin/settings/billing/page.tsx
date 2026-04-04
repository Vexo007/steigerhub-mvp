import Link from "next/link";
import { AdminDashboardShell } from "@/components/layout/admin-dashboard-shell";
import { Badge } from "@/components/ui/badge";
import { Panel } from "@/components/ui/panel";
import { getAuthorizedTenantId, requireAppUser } from "@/lib/auth";
import { getTenantConfigData, getTenantAdminData } from "@/lib/package-builder-data";

export default async function AdminBillingSettingsPage({
  searchParams
}: {
  searchParams?: Promise<{ tenantId?: string }>;
}) {
  const params = (await searchParams) ?? {};
  const user = await requireAppUser();
  const tenantId = getAuthorizedTenantId(user, params.tenantId) ?? undefined;
  const data = await getTenantAdminData(tenantId);
  const config = data.tenant ? await getTenantConfigData(data.tenant.id) : null;
  const activeFeatures = config?.moduleBundles.filter((bundle) => bundle.module.isEnabled) ?? [];

  return (
    <AdminDashboardShell
      user={user}
      tenant={data.tenant}
      tenantId={tenantId}
      currentKey="settings-billing"
      title="Abonnement"
      subtitle="Bekijk hier welk pakket actief is, welke modules aanstaan en waar je voor billingbeheer moet zijn."
    >
      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <Panel>
          <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-ink/45">Huidig pakket</p>
          <h2 className="mt-2 text-2xl font-semibold text-forest">{data.packageDefinition?.name ?? "Nog geen pakket gekoppeld"}</h2>
          <div className="mt-4 flex flex-wrap gap-3">
            <Badge tone={data.tenant?.status ?? "trialing"}>{data.tenant?.status ?? "onbekend"}</Badge>
            {data.tenant?.packageTier ? <Badge tone="active">{data.tenant.packageTier}</Badge> : null}
          </div>
          <p className="mt-4 text-sm text-ink/65">
            De bedrijfsadmin ziet hier de actieve modules. Het aanpassen van pakket, facturatie en Stripe blijft voorlopig
            onder agency-beheer.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link href="/agency" className="rounded-full border border-line px-4 py-2 text-sm font-semibold text-ink">
              Open agency billing
            </Link>
            <Link href="/admin/settings/company" className="rounded-full border border-line px-4 py-2 text-sm font-semibold text-ink">
              Bedrijfsprofiel
            </Link>
          </div>
        </Panel>

        <Panel>
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-ink/45">Actieve features</p>
              <h2 className="mt-2 text-2xl font-semibold text-forest">Modules in dit pakket</h2>
            </div>
            <p className="text-sm text-ink/55">{activeFeatures.length} module(s)</p>
          </div>
          <div className="mt-5 grid gap-3">
            {activeFeatures.length === 0 ? (
              <div className="rounded-[20px] border border-dashed border-line bg-mist/60 px-4 py-4 text-sm text-ink/60">
                Er zijn nog geen modules geactiveerd voor dit account.
              </div>
            ) : (
              activeFeatures.map((bundle) => (
                <div key={bundle.module.id} className="rounded-[22px] border border-line bg-mist/60 p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-lg font-semibold text-forest">{bundle.module.name}</p>
                      <p className="mt-1 text-sm text-ink/60">{bundle.forms.length} formulier(en) binnen deze module</p>
                    </div>
                    <Badge tone="active">actief</Badge>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {bundle.forms.map(({ form }) => (
                      <span key={form.id} className="rounded-full border border-line bg-panel px-3 py-1 text-xs font-semibold text-ink/75">
                        {form.name}
                      </span>
                    ))}
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
