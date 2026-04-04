import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { getCurrentAppUser } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

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
  const body = (await request.json()) as {
    sectionKey?: string;
    title?: string;
    payload?: Record<string, unknown>;
  };

  if (!body.sectionKey || !body.title) {
    return NextResponse.json({ error: "Sectie en titel zijn verplicht." }, { status: 400 });
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

  const { error } = await db.from("project_workplan_sections").upsert({
    workplan_id: workplanId,
    section_key: body.sectionKey,
    title: body.title,
    payload: body.payload ?? {},
    updated_at: new Date().toISOString()
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  revalidatePath(`/workspace/project/${workplan.project_id}/workplans/${workplanId}`);

  return NextResponse.json({ ok: true });
}
