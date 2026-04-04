import Link from "next/link";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { PackageCreateForm } from "@/components/forms/package-create-form";
import { LogoutButton } from "@/components/forms/logout-button";
import { Panel } from "@/components/ui/panel";
import { requireAgencyUser } from "@/lib/auth";
import { getPackageDefinitions } from "@/lib/package-builder-data";

export default async function AgencyPackagesPage() {
  await requireAgencyUser();
  const packages = await getPackageDefinitions();

  return (
    <DashboardShell
      roleLabel="Agency"
      brand="SteigerHub"
      title="Pakketten en templates"
      subtitle="Hier bouw je de softwareblokken die je later per klant kunt inschakelen. Alles blijft database-gedreven."
      navItems={[
        { label: "Overzicht", href: "/agency", caption: "Klanten en omzet" },
        { label: "Pakketten", href: "/agency/packages", active: true, caption: "Templates en modules" },
        { label: "Workspace demo", href: "/workspace", caption: "Bekijk tenant-flow" }
      ]}
      actions={
        <>
          <Link href="/agency" className="rounded-full border border-line px-4 py-2 text-sm font-semibold text-ink">
            Terug
          </Link>
          <LogoutButton />
        </>
      }
    >
      <section className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <Panel>
          <h2 className="text-xl font-semibold text-forest">Beschikbare pakketten</h2>
          <div className="mt-5 grid gap-4">
            {packages.map((item) => (
              <article key={item.id} className="rounded-[22px] border border-line bg-mist/70 p-5">
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-ink/45">
                  {item.isTemplate ? "Template" : "Klantpakket"}
                </p>
                <h3 className="mt-2 text-xl font-semibold text-forest">{item.name}</h3>
                <p className="mt-2 max-w-2xl text-sm text-ink/65">{item.description || "Geen omschrijving."}</p>
                <div className="mt-4">
                  <Link
                    href={`/agency/packages/${item.id}`}
                    className="inline-flex rounded-full border border-line px-4 py-2 text-sm font-semibold text-ink"
                  >
                    Template bewerken
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </Panel>

        <Panel className="sticky top-6 h-fit">
          <h2 className="text-xl font-semibold text-forest">Nieuw templatepakket</h2>
          <p className="mt-2 text-sm text-ink/60">Maak hier een nieuw basispakket aan dat je later per klant kunt kopiëren.</p>
          <div className="mt-5">
            <PackageCreateForm />
          </div>
        </Panel>
      </section>
    </DashboardShell>
  );
}
