import Link from "next/link";
import { TenantOverview } from "@/components/dashboard/tenant-overview";
import { getTenantWorkspaceData } from "@/lib/data";

export default async function WorkspacePage() {
  const data = await getTenantWorkspaceData();

  return (
    <main className="mx-auto max-w-7xl px-6 py-8 lg:px-10">
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-ink/50">Tenant workspace</p>
          <h1 className="mt-2 text-4xl font-semibold text-ink">Dossiers en locatiebeheer</h1>
        </div>
        <Link href="/" className="rounded-full border border-ink/10 px-4 py-2 text-sm text-ink">
          Terug naar home
        </Link>
      </header>
      <TenantOverview {...data} />
    </main>
  );
}
