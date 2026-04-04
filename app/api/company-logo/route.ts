import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { getAuthorizedTenantId, getCurrentAppUser } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const actor = await getCurrentAppUser();
  if (!actor) {
    return NextResponse.json({ error: "Je moet ingelogd zijn." }, { status: 401 });
  }

  if (actor.role !== "tenant_admin" && actor.role !== "agency_admin") {
    return NextResponse.json({ error: "Alleen managers of agency mogen een logo beheren." }, { status: 403 });
  }

  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    return NextResponse.json({ error: "SUPABASE_SERVICE_ROLE_KEY ontbreekt op de server." }, { status: 500 });
  }

  const formData = await request.formData();
  const requestedTenantId = String(formData.get("tenantId") ?? "");
  const file = formData.get("file");

  const tenantId = getAuthorizedTenantId(actor, requestedTenantId) ?? actor.tenantId;
  if (!tenantId || !(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "Tenant en logobestand zijn verplicht." }, { status: 400 });
  }

  const extension = file.name.includes(".") ? file.name.split(".").pop() : "png";
  const path = `${tenantId}/branding/logo-${Date.now()}.${extension}`;
  const arrayBuffer = await file.arrayBuffer();

  const { error: uploadError } = await supabase.storage.from("tenant-files").upload(path, Buffer.from(arrayBuffer), {
    contentType: file.type || "application/octet-stream",
    upsert: true
  });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  const db = supabase as any;
  const { error: upsertError } = await db.from("company_profiles").upsert({
    tenant_id: tenantId,
    logo_path: path
  });

  if (upsertError) {
    return NextResponse.json({ error: upsertError.message }, { status: 500 });
  }

  revalidatePath(tenantId ? `/admin/settings/company?tenantId=${tenantId}` : "/admin/settings/company");
  revalidatePath(tenantId ? `/admin?tenantId=${tenantId}` : "/admin");

  return NextResponse.json({ ok: true });
}
