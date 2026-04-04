import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    return NextResponse.json({ error: "SUPABASE_SERVICE_ROLE_KEY ontbreekt op de server." }, { status: 500 });
  }

  const body = (await request.json()) as {
    fullName?: string;
    email?: string;
    password?: string;
  };

  if (!body.fullName || !body.email || !body.password || body.password.length < 8) {
    return NextResponse.json({ error: "Naam, e-mail en een wachtwoord van minimaal 8 tekens zijn verplicht." }, { status: 400 });
  }

  const db = supabase as any;
  const { count } = await db.from("profiles").select("*", { count: "exact", head: true }).eq("role", "agency_admin");

  if ((count ?? 0) > 0) {
    return NextResponse.json({ error: "Er bestaat al een agency admin. Gebruik /login." }, { status: 409 });
  }

  const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
    email: body.email,
    password: body.password,
    email_confirm: true,
    user_metadata: {
      full_name: body.fullName
    }
  });

  if (authError || !authUser.user) {
    return NextResponse.json({ error: authError?.message ?? "Agency gebruiker kon niet worden aangemaakt." }, { status: 500 });
  }

  const { error: profileError } = await db.from("profiles").insert({
    id: authUser.user.id,
    tenant_id: null,
    role: "agency_admin",
    full_name: body.fullName,
    email: body.email
  });

  if (profileError) {
    await supabase.auth.admin.deleteUser(authUser.user.id);
    return NextResponse.json({ error: profileError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
