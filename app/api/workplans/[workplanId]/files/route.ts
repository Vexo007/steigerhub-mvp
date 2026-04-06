import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { getCurrentAppUser } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type UploadedFilePayload = {
  path: string;
  fileName: string;
  uploadedAt: string;
};

export async function POST(
  request: Request,
  { params }: { params: Promise<{ workplanId: string }> }
) {
  const actor = await getCurrentAppUser();
  if (!actor) {
    return NextResponse.json({ error: "Je moet ingelogd zijn." }, { status: 401 });
  }

  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    return NextResponse.json({ error: "Missing Supabase admin client." }, { status: 500 });
  }

  const { workplanId } = await params;
  const formData = await request.formData();
  const sectionKey = String(formData.get("sectionKey") ?? "");
  const title = String(formData.get("title") ?? "");
  const file = formData.get("file");

  if (!sectionKey || !title || !(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "Sectie, titel en bestand zijn verplicht." }, { status: 400 });
  }

  const db = supabase as any;
  const { data: workplan } = await db
    .from("project_workplans")
    .select("id,tenant_id,project_id")
    .eq("id", workplanId)
    .single();

  if (!workplan) {
    return NextResponse.json({ error: "Werkplan niet gevonden." }, { status: 404 });
  }

  if (actor.role !== "agency_admin" && actor.tenantId !== workplan.tenant_id) {
    return NextResponse.json({ error: "Geen toegang tot dit werkplan." }, { status: 403 });
  }

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
  const extension = safeName.includes(".") ? safeName.split(".").pop() : "bin";
  const path = `${workplan.tenant_id}/workplans/${workplanId}/${sectionKey}-${Date.now()}.${extension}`;
  const arrayBuffer = await file.arrayBuffer();

  const { error: uploadError } = await supabase.storage.from("tenant-files").upload(path, Buffer.from(arrayBuffer), {
    contentType: file.type || "application/octet-stream",
    upsert: true
  });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  const { data: existingSection } = await db
    .from("project_workplan_sections")
    .select("payload")
    .eq("workplan_id", workplanId)
    .eq("section_key", sectionKey)
    .maybeSingle();

  const uploadedFile: UploadedFilePayload = {
    path,
    fileName: file.name,
    uploadedAt: new Date().toISOString()
  };

  const existingPayload = (existingSection?.payload ?? {}) as Record<string, unknown>;
  const existingUploads = Array.isArray(existingPayload.uploadedFiles)
    ? (existingPayload.uploadedFiles as UploadedFilePayload[])
    : [];

  const { error: sectionError } = await db.from("project_workplan_sections").upsert({
    workplan_id: workplanId,
    section_key: sectionKey,
    title,
    payload: {
      ...existingPayload,
      uploadedFiles: [...existingUploads, uploadedFile]
    },
    updated_at: new Date().toISOString()
  });

  if (sectionError) {
    return NextResponse.json({ error: sectionError.message }, { status: 500 });
  }

  revalidatePath(`/workspace/project/${workplan.project_id}/workplans/${workplanId}`);
  revalidatePath(`/admin/projects/${workplan.project_id}/workplans/${workplanId}`);

  return NextResponse.json({ ok: true });
}
