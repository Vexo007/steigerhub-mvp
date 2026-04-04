import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createTenantSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const json = await request.json();
  const parsed = createTenantSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Ongeldige payload", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    return NextResponse.json(
      { error: "SUPABASE_SERVICE_ROLE_KEY ontbreekt op de server." },
      { status: 500 }
    );
  }

  const db = supabase as any;

  const { data: tenant, error: tenantError } = await db
    .from("tenants")
    .insert({
      name: parsed.data.name,
      niche: parsed.data.niche,
      package_tier: parsed.data.packageTier,
      status: "trialing",
      contact_name: parsed.data.contactName,
      contact_email: parsed.data.contactEmail
    })
    .select("id,name,niche,package_tier,status,contact_name,contact_email,stripe_customer_id")
    .single();

  if (tenantError || !tenant) {
    return NextResponse.json(
      { error: tenantError?.message ?? "Tenant kon niet worden aangemaakt." },
      { status: 500 }
    );
  }

  const moduleKeys = ["materials", "blueprints", "safety_docs", "notes", "photos", "timeline"];
  const amountByTier = {
    starter: 79,
    pro: 149,
    plus: 249
  } as const;

  const [moduleResult, subscriptionResult, auditResult] = await Promise.all([
    db.from("tenant_module_settings").insert(
      moduleKeys.map((moduleKey) => ({
        tenant_id: tenant.id,
        module_key: moduleKey,
        enabled: true
      }))
    ),
    db.from("subscriptions").insert({
      tenant_id: tenant.id,
      stripe_customer_id: `manual-${tenant.id}`,
      stripe_price_id: `manual-${parsed.data.packageTier}`,
      package_tier: parsed.data.packageTier,
      status: "trialing",
      current_period_end: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
    }),
    db.from("audit_logs").insert({
      tenant_id: tenant.id,
      action: "tenant_created",
      target_table: "tenants",
      target_id: tenant.id,
      metadata: {
        packageTier: parsed.data.packageTier,
        amountMonthly: amountByTier[parsed.data.packageTier]
      }
    })
  ]);

  if (moduleResult.error || subscriptionResult.error || auditResult.error) {
    return NextResponse.json(
      {
        error:
          moduleResult.error?.message ??
          subscriptionResult.error?.message ??
          auditResult.error?.message ??
          "Tenant is deels aangemaakt maar configuratie mislukte."
      },
      { status: 500 }
    );
  }

  revalidatePath("/agency");
  revalidatePath(`/workspace?tenantId=${tenant.id}`);

  return NextResponse.json({
    message: "Tenant succesvol aangemaakt.",
    data: {
      id: tenant.id,
      name: tenant.name,
      packageTier: tenant.package_tier,
      status: tenant.status
    }
  });
}
