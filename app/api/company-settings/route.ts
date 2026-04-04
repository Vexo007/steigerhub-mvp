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
    return NextResponse.json({ error: "Alleen managers of agency mogen company settings beheren." }, { status: 403 });
  }

  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    return NextResponse.json({ error: "SUPABASE_SERVICE_ROLE_KEY ontbreekt op de server." }, { status: 500 });
  }

  const body = (await request.json()) as {
    tenantId?: string;
    displayName?: string;
    primaryColor?: string;
    secondaryColor?: string;
  };

  const tenantId = getAuthorizedTenantId(actor, body.tenantId) ?? actor.tenantId;
  if (!tenantId) {
    return NextResponse.json({ error: "Geen tenant gevonden." }, { status: 400 });
  }

  const db = supabase as any;
  const { error } = await db.from("company_profiles").upsert({
    tenant_id: tenantId,
    display_name: body.displayName ?? "",
    primary_color: body.primaryColor ?? "#0a331c",
    secondary_color: body.secondaryColor ?? "#49a642",
    rie_notes: "",
    company_notes: ""
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  revalidatePath(tenantId ? `/admin/settings/company?tenantId=${tenantId}` : "/admin/settings/company");
  revalidatePath(tenantId ? `/admin?tenantId=${tenantId}` : "/admin");

  return NextResponse.json({ ok: true });
}
