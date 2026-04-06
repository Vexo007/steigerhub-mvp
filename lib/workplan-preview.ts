import { workplanSections, type WorkplanSectionKey, getWorkplanSectionFields } from "@/lib/workplans";
import type { Project, ProjectWorkplan, ProjectWorkplanSection } from "@/lib/types";

type UploadItem = {
  path: string;
  fileName: string;
  uploadedAt?: string;
  signedUrl?: string;
};

function asRecord(section?: ProjectWorkplanSection | null) {
  return (section?.payload ?? {}) as Record<string, unknown>;
}

function stringValue(section: ProjectWorkplanSection | null | undefined, key: string) {
  const value = asRecord(section)[key];
  return typeof value === "string" ? value.trim() : "";
}

export function getSectionUploads(section: ProjectWorkplanSection | null | undefined): UploadItem[] {
  const value = asRecord(section).uploadedFiles;
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is UploadItem => Boolean(item && typeof item === "object" && "path" in item && "fileName" in item));
}

export function buildWorkplanPreviewModel({
  workplan,
  project,
  sections
}: {
  workplan: ProjectWorkplan;
  project: Project;
  sections: ProjectWorkplanSection[];
}) {
  const sectionMap = new Map(sections.map((section) => [section.sectionKey, section] as const));

  const previewSections = workplanSections
    .filter((section) => section.key !== "genereren")
    .map((section) => {
      const current = sectionMap.get(section.key) ?? null;
      const grouped = getWorkplanSectionFields(section.key as WorkplanSectionKey).reduce<
        Array<{ group: string; rows: Array<{ label: string; value: string }> }>
      >((acc, field) => {
        const group = field.group ?? section.title;
        const currentGroup = acc.find((item) => item.group === group);
        const row = {
          label: field.label,
          value: stringValue(current, field.key)
        };

        if (currentGroup) {
          currentGroup.rows.push(row);
        } else {
          acc.push({ group, rows: [row] });
        }

        return acc;
      }, [])
      .map((group) => ({
        ...group,
        rows: group.rows.filter((row) => row.value.length > 0)
      }))
      .filter((group) => group.rows.length > 0);

      return {
        key: section.key,
        title: section.title,
        description: section.description,
        groups: grouped,
        uploads: getSectionUploads(current)
      };
    });

  return {
    workplan,
    project,
    previewSections
  };
}

export function buildWorkplanWordHtml(model: ReturnType<typeof buildWorkplanPreviewModel>) {
  const sectionsHtml = model.previewSections
    .map(
      (section) => `
      <section style="margin-top:24px;">
        <h2 style="font-size:20px;color:#0a331c;">${section.title}</h2>
        <p style="color:#4b5b53;">${section.description}</p>
        ${section.groups
          .map(
            (group) => `
            <div style="margin-top:16px;">
              <h3 style="font-size:16px;color:#163725;">${group.group}</h3>
              <table style="width:100%;border-collapse:collapse;margin-top:8px;">
                ${group.rows
                  .map(
                    (row) => `
                    <tr>
                      <td style="width:35%;border:1px solid #d7e0db;padding:8px;font-weight:600;">${row.label}</td>
                      <td style="border:1px solid #d7e0db;padding:8px;">${row.value.replace(/\n/g, "<br />")}</td>
                    </tr>`
                  )
                  .join("")}
              </table>
            </div>`
          )
          .join("")}
      </section>`
    )
    .join("");

  return `<!doctype html>
  <html>
    <head>
      <meta charset="utf-8" />
      <title>${model.workplan.title}</title>
    </head>
    <body style="font-family:Arial,sans-serif;padding:32px;color:#14241c;">
      <h1 style="font-size:28px;color:#0a331c;">${model.workplan.title}</h1>
      <p><strong>Type:</strong> ${model.workplan.planType}</p>
      <p><strong>Klant:</strong> ${model.project.clientName}</p>
      <p><strong>Locatie:</strong> ${model.project.siteAddress}, ${model.project.siteCity}</p>
      ${sectionsHtml}
    </body>
  </html>`;
}
