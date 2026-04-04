import Link from "next/link";
import { Panel } from "@/components/ui/panel";

const features = [
  "Agency dashboard voor klanten, pakketten en support",
  "Tenant-dossiers per adres met materiaal, tekeningen en veiligheid",
  "Stripe Billing flow voor handmatige onboarding",
  "AVG-basis met tenant-scheiding, private opslag en audit-log structuur"
];

export default function HomePage() {
  return (
    <main className="mx-auto min-h-screen max-w-7xl px-6 py-8 lg:px-10">
      <section className="overflow-hidden rounded-[40px] bg-ink px-7 py-8 text-white lg:px-10 lg:py-12">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-sand">SteigerHub</p>
            <h1 className="mt-4 max-w-2xl text-4xl font-semibold leading-tight lg:text-6xl">
              SaaS-operatieplatform voor steigerbouwers, gebouwd om mee te groeien.
            </h1>
            <p className="mt-5 max-w-xl text-base text-white/75 lg:text-lg">
              Een lean MVP met agency-beheer, klantsubaccounts, dossierbeheer op locatie en een
              directe Stripe-koppeling voor abonnementen.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/agency" className="rounded-full bg-rust px-5 py-3 text-sm font-semibold text-white">
                Open agency dashboard
              </Link>
              <Link
                href="/workspace"
                className="rounded-full border border-white/20 px-5 py-3 text-sm font-semibold text-white"
              >
                Open tenant workspace
              </Link>
            </div>
          </div>
          <Panel className="bg-white/95">
            <p className="text-sm uppercase tracking-[0.2em] text-ink/50">MVP focus</p>
            <ul className="mt-4 grid gap-3 text-sm text-ink/80">
              {features.map((feature) => (
                <li key={feature} className="rounded-2xl bg-mist px-4 py-3">
                  {feature}
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-3">
        <Panel>
          <p className="text-sm uppercase tracking-[0.2em] text-ink/50">Voor agency</p>
          <h2 className="mt-3 text-xl font-semibold text-ink">Beheer alle klanten centraal</h2>
          <p className="mt-2 text-sm text-ink/70">
            Maak tenants aan, beheer pakketstatus en stuur facturatie via Stripe.
          </p>
        </Panel>
        <Panel>
          <p className="text-sm uppercase tracking-[0.2em] text-ink/50">Voor locatieploegen</p>
          <h2 className="mt-3 text-xl font-semibold text-ink">Snelle mobiele dossierflow</h2>
          <p className="mt-2 text-sm text-ink/70">
            Zie materiaal, bouwtekening, veiligheidsdocumenten en notities per adres.
          </p>
        </Panel>
        <Panel>
          <p className="text-sm uppercase tracking-[0.2em] text-ink/50">Voor AVG</p>
          <h2 className="mt-3 text-xl font-semibold text-ink">Multi-tenant vanaf de basis</h2>
          <p className="mt-2 text-sm text-ink/70">
            Tenant-scheiding via RLS, private storage en voorbereiding voor export/verwijderen.
          </p>
        </Panel>
      </section>
    </main>
  );
}

