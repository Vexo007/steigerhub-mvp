import { CompanyDocumentUploadForm } from "@/components/forms/company-document-upload-form";
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

export default async function AdminReiSettingsPage({
  searchParams
}: {
  searchParams?: Promise<{ tenantId?: string }>;
}) {
  const params = (await searchParams) ?? {};
  const user = await requireAppUser();
  const tenantId = getAuthorizedTenantId(user, params.tenantId) ?? undefined;
  const data = await getTenantAdminData(tenantId);
  const supabase = createSupabaseAdminClient();

  let documentLinks = new Map<string, string>();

  if (supabase && data.companyDocuments.length > 0) {
    const links = await Promise.all(
      data.companyDocuments.map(async (document) => {
        const { data: signedFile } = await supabase.storage.from("tenant-files").createSignedUrl(document.bucketPath, 60 * 60);
        return [document.bucketPath, signedFile?.signedUrl ?? "#"] as const;
      })
    );
    documentLinks = new Map(links);
  }

  return (
    <AdminDashboardShell
      user={user}
      tenant={data.tenant}
      tenantId={tenantId}
      currentKey="settings-rie"
      title="RE&I"
      subtitle="Deze omgeving bundelt RI&E, contracten, certificaten en andere veiligheidsdocumenten van het bedrijf."
    >
      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Panel>
          <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-ink/45">Nieuw document</p>
          <h2 className="mt-2 text-2xl font-semibold text-forest">Document uploaden</h2>
          <p className="mt-2 text-sm text-ink/65">
            Voeg hier RI&E-bestanden, contracten, certificaten of overige documenten toe voor de bedrijfsadmin.
          </p>
          <div className="mt-5">
            <CompanyDocumentUploadForm tenantId={data.tenant?.id ?? ""} />
          </div>
        </Panel>

        <Panel>
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-ink/45">Bibliotheek</p>
              <h2 className="mt-2 text-2xl font-semibold text-forest">Alle documenten</h2>
            </div>
            <p className="text-sm text-ink/55">{data.companyDocuments.length} bestand(en)</p>
          </div>
          <div className="mt-5 grid gap-3">
            {data.companyDocuments.length === 0 ? (
              <div className="rounded-[20px] border border-dashed border-line bg-mist/60 px-4 py-4 text-sm text-ink/60">
                Er zijn nog geen documenten toegevoegd.
              </div>
            ) : (
              data.companyDocuments.map((document) => (
                <div key={document.id} className="rounded-[22px] border border-line bg-mist/60 p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-ink/45">
                        {categoryLabel(document.category)}
                      </p>
                      <p className="mt-2 text-base font-semibold text-forest">{document.title}</p>
                      <p className="mt-1 text-sm text-ink/60">{document.fileName}</p>
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
        </Panel>
      </div>
    </AdminDashboardShell>
  );
}
