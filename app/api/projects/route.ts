import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createProjectSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const json = await request.json();
  const parsed = createProjectSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Ongeldige payload", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    return NextResponse.json(
      { error: "SUPABASE_SERVICE_ROLE_KEY ontbreekt op de server." },
      { status: 500 }
    );
  }

  const db = supabase as any;

  const { data: project, error: projectError } = await db
    .from("projects")
    .insert({
      tenant_id: parsed.data.tenantId,
      client_name: parsed.data.clientName,
      site_address: parsed.data.siteAddress,
      site_city: parsed.data.siteCity,
      status: "planned",
      start_date: parsed.data.startDate,
      material_summary: parsed.data.materialSummary,
      safety_status: parsed.data.safetyStatus
    })
    .select("id,tenant_id,client_name")
    .single();

  if (projectError || !project) {
    return NextResponse.json(
      { error: projectError?.message ?? "Project kon niet worden aangemaakt." },
      { status: 500 }
    );
  }

  const { error: auditError } = await db.from("audit_logs").insert({
    tenant_id: parsed.data.tenantId,
    action: "project_created",
    target_table: "projects",
    target_id: project.id,
    metadata: {
      clientName: parsed.data.clientName,
      siteCity: parsed.data.siteCity
    }
  });

  if (auditError) {
    return NextResponse.json(
      { error: auditError.message },
      { status: 500 }
    );
  }

  revalidatePath(`/workspace?tenantId=${parsed.data.tenantId}`);
  revalidatePath("/workspace");
  revalidatePath("/agency");

  return NextResponse.json({
    message: "Project succesvol aangemaakt.",
    data: project
  });
}
