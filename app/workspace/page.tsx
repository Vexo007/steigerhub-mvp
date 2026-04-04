import Link from "next/link";
import { PackageWorkspace } from "@/components/dashboard/package-workspace";
import { LogoutButton } from "@/components/forms/logout-button";
import { requireAppUser } from "@/lib/auth";
import { getPackageWorkspaceData } from "@/lib/package-builder-data";

export default async function WorkspacePage({
  searchParams
}: {
  searchParams?: Promise<{ tenantId?: string }>;
}) {
  const params = (await searchParams) ?? {};
  const user = await requireAppUser();
  const tenantId = user.role === "agency_admin" ? params.tenantId : user.tenantId ?? undefined;
  const data = await getPackageWorkspaceData(tenantId);

  return (
    <main className="mx-auto max-w-7xl px-6 py-8 lg:px-10">
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-ink/50">Tenant workspace</p>
          <h1 className="mt-2 text-4xl font-semibold text-ink">Werkprocessen en formulieren</h1>
          <p className="mt-2 text-sm text-ink/60">Ingelogd als {user.fullName}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/" className="rounded-full border border-ink/10 px-4 py-2 text-sm text-ink">
            Terug naar home
          </Link>
          <LogoutButton />
        </div>
      </header>
      <PackageWorkspace data={data} />
    </main>
  );
}
