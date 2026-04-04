import Link from "next/link";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { LogoutButton } from "@/components/forms/logout-button";
import { AgencyOverview } from "@/components/dashboard/agency-overview";
import { requireAgencyUser } from "@/lib/auth";
import { getAgencyDashboardData } from "@/lib/data";

export default async function AgencyPage() {
  const user = await requireAgencyUser();
  const data = await getAgencyDashboardData();

  return (
    <DashboardShell
      roleLabel="Agency"
      brand="SteigerHub"
      title="Klanten, pakketten en betalingen"
      subtitle={`Ingelogd als ${user.fullName}. Beheer hier al je klanten en hun softwarepakket vanuit één rustige agency-omgeving.`}
      navItems={[
        { label: "Overzicht", href: "/agency", active: true, caption: "Klanten en omzet" },
        { label: "Pakketten", href: "/agency/packages", caption: "Templates en modules" },
        { label: "Workspace demo", href: "/workspace", caption: "Bekijk tenant-flow" }
      ]}
      actions={
        <>
          <Link href="/" className="rounded-full border border-line px-4 py-2 text-sm font-semibold text-ink">
            Website
          </Link>
          <LogoutButton />
        </>
      }
    >
      <AgencyOverview {...data} />
    </DashboardShell>
  );
}
