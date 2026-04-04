import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { DynamicFieldType } from "@/lib/types";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ fieldId: string }> }
) {
  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    return NextResponse.json({ error: "Missing Supabase admin client." }, { status: 500 });
  }

  const { fieldId } = await params;
  const body = (await request.json()) as {
    tenantId?: string;
    label?: string;
    fieldKey?: string;
    type?: DynamicFieldType;
    required?: boolean;
    options?: string[];
    helpText?: string;
  };

  const db = supabase as any;
  const { error } = await db
    .from("form_fields")
    .update({
      ...(body.label ? { label: body.label } : {}),
      ...(body.fieldKey ? { field_key: body.fieldKey } : {}),
      ...(body.type ? { type: body.type } : {}),
      ...(typeof body.required === "boolean" ? { required: body.required } : {}),
      ...(body.options ? { options: body.options } : {}),
      ...(typeof body.helpText === "string" ? { help_text: body.helpText } : {})
    })
    .eq("id", fieldId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (body.tenantId) {
    revalidatePath(`/agency/tenants/${body.tenantId}/config`);
    revalidatePath(`/workspace?tenantId=${body.tenantId}`);
  }

  return NextResponse.json({ ok: true });
}

