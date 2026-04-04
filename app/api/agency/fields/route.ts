import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { getCurrentAppUser } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { DynamicFieldType } from "@/lib/types";

export async function POST(request: Request) {
  const actor = await getCurrentAppUser();
  if (!actor) {
    return NextResponse.json({ error: "Je moet ingelogd zijn." }, { status: 401 });
  }
  if (actor.role !== "agency_admin") {
    return NextResponse.json({ error: "Alleen agency admins mogen velden beheren." }, { status: 403 });
  }

  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    return NextResponse.json({ error: "Missing Supabase admin client." }, { status: 500 });
  }

  const body = (await request.json()) as {
    formId?: string;
    tenantId?: string;
    label?: string;
    fieldKey?: string;
    type?: DynamicFieldType;
    required?: boolean;
    options?: string[];
    helpText?: string;
  };

  if (!body.formId || !body.label || !body.fieldKey || !body.type) {
    return NextResponse.json({ error: "Formulier, label, sleutel en type zijn verplicht." }, { status: 400 });
  }

  const db = supabase as any;
  const { data, error } = await db
    .from("form_fields")
    .insert({
      form_id: body.formId,
      label: body.label,
      field_key: body.fieldKey,
      type: body.type,
      required: body.required ?? false,
      options: body.options ?? [],
      help_text: body.helpText ?? "",
      sort_order: Date.now() % 100000
    })
    .select("id")
    .single();

  if (error || !data) {
    return NextResponse.json({ error: error?.message ?? "Veld kon niet worden aangemaakt." }, { status: 500 });
  }

  if (body.tenantId) {
    revalidatePath(`/agency/tenants/${body.tenantId}/config`);
    revalidatePath(`/workspace?tenantId=${body.tenantId}`);
  }

  return NextResponse.json({ data });
}
