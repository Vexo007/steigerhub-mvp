import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { getAuthorizedTenantId, getCurrentAppUser } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createCustomerSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const actor = await getCurrentAppUser();
  if (!actor) {
    return NextResponse.json({ error: "Je moet ingelogd zijn." }, { status: 401 });
  }

  if (actor.role !== "tenant_admin" && actor.role !== "agency_admin") {
    return NextResponse.json({ error: "Alleen managers of agency mogen klanten aanmaken." }, { status: 403 });
  }

  const payload = await request.json();
  const parsed = createCustomerSchema.safeParse(payload);

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
  const { data: customer, error: customerError } = await db
    .from("customers")
    .insert({
      tenant_id: tenantId,
      name: parsed.data.name,
      notes: parsed.data.notes
    })
    .select("id,name")
    .single();

  if (customerError || !customer) {
    return NextResponse.json({ error: customerError?.message ?? "Klant kon niet worden aangemaakt." }, { status: 500 });
  }

  if (parsed.data.contactName || parsed.data.contactEmail || parsed.data.contactPhone) {
    const { error: contactError } = await db.from("customer_contacts").insert({
      tenant_id: tenantId,
      customer_id: customer.id,
      full_name: parsed.data.contactName || parsed.data.name,
      email: parsed.data.contactEmail,
      phone: parsed.data.contactPhone,
      role_label: parsed.data.roleLabel,
      is_primary: true
    });

    if (contactError) {
      return NextResponse.json({ error: contactError.message }, { status: 500 });
    }
  }

  if (parsed.data.street || parsed.data.city) {
    const { error: addressError } = await db.from("customer_addresses").insert({
      tenant_id: tenantId,
      customer_id: customer.id,
      label: parsed.data.addressLabel,
      street: parsed.data.street || "Nog geen adres opgegeven",
      postal_code: parsed.data.postalCode,
      city: parsed.data.city || "Onbekend",
      country: parsed.data.country,
      access_notes: parsed.data.accessNotes
    });

    if (addressError) {
      return NextResponse.json({ error: addressError.message }, { status: 500 });
    }
  }

  await db.from("audit_logs").insert({
    tenant_id: tenantId,
    actor_profile_id: actor.id,
    action: "customer_created",
    target_table: "customers",
    target_id: customer.id,
    metadata: { name: parsed.data.name }
  });

  revalidatePath("/admin");
  revalidatePath("/admin/customers");
  revalidatePath("/admin/projects");

  return NextResponse.json({ message: "Klant succesvol aangemaakt.", data: customer });
}
