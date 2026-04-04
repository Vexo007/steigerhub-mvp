import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { getCurrentAppUser } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ moduleId: string }> }
) {
  const actor = await getCurrentAppUser();
  if (!actor) {
    return NextResponse.json({ error: "Je moet ingelogd zijn." }, { status: 401 });
  }
  if (actor.role !== "agency_admin") {
    return NextResponse.json({ error: "Alleen agency admins mogen modules beheren." }, { status: 403 });
  }

  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    return NextResponse.json({ error: "Missing Supabase admin client." }, { status: 500 });
  }

  const { moduleId } = await params;
  const body = (await request.json()) as {
    name?: string;
    slug?: string;
    isEnabled?: boolean;
    tenantId?: string;
  };

  const db = supabase as any;
  const { error } = await db
    .from("package_modules")
    .update({
      ...(body.name ? { name: body.name } : {}),
      ...(body.slug ? { slug: body.slug } : {}),
      ...(typeof body.isEnabled === "boolean" ? { is_enabled: body.isEnabled } : {})
    })
    .eq("id", moduleId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (body.tenantId) {
    revalidatePath(`/agency/tenants/${body.tenantId}/config`);
    revalidatePath(`/workspace?tenantId=${body.tenantId}`);
  }

  return NextResponse.json({ ok: true });
}
