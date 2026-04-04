import Link from "next/link";
import type { SubscriptionSummary, Tenant } from "@/lib/types";
import { euro, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Panel } from "@/components/ui/panel";
import { TenantCreateForm } from "@/components/forms/tenant-create-form";
import { StripeCheckoutButton } from "@/components/forms/stripe-checkout-button";

export function AgencyOverview({
  tenants,
  subscriptions,
  source
}: {
  tenants: Tenant[];
  subscriptions: SubscriptionSummary[];
  source: "mock" | "supabase";
}) {
  return (
    <div className="grid gap-6">
      <section className="grid gap-4 md:grid-cols-4">
        <Panel>
          <p className="text-sm uppercase tracking-[0.2em] text-ink/50">Klanten</p>
          <p className="mt-3 text-3xl font-semibold text-ink">{tenants.length}</p>
        </Panel>
        <Panel>
          <p className="text-sm uppercase tracking-[0.2em] text-ink/50">Actieve dossiers</p>
          <p className="mt-3 text-3xl font-semibold text-ink">
            {tenants.reduce((sum, tenant) => sum + tenant.projectCount, 0)}
          </p>
        </Panel>
        <Panel>
          <p className="text-sm uppercase tracking-[0.2em] text-ink/50">MRR</p>
          <p className="mt-3 text-3xl font-semibold text-ink">
            {euro(subscriptions.reduce((sum, item) => sum + item.amountMonthly, 0))}
          </p>
        </Panel>
        <Panel>
          <p className="text-sm uppercase tracking-[0.2em] text-ink/50">AVG-status</p>
          <p className="mt-3 text-lg font-semibold text-ink">
            {source === "supabase" ? "Live Supabase data" : "Mock preview data"}
          </p>
        </Panel>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        <Panel>
          <h2 className="text-xl font-semibold text-ink">Agency klantenoverzicht</h2>
          <p className="mt-1 text-sm text-ink/60">
            Handmatige onboarding, pakketbeheer en directe Stripe-acties.
          </p>
          <div className="mt-5 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-ink/50">
                <tr>
                  <th className="pb-3 font-medium">Klant</th>
                  <th className="pb-3 font-medium">Pakket</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Volgende factuur</th>
                  <th className="pb-3 font-medium">Actie</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/10">
                {tenants.map((tenant) => {
                  const subscription = subscriptions.find((item) => item.tenantId === tenant.id);
                  return (
                    <tr key={tenant.id}>
                      <td className="py-4">
                        <div className="font-semibold text-ink">{tenant.name}</div>
                        <div className="text-ink/55">{tenant.contactEmail}</div>
                      </td>
                      <td className="py-4 capitalize text-ink">{tenant.packageTier}</td>
                      <td className="py-4">
                        <Badge tone={tenant.status}>{tenant.status}</Badge>
                      </td>
                      <td className="py-4 text-ink/70">
                        {subscription ? formatDate(subscription.nextBillingDate) : "Nog niet gekoppeld"}
                      </td>
                      <td className="py-4">
                        <div className="grid gap-2">
                          <Link
                            href={`/workspace?tenantId=${tenant.id}`}
                            className="rounded-full border border-ink/10 px-4 py-2 text-center text-sm font-semibold text-ink"
                          >
                            Open workspace
                          </Link>
                          <StripeCheckoutButton tenantId={tenant.id} packageTier={tenant.packageTier} />
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {tenants.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-ink/55">
                      Nog geen tenants gevonden in Supabase.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </Panel>

        <Panel>
          <h2 className="text-xl font-semibold text-ink">Nieuwe tenant</h2>
          <p className="mt-1 text-sm text-ink/60">
            Houd onboarding bewust simpel in MVP: maak tenant, kies pakket, start Stripe-checkout.
          </p>
          <div className="mt-5">
            <TenantCreateForm />
          </div>
        </Panel>
      </section>
    </div>
  );
}
