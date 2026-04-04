import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { getAuthorizedTenantId, getCurrentAppUser } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { CompanyDocument } from "@/lib/types";

export async function POST(request: Request) {
  const actor = await getCurrentAppUser();
  if (!actor) {
    return NextResponse.json({ error: "Je moet ingelogd zijn." }, { status: 401 });
  }

  if (actor.role !== "tenant_admin" && actor.role !== "agency_admin") {
    return NextResponse.json({ error: "Alleen managers of agency mogen bedrijfsdocumenten beheren." }, { status: 403 });
  }

  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    return NextResponse.json({ error: "SUPABASE_SERVICE_ROLE_KEY ontbreekt op de server." }, { status: 500 });
  }

  const formData = await request.formData();
  const requestedTenantId = String(formData.get("tenantId") ?? "");
  const title = String(formData.get("title") ?? "");
  const category = String(formData.get("category") ?? "") as CompanyDocument["category"];
  const file = formData.get("file");

  const tenantId = getAuthorizedTenantId(actor, requestedTenantId) ?? actor.tenantId;
  if (!tenantId || !title || !category || !(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "Tenant, titel, categorie en bestand zijn verplicht." }, { status: 400 });
  }

  const extension = file.name.includes(".") ? file.name.split(".").pop() : "bin";
  const path = `${tenantId}/company/${category}-${Date.now()}.${extension}`;
  const arrayBuffer = await file.arrayBuffer();

  const { error: uploadError } = await supabase.storage.from("tenant-files").upload(path, Buffer.from(arrayBuffer), {
    contentType: file.type || "application/octet-stream",
    upsert: true
  });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  const db = supabase as any;
  const { error: insertError } = await db.from("company_documents").insert({
    tenant_id: tenantId,
    category,
    title,
    bucket_path: path,
    file_name: file.name,
    uploaded_by: actor.id
  });

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  revalidatePath(tenantId ? `/admin/settings/company?tenantId=${tenantId}` : "/admin/settings/company");
  revalidatePath(tenantId ? `/admin?tenantId=${tenantId}` : "/admin");

  return NextResponse.json({ ok: true });
}
