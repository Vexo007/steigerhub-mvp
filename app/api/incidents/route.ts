import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { getAuthorizedTenantId, getCurrentAppUser } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createIncidentSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const actor = await getCurrentAppUser();
  if (!actor) {
    return NextResponse.json({ error: "Je moet ingelogd zijn." }, { status: 401 });
  }

  const payload = await request.json();
  const parsed = createIncidentSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: "Ongeldige payload.", details: parsed.error.flatten() }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    return NextResponse.json({ error: "SUPABASE_SERVICE_ROLE_KEY ontbreekt op de server." }, { status: 500 });
  }

  let tenantId: string;
  try {
    tenantId = getAuthorizedTenantId(actor, parsed.data.tenantId) ?? parsed.data.tenantId;
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Geen toegang tot deze tenant." }, { status: 403 });
  }

  const db = supabase as any;
  const { data: incident, error: incidentError } = await db
    .from("project_incidents")
    .insert({
      tenant_id: tenantId,
      project_id: parsed.data.projectId,
      customer_id: parsed.data.customerId,
      title: parsed.data.title,
      description: parsed.data.description,
      severity: parsed.data.severity,
      reported_by: actor.id
    })
    .select("id")
    .single();

  if (incidentError || !incident) {
    return NextResponse.json({ error: incidentError?.message ?? "Incident kon niet worden opgeslagen." }, { status: 500 });
  }

  await db.from("audit_logs").insert({
    tenant_id: tenantId,
    actor_profile_id: actor.id,
    action: "incident_created",
    target_table: "project_incidents",
    target_id: incident.id,
    metadata: { title: parsed.data.title, severity: parsed.data.severity }
  });

  revalidatePath("/admin");
  revalidatePath("/admin/projects");
  revalidatePath("/admin/customers");

  return NextResponse.json({ message: "Incident vastgelegd.", data: incident });
}
