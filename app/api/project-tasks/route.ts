import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { getAuthorizedTenantId, getCurrentAppUser } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createProjectTaskSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const actor = await getCurrentAppUser();
  if (!actor) {
    return NextResponse.json({ error: "Je moet ingelogd zijn." }, { status: 401 });
  }

  if (actor.role !== "tenant_admin" && actor.role !== "agency_admin") {
    return NextResponse.json({ error: "Alleen managers of agency mogen taken aanmaken." }, { status: 403 });
  }

  const payload = await request.json();
  const parsed = createProjectTaskSchema.safeParse(payload);

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
  const { data: task, error: taskError } = await db
    .from("project_tasks")
    .insert({
      tenant_id: tenantId,
      project_id: parsed.data.projectId,
      assigned_to: parsed.data.assignedTo,
      title: parsed.data.title,
      task_type: parsed.data.taskType,
      priority: parsed.data.priority,
      due_date: parsed.data.dueDate,
      notes: parsed.data.notes
    })
    .select("id")
    .single();

  if (taskError || !task) {
    return NextResponse.json({ error: taskError?.message ?? "Taak kon niet worden aangemaakt." }, { status: 500 });
  }

  await db.from("audit_logs").insert({
    tenant_id: tenantId,
    actor_profile_id: actor.id,
    action: "project_task_created",
    target_table: "project_tasks",
    target_id: task.id,
    metadata: { title: parsed.data.title, taskType: parsed.data.taskType }
  });

  revalidatePath("/admin");
  revalidatePath("/admin/projects");
  revalidatePath(`/admin/projects/${parsed.data.projectId}`);
  revalidatePath("/workspace");

  return NextResponse.json({ message: "Taak toegevoegd.", data: task });
}
