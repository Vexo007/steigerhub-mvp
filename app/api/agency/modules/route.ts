import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { getCurrentAppUser } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
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

  const body = (await request.json()) as {
    packageId?: string;
    tenantId?: string;
    name?: string;
    slug?: string;
  };

  if (!body.packageId || !body.name || !body.slug) {
    return NextResponse.json({ error: "Package, naam en slug zijn verplicht." }, { status: 400 });
  }

  const db = supabase as any;
  const { data, error } = await db
    .from("package_modules")
    .insert({
      package_id: body.packageId,
      name: body.name,
      slug: body.slug,
      sort_order: Date.now() % 100000,
      is_enabled: true
    })
    .select("id")
    .single();

  if (error || !data) {
    return NextResponse.json({ error: error?.message ?? "Module kon niet worden aangemaakt." }, { status: 500 });
  }

  if (body.tenantId) {
    revalidatePath(`/agency/tenants/${body.tenantId}/config`);
    revalidatePath(`/workspace?tenantId=${body.tenantId}`);
  }

  return NextResponse.json({ data });
}
