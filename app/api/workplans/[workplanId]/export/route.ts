import { NextResponse } from "next/server";
import { getCurrentAppUser } from "@/lib/auth";
import { buildWorkplanPreviewModel, buildWorkplanWordHtml } from "@/lib/workplan-preview";
import { getWorkplanDetail } from "@/lib/workplan-data";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ workplanId: string }> }
) {
  const actor = await getCurrentAppUser();
  if (!actor) {
    return NextResponse.json({ error: "Je moet ingelogd zijn." }, { status: 401 });
  }

  const { workplanId } = await params;
  const { searchParams } = new URL(request.url);
  const format = searchParams.get("format") ?? "word";
  const data = await getWorkplanDetail(actor, workplanId);
  const model = buildWorkplanPreviewModel({
    workplan: data.workplan,
    project: data.project,
    sections: data.sections
  });

  if (format === "word") {
    const html = buildWorkplanWordHtml(model);
    return new NextResponse(html, {
      headers: {
        "Content-Type": "application/msword; charset=utf-8",
        "Content-Disposition": `attachment; filename="${data.workplan.title.replace(/[^a-zA-Z0-9-_]/g, "-")}.doc"`
      }
    });
  }

  return NextResponse.json({ error: "Onbekend exportformaat." }, { status: 400 });
}
