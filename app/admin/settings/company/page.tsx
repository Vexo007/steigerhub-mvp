import { CompanyDocumentUploadForm } from "@/components/forms/company-document-upload-form";
import { CompanyLogoUploadForm } from "@/components/forms/company-logo-upload-form";
import { CompanySettingsForm } from "@/components/forms/company-settings-form";
import { AdminDashboardShell } from "@/components/layout/admin-dashboard-shell";
import { Panel } from "@/components/ui/panel";
import { getAuthorizedTenantId, requireAppUser } from "@/lib/auth";
import { getTenantAdminData } from "@/lib/package-builder-data";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

function categoryLabel(category: "rie" | "contract" | "certificate" | "other") {
  switch (category) {
    case "rie":
      return "RI&E";
    case "contract":
      return "Contract";
    case "certificate":
      return "Certificaat";
    default:
      return "Overig";
  }
}

export default async function CompanySettingsPage({
  searchParams
}: {
  searchParams?: Promise<{ tenantId?: string }>;
}) {
  const params = (await searchParams) ?? {};
  const user = await requireAppUser();
  const tenantId = getAuthorizedTenantId(user, params.tenantId) ?? undefined;
  const data = await getTenantAdminData(tenantId);
  const supabase = createSupabaseAdminClient();

  let logoUrl: string | null = null;
  let documentLinks = new Map<string, string>();

  if (supabase && data.companyProfile?.logoPath) {
    const { data: signedLogo } = await supabase.storage.from("tenant-files").createSignedUrl(data.companyProfile.logoPath, 60 * 60);
    logoUrl = signedLogo?.signedUrl ?? null;
  }

  if (supabase && data.companyDocuments.length > 0) {
    const links = await Promise.all(
      data.companyDocuments.map(async (document) => {
        const { data: signedFile } = await supabase.storage.from("tenant-files").createSignedUrl(document.bucketPath, 60 * 60);
        return [document.bucketPath, signedFile?.signedUrl ?? "#"] as const;
      })
    );
    documentLinks = new Map(links);
  }

  const profileName = data.companyProfile?.displayName || data.tenant?.name || "Bedrijf";
  const primaryColor = data.companyProfile?.primaryColor ?? "#0a331c";
  const secondaryColor = data.companyProfile?.secondaryColor ?? "#49a642";

  return (
    <AdminDashboardShell
      user={user}
      tenant={data.tenant}
      tenantId={tenantId}
      currentKey="settings-company"
      title="Bedrijfsgegevens & whitelabel"
      subtitle="Beheer hier de merklaag van het bedrijf met naam, kleuren, logo en centrale documenten."
    >
      <div className="grid gap-6">
        <Panel className="overflow-hidden">
          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-ink/45">Bedrijfsprofiel</p>
              <h2 className="mt-2 text-3xl font-semibold text-forest">{profileName}</h2>
              <p className="mt-3 max-w-2xl text-sm text-ink/65">
                Dit is de merklaag van het bedrijf. Hier bepaal je de naam, kleuren en het logo dat de eigenaar en het team
                overal terugzien.
              </p>
              <div className="mt-6 grid gap-4 md:grid-cols-3">
                <div className="rounded-[22px] border border-line bg-mist/60 p-5">
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-ink/45">Weergavenaam</p>
                  <p className="mt-2 text-sm font-semibold text-forest">{profileName}</p>
                </div>
                <div className="rounded-[22px] border border-line bg-mist/60 p-5">
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-ink/45">Primaire kleur</p>
                  <div className="mt-3 flex items-center gap-3">
                    <span className="h-8 w-8 rounded-full border border-line" style={{ backgroundColor: primaryColor }} />
                    <p className="text-sm font-semibold text-forest">{primaryColor}</p>
                  </div>
                </div>
                <div className="rounded-[22px] border border-line bg-mist/60 p-5">
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-ink/45">Secundaire kleur</p>
                  <div className="mt-3 flex items-center gap-3">
                    <span className="h-8 w-8 rounded-full border border-line" style={{ backgroundColor: secondaryColor }} />
                    <p className="text-sm font-semibold text-forest">{secondaryColor}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="rounded-[28px] border border-line bg-forest p-6 text-white shadow-soft">
              <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-white/55">Preview</p>
              <div className="mt-5 rounded-[24px] bg-white p-5 text-forest">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-ink/45">Branding</p>
                    <p className="mt-2 text-xl font-semibold">{profileName}</p>
                  </div>
                  <div
                    className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl border border-line bg-mist"
                    style={{ borderColor: secondaryColor }}
                  >
                    {logoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={logoUrl} alt={`${profileName} logo`} className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-xs font-semibold text-ink/45">Geen logo</span>
                    )}
                  </div>
                </div>
                <div className="mt-5 grid gap-3">
                  <div className="rounded-2xl px-4 py-3 text-sm font-semibold text-white" style={{ backgroundColor: primaryColor }}>
                    Dashboard header
                  </div>
                  <div className="rounded-2xl px-4 py-3 text-sm font-semibold text-white" style={{ backgroundColor: secondaryColor }}>
                    Primaire actieknop
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Panel>

        <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
          <Panel>
            <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-ink/45">Whitelabel</p>
            <h2 className="mt-2 text-2xl font-semibold text-forest">Bedrijfsuitstraling</h2>
            <p className="mt-2 text-sm text-ink/65">Beheer hier naam, kleuren en logo van het bedrijf zonder code.</p>
            <div className="mt-5 grid gap-6">
              <CompanySettingsForm tenantId={data.tenant?.id ?? ""} initialProfile={data.companyProfile} />
              <div className="rounded-[22px] border border-line bg-mist/60 p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-forest">Logo upload</p>
                    <p className="mt-1 text-sm text-ink/60">Gebruik bij voorkeur een vierkant PNG of JPG bestand.</p>
                  </div>
                  {logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={logoUrl} alt={`${profileName} logo`} className="h-16 w-16 rounded-2xl border border-line object-cover" />
                  ) : null}
                </div>
                <div className="mt-4">
                  <CompanyLogoUploadForm tenantId={data.tenant?.id ?? ""} />
                </div>
              </div>
            </div>
          </Panel>

          <Panel>
            <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-ink/45">Bedrijfsdata</p>
            <h2 className="mt-2 text-2xl font-semibold text-forest">Documentenbibliotheek</h2>
            <p className="mt-2 text-sm text-ink/65">
              Gebruik dit als vaste documentmap voor RI&E, contracten, certificaten en andere bedrijfsbestanden.
            </p>
            <div className="mt-5 grid gap-6">
              <div className="rounded-[22px] border border-line bg-mist/60 p-5">
                <p className="text-sm font-semibold text-forest">Upload nieuw document</p>
                <div className="mt-4">
                  <CompanyDocumentUploadForm tenantId={data.tenant?.id ?? ""} />
                </div>
              </div>
              <div className="grid gap-3">
                {data.companyDocuments.length === 0 ? (
                  <div className="rounded-[22px] border border-dashed border-line bg-mist/60 p-5 text-sm text-ink/60">
                    Er zijn nog geen bedrijfsdocumenten toegevoegd.
                  </div>
                ) : (
                  data.companyDocuments.map((document) => (
                    <div key={document.id} className="rounded-[22px] border border-line bg-mist/60 p-5">
                      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-ink/45">
                            {categoryLabel(document.category)}
                          </p>
                          <p className="mt-2 text-base font-semibold text-forest">{document.title}</p>
                          <p className="mt-1 text-sm text-ink/60">{document.fileName}</p>
                          <p className="mt-1 text-xs text-ink/45">
                            Toegevoegd op {new Date(document.createdAt).toLocaleDateString("nl-NL")}
                          </p>
                        </div>
                        <a
                          href={documentLinks.get(document.bucketPath) ?? "#"}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex rounded-full border border-line px-4 py-2 text-sm font-semibold text-ink"
                        >
                          Open document
                        </a>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </Panel>
        </div>
      </div>
    </AdminDashboardShell>
  );
}
