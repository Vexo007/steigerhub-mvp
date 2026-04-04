import Link from "next/link";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { PackageTemplateEditor } from "@/components/dashboard/package-template-editor";
import { LogoutButton } from "@/components/forms/logout-button";
import { requireAgencyUser } from "@/lib/auth";
import { getPackageTemplateData } from "@/lib/package-builder-data";

export default async function AgencyPackageTemplatePage({
  params
}: {
  params: Promise<{ packageId: string }>;
}) {
  await requireAgencyUser();
  const { packageId } = await params;
  const data = await getPackageTemplateData(packageId);

  return (
    <DashboardShell
      roleLabel="Agency"
      brand="SteigerHub"
      title="Template editor"
      subtitle="Bepaal hier welke modules, formulieren en velden in een pakket zitten voordat je het aan klanten toewijst."
      navItems={[
        { label: "Overzicht", href: "/agency", caption: "Klanten en omzet" },
        { label: "Pakketten", href: "/agency/packages", caption: "Templates en modules" },
        { label: "Template editor", href: `/agency/packages/${packageId}`, active: true, caption: "Features per pakket" }
      ]}
      actions={
        <>
          <Link href="/agency/packages" className="rounded-full border border-line px-4 py-2 text-sm font-semibold text-ink">
            Terug
          </Link>
          <LogoutButton />
        </>
      }
    >
      <PackageTemplateEditor data={data} />
    </DashboardShell>
  );
}
