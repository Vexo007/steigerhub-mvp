import Link from "next/link";
import { TenantConfigEditor } from "@/components/dashboard/tenant-config-editor";
import { getTenantConfigData } from "@/lib/package-builder-data";

export default async function TenantConfigPage({
  params
}: {
  params: Promise<{ tenantId: string }>;
}) {
  const { tenantId } = await params;
  const data = await getTenantConfigData(tenantId);

  return (
    <main className="mx-auto max-w-7xl px-6 py-8 lg:px-10">
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-ink/50">Tenant package config</p>
          <h1 className="mt-2 text-4xl font-semibold text-ink">Configuratie per klant</h1>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/agency" className="rounded-full border border-ink/10 px-4 py-2 text-sm text-ink">
            Terug naar agency
          </Link>
          {tenantId ? (
            <Link
              href={`/workspace?tenantId=${tenantId}`}
              className="rounded-full border border-ink/10 px-4 py-2 text-sm text-ink"
            >
              Open workspace
            </Link>
          ) : null}
        </div>
      </header>

      <TenantConfigEditor data={data} />
    </main>
  );
}
