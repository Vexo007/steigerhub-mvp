import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { getAuthorizedTenantId, getCurrentAppUser } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const actor = await getCurrentAppUser();
  if (!actor) {
    return NextResponse.json({ error: "Je moet ingelogd zijn." }, { status: 401 });
  }

  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    return NextResponse.json({ error: "Missing Supabase admin client." }, { status: 500 });
  }

  const body = (await request.json()) as {
    tenantId?: string;
    projectId?: string;
    title?: string;
    planType?: string;
  };

  if (!body.projectId || !body.title || !body.planType) {
    return NextResponse.json({ error: "Project, titel en plantype zijn verplicht." }, { status: 400 });
  }

  const db = supabase as any;
  const { data: project } = await db.from("projects").select("id,tenant_id").eq("id", body.projectId).single();

  if (!project) {
    return NextResponse.json({ error: "Project niet gevonden." }, { status: 404 });
  }

  let tenantId: string;
  try {
    tenantId = getAuthorizedTenantId(actor, project.tenant_id) ?? project.tenant_id;
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Geen toegang." }, { status: 403 });
  }

  const { data: workplan, error } = await db
    .from("project_workplans")
    .insert({
      tenant_id: tenantId,
      project_id: body.projectId,
      title: body.title,
      plan_type: body.planType,
      created_by: actor.id
    })
    .select("id")
    .single();

  if (error || !workplan) {
    return NextResponse.json({ error: error?.message ?? "Werkplan kon niet worden aangemaakt." }, { status: 500 });
  }

  revalidatePath(`/workspace/project/${body.projectId}/workplans`);

  return NextResponse.json({ ok: true, id: workplan.id });
}
