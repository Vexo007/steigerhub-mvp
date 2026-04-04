import Link from "next/link";
import { PackageCreateForm } from "@/components/forms/package-create-form";
import { LogoutButton } from "@/components/forms/logout-button";
import { Panel } from "@/components/ui/panel";
import { requireAgencyUser } from "@/lib/auth";
import { getPackageDefinitions } from "@/lib/package-builder-data";

export default async function AgencyPackagesPage() {
  await requireAgencyUser();
  const packages = await getPackageDefinitions();

  return (
    <main className="mx-auto max-w-7xl px-6 py-8 lg:px-10">
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-ink/50">Agency packages</p>
          <h1 className="mt-2 text-4xl font-semibold text-ink">Pakketten en templates</h1>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/agency" className="rounded-full border border-ink/10 px-4 py-2 text-sm text-ink">
            Terug naar agency
          </Link>
          <LogoutButton />
        </div>
      </header>

      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Panel>
          <h2 className="text-xl font-semibold text-ink">Beschikbare pakketten</h2>
          <div className="mt-5 grid gap-4">
            {packages.map((item) => (
              <article key={item.id} className="rounded-[24px] bg-mist p-5">
                <p className="text-sm uppercase tracking-[0.16em] text-ink/50">
                  {item.isTemplate ? "Template" : "Klantpakket"}
                </p>
                <h3 className="mt-2 text-xl font-semibold text-ink">{item.name}</h3>
                <p className="mt-2 text-sm text-ink/65">{item.description || "Geen omschrijving."}</p>
              </article>
            ))}
          </div>
        </Panel>

        <Panel>
          <h2 className="text-xl font-semibold text-ink">Nieuw templatepakket</h2>
          <div className="mt-5">
            <PackageCreateForm />
          </div>
        </Panel>
      </section>
    </main>
  );
}
