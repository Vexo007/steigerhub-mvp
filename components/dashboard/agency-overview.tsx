import Link from "next/link";
import type { SubscriptionSummary, Tenant } from "@/lib/types";
import { euro, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Panel } from "@/components/ui/panel";
import { StatCard } from "@/components/ui/stat-card";
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
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Klanten" value={tenants.length} detail="Actieve klantomgevingen" />
        <StatCard
          label="Actieve dossiers"
          value={tenants.reduce((sum, tenant) => sum + tenant.projectCount, 0)}
          detail="Projecten in alle tenants"
        />
        <StatCard
          label="MRR"
          value={euro(subscriptions.reduce((sum, item) => sum + item.amountMonthly, 0))}
          detail="Maandelijkse softwareomzet"
        />
        <StatCard
          label="Databron"
          value={source === "supabase" ? "Live" : "Preview"}
          detail={source === "supabase" ? "Supabase productiegegevens" : "Mock voorbeelddata"}
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <Panel>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-ink/45">Klantaccounts</p>
              <h2 className="mt-2 text-2xl font-semibold text-forest">Agency klantenoverzicht</h2>
            </div>
            <div className="rounded-full bg-lime/10 px-4 py-2 text-sm font-semibold text-lime">
              Handmatige onboarding
            </div>
          </div>
          <p className="mt-3 text-sm text-ink/60">
            Rustig overzicht van klanten, pakketstatus en billing-acties. Dit is de agency-kant zoals jij hem voor je ziet.
          </p>

          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-ink/45">
                <tr>
                  <th className="pb-3 font-medium">Klant</th>
                  <th className="pb-3 font-medium">Pakket</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Volgende factuur</th>
                  <th className="pb-3 font-medium">Actie</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {tenants.map((tenant) => {
                  const subscription = subscriptions.find((item) => item.tenantId === tenant.id);
                  return (
                    <tr key={tenant.id}>
                      <td className="py-5">
                        <div className="font-semibold text-forest">{tenant.name}</div>
                        <div className="mt-1 text-ink/55">{tenant.contactEmail}</div>
                      </td>
                      <td className="py-5 capitalize text-ink">{tenant.packageTier}</td>
                      <td className="py-5">
                        <Badge tone={tenant.status}>{tenant.status}</Badge>
                      </td>
                      <td className="py-5 text-ink/70">
                        {subscription ? formatDate(subscription.nextBillingDate) : "Nog niet gekoppeld"}
                      </td>
                      <td className="py-5">
                        <div className="grid gap-2 md:min-w-[220px]">
                          <Link
                            href={`/admin?tenantId=${tenant.id}`}
                            className="rounded-full border border-line px-4 py-2 text-center text-sm font-semibold text-ink"
                          >
                            Open als eigenaar
                          </Link>
                          <Link
                            href={`/workspace?tenantId=${tenant.id}`}
                            className="rounded-full border border-line px-4 py-2 text-center text-sm font-semibold text-ink"
                          >
                            Open werkapp
                          </Link>
                          <Link
                            href={`/agency/tenants/${tenant.id}/config`}
                            className="rounded-full border border-line px-4 py-2 text-center text-sm font-semibold text-ink"
                          >
                            Beheer pakket
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

        <Panel className="sticky top-6 h-fit">
          <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-ink/45">Nieuwe klant</p>
          <h2 className="mt-2 text-2xl font-semibold text-forest">Nieuwe tenant onboarden</h2>
          <p className="mt-2 text-sm text-ink/60">
            Maak hier direct een nieuwe klantomgeving aan, koppel een pakket en geef de eigenaar meteen zijn eerste login.
          </p>
          <Link
            href="/agency/packages"
            className="mt-4 inline-flex rounded-full border border-line px-4 py-2 text-sm font-semibold text-ink"
          >
            Beheer pakketten
          </Link>
          <div className="mt-5">
            <TenantCreateForm />
          </div>
        </Panel>
      </section>
    </div>
  );
}
