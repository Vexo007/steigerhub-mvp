import Link from "next/link";
import { Panel } from "@/components/ui/panel";
import { getCurrentAppUser } from "@/lib/auth";

const features = [
  "Agency dashboard voor klanten, pakketten en support",
  "Tenant-dossiers per adres met materiaal, tekeningen en veiligheid",
  "Stripe Billing flow voor handmatige onboarding",
  "AVG-basis met tenant-scheiding, private opslag en audit-log structuur"
];

export default async function HomePage() {
  const user = await getCurrentAppUser();

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-4 py-4 lg:px-8 lg:py-8">
      <section className="overflow-hidden rounded-[34px] border border-forest/10 bg-forest px-6 py-8 text-white shadow-panel lg:px-10 lg:py-12">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-white/45">SteigerHub</p>
            <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-tight lg:text-6xl">
              Rustige software voor agency, eigenaar en werkvloer.
            </h1>
            <p className="mt-5 max-w-2xl text-base text-white/72 lg:text-lg">
              Geen drukke chaos, maar een strakke werkapp voor dossiers, formulieren, foto’s en pakketbeheer per klant.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={user ? (user.role === "agency_admin" ? "/agency" : "/workspace") : "/login"}
                className="rounded-full bg-lime px-5 py-3 text-sm font-semibold text-white"
              >
                {user ? "Open dashboard" : "Inloggen"}
              </Link>
              {!user ? (
                <Link
                  href="/setup"
                  className="rounded-full border border-white/15 px-5 py-3 text-sm font-semibold text-white"
                >
                  Eerste setup
                </Link>
              ) : null}
            </div>
          </div>
          <div className="rounded-[28px] bg-white/96 p-5 text-ink shadow-soft">
            <div className="grid gap-3">
              <div className="rounded-[22px] bg-canvas p-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-ink/45">Agency</p>
                <p className="mt-2 text-lg font-semibold text-forest">Klanten, pakketten en billing centraal</p>
              </div>
              <div className="rounded-[22px] bg-canvas p-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-ink/45">Bedrijfsadmin</p>
                <p className="mt-2 text-lg font-semibold text-forest">Bedrijfsprofiel, medewerkers en RE&I beheren</p>
              </div>
              <div className="rounded-[22px] bg-canvas p-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-ink/45">Werkvloer</p>
                <p className="mt-2 text-lg font-semibold text-forest">Mobiel formulieren invullen per klant en project</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-5 lg:grid-cols-3">
        {features.map((feature, index) => (
          <Panel key={feature}>
            <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-ink/45">
              {index === 0 ? "Agency" : index === 1 ? "Mobiel" : "Veilig"}
            </p>
            <h2 className="mt-3 text-xl font-semibold text-forest">{feature}</h2>
          </Panel>
        ))}
      </section>
    </main>
  );
}
