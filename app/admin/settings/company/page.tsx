import Link from "next/link";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { LogoutButton } from "@/components/forms/logout-button";
import { Panel } from "@/components/ui/panel";
import { getAuthorizedTenantId, requireAppUser } from "@/lib/auth";
import { getTenantAdminData } from "@/lib/package-builder-data";

export default async function CompanySettingsPage({
  searchParams
}: {
  searchParams?: Promise<{ tenantId?: string }>;
}) {
  const params = (await searchParams) ?? {};
  const user = await requireAppUser();
  const tenantId = getAuthorizedTenantId(user, params.tenantId) ?? undefined;
  const data = await getTenantAdminData(tenantId);

  return (
    <DashboardShell
      roleLabel={user.role === "agency_admin" ? "Agency als klant" : "Bedrijfsadmin"}
      brand={data.tenant?.name ?? "SteigerHub"}
      title="Company settings"
      subtitle="Hier komt de white-label laag van het bedrijf: kleuren, logo en centrale bedrijfsdocumenten."
      navItems={[
        { label: "Overzicht", href: tenantId ? `/admin?tenantId=${tenantId}` : "/admin", caption: "Bedrijf en team" },
        { label: "Company settings", href: tenantId ? `/admin/settings/company?tenantId=${tenantId}` : "/admin/settings/company", active: true, caption: "Logo en documenten" },
        { label: "Werkapp", href: tenantId ? `/workspace?tenantId=${tenantId}` : "/workspace", caption: "Werknemer weergave" }
      ]}
      actions={
        <>
          <Link href={tenantId ? `/admin?tenantId=${tenantId}` : "/admin"} className="rounded-full border border-line px-4 py-2 text-sm font-semibold text-ink">
            Admin
          </Link>
          <LogoutButton />
        </>
      }
    >
      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <Panel>
          <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-ink/45">White-label</p>
          <h2 className="mt-2 text-2xl font-semibold text-forest">Bedrijfsuitstraling</h2>
          <div className="mt-5 grid gap-4">
            <div className="rounded-[22px] border border-line bg-mist/60 p-5">
              <p className="text-sm font-semibold text-forest">Bedrijfsnaam</p>
              <p className="mt-2 text-sm text-ink/70">{data.tenant?.name}</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-[22px] border border-line bg-mist/60 p-5">
                <p className="text-sm font-semibold text-forest">Primaire kleur</p>
                <p className="mt-2 text-sm text-ink/70">#0a331c</p>
              </div>
              <div className="rounded-[22px] border border-line bg-mist/60 p-5">
                <p className="text-sm font-semibold text-forest">Secundaire kleur</p>
                <p className="mt-2 text-sm text-ink/70">#49a642</p>
              </div>
            </div>
            <div className="rounded-[22px] border border-dashed border-line bg-mist/60 p-5">
              <p className="text-sm font-semibold text-forest">Logo upload</p>
              <p className="mt-2 text-sm text-ink/60">Volgende stap: bedrijf kan hier eigen logo en branding uploaden.</p>
            </div>
          </div>
        </Panel>

        <Panel>
          <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-ink/45">Bedrijfsdata</p>
          <h2 className="mt-2 text-2xl font-semibold text-forest">RI&E, contracten en certificaten</h2>
          <div className="mt-5 grid gap-4">
            <div className="rounded-[22px] border border-dashed border-line bg-mist/60 p-5">
              <p className="text-sm font-semibold text-forest">RI&E</p>
              <p className="mt-2 text-sm text-ink/60">Reserveer hier alle risico-inventarisaties en evaluaties van het bedrijf.</p>
            </div>
            <div className="rounded-[22px] border border-dashed border-line bg-mist/60 p-5">
              <p className="text-sm font-semibold text-forest">Contracten</p>
              <p className="mt-2 text-sm text-ink/60">Centrale opslag voor servicecontracten, klantafspraken en documenten.</p>
            </div>
            <div className="rounded-[22px] border border-dashed border-line bg-mist/60 p-5">
              <p className="text-sm font-semibold text-forest">Certificaten</p>
              <p className="mt-2 text-sm text-ink/60">Overzicht van bedrijfscertificaten en bijbehorende verloopdata.</p>
            </div>
          </div>
        </Panel>
      </div>
    </DashboardShell>
  );
}
