import { WorkplanPreviewAutoPrint } from "@/components/workplans/workplan-preview-auto-print";
import { requireAppUser } from "@/lib/auth";
import { buildWorkplanPreviewModel } from "@/lib/workplan-preview";
import { getWorkplanDetail } from "@/lib/workplan-data";

export default async function WorkplanPreviewPage({
  params,
  searchParams
}: {
  params: Promise<{ projectId: string; workplanId: string }>;
  searchParams?: Promise<{ print?: string }>;
}) {
  const user = await requireAppUser();
  const { workplanId } = await params;
  const query = (await searchParams) ?? {};
  const data = await getWorkplanDetail(user, workplanId);
  const model = buildWorkplanPreviewModel({
    workplan: data.workplan,
    project: data.project,
    sections: data.sections
  });
  const autoPrint = query.print === "1";

  return (
    <main className="min-h-screen bg-white px-6 py-8 text-[#173426]">
      <WorkplanPreviewAutoPrint autoPrint={autoPrint} />
      <div className="mx-auto max-w-5xl">
        <header className="border-b border-[#d7e0db] pb-6">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#64806f]">Werkplan preview</p>
          <h1 className="mt-3 text-4xl font-semibold">{model.workplan.title}</h1>
          <div className="mt-4 grid gap-2 text-sm text-[#4a5b53] md:grid-cols-2">
            <p><strong>Type:</strong> {model.workplan.planType}</p>
            <p><strong>Klant:</strong> {model.project.clientName}</p>
            <p><strong>Adres:</strong> {model.project.siteAddress}</p>
            <p><strong>Plaats:</strong> {model.project.siteCity}</p>
          </div>
        </header>

        <div className="mt-8 grid gap-6">
          {model.previewSections.map((section) => (
            <section key={section.key} className="rounded-[24px] border border-[#d7e0db] bg-[#f8fbf9] p-6">
              <h2 className="text-2xl font-semibold text-[#0a331c]">{section.title}</h2>
              <p className="mt-2 text-sm text-[#5c6d65]">{section.description}</p>

              <div className="mt-5 grid gap-5">
                {section.groups.map((group) => (
                  <div key={group.group} className="rounded-[20px] border border-[#d7e0db] bg-white p-5">
                    <h3 className="text-base font-semibold text-[#173426]">{group.group}</h3>
                    <div className="mt-4 grid gap-3">
                      {group.rows.map((row) => (
                        <div key={`${section.key}-${group.group}-${row.label}`} className="grid gap-1 md:grid-cols-[220px_1fr]">
                          <p className="text-sm font-semibold text-[#173426]">{row.label}</p>
                          <p className="text-sm text-[#50615a] whitespace-pre-wrap">{row.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                {section.uploads.length > 0 ? (
                  <div className="rounded-[20px] border border-[#d7e0db] bg-white p-5">
                    <h3 className="text-base font-semibold text-[#173426]">Uploads</h3>
                    <div className="mt-4 grid gap-2">
                      {section.uploads.map((upload) => (
                        <a
                          key={`${upload.path}-${upload.fileName}`}
                          href={upload.signedUrl ?? "#"}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sm font-semibold text-[#0a331c] underline-offset-2 hover:underline"
                        >
                          {upload.fileName}
                        </a>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
