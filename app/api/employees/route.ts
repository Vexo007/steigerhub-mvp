import { NextResponse } from "next/server";
import { getCurrentAppUser } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const actor = await getCurrentAppUser();
  if (!actor) {
    return NextResponse.json({ error: "Je moet ingelogd zijn." }, { status: 401 });
  }

  if (actor.role !== "tenant_admin" && actor.role !== "agency_admin") {
    return NextResponse.json({ error: "Alleen managers of agency mogen gebruikers aanmaken." }, { status: 403 });
  }

  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    return NextResponse.json({ error: "SUPABASE_SERVICE_ROLE_KEY ontbreekt op de server." }, { status: 500 });
  }

  const body = (await request.json()) as {
    fullName?: string;
    email?: string;
    role?: "tenant_admin" | "tenant_staff";
  };

  if (!body.fullName || !body.email || !body.role) {
    return NextResponse.json({ error: "Naam, e-mail en rol zijn verplicht." }, { status: 400 });
  }

  const tenantId = actor.tenantId;
  if (!tenantId) {
    return NextResponse.json({ error: "Geen tenant gekoppeld aan deze admin." }, { status: 400 });
  }

  const temporaryPassword = `Steiger!${crypto.randomUUID().slice(0, 8)}`;
  const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
    email: body.email,
    password: temporaryPassword,
    email_confirm: true,
    user_metadata: {
      full_name: body.fullName
    }
  });

  if (authError || !authUser.user) {
    return NextResponse.json({ error: authError?.message ?? "Gebruiker kon niet worden aangemaakt." }, { status: 500 });
  }

  const db = supabase as any;
  const { error: profileError } = await db.from("profiles").insert({
    id: authUser.user.id,
    tenant_id: tenantId,
    role: body.role,
    full_name: body.fullName,
    email: body.email
  });

  if (profileError) {
    await supabase.auth.admin.deleteUser(authUser.user.id);
    return NextResponse.json({ error: profileError.message }, { status: 500 });
  }

  return NextResponse.json({
    message: "Gebruiker aangemaakt.",
    data: {
      loginEmail: body.email,
      temporaryPassword
    }
  });
}
