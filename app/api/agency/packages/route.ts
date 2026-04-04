import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    return NextResponse.json({ error: "Missing Supabase admin client." }, { status: 500 });
  }

  const body = (await request.json()) as {
    name?: string;
    description?: string;
    isTemplate?: boolean;
  };

  if (!body.name) {
    return NextResponse.json({ error: "Naam is verplicht." }, { status: 400 });
  }

  const db = supabase as any;
  const { data, error } = await db
    .from("packages")
    .insert({
      name: body.name,
      niche: "steigerbouw",
      description: body.description ?? "",
      is_template: body.isTemplate ?? false
    })
    .select("id,name")
    .single();

  if (error || !data) {
    return NextResponse.json({ error: error?.message ?? "Package kon niet worden aangemaakt." }, { status: 500 });
  }

  return NextResponse.json({ data });
}

