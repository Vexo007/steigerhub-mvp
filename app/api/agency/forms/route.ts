import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    return NextResponse.json({ error: "Missing Supabase admin client." }, { status: 500 });
  }

  const body = (await request.json()) as {
    moduleId?: string;
    tenantId?: string;
    name?: string;
    description?: string;
  };

  if (!body.moduleId || !body.name) {
    return NextResponse.json({ error: "Module en naam zijn verplicht." }, { status: 400 });
  }

  const db = supabase as any;
  const { data, error } = await db
    .from("module_forms")
    .insert({
      module_id: body.moduleId,
      name: body.name,
      description: body.description ?? "",
      sort_order: Date.now() % 100000
    })
    .select("id")
    .single();

  if (error || !data) {
    return NextResponse.json({ error: error?.message ?? "Formulier kon niet worden aangemaakt." }, { status: 500 });
  }

  if (body.tenantId) {
    revalidatePath(`/agency/tenants/${body.tenantId}/config`);
    revalidatePath(`/workspace?tenantId=${body.tenantId}`);
  }

  return NextResponse.json({ data });
}

