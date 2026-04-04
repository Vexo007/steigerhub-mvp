import Link from "next/link";
import type { ReactNode } from "react";
import { DashboardShell, type DashboardNavSection } from "@/components/layout/dashboard-shell";
import { LogoutButton } from "@/components/forms/logout-button";
import type { AppUser, Tenant } from "@/lib/types";

function withTenant(href: string, tenantId?: string) {
  if (!tenantId) {
    return href;
  }

  const separator = href.includes("?") ? "&" : "?";
  return `${href}${separator}tenantId=${tenantId}`;
}

function buildSections(currentKey: string, tenantId?: string): DashboardNavSection[] {
  return [
    {
      items: [
        {
          label: "Overzicht",
          href: withTenant("/admin", tenantId),
          active: currentKey === "overview",
          caption: "Dashboard en assets"
        },
        {
          label: "Projecten",
          href: withTenant("/admin/projects", tenantId),
          active: currentKey === "projects",
          caption: "Klantdossiers en werkplannen"
        },
        {
          label: "Klanten",
          href: withTenant("/admin/customers", tenantId),
          active: currentKey === "customers",
          caption: "Bedrijven en adressen"
        },
        {
          label: "Medewerkers",
          href: withTenant("/admin/employees", tenantId),
          active: currentKey === "employees",
          caption: "Managers en werkvloer"
        }
      ]
    },
    {
      title: "Instellingen",
      items: [
        {
          label: "RE&I",
          href: withTenant("/admin/settings/rei", tenantId),
          active: currentKey === "settings-rie",
          caption: "Documenten en veiligheidsmap"
        },
        {
          label: "Bedrijfsgegevens & whitelabel",
          href: withTenant("/admin/settings/company", tenantId),
          active: currentKey === "settings-company",
          caption: "Logo, kleuren en bedrijfsprofiel"
        },
        {
          label: "Abonnement",
          href: withTenant("/admin/settings/billing", tenantId),
          active: currentKey === "settings-billing",
          caption: "Pakket en facturatie"
        }
      ]
    },
    {
      title: "Assets",
      items: [
        {
          label: "Werkapp preview",
          href: withTenant("/workspace", tenantId),
          active: currentKey === "workspace",
          caption: "Zo ziet de werknemer het"
        },
        {
          label: "Projectboard",
          href: withTenant("/admin/projects", tenantId),
          active: false,
          caption: "Snel naar dossiers en taken"
        }
      ]
    }
  ];
}

export function AdminDashboardShell({
  user,
  tenant,
  tenantId,
  currentKey,
  title,
  subtitle,
  children
}: {
  user: AppUser;
  tenant: Tenant | null;
  tenantId?: string;
  currentKey:
    | "overview"
    | "projects"
    | "customers"
    | "employees"
    | "settings-rie"
    | "settings-company"
    | "settings-billing"
    | "workspace";
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <DashboardShell
      roleLabel={user.role === "agency_admin" ? "Agency als klant" : "Bedrijfsadmin"}
      brand={tenant?.name ?? "SteigerHub"}
      title={title}
      subtitle={subtitle}
      navSections={buildSections(currentKey, tenantId)}
      actions={
        <>
          {user.role === "agency_admin" ? (
            <Link href="/agency" className="rounded-full border px-4 py-2 text-sm font-semibold">
              Terug naar agency
            </Link>
          ) : null}
          <LogoutButton />
        </>
      }
    >
      {children}
    </DashboardShell>
  );
}
