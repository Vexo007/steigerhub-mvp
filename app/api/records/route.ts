import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    return NextResponse.json({ error: "Missing Supabase admin client." }, { status: 500 });
  }

  const formData = await request.formData();
  const tenantId = String(formData.get("tenantId") ?? "");
  const formId = String(formData.get("formId") ?? "");
  const projectIdValue = String(formData.get("projectId") ?? "");

  if (!tenantId || !formId) {
    return NextResponse.json({ error: "Tenant en formulier zijn verplicht." }, { status: 400 });
  }

  const db = supabase as any;
  const { data: fields, error: fieldError } = await db
    .from("form_fields")
    .select("id,field_key,type")
    .eq("form_id", formId);

  if (fieldError) {
    return NextResponse.json({ error: fieldError.message }, { status: 500 });
  }

  const { data: record, error: recordError } = await db
    .from("records")
    .insert({
      tenant_id: tenantId,
      project_id: projectIdValue || null,
      form_id: formId,
      status: "submitted"
    })
    .select("id")
    .single();

  if (recordError || !record) {
    return NextResponse.json({ error: recordError?.message ?? "Record kon niet worden opgeslagen." }, { status: 500 });
  }

  const fieldValueRows = [];

  for (const field of (fields ?? []) as Array<{ id: string; field_key: string; type: string }>) {
    const key = `field:${field.id}`;
    const raw = formData.get(key);

    if (field.type === "photo") {
      if (raw instanceof File && raw.size > 0) {
        const extension = raw.name.includes(".") ? raw.name.split(".").pop() : "bin";
        const path = `${tenantId}/${record.id}/${field.id}-${Date.now()}.${extension}`;
        const arrayBuffer = await raw.arrayBuffer();
        const { error: uploadError } = await supabase.storage
          .from("tenant-files")
          .upload(path, Buffer.from(arrayBuffer), {
            contentType: raw.type || "application/octet-stream",
            upsert: true
          });

        if (uploadError) {
          return NextResponse.json({ error: uploadError.message }, { status: 500 });
        }

        fieldValueRows.push({
          record_id: record.id,
          field_id: field.id,
          value: {
            path,
            fileName: raw.name
          }
        });
      }
      continue;
    }

    if (raw === null) {
      continue;
    }

    let value: unknown = raw;
    if (field.type === "checkbox") {
      value = raw === "true";
    } else if (field.type === "number") {
      value = raw === "" ? null : Number(raw);
    }

    fieldValueRows.push({
      record_id: record.id,
      field_id: field.id,
      value
    });
  }

  if (fieldValueRows.length > 0) {
    const { error: valueError } = await db.from("field_values").insert(fieldValueRows);
    if (valueError) {
      return NextResponse.json({ error: valueError.message }, { status: 500 });
    }
  }

  revalidatePath(`/workspace?tenantId=${tenantId}`);
  revalidatePath("/workspace");

  return NextResponse.json({ ok: true, recordId: record.id });
}
